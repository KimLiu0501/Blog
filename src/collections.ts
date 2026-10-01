// 文章合集定义
//
// 想加一个新合集，两步：
//   1. 在 src/content/ 下建一个同名英文目录（比如 essays）
//   2. 在下面加一行 'essays': { title: '...', description: '...' }
//      —— 并在 src/content.config.ts 的 collections 里补一条 defineCollection
//
// 目录名用英文是为了 URL 干净（/collections/essays），
// 显示给读者的是 title，中文随便起。

export const COLLECTIONS = {
  'reading-notes': {
    title: '读书笔记',
    description: '读完一本书之后留下的东西',
  },
  tech: {
    title: '技术随笔',
    description: 'Android、鸿蒙与 Flutter 的实践记录',
  },
  life: {
    title: '生活影像',
    description: 'vlog、摄影与一点日系影像审美',
  },
} as const;

export type CollectionId = keyof typeof COLLECTIONS;

export const COLLECTION_IDS = Object.keys(COLLECTIONS) as CollectionId[];

export function getCollectionMeta(id: string) {
  return COLLECTIONS[id as CollectionId] ?? { title: id, description: '' };
}
