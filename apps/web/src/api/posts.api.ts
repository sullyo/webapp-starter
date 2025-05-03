import { apiRpc, InferRequestType, callRpc, getApiClient } from "./client";

const $createPost = apiRpc.posts.$post;

export async function getPosts() {
  const client = await getApiClient();
  return callRpc(client.posts.$get());
}

export type CreatePostParams = InferRequestType<typeof $createPost>;
export async function createPost(params: CreatePostParams) {
  const client = await getApiClient();
  return callRpc(client.posts.$post(params));
}
