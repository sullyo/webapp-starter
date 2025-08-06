"use client";

import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDocumentPanel } from "@/features/chat/hooks/use-artifacts";

export function SidePanelToggle() {
  const { isPanelOpen, togglePanel } = useDocumentPanel();

  return (
    <Button
      className="absolute top-4 right-4 z-10"
      onClick={() => togglePanel()}
      size="icon"
      title={isPanelOpen ? "Close documents panel" : "Open documents panel"}
      variant="ghost"
    >
      {isPanelOpen ? <PanelRightClose className="size-5" /> : <PanelRightOpen className="size-5" />}
    </Button>
  );
}
