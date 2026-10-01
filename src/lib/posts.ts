// 跨合集的取文章工具
// 所有合集共用同一套 schema，所以 entry 类型可以直接复用其中一个
import { getCollection, type CollectionEntry } from 'astro:content';
import { COLLECTION_IDS } from '../collections';

export type PostEntry = CollectionEntry<'reading-notes'>;

// 取全部合集的已发布文章，按时间倒序
export async function getPublishedPosts(): Promise<PostEntry[]> {
  const lists = await Promise.all(
    COLLECTION_IDS.map((id) => getCollection(id as 'reading-notes'))
  );
  return lists
    .flat()
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()) as PostEntry[];
}

// 只看草稿，给草稿箱页面用
export async function getDraftPosts(): Promise<PostEntry[]> {
  const lists = await Promise.all(
    COLLECTION_IDS.map((id) => getCollection(id as 'reading-notes'))
  );
  return lists
    .flat()
    .filter((p) => p.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()) as PostEntry[];
}

// 取某个合集下的文章（草稿只在开发环境出现）
export async function getPostsInCollection(
  collectionId: string
): Promise<PostEntry[]> {
  const list = await getCollection(collectionId as 'reading-notes');
  return list
    .filter((p) => import.meta.env.DEV || !p.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()) as PostEntry[];
}

export function postUrl(entry: PostEntry): string {
  return `/posts/${entry.collection}/${entry.id}`;
}
