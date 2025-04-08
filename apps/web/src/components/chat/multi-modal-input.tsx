"use client";

import type React from "react";
import { memo, useCallback, useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import type { Attachment, ChatRequestOptions, CreateMessage, Message } from "ai";
import equal from "fast-deep-equal";
import { toast } from "sonner";
import { useLocalStorage, useWindowSize } from "usehooks-ts";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { sanitizeUIMessages } from "@/components/chat/util";
import { ArrowUp, Paperclip, Square, StopCircleIcon } from "lucide-react";
import { useOnMountUnsafe } from "@/hooks/use-on-mount-unsafe";

import { useQuery } from "@tanstack/react-query";
import { UseChatHelpers } from "@ai-sdk/react";

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  append,
  handleSubmit,
  className,
  isHomePage = false,
}: {
  chatId: string;
  input: string;
  setInput: (value: string) => void;
  status: UseChatHelpers["status"];
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<Message>;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  handleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions,
  ) => void;
  className?: string;
  isHomePage?: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { width } = useWindowSize();
  const [localStorageInput, setLocalStorageInput] = useLocalStorage("input", "");

  // const {
  //   files,
  //   onChange,
  //   onDrop,
  //   onDragOver,
  //   onDragLeave,
  //   dragOver,
  //   isUploading: isFileUploading,
  // } = useFileUpload({
  //   async onUploadComplete(fileNames: string[]) {
  //     // Convert the completed files to attachments format
  //     const newAttachments = files
  //       .filter((f) => f.status === "completed")
  //       .map((f) => ({
  //         name: f.file.name,
  //         url: f.file.name, // The URL will be set by the upload process
  //         contentType: f.file.type,
  //       }));

  //     setAttachments((current) => [...current, ...newAttachments]);
  //   },
  // });

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = "98px";
    }
  };

  useOnMountUnsafe(() => {
    if (textareaRef.current && localStorageInput.length > 0 && !isHomePage) {
      const domValue = textareaRef.current.value;
      // Prefer DOM value over localStorage to handle hydration
      const finalValue = domValue || localStorageInput || "";

      append({
        role: "user",
        content: finalValue,
      });
      adjustHeight();
      setAttachments([]);
      setLocalStorageInput("");
    }
  });

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const submitForm = useCallback(() => {
    handleSubmit(undefined, {
      experimental_attachments: attachments,
    });

    // Only clear input and reset height if not on home page
    // For home page, we'll let the Chat component handle this after navigation
    if (!isHomePage) {
      setAttachments([]);
      setLocalStorageInput("");
      resetHeight();
    }

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [attachments, handleSubmit, setAttachments, width, chatId, isHomePage]);

  return (
    <div
      className="relative flex w-full flex-col gap-4"
      // onDragOver={onDragOver}
      // onDragLeave={onDragLeave}
      // onDrop={onDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="-left-4 -top-4 pointer-events-none fixed size-0.5 opacity-0"
        // onChange={onChange}
        // multiple
        // accept={acceptedFileTypes.join(",")}
        tabIndex={-1}
      />

      {/* {(attachments.length > 0 || files.some((f) => f.status === "uploading")) && (
        <div className="flex flex-row items-end gap-2 overflow-x-scroll">
          {attachments.map((attachment) => (
            <PreviewAttachment key={attachment.url} attachment={attachment} />
          ))}

          {files
            .filter((f) => f.status === "uploading")
            .map((file) => (
              <PreviewAttachment
                key={file.id}
                attachment={{
                  url: "",
                  name: file.file.name,
                  contentType: file.file.type,
                }}
                isUploading={true}
              />
            ))}
        </div>
      )} */}

      <Textarea
        ref={textareaRef}
        placeholder="Send a message..."
        value={input}
        onChange={handleInput}
        className={cn(
          "!text-sm max-h-[350px] min-h-[100px] resize-none overflow-y-auto rounded-xl bg-accent/70 pb-10",
          className,
        )}
        rows={2}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault();

            if (status !== "ready") {
              toast.error("Please wait for the model to finish its response!");
            } else {
              submitForm();
            }
          }
        }}
      />

      {/* 
      <div className="absolute bottom-0 flex w-fit flex-row justify-start p-2">
        <AttachmentsButton fileInputRef={fileInputRef} isLoading={isLoading} />
      </div> */}

      <div className="absolute right-0 bottom-0 flex w-fit flex-row justify-end p-2">
        {status === "submitted" ? (
          <StopButton stop={stop} setMessages={setMessages} />
        ) : (
          <SendButton input={input} submitForm={submitForm} uploadQueue={[]} />
        )}
      </div>
    </div>
  );
}

export const MultimodalInput = memo(PureMultimodalInput, (prevProps, nextProps) => {
  if (prevProps.input !== nextProps.input) return false;
  if (prevProps.status !== nextProps.status) return false;
  if (!equal(prevProps.attachments, nextProps.attachments)) return false;
  if (prevProps.isHomePage !== nextProps.isHomePage) return false;

  return true;
});

function PureAttachmentsButton({
  fileInputRef,
  status,
}: {
  fileInputRef: React.RefObject<HTMLInputElement>;
  status: UseChatHelpers["status"];
}) {
  return (
    <Button
      className="h-fit rounded-md rounded-bl-lg p-[7px]"
      onClick={(event) => {
        event.preventDefault();
        fileInputRef.current?.click();
      }}
      disabled={status !== "ready"}
      variant="ghost"
    >
      <Paperclip className="size-5" />
    </Button>
  );
}

const AttachmentsButton = memo(PureAttachmentsButton);

function PureStopButton({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
}) {
  return (
    <Button
      className="rounded-full p-1.5"
      size="icon"
      onClick={(event) => {
        event.preventDefault();
        stop();
        setMessages((messages) => sanitizeUIMessages(messages));
      }}
    >
      <Square className="size-4" />
    </Button>
  );
}

const StopButton = memo(PureStopButton);

function PureSendButton({
  submitForm,
  input,
  uploadQueue,
}: {
  submitForm: () => void;
  input: string;
  uploadQueue: Array<string>;
}) {
  return (
    <Button
      className="h-fit rounded-full border p-1.5"
      onClick={(event) => {
        event.preventDefault();
        submitForm();
      }}
      size="icon"
      disabled={input.length === 0 || uploadQueue.length > 0}
    >
      <ArrowUp className="size-5" />
    </Button>
  );
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  if (prevProps.uploadQueue.length !== nextProps.uploadQueue.length) return false;
  if (prevProps.input !== nextProps.input) return false;
  return true;
});
