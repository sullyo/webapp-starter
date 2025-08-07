/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  apiRpc,
  callRpc,
  getApiClient,
  type InferRequestType,
  type InferResponseType,
} from "./client";

// Define RPC endpoints
const $getChats = apiRpc.chats.$get;
const $getChat = apiRpc.chats[`:id`].$get;
const $createChat = apiRpc.chats.$post;
const $updateChat = apiRpc.chats[`:id`].$patch;
const $deleteChat = apiRpc.chats[`:id`].$delete;
const $getChatMessages = apiRpc.chats[`:id`].messages.$get;
const $createChatMessage = apiRpc.chats[`:id`].messages.$post;
const $getChatMessage = apiRpc.chats[`:chatId`].messages[`:messageId`].$get;
const $updateChatMessage = apiRpc.chats[`:chatId`].messages[`:messageId`].$patch;
const $deleteChatMessage = apiRpc.chats[`:chatId`].messages[`:messageId`].$delete;

// Request types
export type GetChatsParams = InferRequestType<typeof $getChats>;
export type GetChatParams = InferRequestType<typeof $getChat>;
export type CreateChatParams = InferRequestType<typeof $createChat>;
export type UpdateChatParams = InferRequestType<typeof $updateChat>;
export type DeleteChatParams = InferRequestType<typeof $deleteChat>;
export type GetChatMessagesParams = InferRequestType<typeof $getChatMessages>;
export type CreateChatMessageParams = InferRequestType<typeof $createChatMessage>;
export type GetChatMessageParams = InferRequestType<typeof $getChatMessage>;
export type UpdateChatMessageParams = InferRequestType<typeof $updateChatMessage>;
export type DeleteChatMessageParams = InferRequestType<typeof $deleteChatMessage>;

// Response types
export type GetChatsResponseType = InferResponseType<typeof $getChats, 200>;
export type GetChatResponseType = InferResponseType<typeof $getChat, 200>;
export type CreateChatResponseType = InferResponseType<typeof $createChat, 201>;
export type UpdateChatResponseType = InferResponseType<typeof $updateChat, 200>;
export type DeleteChatResponseType = InferResponseType<typeof $deleteChat, 200>;
export type GetChatMessagesResponseType = InferResponseType<typeof $getChatMessages, 200>;
export type CreateChatMessageResponseType = InferResponseType<typeof $createChatMessage, 201>;
export type GetChatMessageResponseType = InferResponseType<typeof $getChatMessage, 200>;
export type UpdateChatMessageResponseType = InferResponseType<typeof $updateChatMessage, 200>;
export type DeleteChatMessageResponseType = InferResponseType<typeof $deleteChatMessage, 200>;

// API methods
export async function getChats() {
  const client = await getApiClient();
  return await callRpc(client.chats.$get());
}

export async function getChat(params: GetChatParams) {
  const client = await getApiClient();
  return await callRpc(client.chats[`:id`].$get(params));
}

export async function createChat(params: CreateChatParams) {
  const client = await getApiClient();
  return await callRpc(client.chats.$post(params));
}

export async function updateChat(params: UpdateChatParams) {
  const client = await getApiClient();
  return await callRpc(client.chats[`:id`].$patch(params));
}

export async function deleteChat(params: DeleteChatParams) {
  const client = await getApiClient();
  return await callRpc(client.chats[`:id`].$delete(params));
}

export async function getChatMessages(params: GetChatMessagesParams) {
  const client = await getApiClient();
  return await callRpc(client.chats[`:id`].messages.$get(params));
}

export async function createChatMessage(params: CreateChatMessageParams) {
  const client = await getApiClient();
  return await callRpc(client.chats[`:id`].messages.$post(params));
}

export async function getChatMessage(params: GetChatMessageParams) {
  const client = await getApiClient();
  return await callRpc(client.chats[`:chatId`].messages[`:messageId`].$get(params));
}

export async function updateChatMessage(params: UpdateChatMessageParams) {
  const client = await getApiClient();
  return await callRpc(client.chats[`:chatId`].messages[`:messageId`].$patch(params));
}

export async function deleteChatMessage(params: DeleteChatMessageParams) {
  const client = await getApiClient();
  return await callRpc(client.chats[`:chatId`].messages[`:messageId`].$delete(params));
}

// React Query hooks
export const useGetChats = () => {
  const query = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      return await getChats();
    },
  });
  return query;
};

export const useGetChat = (params: GetChatParams) => {
  const query = useQuery({
    enabled: !!params.param.id,
    queryKey: ["chat", { id: params.param.id }],
    queryFn: async () => {
      return await getChat(params);
    },
  });
  return query;
};

export const useCreateChat = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<CreateChatResponseType, Error, CreateChatParams>({
    mutationKey: ["chat", "create"],
    mutationFn: async (params) => {
      return await createChat(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
    onError: () => {},
  });
  return mutation;
};

export const useUpdateChat = (id: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<UpdateChatResponseType, Error, UpdateChatParams>({
    mutationKey: ["chat", { id }],
    mutationFn: async (params) => {
      return await updateChat(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.invalidateQueries({ queryKey: ["chat", { id }] });
    },
    onError: () => {},
  });
  return mutation;
};

export const useDeleteChat = (id: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<DeleteChatResponseType, Error, DeleteChatParams>({
    mutationKey: ["chat", "delete", { id }],
    mutationFn: async (params) => {
      return await deleteChat(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
  return mutation;
};

export const useGetChatMessages = (params: GetChatMessagesParams & { disable?: boolean }) => {
  const query = useQuery({
    enabled: !!params.param.id && !params.disable,
    queryKey: ["chat-messages", { chatId: params.param.id }],
    refetchOnWindowFocus: false,
    retry: false,
    queryFn: async () => {
      return await getChatMessages(params);
    },
  });
  return query;
};

export const useCreateChatMessage = (chatId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<CreateChatMessageResponseType, Error, CreateChatMessageParams>({
    mutationKey: ["chat-message", "create", { chatId }],
    mutationFn: async (params) => {
      return await createChatMessage(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", { chatId }] });
    },
    onError: () => {
      // toast.error("Failed to send message");
    },
  });
  return mutation;
};

export const useGetChatMessage = (params: GetChatMessageParams) => {
  const query = useQuery({
    enabled: !!params.param.chatId && !!params.param.messageId,
    queryKey: ["chat-message", { chatId: params.param.chatId, messageId: params.param.messageId }],
    queryFn: async () => {
      return await getChatMessage(params);
    },
  });
  return query;
};

export const useUpdateChatMessage = (chatId: string, messageId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<UpdateChatMessageResponseType, Error, UpdateChatMessageParams>({
    mutationKey: ["chat-message", { chatId, messageId }],
    mutationFn: async (params) => {
      return await updateChatMessage(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", { chatId }] });
      queryClient.invalidateQueries({ queryKey: ["chat-message", { chatId, messageId }] });
    },
    onError: () => {
      // toast.error("Failed to update message");
    },
  });
  return mutation;
};

export const useDeleteChatMessage = (chatId: string, messageId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<DeleteChatMessageResponseType, Error, DeleteChatMessageParams>({
    mutationKey: ["chat-message", "delete", { chatId, messageId }],
    mutationFn: async (params) => {
      return await deleteChatMessage(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", { chatId }] });
    },
  });
  return mutation;
};
