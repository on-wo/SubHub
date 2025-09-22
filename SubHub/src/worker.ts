import { Hono } from 'hono';
import login from './routes/login';
import user from './routes/user';
import admin from './routes/admin';
import static_ from './routes/static';

const app = new Hono();

// 配置跨域
app.use('*', async (c, next) => {
  await next();
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,POST,DELETE,PATCH');
});

// 注册路由
app.route('/login', login);
app.route('/logout', login);
app.route('/user', user);
app.route('/admin', admin);
app.route('/', static_);

// 默认重定向到用户面板
app.get('/', (c) => c.redirect('/user'));

export default app;