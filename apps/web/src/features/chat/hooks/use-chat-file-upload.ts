"use client";

import { toast } from "sonner";
import type { FileUIPart } from "ai";
import { uploadFile } from "@/api/file.api";
import { useCallback, useState } from "react";

async function processFiles(files: File[]): Promise<FileUIPart[]> {
  const attachments: FileUIPart[] = [];

  for (const file of files) {
    try {
      // Upload the file and get the file record
      const uploadedFile = await uploadFile(file, `chat`);

      if (uploadedFile) {
        // Convert uploaded file to attachment format
        attachments.push({
          type: "file",
          mediaType: uploadedFile.contentType,
          filename: uploadedFile.fileName,
          url: uploadedFile.fileUrl,
        });
      }
    } catch (error) {
      console.error(`Failed to upload file ${file.name}:`, error);
      throw error;
    }
  }

  return attachments;
}

export const useChatFileUpload = () => {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileUploads = async (): Promise<FileUIPart[] | null> => {
    if (files.length === 0) return [];

    try {
      const processed = await processFiles(files);
      setFiles([]);
      return processed;
    } catch {
      toast.error("Failed to process files");
      return null;
    }
  };

  const createOptimisticAttachments = (files: File[]) => {
    return files.map((file) => ({
      type: "file" as const,
      mediaType: file.type,
      filename: file.name,
      url: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
    }));
  };

  const cleanupOptimisticAttachments = (attachments?: Array<{ url?: string }>) => {
    if (!attachments) return;
    attachments.forEach((attachment) => {
      if (attachment.url?.startsWith("blob:")) {
        URL.revokeObjectURL(attachment.url);
      }
    });
  };

  const handleFileUpload = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleFileRemove = useCallback((file: File) => {
    setFiles((prev) => prev.filter((f) => f !== file));
  }, []);

  return {
    files,
    setFiles,
    handleFileUploads,
    createOptimisticAttachments,
    cleanupOptimisticAttachments,
    handleFileUpload,
    handleFileRemove,
  };
};
