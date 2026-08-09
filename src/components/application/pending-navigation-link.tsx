"use client";

import Link from "next/link";
import { useState, type MouseEvent, type ReactNode } from "react";

type PendingNavigationLinkProps = {
  href: string;
  children: ReactNode;
  pendingLabel: ReactNode;
  className?: string;
};

export function PendingNavigationLink({
  href,
  children,
  pendingLabel,
  className,
}: PendingNavigationLinkProps) {
  const [pending, setPending] = useState(false);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (pending) {
      event.preventDefault();
      return;
    }

    const isPrimaryNavigation =
      event.button === 0 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey &&
      event.currentTarget.target !== "_blank";

    if (isPrimaryNavigation) {
      setPending(true);
    }
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      aria-busy={pending}
      aria-disabled={pending}
      className={`inline-flex items-center justify-center gap-2 ${className ?? ""}`}
    >
      {pending ? (
        <>
          <span
            aria-hidden="true"
            className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent"
          />
          <span>{pendingLabel}</span>
        </>
      ) : (
        children
      )}
    </Link>
  );
}
