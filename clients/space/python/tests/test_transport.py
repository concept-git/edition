"""Exercise the real HTTP client against deterministic protocol failures."""

import asyncio
import gzip
import unittest
from unittest.mock import AsyncMock, patch

import httpx
from pydantic import ValidationError

from space_vfs.client import ContentClient
from space_vfs.errors import SpaceProblem


class TransportTest(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.client = ContentClient("https://docs.example.com", "docs.example.com", "docs", max_concurrent_reads=1)
        await self.client._http.aclose()

    async def asyncTearDown(self):
        await self.client.aclose()

    def serve(self, handler):
        self.client._http = httpx.AsyncClient(
            base_url=self.client.origin, transport=httpx.MockTransport(handler)
        )

    async def test_retry_after_is_honored_and_auth_failure_is_not_retried(self):
        responses = [httpx.Response(429, headers={"Retry-After": "2"}),
                     httpx.Response(401, json={"code": "invalid_token"})]
        requests = []

        def handle(request):
            requests.append(request)
            return responses.pop(0)

        self.serve(handle)
        with patch("space_vfs.client.asyncio.sleep", new=AsyncMock()) as sleep:
            with self.assertRaises(SpaceProblem) as failure:
                await self.client.snapshot()
        self.assertEqual(failure.exception.status, 401)
        self.assertEqual(len(requests), 2)
        sleep.assert_awaited_once_with(2)

    async def test_deadline_bounds_retry_after_and_releases_permit(self):
        self.serve(lambda request: httpx.Response(503, headers={"Retry-After": "3600"}))
        with patch("space_vfs.client.REQUEST_TIMEOUT", 0.02):
            with self.assertRaises(SpaceProblem) as failure:
                await asyncio.wait_for(self.client.snapshot(), 1)
        self.assertEqual(failure.exception.code, "delivery_unavailable")
        await self.client._http.aclose()
        self.serve(lambda request: httpx.Response(200, json={"snapshot": "ready"}))
        self.assertEqual((await asyncio.wait_for(self.client.snapshot(), 1))["snapshot"], "ready")

    async def test_deadline_retains_retry_advice_and_trace_without_fake_http_status(self):
        self.serve(lambda request: httpx.Response(429, headers={"Retry-After": "3600"},
                                                  json={"code": "read_limit_exceeded", "traceId": "fixture-trace"}))
        with patch("space_vfs.client.REQUEST_TIMEOUT", 0.02):
            with self.assertRaises(SpaceProblem) as failure:
                await self.client.snapshot()
        self.assertIsNone(failure.exception.http_status)
        self.assertEqual(failure.exception.source, "transport")
        self.assertEqual(failure.exception.retry_after, 3600)
        self.assertEqual(failure.exception.trace_id, "fixture-trace")

    async def test_malformed_listing_is_not_an_empty_directory(self):
        for body in ({}, {"snapshot": "s", "entries": "bad"}, {"snapshot": "s", "entries": []},
                     {"snapshot": "other", "entries": [], "nextCursor": None}):
            with self.subTest(body=body):
                await self.client._http.aclose()
                self.serve(lambda request: httpx.Response(200, json=body))
                with self.assertRaises(SpaceProblem):
                    await self.client.children("s", "/")

    async def test_repeated_cursor_fails_instead_of_looping(self):
        self.serve(lambda request: httpx.Response(200, json={
            "snapshot": "s", "entries": [], "nextCursor": "same"
        }))
        with self.assertRaises(SpaceProblem):
            await self.client.children("s", "/")

    async def test_response_limit_applies_to_decompressed_bytes(self):
        self.serve(lambda request: httpx.Response(200, headers={"Content-Encoding": "gzip"},
                                                  content=gzip.compress(b"x" * 100)))
        with patch("space_vfs.client.MAX_RESPONSE_BYTES", 50):
            with self.assertRaises(SpaceProblem) as failure:
                await self.client.content("s", "/large.txt")
        self.assertEqual(failure.exception.status, 413)

    async def test_gzip_content_is_decoded_once(self):
        self.serve(lambda request: httpx.Response(200, headers={"Content-Encoding": "gzip"},
                                                  content=gzip.compress(b"hello")))
        self.assertEqual((await self.client.content("s", "/page.txt")).payload, b"hello")

    async def test_304_must_match_the_requested_fingerprint(self):
        self.serve(lambda request: httpx.Response(304, headers={"ETag": '"different"'}))
        with self.assertRaises(SpaceProblem):
            await self.client.content("s", "/page.txt", "cached")

    async def test_direct_client_cannot_bypass_transport_validation(self):
        with self.assertRaises(ValidationError):
            ContentClient("http://remote.example.com", "remote.example.com", "docs", "secret")

    async def test_empty_token_cannot_silently_become_anonymous(self):
        with self.assertRaises(ValidationError):
            ContentClient("https://docs.example.com", "docs.example.com", "docs", "")
