#!/usr/bin/env node
// 新建一篇文章，默认生成为草稿
//
// 用法：
//   npm run new <合集> "<标题>"
//   npm run new <合集> "<标题>" <文件名slug>
//
// 例：
//   npm run new tech "为什么我用 Astro"
//   npm run new reading-notes "读《海边的卡夫卡》" kafka-on-the-shore
//
// slug 不写就用时间戳当文件名。slug 建议用英文，它会出现在文章网址里。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = path.join(root, 'src/content');
const args = process.argv.slice(2);

const pad = (n) => String(n).padStart(2, '0');

function listCollections() {
  return fs
    .readdirSync(contentDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

const collections = listCollections();

if (args.length < 2 || args[0] === '-h' || args[0] === '--help') {
  console.log('用法: npm run new <合集> "<标题>" [slug]\n');
  console.log(`可用合集: ${collections.join(' / ')}`);
  process.exit(args.length < 2 ? 1 : 0);
}

const [collection, title, slugArg] = args;

if (!collections.includes(collection)) {
  console.error(`没有「${collection}」这个合集。`);
  console.error(`可用合集: ${collections.join(' / ')}`);
  console.error('（想加新合集：在 src/content/ 下建目录，再改 src/collections.ts 和 src/content.config.ts）');
  process.exit(1);
}

const now = new Date();
const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
const slug =
  slugArg || `post-${dateStr.replace(/-/g, '')}-${pad(now.getHours())}${pad(now.getMinutes())}`;

const file = path.join(contentDir, collection, `${slug}.md`);

if (fs.existsSync(file)) {
  console.error(`已经存在了：src/content/${collection}/${slug}.md`);
  process.exit(1);
}

const body = `---
title: ${JSON.stringify(title)}
description: ''
pubDate: ${dateStr}
draft: true
tags: []
---

在这里写正文。

写完之后，把上面的 draft 改成 false，这篇文章就会出现在首页、归档和合集里。
`;

fs.writeFileSync(file, body);

console.log(`建好了：src/content/${collection}/${slug}.md`);
console.log('现在它是草稿，本地 dev 的「草稿箱」里能看到。发布时把 draft 改成 false。');
