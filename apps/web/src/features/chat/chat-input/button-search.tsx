import { GlobeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonSearchProps = {
  isSelected?: boolean;
  onToggle?: (isSelected: boolean) => void;
};

export function ButtonSearch({ isSelected = false, onToggle }: ButtonSearchProps) {
  const handleClick = () => {
    const newState = !isSelected;
    onToggle?.(newState);
  };

  return (
    <Button
      className={cn(
        "rounded-full border border-border bg-transparent transition-all duration-150 has-[>svg]:px-1.75 md:has-[>svg]:px-3 dark:bg-secondary",
        isSelected &&
          "border-[#0091FF]/20 bg-[#E5F3FE] text-[#0091FF] hover:bg-[#E5F3FE] hover:text-[#0091FF]"
      )}
      onClick={handleClick}
      variant="secondary"
    >
      <GlobeIcon className="size-5" />
      <span className="hidden md:block">Search</span>
    </Button>
  );
}
