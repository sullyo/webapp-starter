"use client";
import type { FileUIPart } from "ai";
import { useCallback, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

export interface DraftData {
  message: string;
  inputHeight?: number;
  attachments: FileUIPart[];
  updatedAt: number;
}

interface DraftsStore {
  version: number;
  drafts: Record<string, DraftData>;
}

const DRAFTS_STORAGE_KEY = "chat-drafts";
export const NEW_CHAT_DRAFT_KEY = "new-chat-draft";

/**
 * Hook to manage persistent chat drafts using localStorage (Vercel-style)
 * @param chatId - The current chat ID (null for new chat)
 * @returns Object containing draft methods and data
 */
export function useChatDraft(chatId: string | null) {
  const draftKey = chatId || NEW_CHAT_DRAFT_KEY;

  const [attachments, setAttachments] = useState<FileUIPart[]>([]);

  const [draftsStore, setDraftsStore] = useLocalStorage<DraftsStore>(DRAFTS_STORAGE_KEY, {
    version: 1,
    drafts: {},
  });

  const getDraft = useCallback(
    (draftId?: string): DraftData | null => {
      return draftsStore.drafts[draftId || draftKey] || null;
    },
    [draftKey, draftsStore.drafts]
  );

  const updateInput = useCallback(
    (input: string) => {
      setDraftsStore((currentStore) => {
        const currentDraft = currentStore.drafts[draftKey] || {
          message: "",
          attachments: [],
          updatedAt: Date.now(),
        };
        return {
          ...currentStore,
          drafts: {
            ...currentStore.drafts,
            [draftKey]: {
              ...currentDraft,
              message: input,
              updatedAt: Date.now(),
            },
          },
        };
      });
    },
    [draftKey, setDraftsStore]
  );

  const updateAttachments = useCallback(
    (newFiles: FileUIPart[]) => {
      setAttachments(newFiles);

      setDraftsStore((currentStore) => {
        const currentDraft = currentStore.drafts[draftKey] || {
          message: "",
          attachments: [],
          updatedAt: Date.now(),
        };
        return {
          ...currentStore,
          drafts: {
            ...currentStore.drafts,
            [draftKey]: {
              ...currentDraft,
              attachments: newFiles,
              updatedAt: Date.now(),
            },
          },
        };
      });
    },
    [draftKey, setDraftsStore]
  );

  const updateDraft = useCallback(
    (updates: Partial<DraftData & { id?: string }>) => {
      const idToUpdate = updates.id || draftKey;
      setDraftsStore((currentStore) => {
        const currentDraftData = currentStore.drafts[idToUpdate] || {
          message: "",
          attachments: [],
          updatedAt: Date.now(),
        };
        const newDraftData = {
          ...currentDraftData,
          ...updates,
          updatedAt: Date.now(),
        };
        // biome-ignore lint/performance/noDelete: <explanation>
        if (updates.id && newDraftData.id) delete newDraftData.id; // remove id from data if it was only for targeting

        return {
          ...currentStore,
          drafts: {
            ...currentStore.drafts,
            [idToUpdate]: newDraftData,
          },
        };
      });
    },
    [draftKey, setDraftsStore]
  );

  const clearDraft = useCallback(
    (draftId?: string) => {
      const idToClear = draftId || draftKey;

      setDraftsStore((currentStore) => ({
        ...currentStore,
        drafts: {
          ...currentStore.drafts,
          [idToClear]: {
            message: "",
            attachments: [],
            updatedAt: Date.now(),
          },
        },
      }));
      // If clearing the draft associated with this hook instance (or a specific one passed), clear local attachments too
      if (!draftId || draftId === draftKey) {
        setAttachments([]);
      }
    },
    [draftKey, setDraftsStore]
  );

  const draft = getDraft();

  return {
    updateInput,
    updateAttachments,
    updateDraft: (updates: Partial<DraftData & { draftKey?: string }>) => {
      if (updates.message !== undefined) {
        updateDraft({ message: updates.message });
      }
      if (updates.attachments !== undefined) {
        updateAttachments(updates.attachments);
      }
    },
    clearDraft,
    getDraft,
    draftValue: draft?.message || "",
    setDraftValue: updateInput,
  };
}
