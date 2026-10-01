// Astro 配置
// 部署前记得把 site 换成你自己的境外域名，sitemap 和 RSS 都依赖它
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://example.com',
  output: 'static',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'github-light',
      wrap: true,
    },
  },
});
