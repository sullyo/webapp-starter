"use client";

import { useCallback, useMemo } from "react";
import { atom, useAtom } from "jotai";
import type { ChatDataParts } from "@/features/chat/types";

export interface Document {
  id: string; // unique identifier for this document instance
  documentId: string; // the documentId from backend (can be shared across versions)
  title: string;
  content: string;
  status: "streaming" | "complete";
  createdAt: number;
  isVisible: boolean;
}

interface ArtifactsState {
  documents: Document[];
  activeDocumentId: string | null;
  isPanelOpen: boolean;
}

// Create atoms for artifact management
const artifactsAtom = atom<ArtifactsState>({
  documents: [],
  activeDocumentId: null,
  isPanelOpen: false,
});

// Optimized selector atoms for performance
const activeDocumentAtom = atom((get) => {
  const state = get(artifactsAtom);
  return state.documents.find((doc) => doc.id === state.activeDocumentId) || null;
});

const documentCountAtom = atom((get) => {
  const state = get(artifactsAtom);
  return state.documents.length;
});

export function useArtifacts() {
  const [state, setState] = useAtom(artifactsAtom);
  const [activeDocument] = useAtom(activeDocumentAtom);
  const [documentCount] = useAtom(documentCountAtom);

  const addDocument = useCallback(
    (artifactData: ChatDataParts["createDocument"] | ChatDataParts["updateDocument"]) => {
      setState((prev) => {
        let title = "Untitled Document";
        if ("title" in artifactData && artifactData.title) {
          title = artifactData.title;
        } else if (prev.documents.length > 0) {
          // Use the most recent document's title for updates
          title = prev.documents[prev.documents.length - 1].title;
        }

        // Check if this is an update to an existing streaming document
        const existingStreamingIndex = prev.documents.findIndex(
          (doc) => doc.documentId === artifactData.documentId && doc.status === "streaming",
        );

        let updatedDocuments;
        let documentId: string;

        if (existingStreamingIndex >= 0) {
          // Update existing streaming document
          const existingDoc = prev.documents[existingStreamingIndex];
          const updatedDocument: Document = {
            ...existingDoc,
            title,
            content: artifactData.content,
            status: artifactData.status === "loading" ? "streaming" : "complete",
            isVisible: artifactData.content.length > 15,
          };

          updatedDocuments = [...prev.documents];
          updatedDocuments[existingStreamingIndex] = updatedDocument;
          documentId = existingDoc.id;
        } else {
          // Create new document
          const newDocument: Document = {
            id: `${artifactData.documentId}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`, // unique instance ID
            documentId: artifactData.documentId, // backend document ID
            title,
            content: artifactData.content,
            status: artifactData.status === "loading" ? "streaming" : "complete",
            createdAt: Date.now(),
            isVisible: artifactData.content.length > 15,
          };

          updatedDocuments = [...prev.documents, newDocument];
          documentId = newDocument.id;
        }

        return {
          ...prev,
          documents: updatedDocuments,
          activeDocumentId: documentId,
          isPanelOpen: updatedDocuments.find((doc) => doc.id === documentId)?.isVisible
            ? true
            : prev.isPanelOpen,
        };
      });
    },
    [setState],
  );

  const streamDocumentContent = useCallback(
    (documentId: string, contentDelta: string) => {
      setState((prev) => {
        const documentIndex = prev.documents.findIndex((doc) => doc.documentId === documentId);
        if (documentIndex === -1) return prev;

        const document = prev.documents[documentIndex];
        const updatedDocument: Document = {
          ...document,
          content: document.content + contentDelta,
          status: "streaming",
          isVisible: document.content.length + contentDelta.length > 15,
        };

        const updatedDocuments = [...prev.documents];
        updatedDocuments[documentIndex] = updatedDocument;

        return {
          ...prev,
          documents: updatedDocuments,
          isPanelOpen: updatedDocument.isVisible ? true : prev.isPanelOpen,
        };
      });
    },
    [setState],
  );

  // Set active document
  const setActiveDocument = useCallback(
    (documentId: string | null) => {
      setState((prev) => ({
        ...prev,
        activeDocumentId: documentId,
      }));
    },
    [setState],
  );

  // Toggle panel visibility
  const togglePanel = useCallback(
    (open?: boolean) => {
      setState((prev) => ({
        ...prev,
        isPanelOpen: open !== undefined ? open : !prev.isPanelOpen,
      }));
    },
    [setState],
  );

  // Navigate between documents (like version history)
  const setActiveDocumentIndex = useCallback(
    (index: number) => {
      setState((prev) => {
        if (index < 0 || index >= prev.documents.length) return prev;

        return {
          ...prev,
          activeDocumentId: prev.documents[index].id,
        };
      });
    },
    [setState],
  );

  // Delete a document
  const deleteDocument = useCallback(
    (documentId: string) => {
      setState((prev) => {
        const remaining = prev.documents.filter((doc) => doc.id !== documentId);
        return {
          ...prev,
          documents: remaining,
          activeDocumentId:
            prev.activeDocumentId === documentId
              ? remaining.length > 0
                ? remaining[remaining.length - 1].id
                : null
              : prev.activeDocumentId,
          isPanelOpen: remaining.length === 0 ? false : prev.isPanelOpen,
        };
      });
    },
    [setState],
  );

  // Get documents as array sorted by creation date (most recent first)
  const documentsList = useMemo(
    () => [...state.documents].sort((a, b) => b.createdAt - a.createdAt),
    [state.documents],
  );

  // Clear all documents
  const clearDocuments = useCallback(() => {
    setState({
      documents: [],
      activeDocumentId: null,
      isPanelOpen: false,
    });
  }, [setState]);

  return {
    // State
    documents: state.documents,
    documentsList,
    activeDocument,
    activeDocumentId: state.activeDocumentId,
    isPanelOpen: state.isPanelOpen,
    documentCount,

    // Actions
    addDocument,
    streamDocumentContent,
    setActiveDocument,
    togglePanel,
    setActiveDocumentIndex,
    deleteDocument,
    clearDocuments,
  };
}

// Hook for accessing a specific document
export function useDocument(documentId: string | undefined) {
  const [state] = useAtom(artifactsAtom);

  const document = useMemo(
    () =>
      documentId ? state.documents.find((doc) => doc.documentId === documentId) || null : null,
    [documentId, state.documents],
  );

  return document;
}

// Hook for managing document panel UI state
export function useDocumentPanel() {
  const [state] = useAtom(artifactsAtom);
  const { togglePanel, setActiveDocument } = useArtifacts();

  return {
    isPanelOpen: state.isPanelOpen,
    activeDocumentId: state.activeDocumentId,
    hasDocuments: state.documents.length > 0,
    togglePanel,
    setActiveDocument,
  };
}
