import { Hono } from 'hono';
import { requireUser } from '../utils/jwt';
import { KVStorage } from '../utils/storage';
import { refreshUserSubscription } from '../utils/parser';
import { renderBytes, renderDate } from '../utils/render';

const app = new Hono();

app.use('*', requireUser);

// 用户面板
app.get('/', async (c) => {
  const { uuid } = c.get('user');
  const storage = new KVStorage(c.env.USERS_KV);
  
  const user = await storage.getUser(uuid);
  if (!user) {
    return c.text('User not found', 404);
  }

  return c.html(`
    <div class="p-4">
      <div class="bg-white rounded-lg shadow p-6 mb-4">
        <h2 class="text-lg font-semibold mb-4">订阅信息</h2>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">订阅地址</label>
            <input type="text" value="${user.sub}" readonly class="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">到期时间</label>
            <div class="mt-1">${renderDate(user.expire)}</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">已用流量</label>
            <div class="mt-1">${renderBytes(user.traffic.download)}</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">剩余流量</label>
            <div class="mt-1">${renderBytes(Math.max(0, user.traffic.total - user.traffic.download))}</div>
          </div>
        </div>
      </div>
      <button 
        onclick="fetch('/refresh/${uuid}',{method:'POST'}).then(()=>location.reload())"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        刷新数据
      </button>
    </div>
  `);
});

// 刷新订阅
app.post('/refresh/:uuid', async (c) => {
  const { uuid } = c.req.param();
  const user = c.get('user');

  // 仅允许刷新自己的订阅
  if (user.uuid !== uuid) {
    return c.text('Forbidden', 403);
  }

  const storage = new KVStorage(c.env.USERS_KV);
  
  try {
    await refreshUserSubscription(storage, uuid);
    return c.json({ success: true });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

export default app;