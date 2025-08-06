"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo } from "react";
import { useIsMounted, useWindowSize } from "usehooks-ts";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function PureChatHeader({ chatId }: { chatId: string }) {
  const router = useRouter();

  const { width: windowWidth } = useWindowSize();
  const isMounted = useIsMounted();

  return (
    <header className="sticky top-0 flex items-center gap-2 bg-background px-2 py-1.5 md:px-2">
      {windowWidth > 768 && isMounted() && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="order-2 ml-auto px-2 md:order-1 md:ml-0 md:h-fit md:px-2"
              onClick={() => {
                router.push("/chat");
                router.refresh();
              }}
              variant="outline"
            >
              <Plus />
              <span className="md:sr-only">New Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
      )}
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return prevProps.chatId === nextProps.chatId;
});
