export function LinkMarkdown({ href, children, ...props }: React.ComponentProps<"a">) {
  if (!href) return <span {...props}>{children}</span>;

  // Check if href is a valid URL
  let domain = "";
  try {
    const url = new URL(href);
    domain = url.hostname;
  } catch {
    // If href is not a valid URL (likely a relative path)
    domain = href.split("/").pop() || href;
  }

  return (
    <a
      className="inline-flex h-5 max-w-32 items-center gap-1 overflow-hidden overflow-ellipsis whitespace-nowrap rounded-full bg-muted py-0 pr-2 pl-0.5 text-muted-foreground text-xs leading-none no-underline transition-colors duration-150 hover:bg-muted-foreground/30 hover:text-primary"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      <img
        alt="favicon"
        className="size-3.5 rounded-full"
        height={14}
        src={`https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(href)}`}
        width={14}
      />
      <span className="overflow-hidden text-ellipsis whitespace-nowrap font-normal">
        {domain.replace("www.", "")}
      </span>
    </a>
  );
}
