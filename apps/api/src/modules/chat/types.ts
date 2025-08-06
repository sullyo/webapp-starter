import type { InferUITools, ToolSet, UIDataTypes, UIMessage } from "ai";

import { weatherTool } from "@/modules/chat/tools";

const customTools: ToolSet = {
  weather: weatherTool(),
};

export type ChatTools = InferUITools<typeof customTools>;

export type ChatUIMessage = UIMessage<never, UIDataTypes, ChatTools>;
