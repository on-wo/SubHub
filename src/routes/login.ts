import { Hono } from 'hono';
import { createToken } from '../utils/jwt';

const app = new Hono();

// 登录页面
app.get('/login', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SubHub - 登录</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@sweetalert2/theme-minimal@5/minimal.css">
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    </head>
    <body class="bg-gray-100 h-screen flex items-center justify-center">
        <div class="max-w-md w-full mx-auto">
            <div class="bg-white py-8 px-6 shadow-md rounded-lg">
                <h2 class="text-2xl font-bold text-center text-gray-800 mb-8">SubHub</h2>
                
                <!-- 登录表单 -->
                <form id="loginForm" class="space-y-6">
                    <!-- 切换按钮 -->
                    <div class="flex rounded-lg bg-gray-100 p-1">
                        <button type="button" onclick="switchForm('user')" 
                            class="flex-1 py-2 text-sm rounded-md transition-colors duration-200"
                            id="userBtn">
                            用户登录
                        </button>
                        <button type="button" onclick="switchForm('admin')"
                            class="flex-1 py-2 text-sm rounded-md transition-colors duration-200"
                            id="adminBtn">
                            管理员登录
                        </button>
                    </div>

                    <!-- 用户登录字段 -->
                    <div id="userField">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            UUID
                        </label>
                        <input type="text" id="uuid" name="uuid" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="输入你的 UUID">
                    </div>

                    <!-- 管理员登录字段 -->
                    <div id="adminField" class="hidden">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            管理员密码
                        </label>
                        <input type="password" id="key" name="key"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="输入管理员密码">
                    </div>

                    <button type="submit"
                        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        登录
                    </button>
                </form>
            </div>
        </div>

        <script>
        // 切换表单显示
        function switchForm(type) {
            const userField = document.getElementById('userField');
            const adminField = document.getElementById('adminField');
            const userBtn = document.getElementById('userBtn');
            const adminBtn = document.getElementById('adminBtn');

            if (type === 'user') {
                userField.classList.remove('hidden');
                adminField.classList.add('hidden');
                userBtn.classList.add('bg-white');
                adminBtn.classList.remove('bg-white');
            } else {
                userField.classList.add('hidden');
                adminField.classList.remove('hidden');
                userBtn.classList.remove('bg-white');
                adminBtn.classList.add('bg-white');
            }
        }

        // 初始化显示用户登录
        switchForm('user');

        // 处理表单提交
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const uuid = document.getElementById('uuid').value;
            const key = document.getElementById('key').value;
            
            try {
                const res = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ uuid, key })
                });

                const data = await res.json();
                
                if (res.ok) {
                    // 登录成功，根据角色跳转
                    window.location.href = data.role === 'admin' ? '/admin' : '/user';
                } else {
                    // 登录失败，显示错误
                    throw new Error(data.error || '登录失败');
                }
            } catch (err) {
                Swal.fire({
                    title: '错误',
                    text: err.message || '登录失败，请重试',
                    icon: 'error',
                    confirmButtonText: '确定'
                });
            }
        });
        </script>
    </body>
    </html>
  `);
});

// 登录API
app.post('/login', async (c) => {
  const { uuid, key } = await c.req.json();

  // 管理员登录
  if (key === c.env.ADMIN_KEY) {
    const token = createToken({ role: 'admin', uuid: 'admin' }, c.env.JWT_SECRET);
    c.header('Set-Cookie', `auth=${token}; Path=/; HttpOnly`);
    return c.json({ role: 'admin' });
  }

  // 用户登录
  const storage = new KVStorage(c.env.USERS_KV);
  const user = await storage.getUser(uuid);
  if (!user) {
    return c.json({ error: 'UUID 无效' }, 401);
  }

  const token = createToken({ role: 'user', uuid }, c.env.JWT_SECRET);
  c.header('Set-Cookie', `auth=${token}; Path=/; HttpOnly`);
  return c.json({ role: 'user' });
});

// 登出
app.get('/logout', (c) => {
  c.header('Set-Cookie', 'auth=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  return c.redirect('/login');
});

export default app;