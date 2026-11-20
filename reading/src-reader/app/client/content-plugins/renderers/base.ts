import {
  emitContentEvent,
  type ContentConfig,
  type ContentDiagnostic,
  type ContentServices,
} from "../types.ts";

export abstract class ContentRenderElement extends HTMLElement {
  protected root = this.attachShadow({ mode: "open" });
  #value = "";
  #config: ContentConfig = {};
  #queued = false;
  #revision = 0;
  readonly = true;
  services?: ContentServices;
  get value() {
    return this.#value;
  }
  set value(value: string) {
    if (value === this.#value) return;
    this.#value = value;
    this.#revision++;
    this.schedule();
  }
  get config() {
    return this.#config;
  }
  set config(value: ContentConfig) {
    this.#config = value ?? {};
    this.#revision++;
    this.schedule();
  }
  connectedCallback() {
    this.schedule();
  }
  disconnectedCallback() {
    this.#revision++;
    this.clear();
  }
  /** Async renderers must check this before publishing results from an older input. */
  protected checkpoint(): () => boolean {
    const revision = this.#revision;
    return () => this.isConnected && revision === this.#revision;
  }
  protected clear(): void {}
  protected abstract render(): void | Promise<void>;
  protected diagnostics(diagnostics: ContentDiagnostic[]) {
    emitContentEvent(this, "content-diagnostics", { diagnostics });
  }
  protected content(): HTMLDivElement {
    this.root.replaceChildren();
    const style = document.createElement("style");
    style.textContent =
      ":host{display:block;color:var(--foreground,#17202a);font:inherit;overflow-wrap:anywhere}.body{padding:1rem;min-width:0}pre{white-space:pre-wrap;overflow:auto;font-size:.875rem}table{border-collapse:collapse;width:100%}td,th{border:1px solid var(--border,#ccd1d1);padding:.5rem}a{color:var(--primary,#2458a6)}button,input,textarea,select{font:inherit}button{cursor:pointer}img{max-width:100%}.error{color:var(--destructive,#b42318)}";
    const body = document.createElement("div");
    body.className = "body";
    this.root.append(style, body);
    return body;
  }
  protected failure(error: unknown) {
    this.clear();
    const message = error instanceof Error ? error.message : String(error);
    const body = this.content();
    const alert = document.createElement("p");
    alert.className = "error";
    alert.setAttribute("role", "alert");
    alert.textContent = message;
    const source = document.createElement("pre");
    source.textContent = this.value;
    body.append(alert, source);
    this.diagnostics([{ severity: "error", message }]);
  }
  private schedule() {
    if (this.#queued || !this.isConnected) return;
    this.#queued = true;
    queueMicrotask(() => {
      this.#queued = false;
      if (this.isConnected) {
        const current = this.checkpoint();
        try {
          void Promise.resolve(this.render()).catch((error) => {
            if (current()) this.failure(error);
          });
        } catch (error) {
          this.failure(error);
        }
      }
    });
  }
}
