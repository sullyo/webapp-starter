import {
  FileUpload,
  FileUploadContent,
  FileUploadTrigger,
} from "@/components/prompt-kit/file-upload";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { FileArrowUpIcon, PaperclipIcon } from "@phosphor-icons/react";
import React from "react";

type ButtonFileUploadProps = {
  onFileUpload: (files: File[]) => void;
  model: string;
};

export function ButtonFileUpload({ onFileUpload, model }: ButtonFileUploadProps) {
  return (
    <FileUpload
      onFilesAdded={onFileUpload}
      multiple
      accept=".txt,.md,image/jpeg,image/png,image/gif,image/webp,image/svg,image/heic,image/heif"
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <FileUploadTrigger asChild>
            <Button
              size="sm"
              variant="secondary"
              className="size-9 rounded-full border border-border bg-transparent dark:bg-secondary"
              type="button"
              aria-label="Add files"
            >
              <PaperclipIcon className="size-4" />
            </Button>
          </FileUploadTrigger>
        </TooltipTrigger>
        <TooltipContent>Add files</TooltipContent>
      </Tooltip>
      <FileUploadContent>
        <div className="flex flex-col items-center rounded-lg border border-input border-dashed bg-background p-8">
          <FileArrowUpIcon className="size-8 text-muted-foreground" />
          <span className="mt-4 mb-1 font-medium text-lg">Drop files here</span>
          <span className="text-muted-foreground text-sm">
            Drop any files here to add it to the conversation
          </span>
        </div>
      </FileUploadContent>
    </FileUpload>
  );
}
