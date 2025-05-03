"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Copy } from "lucide-react";
import { useCopyToClipboard } from "usehooks-ts";
import { useState } from "react";

interface CopyButtonProps extends React.ComponentProps<typeof Button> {}

export function CopyButton({ value, ...props }: CopyButtonProps) {
  const [, copy] = useCopyToClipboard();
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = async () => {
    await copy(String(value));
    setHasCopied(true);
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  };

  return (
    <Button size="sm" onClick={handleCopy} {...props} className="size-6.5 p-0">
      {hasCopied ? (
        <Check className="size-4" aria-hidden="true" />
      ) : (
        <Copy className="size-4" aria-hidden="true" />
      )}
      <span className="sr-only">{hasCopied ? "Copied" : "Copy to clipboard"}</span>
    </Button>
  );
}
