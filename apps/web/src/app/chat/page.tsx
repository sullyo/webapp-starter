"use client";

import { Chat } from "@/components/chat/chat";

export default function ChatPage() {
  return (
    <div className="flex h-[calc(100dvh-49px)] w-full flex-col items-center justify-center">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4">
        <h1 className="mb-2 text-center font-bold text-4xl">Chat bot template</h1>
        <p className="mb-8 text-center text-lg text-muted-foreground">Ask any chat questions</p>
        <div className="w-full">
          <Chat id={`home-${Date.now()}`} isHomePage={true} />
        </div>
      </div>
    </div>
  );
}
