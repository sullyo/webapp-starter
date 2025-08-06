import { useCallback } from "react";
import type { ChatUIMessage } from "@/features/chat/chat.types";
import { useChatDraft } from "@/features/chat/hooks/use-chat-drafts";

type UseChatHandlersProps = {
  messages: ChatUIMessage[];
  setMessages: (
    messages: ChatUIMessage[] | ((messages: ChatUIMessage[]) => ChatUIMessage[])
  ) => void;
  setInput: (input: string) => void;
  setSelectedModel: (model: string) => void;
  selectedModel: string;
  chatId: string | null;
};

export function useChatHandlers({
  messages,
  setMessages,
  setInput,
  setSelectedModel,
  selectedModel,
  chatId,
}: UseChatHandlersProps) {
  const { setDraftValue } = useChatDraft(chatId);

  const handleInputChange = useCallback(
    (value: string) => {
      setInput(value);
      setDraftValue(value);
    },
    [setInput, setDraftValue]
  );

  const handleModelChange = useCallback(
    async (model: string) => {
      setSelectedModel(model);
    },
    [setSelectedModel]
  );

  const handleDelete = useCallback(
    (id: string) => {
      setMessages(messages.filter((message) => message.id !== id));
    },
    [messages, setMessages]
  );

  const handleEdit = useCallback(
    (id: string, newText: string) => {
      setMessages(
        messages.map((message) => (message.id === id ? { ...message, content: newText } : message))
      );
    },
    [messages, setMessages]
  );

  return {
    handleInputChange,
    handleModelChange,
    handleDelete,
    handleEdit,
  };
}
