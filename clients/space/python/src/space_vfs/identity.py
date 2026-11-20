"""Stable client family/version reported on every /api/content request."""

from __future__ import annotations

import sys
from importlib.metadata import PackageNotFoundError, version

FAMILY = "space-vfs"
RUNTIME = "python"
_FALLBACK_VERSION = "0.1.0"


def package_version() -> str:
    try:
        return version("space-vfs")
    except PackageNotFoundError:
        return _FALLBACK_VERSION


def user_agent() -> str:
    python = f"{sys.version_info.major}.{sys.version_info.minor}"
    return f"{FAMILY}/{package_version()} {RUNTIME}/{python}"


def client_header() -> str:
    return f"family={FAMILY}; ver={package_version()}; runtime={RUNTIME}"
