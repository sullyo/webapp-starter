/** biome-ignore-all lint/a11y/useAriaPropsSupportedByRole: <explanation> */
"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center">
            <Link className="flex items-center space-x-2" href="/">
              <Image
                alt="Logo"
                className="h-8 w-auto"
                height={40}
                src="https://placehold.co/40x40"
                width={40}
              />
              <span className="font-bold text-xl">Logo</span>
            </Link>
          </div>
          <nav className="hidden space-x-4 md:flex">
            <Link
              className="font-medium text-muted-foreground text-sm hover:text-primary"
              href="/about"
            >
              About
            </Link>
            <Link
              className="font-medium text-muted-foreground text-sm hover:text-primary"
              href="/services"
            >
              Services
            </Link>
            <Link
              className="font-medium text-muted-foreground text-sm hover:text-primary"
              href="/contact"
            >
              Contact
            </Link>
          </nav>
          <div className="hidden items-center space-x-4 md:flex">
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <Link className={buttonVariants({ variant: "ghost", size: "sm" })} href="/signin">
                Log in
              </Link>
              <Link className={buttonVariants({ size: "sm" })} href="/signup">
                Sign up
              </Link>
            </SignedOut>
          </div>
          <Button
            aria-controls="mobile-menu"
            aria-expanded={isMenuOpen}
            className="md:hidden"
            onClick={toggleMenu}
            size="icon"
            variant="ghost"
          >
            <span className="sr-only">Open menu</span>
            {isMenuOpen ? (
              <X aria-hidden="true" className="size-6" />
            ) : (
              <Menu aria-hidden="true" className="size-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        aria-labelledby="mobile-menu-button"
        className={cn(
          "fixed inset-x-0 top-[68px] bottom-0 bg-background md:hidden",
          "border-t",
          isMenuOpen ? "block" : "hidden"
        )}
        id="mobile-menu"
      >
        <div className="flex flex-col space-y-4 p-4">
          <div className="flex flex-col space-y-2">
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <Link className={buttonVariants({ size: "sm", className: "w-full" })} href="/signup">
                Sign up
              </Link>
              <Link
                className={buttonVariants({ variant: "ghost", size: "sm", className: "w-full" })}
                href="/login"
              >
                Log in
              </Link>
            </SignedOut>
          </div>

          <nav className="flex flex-col space-y-4">
            <Link
              className="font-medium text-base text-muted-foreground hover:text-primary"
              href="/about"
            >
              About
            </Link>
            <Link
              className="font-medium text-base text-muted-foreground hover:text-primary"
              href="/services"
            >
              Services
            </Link>
            <Link
              className="font-medium text-base text-muted-foreground hover:text-primary"
              href="/contact"
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
