import { memo, useState, useRef } from "react";
import { type ChatRequestOptions, type Message } from "ai";
import equal from "fast-deep-equal";

import { PreviewMessage, ThinkingMessage } from "./message";
import { ChatContainer } from "./kit/chat-container";
import { UseChatHelpers } from "@ai-sdk/react";

interface MessagesProps {
  chatId: string;
  status: UseChatHelpers["status"];
  messages: Array<Message>;
  setMessages: (messages: Message[] | ((messages: Message[]) => Message[])) => void;
  reload: (chatRequestOptions?: ChatRequestOptions) => Promise<string | null | undefined>;
  isReadonly: boolean;
  isBlockVisible: boolean;
}

function PureMessages({
  chatId,
  status,
  messages,
  setMessages,
  reload,
  isReadonly,
}: MessagesProps) {
  const [autoScroll, setAutoScroll] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  return (
    <ChatContainer className="flex-1 space-y-4 p-4" autoScroll={autoScroll} ref={chatContainerRef}>
      {messages.map((message, index) => (
        <PreviewMessage
          key={message.id}
          chatId={chatId}
          message={message}
          isLoading={status === "streaming" && messages.length - 1 === index}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
        />
      ))}

      {status === "submitted" &&
        messages.length > 0 &&
        messages[messages.length - 1]?.role === "user" && <ThinkingMessage />}
    </ChatContainer>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isBlockVisible && nextProps.isBlockVisible) return true;

  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.status && nextProps.status) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;

  return true;
});
