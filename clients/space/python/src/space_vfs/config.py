import re
from urllib.parse import urlsplit

from pydantic import BaseModel, ConfigDict, Field, SecretStr, model_validator


class SpaceConfig(BaseModel):
    model_config = ConfigDict(extra="forbid", hide_input_in_errors=True)

    origin: str
    host: str
    space: str
    token: SecretStr | None = Field(default=None, min_length=1)
    tls_insecure: bool = False
    max_concurrent_reads: int = Field(default=4, ge=1, le=4)

    @model_validator(mode="after")
    def validate_transport(self):
        origin = urlsplit(self.origin)
        loopback = origin.hostname in {"localhost", "127.0.0.1", "::1"}
        if (
            origin.scheme not in {"http", "https"}
            or not origin.hostname
            or origin.username
            or origin.password
            or origin.path not in {"", "/"}
            or origin.query
            or origin.fragment
        ):
            raise ValueError("origin must be a site URL without credentials or a path")
        # Local acceptance runs use HTTP and a self-signed HTTPS certificate.
        if origin.scheme == "http" and not loopback:
            raise ValueError("HTTP is allowed only for a loopback origin")
        if self.tls_insecure and not loopback:
            raise ValueError("tls_insecure is allowed only for a loopback origin")
        if not self.host or any(
            char.isspace() or ord(char) < 33 or char in "/\\@?#" for char in self.host
        ):
            raise ValueError("host must be a hostname")
        if not re.fullmatch(r"[^\W_]+(?:-[^\W_]+)*", self.space, re.UNICODE):
            raise ValueError("space must be a slug")
        return self
