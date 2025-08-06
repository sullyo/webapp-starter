import type { UseChatHelpers } from "@ai-sdk/react";

import type { ChatUIMessage as InternalMessage } from "../../../../api/src/modules/chat";

export type ChatHelpers = UseChatHelpers<InternalMessage>;

export type ChatUIMessage = InternalMessage;
