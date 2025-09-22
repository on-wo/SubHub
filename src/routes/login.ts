import { Hono } from 'hono';
import { createToken } from '../utils/jwt';

const app = new Hono();

app.post('/login', async (c) => {
  const { uuid, key } = await c.req.json();

  // 管理员登录
  if (key === c.env.ADMIN_KEY) {
    const token = createToken({ role: 'admin', uuid: 'admin' }, c.env.JWT_SECRET);
    c.header('Set-Cookie', `auth=${token}; Path=/; HttpOnly`);
    return c.json({ role: 'admin' });
  }

  // 用户登录
  const user = await c.env.USERS_KV.get(uuid);
  if (!user) {
    return c.json({ error: 'Invalid UUID' }, 401);
  }

  const token = createToken({ role: 'user', uuid }, c.env.JWT_SECRET);
  c.header('Set-Cookie', `auth=${token}; Path=/; HttpOnly`);
  return c.json({ role: 'user' });
});

app.get('/logout', (c) => {
  c.header('Set-Cookie', 'auth=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  return c.redirect('/login');
});

export default app;