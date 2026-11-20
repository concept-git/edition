// 「继续阅读」表单：有脚本时自动续期并回原页，失败保留会话并给出倒计时重试。
import {
  resumeReading,
  type Renewer,
} from "../../features/reader-session/index.ts";

export function mountContinueForm(
  doc: Document,
  renewer: Renewer,
  navigate: (to: string) => void,
): void {
  const form = doc.querySelector<HTMLFormElement>("form.continue-form");
  const button = form?.querySelector<HTMLButtonElement>(
    'button[type="submit"]',
  );
  const status = form?.querySelector<HTMLElement>(".continue-status");
  if (!form || !button || !status) return;
  const messages = JSON.parse(form.dataset.messages ?? "{}");
  const label = button.textContent ?? "";
  let timer: ReturnType<typeof setTimeout> | undefined;

  const countdown = () => {
    clearTimeout(timer);
    const seconds = renewer.cooldownSeconds();
    button.disabled = seconds > 0;
    button.textContent =
      seconds > 0
        ? String(messages.countdown).replace("{n}", String(seconds))
        : label;
    if (seconds > 0) timer = setTimeout(countdown, 1000);
  };
  const attempt = async () => {
    button.disabled = true;
    status.hidden = true;
    try {
      const outcome = await resumeReading(renewer, form.dataset.returnTo);
      if (outcome.kind === "continue" || outcome.kind === "login") {
        navigate(outcome.to);
        return;
      }
      status.textContent = messages[outcome.reason] ?? messages.unavailable;
    } catch {
      status.textContent = messages.offline;
    }
    status.hidden = false;
    countdown();
  };
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    void attempt();
  });
  void attempt();
}
