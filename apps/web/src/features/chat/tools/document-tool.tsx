"use client";

import { ChatDataParts } from "@/features/chat/types";
import { cn } from "@/lib/utils";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useArtifacts } from "../hooks/use-artifacts";
import { PiCaretDown, PiCheckCircle, PiSpinner, PiWrench } from "react-icons/pi";

const TRANSITION = {
  type: "spring",
  duration: 0.2,
  bounce: 0,
};

export function DocumentTool({
  data,
  defaultOpen = false,
  className,
}: {
  data: ChatDataParts["createDocument"] | ChatDataParts["updateDocument"];
  defaultOpen?: boolean;
  className?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultOpen);
  const { content, status } = data;
  const title = "title" in data ? data.title : "Document";
  const { addDocument } = useArtifacts();

  useEffect(() => {
    addDocument(data);
  }, [data, addDocument]);

  return (
    <div
      className={cn(
        "flex flex-col gap-0 overflow-hidden rounded-md border border-border",
        className,
      )}
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          setIsExpanded(!isExpanded);
        }}
        type="button"
        className="flex w-full flex-row items-center rounded-t-md px-3 py-2 transition-colors hover:bg-accent"
      >
        <div className="flex flex-1 flex-row items-center gap-2 text-left text-base">
          <PiWrench className="size-4 text-muted-foreground" />
          <span className="font-mono text-sm">{title}</span>
          <AnimatePresence mode="popLayout" initial={false}>
            {status === "loading" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, filter: "blur(2px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.9, filter: "blur(2px)" }}
                transition={{ duration: 0.15 }}
                key="loading"
              >
                <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-1.5 py-0.5 text-blue-700 text-xs">
                  <PiSpinner className="mr-1 h-3 w-3 animate-spin" />
                  Running
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, filter: "blur(2px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.9, filter: "blur(2px)" }}
                transition={{ duration: 0.15 }}
                key="completed"
              >
                <div className="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-1.5 py-0.5 text-green-700 text-xs ">
                  <PiCheckCircle className="mr-1 h-3 w-3" />
                  Completed
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <PiCaretDown
          className={cn("h-4 w-4 transition-transform", isExpanded ? "rotate-180 transform" : "")}
        />
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={TRANSITION}
            className="overflow-hidden"
          >
            <div className="space-y-3 px-3 pt-3 pb-3">
              {status === "success" && (
                <div>
                  <div className="mb-1 font-medium text-muted-foreground text-xs">Result</div>
                  <div className="max-h-60 overflow-auto rounded border bg-background p-2 text-sm">
                    {content}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
