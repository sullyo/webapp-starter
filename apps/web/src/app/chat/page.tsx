"use client";

import { Chat } from "@/features/chat";

export default function ChatPage() {
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      <main className="@container relative h-dvh w-0 flex-shrink flex-grow overflow-y-auto">
        <Chat id={null} initialChatModel={""} initialMessages={[]} />
      </main>
    </div>
  );
}
