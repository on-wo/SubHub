import { KVStorage } from './storage';

interface SubInfo {
  upload: number;
  download: number;
  total: number;
  expire: string;
}

export async function parseSubscription(url: string): Promise<SubInfo> {
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error('Failed to fetch subscription');
  }

  // 解析 header
  const upload = Number(resp.headers.get('subscription-userinfo-upload')) || 0;
  const download = Number(resp.headers.get('subscription-userinfo-download')) || 0;
  const total = Number(resp.headers.get('subscription-userinfo-total')) || 0;
  const expire = resp.headers.get('subscription-userinfo-expire') || '';

  return {
    upload,
    download,
    total,
    expire
  };
}

// 刷新用户订阅信息
export async function refreshUserSubscription(storage: KVStorage, uuid: string) {
  const user = await storage.getUser(uuid);
  if (!user?.sub) {
    throw new Error('User not found or no subscription URL');
  }

  const info = await parseSubscription(user.sub);
  
  await storage.putUser(uuid, {
    ...user,
    expire: info.expire || user.expire,
    traffic: {
      upload: info.upload,
      download: info.download,
      total: info.total
    }
  });

  return info;
}