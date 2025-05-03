import { ClientResponse, hc } from "hono/client";

import { HTTPException } from "hono/http-exception";
import type { AppType } from "../../../api/src";
import { getToken } from "@/lib/clerk";

export type { InferRequestType, InferResponseType } from "hono/client";

const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL!;
};

export const apiRpc = hc<AppType>(getBaseUrl(), {
  fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
    return fetch(input, init);
  },
}).api;

export const getApiClient = () => {
  return hc<AppType>(getBaseUrl(), {
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      const authToken = await getToken();

      headers.set("Authorization", `Bearer ${authToken}`);

      const response = await fetch(input, {
        ...init,
        headers,
        cache: "no-store",
      });

      return response;
    },
  }).api;
};

export const getServerClient = () => {
  return hc<AppType>(getBaseUrl(), {
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      const response = await fetch(input, {
        ...init,
        headers,
        cache: "no-store",
      });

      return response;
    },
  }).api;
};

export const callRpc = async <T>(rpc: Promise<ClientResponse<T>>): Promise<T> => {
  try {
    const data = await rpc;

    if (!data.ok) {
      const res = await data.text();
      throw new Error(res);
    }

    const res = await data.json();
    return res as T;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};
