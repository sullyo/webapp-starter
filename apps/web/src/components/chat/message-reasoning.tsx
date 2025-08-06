"use client";

import { ChevronDownIcon, LoaderIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Markdown } from "@/features/chat/kit/markdown";

interface MessageReasoningProps {
  isLoading: boolean;
  reasoning: string;
}

export function MessageReasoning({ isLoading, reasoning }: MessageReasoningProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const variants = {
    collapsed: {
      height: 0,
      opacity: 0,
      marginTop: 0,
      marginBottom: 0,
    },
    expanded: {
      height: "auto",
      opacity: 1,
      marginTop: "1rem",
      marginBottom: "0.5rem",
    },
  };

  return (
    <div className="flex flex-col">
      {isLoading ? (
        <div className="flex flex-row items-center gap-2">
          <div className="font-medium">Reasoning</div>
          <div className="animate-spin">
            <LoaderIcon className="size-4" />
          </div>
        </div>
      ) : (
        <button
          className="flex w-full cursor-pointer flex-row items-center gap-2"
          data-testid="message-reasoning-toggle"
          onClick={() => {
            setIsExpanded(!isExpanded);
          }}
          type="button"
        >
          <div className="text-[15px]">Thought for a few seconds</div>
          <ChevronDownIcon
            className={` size-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </button>
      )}

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            animate="expanded"
            className="flex flex-col gap-4 border-l pl-4 text-[15px]"
            data-testid="message-reasoning"
            exit="collapsed"
            initial="collapsed"
            key="content"
            style={{ overflow: "hidden" }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            variants={variants}
          >
            <Markdown>{reasoning}</Markdown>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
