export type SaveIntent = Readonly<{
  content: string;
  etag: string;
  key: string;
}>;
export type Conflict = Readonly<{ content: string; etag: string }>;

/** One editing session owns one mutable draft. Server refreshes cannot overwrite local input. */
export class EditorDraft {
  content: string;
  etag: string;
  conflict: Conflict | null = null;
  private baseline: string;
  private intent: SaveIntent | null = null;
  constructor(content: string, etag: string) {
    this.content = content;
    this.baseline = content;
    this.etag = etag;
  }
  get dirty() {
    return this.content !== this.baseline;
  }
  edit(content: string) {
    this.content = content;
  }
  beginSave(key: string): SaveIntent {
    if (!this.intent || this.intent.content !== this.content)
      this.intent = { content: this.content, etag: this.etag, key };
    return this.intent;
  }
  saved(intent: SaveIntent, etag: string) {
    this.baseline = intent.content;
    this.etag = etag;
    this.intent = null;
    this.conflict = null;
  }
  conflicted(content: string, etag: string) {
    this.conflict = { content, etag };
  }
  rebase(content: string) {
    if (!this.conflict) return;
    this.baseline = this.conflict.content;
    this.etag = this.conflict.etag;
    this.content = content;
    this.conflict = null;
    this.intent = null;
  }
}
