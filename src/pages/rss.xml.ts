import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublishedPosts, postUrl } from '../lib/posts';
import { SITE } from '../site';

// RSS 只包含已发布文章，草稿不会漏出去
export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site!,
    items: posts.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description ?? '',
      pubDate: entry.data.pubDate,
      link: postUrl(entry),
      categories: entry.data.tags,
    })),
    customData: `<language>zh-CN</language>`,
  });
}
