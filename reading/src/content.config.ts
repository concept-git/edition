import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { spaceCollection } from "./loaders/space";
export const BLOG_PATH = "";
const posts = defineCollection({
  loader: spaceCollection("post"),
  schema: z.object({
    kind: z.enum(["post", "guide"]).default("post"),
    title: z.string(),
    description: z.string(),
    author: z.string(),
    pubDatetime: z.coerce.date(),
    modDatetime: z.coerce.date().optional().nullable(),
    category: z.string(),
    categoryLabel: z.string().optional(),
    tags: z.array(z.string()),
    tagSlugs: z.record(z.string(), z.string()),
    ogImage: z.string().optional(),
    canonicalURL: z.string(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    hideEditPost: z.boolean().default(true),
    hideToc: z.boolean().optional(),
    timezone: z.string().optional(),
    noIndex: z.boolean().default(false),
  }),
});
const pages = defineCollection({
  loader: spaceCollection("page"),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    ogImage: z.string().optional(),
    canonicalURL: z.string().optional(),
    noIndex: z.boolean().default(false),
  }),
});
export const collections = { posts, pages };
