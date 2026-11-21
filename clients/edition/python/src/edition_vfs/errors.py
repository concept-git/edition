"""problem+json from /api/content, classified by the caller's next action."""


class SpaceProblem(OSError):
    def __init__(self, status, code, retry_after=None, trace_id=None, *, source="reader"):
        self.status = int(status)
        self.code = code or "unexpected"
        self.retry_after = retry_after
        self.trace_id = trace_id
        self.source = source
        self.http_status = self.status if source == "reader" else None
        super().__init__(f"{self.status} {self.code}")

    def remount(self):
        return self.status == 409

    def forbidden(self):
        return self.status in (401, 403)

    def transient(self):
        return self.status in (429, 503)
