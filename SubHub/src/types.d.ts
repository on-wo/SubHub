// 扩展 Hono 的 Env 类型
declare module 'hono' {
  interface Env {
    USERS_KV: KVNamespace;
    JWT_SECRET: string;
    ADMIN_KEY: string;
  }
}

// Cloudflare Workers 的 btoa/atob 声明
declare function btoa(data: string): string;
declare function atob(data: string): string;