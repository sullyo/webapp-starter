import { getToken } from "@/lib/clerk";

export const chatUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/chat`;

export async function customFetcher(input: RequestInfo | URL, init?: RequestInit) {
  const token = await getToken();
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string>),
  };

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
