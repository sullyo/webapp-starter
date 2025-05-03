"use client";

import { Markdown } from "@/components/chat/kit/markdown";
import { ChevronDownIcon, LoaderIcon } from "lucide-react";
import { motion } from "motion/react";
import { AnimatePresence } from "motion/react";
import { useState } from "react";

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
          data-testid="message-reasoning-toggle"
          type="button"
          className="flex w-full cursor-pointer flex-row items-center gap-2"
          onClick={() => {
            setIsExpanded(!isExpanded);
          }}
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
            data-testid="message-reasoning"
            key="content"
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={variants}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
            className="flex flex-col gap-4 border-l pl-4 text-[15px]"
          >
            <Markdown>{reasoning}</Markdown>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
