import { PaperclipIcon, UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FileUpload, FileUploadContent, FileUploadTrigger } from "@/features/chat/kit/file-upload";

type ButtonFileUploadProps = {
  onFileUpload: (files: File[]) => void;
  model: string;
};

export function ButtonFileUpload({ onFileUpload, model }: ButtonFileUploadProps) {
  return (
    <FileUpload
      accept=".txt,.md,image/jpeg,image/png,image/gif,image/webp,image/svg,image/heic,image/heif"
      multiple
      onFilesAdded={onFileUpload}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <FileUploadTrigger asChild>
            <Button
              aria-label="Add files"
              className="size-9 rounded-full border border-border bg-transparent dark:bg-secondary"
              size="sm"
              type="button"
              variant="secondary"
            >
              <PaperclipIcon className="size-4" />
            </Button>
          </FileUploadTrigger>
        </TooltipTrigger>
        <TooltipContent>Add files</TooltipContent>
      </Tooltip>
      <FileUploadContent>
        <div className="flex flex-col items-center rounded-lg border border-input border-dashed bg-background p-8">
          <UploadIcon className="size-8 text-muted-foreground" />
          <span className="mt-4 mb-1 font-medium text-lg">Drop files here</span>
          <span className="text-muted-foreground text-sm">
            Drop any files here to add it to the conversation
          </span>
        </div>
      </FileUploadContent>
    </FileUpload>
  );
}
