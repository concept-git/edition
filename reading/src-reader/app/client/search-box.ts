// 页眉即时搜索的 DOM 装配：渲染 createSuggest 的状态，转发输入、键盘与点击。
import {
  createSuggest,
  snippetSegments,
  suggestMessages,
  type SearchTracker,
  type SuggestGateway,
  type SuggestState,
} from "../../features/search/index.ts";

export function mountSearchBox(
  doc: Document,
  deps: { gateway: SuggestGateway; tracker: SearchTracker },
): void {
  const input = doc.querySelector<HTMLInputElement>("#site-search-input");
  const popover = doc.querySelector<HTMLElement>("#site-search-results");
  if (!input || !popover) return;
  const scope = doc.querySelector<HTMLSelectElement>("#site-search-scope");
  const status = doc.querySelector<HTMLElement>("#site-search-status");
  const text = suggestMessages(doc.documentElement.lang.startsWith("zh"));
  const scopeValue = () => scope?.value ?? "";
  let options: HTMLElement[] = [];

  const row = (message: string) => {
    const element = doc.createElement("div");
    element.className = "search-state";
    element.textContent = message;
    popover.append(element);
  };
  const option = (element: HTMLElement, generation: number) => {
    element.id = `site-search-option-${generation}-${options.length}`;
    element.setAttribute("role", "option");
    element.setAttribute("aria-selected", "false");
    popover.append(element);
    options.push(element);
  };

  const render = (state: SuggestState) => {
    popover.replaceChildren();
    options = [];
    input.removeAttribute("aria-activedescendant");
    let announce = "";
    if (state.phase === "loading") row((announce = text.loading));
    else if (state.phase === "empty") row((announce = text.empty));
    else if (state.phase === "too-long") row((announce = text.tooLong));
    else if (state.phase === "failed") {
      announce = text.error;
      row(
        text.error +
          (state.failure?.traceId ? ` (${state.failure.traceId})` : ""),
      );
      const retry = doc.createElement("button");
      retry.type = "button";
      retry.className = "search-all";
      retry.textContent = text.retry;
      retry.disabled = !state.retryEnabled;
      retry.addEventListener("click", () => controller.retry());
      option(retry, state.generation);
    } else if (state.phase === "results") {
      for (const hit of state.hits) {
        const link = doc.createElement("a");
        link.className = "search-hit";
        link.href = hit.path;
        const title = doc.createElement("strong");
        title.textContent = hit.title;
        const path = doc.createElement("small");
        path.textContent = `${hit.spaceName} · ${hit.path}`;
        const snippet = doc.createElement("p");
        for (const segment of snippetSegments(hit.snippet)) {
          if (segment.mark) {
            const mark = doc.createElement("mark");
            mark.textContent = segment.text;
            snippet.append(mark);
          } else snippet.append(doc.createTextNode(segment.text));
        }
        link.addEventListener("click", () => controller.choose(hit));
        link.append(title, path, snippet);
        option(link, state.generation);
      }
      const all = doc.createElement("a");
      all.className = "search-all";
      all.href = state.allHref ?? "/_search";
      all.textContent = text.all;
      option(all, state.generation);
      announce = text.results(state.hits.length);
    }
    const open = state.phase !== "closed";
    popover.hidden = !open;
    input.setAttribute("aria-expanded", String(open));
    options.forEach((element, at) =>
      element.setAttribute("aria-selected", String(at === state.active)),
    );
    const active = options[state.active];
    if (active) {
      input.setAttribute("aria-activedescendant", active.id);
      active.scrollIntoView?.({ block: "nearest" });
    }
    if (status) status.textContent = announce;
  };

  const controller = createSuggest({ ...deps, onChange: render });
  input.addEventListener("input", () =>
    controller.input(input.value, scopeValue()),
  );
  scope?.addEventListener("change", () =>
    controller.input(input.value, scopeValue()),
  );
  input.addEventListener("compositionstart", () =>
    controller.compositionStart(),
  );
  input.addEventListener("compositionend", () =>
    controller.compositionEnd(input.value, scopeValue()),
  );
  input.addEventListener("keydown", (event) => {
    if (event.isComposing || controller.isComposing()) return;
    const state = controller.state();
    if (event.key === "ArrowDown" && controller.optionCount()) {
      event.preventDefault();
      controller.next();
    } else if (event.key === "ArrowUp" && controller.optionCount()) {
      event.preventDefault();
      controller.previous();
    } else if (event.key === "Enter" && state.active >= 0) {
      event.preventDefault();
      options[state.active]?.click();
    } else if (event.key === "Escape") {
      event.preventDefault();
      controller.hide();
    }
  });
  input.form?.addEventListener("submit", (event) => {
    if (controller.isComposing()) event.preventDefault();
    else controller.submit();
  });
  const outside = (event: Event) => {
    if (!event.composedPath().includes(popover) && event.target !== input)
      controller.hide();
  };
  doc.addEventListener("click", outside);
  doc.addEventListener("focusin", outside);
}

/** 搜索结果页：上报「已展示」，点击结果时上报点击。 */
export function trackSearchPage(doc: Document, tracker: SearchTracker): void {
  const page = doc.querySelector<HTMLElement>("[data-search-proof]");
  const proof = page?.dataset.searchProof;
  if (!page || !proof) return;
  tracker.track("observable", proof, null);
  page
    .querySelectorAll<HTMLAnchorElement>(".search-results a")
    .forEach((link) =>
      link.addEventListener("click", () =>
        tracker.track("click", proof, link.getAttribute("href")),
      ),
    );
}
