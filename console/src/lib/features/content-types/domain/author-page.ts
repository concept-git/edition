export type AuthorPage = {
  id: string;
  title: string;
  slug: string;
  format: string;
  contentType: string;
  versionRef: string;
  interpretation: Record<string, unknown>;
};

export type PageList = {
  items: AuthorPage[];
};

export type CreatePageBody = {
  format: string;
  title: string;
  slug: string;
  contentType: string;
  versionRef: string;
  interpretation: Record<string, unknown>;
};
