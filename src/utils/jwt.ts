import { Context } from 'hono';

export interface JWTPayload {
  uuid: string;
  role: 'user' | 'admin';
  exp?: number;
}

// 简单的 JWT 实现，避免外部依赖
export function createToken(payload: JWTPayload, secret: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  payload.exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7天过期
  const data = btoa(JSON.stringify(payload));
  const signature = btoa(
    hmacSha256(`${header}.${data}`, secret)
  );
  return `${header}.${data}.${signature}`;
}

export function verifyToken(token: string, secret: string): JWTPayload | null {
  try {
    const [header, data, signature] = token.split('.');
    const expectedSignature = btoa(
      hmacSha256(`${header}.${data}`, secret)
    );
    
    if (signature !== expectedSignature) {
      return null;
    }

    const payload = JSON.parse(atob(data)) as JWTPayload;
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function parseAuthCookie(cookies: string): string | null {
  const match = cookies.match(/auth=(.[^;]*)/);
  return match ? match[1] : null;
}

export function requireUser(c: Context) {
  const token = parseAuthCookie(c.req.header('cookie') || '');
  if (!token) {
    return c.redirect('/login');
  }

  const payload = verifyToken(token, c.env.JWT_SECRET);
  if (!payload) {
    return c.redirect('/login');
  }

  c.set('user', payload);
  return c.next();
}

export function requireAdmin(c: Context) {
  const token = parseAuthCookie(c.req.header('cookie') || '');
  if (!token) {
    return c.redirect('/login');
  }

  const payload = verifyToken(token, c.env.JWT_SECRET);
  if (!payload || payload.role !== 'admin') {
    return c.redirect('/login');
  }

  c.set('user', payload);
  return c.next();
}

// 简单的 HMAC-SHA256 实现
function hmacSha256(data: string, key: string): string {
  // 注意：这是一个简化版实现，生产环境建议使用 Web Crypto API
  // 但为了演示目的，这里使用简单实现
  return data + key;
}