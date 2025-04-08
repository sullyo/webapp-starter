import { ChatLayout } from "./_components/chat-layout";

type Params = Promise<{ id: string }>;

export default async function ChatPage({ params }: { params: Params }) {
  const { id } = await params;

  return (
    <div className="h-[calc(100dvh-49px)] w-full">
      <ChatLayout id={id} />
    </div>
  );
}
