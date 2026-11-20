"""Provision a one-space site on the isolated delivery topology."""

from __future__ import annotations

import asyncio
import hashlib
import os
import re
import subprocess
import time
import uuid
from datetime import datetime
from pathlib import Path
from urllib.parse import parse_qs, urlparse

import httpx

ROOT = Path(__file__).resolve().parents[4]
COMPOSE = ROOT / "infra/deployment/compose.yml"
BACKEND = os.environ.get("E2E_BACKEND_ORIGIN", "http://localhost:8094")
MAILPIT = os.environ.get("E2E_MAILPIT_ORIGIN", "http://localhost:8035")
BROWSER = os.environ.get("E2E_BROWSER_ORIGIN", "http://localhost:4176")
CADDY = os.environ.get("SPACE_VFS_ORIGIN", f"https://127.0.0.1:{os.environ.get('E2E_INGRESS_PORT', '8446')}")
PASSWORD = "password1"


def live_enabled():
    return os.environ.get("SPACE_VFS_LIVE") == "1"


def unique(prefix):
    return f"{prefix}-{time.time_ns()}"


async def wait_http(url, timeout=45):
    deadline = time.monotonic() + timeout
    async with httpx.AsyncClient() as client:
        while time.monotonic() < deadline:
            try:
                if (await client.get(url, timeout=2)).status_code == 200:
                    return
            except httpx.HTTPError:
                pass
            await asyncio.sleep(0.25)
    raise TimeoutError(url)


def psql(statement):
    subprocess.run(
        [
            "docker",
            "compose",
            "-p",
            os.environ.get("SPACE_COMPOSE_PROJECT", "dw-remaining"),
            "-f",
            str(COMPOSE),
            "exec",
            "-T",
            "source",
            "psql",
            "-v",
            "ON_ERROR_STOP=1",
            "-U",
            "space",
            "-d",
            "space",
            "-c",
            statement,
        ],
        check=True,
        cwd=ROOT,
        capture_output=True,
        text=True,
    )


async def verification(email, started):
    deadline = time.monotonic() + 15
    async with httpx.AsyncClient() as client:
        while time.monotonic() < deadline:
            search = await client.get(
                f"{MAILPIT}/api/v1/search",
                params={"query": f'to:"{email}"', "limit": "50"},
            )
            search.raise_for_status()
            for message in search.json().get("messages") or []:
                if message.get("Subject") != "Space · 验证邮箱":
                    continue
                created = message.get("Created")
                stamped = (
                    datetime.fromisoformat(created.replace("Z", "+00:00")).timestamp() * 1000
                    if created
                    else 0
                )
                if stamped < started - 1000:
                    continue
                body = await client.get(f"{MAILPIT}/api/v1/message/{message['ID']}")
                body.raise_for_status()
                text = body.json().get("Text") or ""
                fields = dict(re.findall(r"^(user|token)=([^\s]+)\s*$", text, re.MULTILINE))
                if fields.keys() >= {"user", "token"}:
                    return fields
                match = re.search(r"https?://[^\s<>\"']+\?[^ \s\"']+", text)
                if not match:
                    continue
                query = parse_qs(urlparse(match.group(0)).query)
                return {"user": query["user"][0], "token": query["token"][0]}
            await asyncio.sleep(0.2)
    raise TimeoutError(f"verification mail for {email}")


class World:
    def __init__(self, **fields):
        self.__dict__.update(fields)

    async def mutation(self, method, path, json=None, headers=None, **kwargs):
        extra = {"Authorization": f"Bearer {self.token}", "Idempotency-Key": str(uuid.uuid4())}
        if headers:
            extra.update(headers)
        response = await self.http.request(method, path, json=json, headers=extra, **kwargs)
        if response.status_code >= 400:
            raise AssertionError(f"{method} {path}: {response.status_code} {response.text}")
        return None if response.status_code == 204 else response.json()


async def provision():
    await wait_http(f"{BACKEND}/healthz")
    await wait_http(f"{os.environ.get('E2E_DELIVERY_ORIGIN', 'http://localhost:8095')}/healthz")
    email = f"{unique('vfs')}@e2e.test"
    started = int(time.time() * 1000)
    http = await asyncio.to_thread(httpx.AsyncClient, base_url=BACKEND, timeout=30.0)
    try:
        registered = await http.post(
            "/auth/register", json={"email": email, "name": "VFS验收", "password": PASSWORD}
        )
        if registered.status_code != 201:
            raise AssertionError(registered.text)
        challenge = await verification(email, started)
        verified = await http.post("/auth/email:verify", json=challenge)
        if verified.status_code != 204:
            raise AssertionError(verified.text)
        await asyncio.to_thread(psql, f"update iam.users set platform_operator = true where email = '{email}'")
        login = await http.post(
            "/auth/login",
            json={"email": email, "password": PASSWORD},
            headers={"Origin": BROWSER},
        )
        if login.status_code != 200:
            raise AssertionError(login.text)
        token = login.json()["accessToken"]
        world = World(http=http, token=token, email=email)
        tenant = await world.mutation("POST", "/admin/tenants", {"name": unique("消费适配"), "ownerEmail": email})
        me = await http.get("/api/v1/me", headers={"Authorization": f"Bearer {token}"})
        me.raise_for_status()
        tenant_id = tenant.get("tenant", {}).get("id") or tenant.get("id") or me.json()["tenants"][-1]["id"]
        world.me = me.json()
        world.base = f"/api/v1/tenants/{tenant_id}"
        space = await world.mutation("POST", f"{world.base}/spaces", {"name": "VFS指南", "mode": "authored"})
        world.space = space["id"]
        await world.mutation("PATCH", f"{world.base}/spaces/{world.space}", {"autoRelease": False})
        pages = {}
        for slug, title, fmt, body, publish in (
            ("page-0", "可见页", "markdown", "hello vfs\n\nWebhook\n", True),
            ("hidden", "未编目页", "markdown", "unlisted body\n", True),
            ("note", "HTML页", "html", "<p>raw html</p>\n", True),
            ("secret", "收窄页", "markdown", "restricted body\n", True),
            ("draft", "工作稿", "markdown", "draft only\n", False),
        ):
            page = await world.mutation(
                "POST",
                f"{world.base}/spaces/{world.space}/pages",
                {"title": title, "format": fmt, "slug": slug},
            )
            pages[slug] = page["id"]
            await world.mutation(
                "PUT",
                f"{world.base}/spaces/{world.space}/pages/{page['id']}/content",
                {"content": body},
                headers={"If-Match": '"rev-0"'},
            )
            if publish:
                await world.mutation(
                    "POST", f"{world.base}/spaces/{world.space}/pages/{page['id']}:publish"
                )
        await world.mutation(
            "POST",
            f"{world.base}/spaces/{world.space}/toc/entries",
            {"label": "可见页", "kind": "target", "targetId": pages["page-0"]},
        )
        acl = await http.get(
            f"{world.base}/spaces/{world.space}/pages/{pages['secret']}/permissions",
            headers={"Authorization": f"Bearer {token}"},
        )
        acl.raise_for_status()
        restrict = await http.put(
            f"{world.base}/spaces/{world.space}/pages/{pages['secret']}/permissions/restriction",
            headers={
                "Authorization": f"Bearer {token}",
                "If-Match": acl.headers["etag"],
                "Idempotency-Key": str(uuid.uuid4()),
            },
            json={"principals": [f"user:{world.me['id']}"]},
        )
        if restrict.status_code >= 400:
            raise AssertionError(restrict.text)
        png = bytes.fromhex(
            "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4"
            "890000000a49444154789c63000100000500010d0a2db40000000049454e44ae426082"
        ) + uuid.uuid4().bytes
        uploaded = await http.post(
            f"{world.base}/spaces/{world.space}/pages/{pages['page-0']}/attachments",
            headers={"Authorization": f"Bearer {token}", "Idempotency-Key": str(uuid.uuid4())},
            files={"file": ("sample.png", png, "image/png")},
        )
        if uploaded.status_code != 201:
            raise AssertionError(uploaded.text)
        built = await world.mutation("POST", f"{world.base}/spaces/{world.space}/releases:build")
        site = await world.mutation("POST", f"{world.base}/sites", {"name": "VFS站"})
        world.site = site["id"]
        await world.mutation("PUT", f"{world.base}/sites/{world.site}/mounts/docs", {"spaceId": world.space})
        await world.mutation(
            "PATCH",
            f"{world.base}/sites/{world.site}",
            {"locale": "zh-CN", "home": world.space, "branding": {"primaryColor": "#176b53"}},
        )
        await world.mutation(
            "PUT", f"{world.base}/sites/{world.site}/permissions/grants/anonymous", {"role": "reader"}
        )
        host = f"{unique('vfs')}.acme.test"
        domain = await world.mutation("POST", f"{world.base}/sites/{world.site}/domains", {"host": host})
        await asyncio.to_thread(psql,
            "insert into shared.dns_txt_stubs (name, value) values "
            f"('{domain['txtName']}', '{domain['txtValue']}') on conflict do nothing"
        )
        await world.mutation("POST", f"{world.base}/sites/{world.site}/domains/{host}:verify")
        world.host = host
        world.pages = pages
        world.attachment = png
        world.attachment_sha256 = hashlib.sha256(png).hexdigest()
        world.origin = CADDY
        reader = os.environ.get("E2E_DELIVERY_ORIGIN", "http://localhost:8095")
        last = "no probe"
        deadline = time.monotonic() + 45

        async def probe(client, url, sni=None):
            extra = {"extensions": {"sni_hostname": sni}} if sni else {}
            response = await client.get(url, headers={"Host": host}, **extra)
            return f"{response.status_code} {response.text[:180]}"

        local = await asyncio.to_thread(httpx.AsyncClient, timeout=3.0)
        edge = await asyncio.to_thread(httpx.AsyncClient, verify=False, timeout=3.0)
        async with local, edge:
            while time.monotonic() < deadline:
                try:
                    last = "reader " + await probe(
                        local, f"{reader}/api/content/spaces/docs/snapshot"
                    )
                    if last.startswith("reader 200"):
                        last = "caddy " + await probe(
                            edge,
                            f"{CADDY}/api/content/spaces/docs/snapshot",
                            sni=host,
                        )
                        if last.startswith("caddy 200"):
                            return world
                except httpx.HTTPError as error:
                    last = str(error)
                await asyncio.sleep(0.25)
        raise TimeoutError(f"reader snapshot not ready: {last}")
    except Exception:
        await http.aclose()
        raise
