import baseX from "base-x";

const b58 = baseX("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz");

import { createIdGenerator } from "ai";

const prefixes = {
  post: "post",
  file: "file",
  chat: "chat",
  message: "msg",
} as const;

export function newId<TPrefix extends keyof typeof prefixes>(prefix: TPrefix, size?: number) {
  const idGenerator = createIdGenerator({
    prefix: prefixes[prefix],
    separator: "-",
    size: size ?? 14,
  });

  return idGenerator();
}

export function newIdWithoutPrefix(maxLength: number): string {
  const buf = crypto.getRandomValues(new Uint8Array(20));
  const encoded = b58.encode(buf);
  return encoded.slice(0, maxLength);
}
