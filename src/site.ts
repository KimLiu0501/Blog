// 站点基本信息 —— 换成你自己的
export const SITE = {
  title: '小k 的博客',
  description: '读书笔记、技术随笔与生活影像',
  author: '小k',
  lang: 'zh-CN',
  // 导航项
  nav: [
    { label: '首页', href: '/' },
    { label: '归档', href: '/archives' },
    { label: '合集', href: '/collections' },
  ],
};

// 日期格式化：2026年10月1日
export function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// 简短日期：2026-10-01
export function formatShortDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
