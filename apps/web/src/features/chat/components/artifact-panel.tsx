"use client";

import { Copy, Download, X, Clock, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useArtifacts, useDocument } from "../hooks/use-artifacts";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Markdown } from "@/components/prompt-kit/markdown";

interface ArtifactPanelProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ArtifactPanel({ className }: ArtifactPanelProps) {
  const { activeDocument, documentsList, togglePanel, setActiveDocumentIndex } = useArtifacts();

  const handleCopy = () => {
    if (activeDocument) {
      navigator.clipboard.writeText(activeDocument.content);
      toast.success("Copied to clipboard");
    }
  };

  const handleDownload = () => {
    if (activeDocument) {
      const blob = new Blob([activeDocument.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${activeDocument.title.replace(/[^a-z0-9]/gi, "_")}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Downloaded document");
    }
  };

  const canNavigateVersions = documentsList.length > 1;
  const currentDocumentIndex = activeDocument ? documentsList.findIndex(doc => doc.id === activeDocument.id) : -1;

  if (!activeDocument) {
    return (
      <div className={cn("flex h-full flex-col bg-background", className)}>
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="font-semibold">No documents yet</h3>
          <Button variant="ghost" size="icon" onClick={() => togglePanel(false)}>
            <X className="size-4" />
          </Button>
        </div>
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          <p className="text-sm">Documents will appear here when created</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full flex-col bg-background", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">{activeDocument.title}</h3>
          <p className="text-muted-foreground text-xs">
            {activeDocument.status === "streaming" ? "Generating..." : "Complete"}
          </p>
        </div>
        <div className="ml-2 flex items-center gap-1">
          {/* Document history dropdown */}
          {canNavigateVersions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <span className="text-xs">V{currentDocumentIndex + 1}</span>
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {documentsList.map((document, index) => (
                  <DropdownMenuItem
                    key={document.id}
                    onClick={() => setActiveDocumentIndex(index)}
                    className={cn(
                      "flex flex-col items-start gap-0.5",
                      document.id === activeDocument.id && "bg-accent",
                    )}
                  >
                    <span className="font-medium text-sm">Version {index + 1}</span>
                    <span className="text-muted-foreground text-xs">
                      {new Date(document.createdAt).toLocaleString()}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button variant="ghost" size="icon" onClick={handleCopy}>
            <Copy className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDownload}>
            <Download className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => togglePanel(false)}>
            <X className="size-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <Markdown variant="default">{activeDocument.content}</Markdown>
        {activeDocument.status === "streaming" && (
          <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-primary" />
        )}
      </ScrollArea>
    </div>
  );
}

export function DocumentPreview({ documentId }: { documentId: string }) {
  const document = useDocument(documentId);

  if (!document) return null;

  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">{document.title}</h4>
        <span className="text-muted-foreground text-xs">📄</span>
      </div>
      <p className="line-clamp-2 text-muted-foreground text-xs">{document.content}</p>
    </div>
  );
}
