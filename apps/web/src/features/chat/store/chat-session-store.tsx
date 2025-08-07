"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useMemo } from "react";

const ChatSessionContext = createContext<{ chatId: string | null | undefined }>({
  chatId: null,
});

export const useChatSession = () => useContext(ChatSessionContext);

export function ChatSessionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const chatId = useMemo(() => {
    if (pathname?.startsWith("/chat/")) return pathname.split("/chat/")[1];
    return null;
  }, [pathname]);

  return <ChatSessionContext.Provider value={{ chatId }}>{children}</ChatSessionContext.Provider>;
}
