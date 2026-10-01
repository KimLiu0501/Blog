// 内容集合（合集）定义
//
// ⚠️ Astro 要求这里的 collections 是静态写死的对象，不能用循环动态生成，
//    所以加新合集时必须在这里手动补一条。schema 是共用的。
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 所有合集共用的字段定义
const postSchema = z.object({
  title: z.string(),
  // 列表页和 RSS 里显示的一句话摘要
  description: z.string().optional(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  // 草稿箱的核心开关：true 的文章不会出现在正式构建里
  draft: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  // 封面图，放在 public/ 下，写 /images/xxx.jpg
  cover: z.string().optional(),
});

export const collections = {
  'reading-notes': defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/reading-notes' }),
    schema: postSchema,
  }),
  tech: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/tech' }),
    schema: postSchema,
  }),
  life: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/life' }),
    schema: postSchema,
  }),
};
