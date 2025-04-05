"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Copy } from "lucide-react";
import { useCopyToClipboard } from "usehooks-ts";

interface CopyButtonProps extends React.ComponentProps<typeof Button> {}

export function CopyButton({ value, ...props }: CopyButtonProps) {
  const [copiedText, copy] = useCopyToClipboard();

  return (
    <Button size="sm" onClick={async () => await copy(String(value))} {...props}>
      {copiedText ? (
        <Check className="size-5" aria-hidden="true" />
      ) : (
        <Copy className="size-5" aria-hidden="true" />
      )}
      <span className="sr-only">{copiedText ? "Copied" : "Copy to clipboard"}</span>
    </Button>
  );
}
