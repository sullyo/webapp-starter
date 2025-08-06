import { ResizableChatLayout } from "./_components/resizable-chat-layout";

type Params = Promise<{ id: string }>;

export default async function ChatPage({ params }: { params: Params }) {
  const { id } = await params;

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      <main className="@container relative h-dvh w-0 flex-shrink flex-grow overflow-y-auto">
        <ResizableChatLayout id={id} />
      </main>
    </div>
  );
}
