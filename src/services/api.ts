const BASE_URL = import.meta.env.VITE_BASE_URL ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    ...init,
  });

  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

function mutate<T>(method: string) {
  return (path: string, body: unknown | FormData) => {
    const isForm = body instanceof FormData;
    return request<T>(path, {
      method,
      headers: isForm ? undefined : { 'Content-Type': 'application/json' },
      body: isForm ? body : JSON.stringify(body),
    });
  };
}

export const api = {
  get:    <T>(path: string, params?: object) => {
    if (params) {
      const query = new URLSearchParams(
        Object.entries(params as Record<string, unknown>)
          .filter(([, v]) => v !== undefined && v !== null)
          .map(([k, v]) => [k, String(v)])
      ).toString();
      if (query) path = `${path}?${query}`;
    }
    return request<T>(path);
  },
  post:   <T>(path: string, body: unknown | FormData) => mutate<T>('POST')(path, body),
  put:    <T>(path: string, body: unknown | FormData) => mutate<T>('PUT')(path, body),
  patch:  <T>(path: string, body: unknown | FormData) => mutate<T>('PATCH')(path, body),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};