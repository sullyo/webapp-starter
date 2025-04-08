"use client";

import { Chat } from "@/components/chat/chat";

interface ChatLayoutProps {
  id: string;
}

export function ChatLayout({ id }: ChatLayoutProps) {
  /* Fetch any initial messages, if required. */

  return (
    <div>
      <Chat id={id} initialMessages={[]} isReadonly={false} />
    </div>
  );
}
