"""HTTP client for GET /api/content. Does not import Mirage."""

from __future__ import annotations

import asyncio
import hashlib
import json
import random
from dataclasses import dataclass
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime

import httpx

from edition_vfs.errors import SpaceProblem
from edition_vfs.config import SpaceConfig
from edition_vfs.identity import client_header, user_agent
from edition_vfs.paths import children, normalize

REQUEST_TIMEOUT = 30.0
MAX_RESPONSE_BYTES = 64 * 1024 * 1024


@dataclass(frozen=True)
class Content:
    payload: bytes | None
    sha256: str | None
    type: str
    not_modified: bool


class ContentClient:
    def __init__(self, origin, host, space, token=None, tls_insecure=False, max_concurrent_reads=4):
        # Direct HTTP consumers must receive the same validation as Mirage mounts.
        SpaceConfig(origin=origin, host=host, space=space, token=token,
                    tls_insecure=tls_insecure, max_concurrent_reads=max_concurrent_reads)
        self.origin = origin.rstrip("/")
        self.host = host
        self.space = space
        self.token = token
        self.identity = "anonymous" if not token else hashlib.sha256(token.encode()).hexdigest()
        self._requests = asyncio.Semaphore(max_concurrent_reads)
        self._http = httpx.AsyncClient(
            base_url=self.origin,
            headers=self._headers(),
            verify=not tls_insecure,
            timeout=30.0,
            follow_redirects=False,
        )

    def _headers(self, extra=None):
        headers = {"Host": self.host, "Accept": "application/json"}
        if extra:
            headers.update(extra)
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        headers["User-Agent"] = user_agent()
        headers["X-Edition-Client"] = client_header()
        return headers

    async def aclose(self):
        await self._http.aclose()

    async def __aenter__(self):
        return self

    async def __aexit__(self, *_exc):
        await self.aclose()

    async def snapshot(self):
        return await self._json(f"/api/content/spaces/{self.space}/snapshot")

    async def list_all(self, snapshot):
        entries = []
        async for page in self._file_pages(snapshot):
            entries.extend(page)
        return entries

    async def children(self, snapshot, directory):
        """Scan an authorized listing without retaining every file in memory."""
        names, seen = [], set()
        async for page in self._file_pages(snapshot):
            for name in children(page, directory):
                if name not in seen:
                    seen.add(name)
                    names.append(name)
        return names

    async def _file_pages(self, snapshot):
        cursor, visited = None, set()
        while True:
            query = {"snapshot": snapshot, "limit": "200"}
            if cursor:
                query["cursor"] = cursor
            page = await self._json(f"/api/content/spaces/{self.space}/files", query)
            entries = page.get("entries")
            cursor = page.get("nextCursor")
            if (page.get("snapshot") != snapshot or "nextCursor" not in page or not isinstance(entries, list)
                    or any(not isinstance(row, dict) or not isinstance(row.get("path"), str) for row in entries)
                    or (cursor is not None and (not isinstance(cursor, str) or not cursor))):
                raise SpaceProblem(503, "delivery_unavailable", source="protocol")
            yield entries
            if not cursor:
                return
            if cursor in visited:
                raise SpaceProblem(503, "delivery_unavailable", source="protocol")
            visited.add(cursor)

    async def stat(self, snapshot, path):
        return await self._json(
            f"/api/content/spaces/{self.space}/stat",
            {"snapshot": snapshot, "path": normalize(path)},
        )

    async def content(self, snapshot, path, etag=None):
        extra = {"Accept": "*/*"}
        if etag:
            extra["If-None-Match"] = f'"{etag}"'
        response = await self._send(
            f"/api/content/spaces/{self.space}/content",
            {"snapshot": snapshot, "path": normalize(path)},
            extra,
        )
        if response.status_code == 304:
            if not etag or (_etag(response) is not None and _etag(response) != etag):
                raise SpaceProblem(503, "delivery_unavailable", source="protocol")
            return Content(None, _etag(response) or etag, response.headers.get("content-type", ""), True)
        return Content(
            response.content,
            _etag(response),
            response.headers.get("content-type", "application/octet-stream"),
            False,
        )

    async def _json(self, path, params=None):
        response = await self._send(path, params)
        try:
            result = response.json()
        except ValueError as error:
            raise SpaceProblem(503, "delivery_unavailable", source="protocol") from error
        if not isinstance(result, dict):
            raise SpaceProblem(503, "delivery_unavailable", source="protocol")
        return result

    async def _send(self, path, params=None, headers=None):
        # The deadline includes queueing, downloads and Retry-After, not just
        # individual socket operations. Cancellation releases the permit.
        retry_state = {"problem": None}
        try:
            async with asyncio.timeout(REQUEST_TIMEOUT):
                async with self._requests:
                    return await self._send_with_retries(path, params, headers, retry_state)
        except TimeoutError as error:
            last = retry_state["problem"]
            raise SpaceProblem(503, "delivery_unavailable", last.retry_after if last else None,
                               last.trace_id if last else None, source="transport") from error

    async def _send_with_retries(self, path, params, headers, retry_state):
        delay = 0.5
        for attempt in range(4):
            try:
                response = await self._request(path, params, headers)
            except httpx.TransportError as error:
                if attempt == 3:
                    raise SpaceProblem(503, "delivery_unavailable", source="transport") from error
                await asyncio.sleep(random.uniform(delay / 2, delay))
                delay = min(delay * 2, 8)
                continue
            if response.status_code == 304 or response.is_success:
                return response
            problem = _problem(response)
            retry_state["problem"] = problem
            if not problem.transient() or attempt == 3:
                raise problem
            await asyncio.sleep(problem.retry_after if problem.retry_after is not None
                                else random.uniform(delay / 2, delay))
            delay = min(delay * 2, 8)

    async def _request(self, path, params, headers):
        async with self._http.stream("GET", path, params=params, headers=self._headers(headers),
                                     extensions={"sni_hostname": self.host}) as response:
            payload = bytearray()
            async for chunk in response.aiter_bytes():
                if len(payload) + len(chunk) > MAX_RESPONSE_BYTES:
                    raise SpaceProblem(413, "content_too_large", source="client")
                payload.extend(chunk)
            # aiter_bytes has decoded the transfer representation already.
            decoded_headers = httpx.Headers(response.headers)
            for name in ("content-encoding", "content-length", "transfer-encoding"):
                decoded_headers.pop(name, None)
            return httpx.Response(response.status_code, headers=decoded_headers,
                                  content=bytes(payload), request=response.request)


def _etag(response):
    value = response.headers.get("etag")
    return None if not value else value.strip().removeprefix("W/").strip('"')


def _problem(response):
    retry = response.headers.get("retry-after")
    code, trace = "unexpected", None
    try:
        body = response.json()
        if isinstance(body, dict):
            code = body.get("code") or code
            trace = body.get("traceId")
    except (json.JSONDecodeError, ValueError):
        pass
    return SpaceProblem(response.status_code, code, _retry_after(retry), trace)


def _retry_after(value):
    if not value:
        return None
    if value.isdigit():
        return int(value)
    try:
        when = parsedate_to_datetime(value)
        return max(0, (when - datetime.now(timezone.utc)).total_seconds())
    except (TypeError, ValueError, OverflowError):
        return None
