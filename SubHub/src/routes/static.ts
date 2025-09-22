import { Hono } from 'hono';

const app = new Hono();

// 部署向导
app.get('/deploy', (c) => {
  return c.redirect('/static/deploy.html');
});

// 静态页面服务
app.get('/docs', (c) => {
  return c.html(`
    <div class="p-4 max-w-3xl mx-auto">
      <h1 class="text-2xl font-bold mb-4">使用帮助</h1>
      
      <div class="prose">
        <h2>简介</h2>
        <p>SubHub 是一个简单的订阅管理面板，支持：</p>
        <ul>
          <li>查看订阅链接</li>
          <li>检查剩余流量</li>
          <li>查看到期时间</li>
          <li>手动刷新数据</li>
        </ul>

        <h2>登录方式</h2>
        <p>使用管理员提供的 UUID 登录即可访问你的订阅信息。</p>

        <h2>注意事项</h2>
        <ul>
          <li>建议定期刷新以获取最新数据</li>
          <li>遇到问题请联系管理员</li>
        </ul>
      </div>
    </div>
  `);
});

app.get('/clients', (c) => {
  return c.html(`
    <div class="p-4 max-w-3xl mx-auto">
      <h1 class="text-2xl font-bold mb-4">客户端下载</h1>
      
      <div class="space-y-6">
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold mb-2">Windows</h2>
          <ul class="space-y-2">
            <li><a href="https://github.com/2dust/v2rayN/releases" class="text-blue-600 hover:underline">v2rayN</a></li>
            <li><a href="https://github.com/Fndroid/clash_for_windows_pkg/releases" class="text-blue-600 hover:underline">Clash for Windows</a></li>
          </ul>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold mb-2">macOS</h2>
          <ul class="space-y-2">
            <li><a href="https://github.com/yanue/V2rayU/releases" class="text-blue-600 hover:underline">V2rayU</a></li>
            <li><a href="https://github.com/Fndroid/clash_for_windows_pkg/releases" class="text-blue-600 hover:underline">ClashX</a></li>
          </ul>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold mb-2">iOS</h2>
          <ul class="space-y-2">
            <li><a href="https://apps.apple.com/us/app/shadowrocket/id932747118" class="text-blue-600 hover:underline">Shadowrocket</a></li>
            <li><a href="https://apps.apple.com/us/app/quantumult-x/id1443988620" class="text-blue-600 hover:underline">Quantumult X</a></li>
          </ul>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold mb-2">Android</h2>
          <ul class="space-y-2">
            <li><a href="https://github.com/2dust/v2rayNG/releases" class="text-blue-600 hover:underline">v2rayNG</a></li>
            <li><a href="https://github.com/Kr328/ClashForAndroid/releases" class="text-blue-600 hover:underline">Clash for Android</a></li>
          </ul>
        </div>
      </div>
    </div>
  `);
});

export default app;