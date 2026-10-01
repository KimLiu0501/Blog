/**
 * GitHub OAuth 代理 —— 给 Sveltia / Decap CMS 做登录用
 *
 * 为什么需要它：CMS 在浏览器里跑，不能把 GitHub 密钥写在前端，
 * 所以由这个 Worker 拿着密钥去换 token，再把 token 交回给编辑器。
 *
 * 部署（在 workers/oauth 目录下）：
 *   npx wrangler deploy
 *   npx wrangler secret put GITHUB_CLIENT_ID
 *   npx wrangler secret put GITHUB_CLIENT_SECRET
 *
 * 两个环境变量来自 GitHub OAuth App：
 *   https://github.com/settings/developers → New OAuth App
 *   Homepage URL:              你的博客地址
 *   Authorization callback URL: https://<这个 worker 的域名>/callback
 */

const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';

function getCookie(request, name) {
  const cookie = request.headers.get('Cookie') || '';
  const hit = cookie.split(';').find((c) => c.trim().startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.split('=')[1]) : null;
}

// 授权成功后回给编辑器的页面：通过 postMessage 把 token 交给打开它的窗口
function successPage(token) {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <title>授权完成</title>
  </head>
  <body>
    <p>授权完成，正在返回编辑器…</p>
    <script>
      (function () {
        var payload = ${JSON.stringify({ token, provider: 'github' })};
        function receiveMessage(event) {
          window.opener.postMessage(
            'authorization:github:success:' + JSON.stringify(payload),
            event.origin
          );
          window.removeEventListener('message', receiveMessage);
        }
        window.addEventListener('message', receiveMessage, false);
        window.opener.postMessage('authorizing:github', '*');
      })();
    </script>
  </body>
</html>`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 第一步：把 CMS 的登录请求转给 GitHub
    if (url.pathname === '/auth') {
      const scope = url.searchParams.get('scope') || 'repo,user';
      const state = crypto.randomUUID();
      const redirectUri = new URL('/callback', request.url).href;

      const params = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        redirect_uri: redirectUri,
        scope,
        state,
      });

      return new Response(null, {
        status: 302,
        headers: {
          Location: `${GITHUB_AUTHORIZE_URL}?${params}`,
          'Set-Cookie': `cms_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
        },
      });
    }

    // 第二步：GitHub 带着 code 回调，用它换 access token
    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const savedState = getCookie(request, 'cms_oauth_state');

      if (!code) {
        return new Response('缺少 code 参数', { status: 400 });
      }
      if (!savedState || savedState !== state) {
        return new Response('state 校验失败，请重新登录', { status: 400 });
      }

      const tokenRes = await fetch(GITHUB_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'blog-cms-auth',
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });

      const data = await tokenRes.json();

      if (!data.access_token) {
        return new Response(`GitHub 换 token 失败：${data.error_description || data.error}`, {
          status: 400,
        });
      }

      return new Response(successPage(data.access_token), {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Set-Cookie': 'cms_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
        },
      });
    }

    return new Response('Not found', { status: 404 });
  },
};
