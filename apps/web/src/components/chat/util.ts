import { type Message } from "ai";

export function sanitizeUIMessages(messages: Array<Message>): Array<Message> {
  const messagesBySanitizedToolInvocations = messages.map((message) => {
    if (message.role !== "assistant") return message;

    if (!message.parts) return message;

    const toolResultIds: Array<string> = [];

    for (const part of message.parts) {
      if (part.type === "tool-invocation" && part.toolInvocation.state === "result") {
        toolResultIds.push(part.toolInvocation.toolCallId);
      }
    }

    const sanitizedParts = message.parts.filter(
      (part) =>
        (part.type === "tool-invocation" && part.toolInvocation.state === "result") ||
        toolResultIds.includes(
          part.type === "tool-invocation" ? part.toolInvocation.toolCallId : "",
        ),
    );

    return {
      ...message,
      parts: sanitizedParts,
    };
  });

  return messagesBySanitizedToolInvocations.filter(
    (message) => message.content.length > 0 || (message.parts && message.parts.length > 0),
  );
}
