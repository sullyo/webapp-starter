import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, type Transition } from "motion/react";
import { useEffect, useState } from "react";
import { Loader } from "@/features/chat/kit/loader";
import { Markdown } from "@/features/chat/kit/markdown";
import { cn } from "@/lib/utils";

type ReasoningProps = {
  reasoning: string;
  isReasoning?: boolean;
};

const TRANSITION: Transition = {
  type: "spring",
  duration: 0.2,
  bounce: 0,
};

export function Reasoning({ reasoning, isReasoning = false }: ReasoningProps) {
  const [isExpanded, setIsExpanded] = useState(isReasoning);

  useEffect(() => {
    if (isReasoning) {
      setIsExpanded(true);
    } else {
      const timer = setTimeout(() => setIsExpanded(false), 100);
      return () => clearTimeout(timer);
    }
  }, [isReasoning]);

  return (
    <div>
      <button
        className="flex items-center gap-1 text-muted-foreground text-sm transition-colors hover:text-foreground"
        disabled={isReasoning}
        onClick={() => !isReasoning && setIsExpanded(!isExpanded)}
        type="button"
      >
        {isReasoning ? (
          <Loader text={"Thinking"} variant={"text-shimmer"} />
        ) : (
          <span>Thinking</span>
        )}
        <ChevronDown
          className={cn("size-3 transition-transform", isExpanded ? "rotate-180" : "")}
        />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            animate={{ height: "auto", opacity: 1 }}
            className="mt-2 overflow-hidden"
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            transition={TRANSITION}
          >
            <div className="flex flex-col border-muted-foreground/20 border-l pl-4 text-muted-foreground text-sm">
              <Markdown>{reasoning}</Markdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
