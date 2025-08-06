"use client";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { X } from "@phosphor-icons/react";
import Image from "next/image";
import { useState } from "react";

type FileItemProps = {
  file: File;
  onRemove: (file: File) => void;
};

export function FileItem({ file, onRemove }: FileItemProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleRemove = () => {
    setIsRemoving(true);
    onRemove(file);
  };

  return (
    <div className="relative mr-2 mb-0 flex items-center">
      <HoverCard open={file.type.includes("image") ? isOpen : false} onOpenChange={setIsOpen}>
        <HoverCardTrigger className="w-full">
          <div className="flex w-full items-center gap-3 rounded-2xl border border-input bg-background p-2 pr-3 transition-colors hover:bg-accent">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-accent-foreground">
              {file.type.includes("image") ? (
                <Image
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-center text-gray-400 text-xs">
                  {file.name.split(".").pop()?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate font-medium text-xs">{file.name}</span>
              <span className="text-gray-500 text-xs">{(file.size / 1024).toFixed(2)}kB</span>
            </div>
          </div>
        </HoverCardTrigger>
        <HoverCardContent side="top">
          <Image
            src={URL.createObjectURL(file)}
            alt={file.name}
            width={200}
            height={200}
            className="h-full w-full object-cover"
          />
        </HoverCardContent>
      </HoverCard>
      {!isRemoving ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleRemove}
              className="-translate-y-1/2 absolute top-1 right-1 z-10 inline-flex size-6 translate-x-1/2 items-center justify-center rounded-full border-[3px] border-background bg-black text-white shadow-none transition-colors"
              aria-label="Remove file"
            >
              <X className="size-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Remove file</TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  );
}
