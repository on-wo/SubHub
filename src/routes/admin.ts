import { Hono } from 'hono';
import { requireAdmin } from '../utils/jwt';
import { KVStorage } from '../utils/storage';
import { renderBytes, renderDate } from '../utils/render';

const app = new Hono();

app.use('*', requireAdmin);

// 管理面板
app.get('/', async (c) => {
  const storage = new KVStorage(c.env.USERS_KV);
  const users = await storage.listUsers();
  
  return c.html(`
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-4">用户管理</h1>
      
      <!-- 添加用户 -->
      <form class="bg-white rounded-lg shadow p-6 mb-6" onsubmit="event.preventDefault(); addUser(this)">
        <h2 class="text-lg font-semibold mb-4">添加用户</h2>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">UUID</label>
            <input name="uuid" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">订阅地址</label>
            <input name="sub" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">到期时间</label>
            <input name="expire" type="datetime-local" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">备注</label>
            <input name="note" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
          </div>
        </div>
        <button type="submit" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          添加
        </button>
      </form>

      <!-- 用户列表 -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UUID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">订阅地址</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">到期时间</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">已用流量</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">备注</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${Object.entries(users).map(([uuid, user]) => `
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${uuid}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${user.sub}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${renderDate(user.expire)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${renderBytes(user.traffic.download)} / ${renderBytes(user.traffic.total)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${user.note || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <button onclick="deleteUser('${uuid}')" class="text-red-600 hover:text-red-900">删除</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <script>
    async function addUser(form) {
      const data = {
        sub: form.sub.value,
        expire: form.expire.value,
        note: form.note.value,
        traffic: { upload: 0, download: 0, total: 1099511627776 } // 1TB
      };

      await fetch('/admin/users/' + form.uuid.value, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      location.reload();
    }

    async function deleteUser(uuid) {
      if (!confirm('确定要删除此用户吗？')) return;
      
      await fetch('/admin/users/' + uuid, { method: 'DELETE' });
      location.reload();
    }
    </script>
  `);
});

// CRUD API
app.put('/users/:uuid', async (c) => {
  const { uuid } = c.req.param();
  const data = await c.req.json();
  
  const storage = new KVStorage(c.env.USERS_KV);
  await storage.putUser(uuid, data);
  
  return c.json({ success: true });
});

app.delete('/users/:uuid', async (c) => {
  const { uuid } = c.req.param();
  
  const storage = new KVStorage(c.env.USERS_KV);
  await storage.deleteUser(uuid);
  
  return c.json({ success: true });
});

export default app;