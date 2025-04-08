"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

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
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="https://placehold.co/40x40"
                alt="Logo"
                width={40}
                height={40}
                className="h-8 w-auto"
              />
              <span className="font-bold text-xl">Logo</span>
            </Link>
          </div>
          <nav className="hidden space-x-4 md:flex">
            <Link
              href="/about"
              className="font-medium text-muted-foreground text-sm hover:text-primary"
            >
              About
            </Link>
            <Link
              href="/services"
              className="font-medium text-muted-foreground text-sm hover:text-primary"
            >
              Services
            </Link>
            <Link
              href="/contact"
              className="font-medium text-muted-foreground text-sm hover:text-primary"
            >
              Contact
            </Link>
          </nav>
          <div className="hidden items-center space-x-4 md:flex">
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <Link href="/signin" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Log in
              </Link>
              <Link href="/signup" className={buttonVariants({ size: "sm" })}>
                Sign up
              </Link>
            </SignedOut>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <span className="sr-only">Open menu</span>
            {isMenuOpen ? (
              <X className="size-6" aria-hidden="true" />
            ) : (
              <Menu className="size-6" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-x-0 top-[68px] bottom-0 bg-background md:hidden",
          "border-t",
          isMenuOpen ? "block" : "hidden",
        )}
        id="mobile-menu"
        aria-labelledby="mobile-menu-button"
      >
        <div className="flex flex-col space-y-4 p-4">
          <div className="flex flex-col space-y-2">
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <Link href="/signup" className={buttonVariants({ size: "sm", className: "w-full" })}>
                Sign up
              </Link>
              <Link
                href="/login"
                className={buttonVariants({ variant: "ghost", size: "sm", className: "w-full" })}
              >
                Log in
              </Link>
            </SignedOut>
          </div>

          <nav className="flex flex-col space-y-4">
            <Link
              href="/about"
              className="font-medium text-base text-muted-foreground hover:text-primary"
            >
              About
            </Link>
            <Link
              href="/services"
              className="font-medium text-base text-muted-foreground hover:text-primary"
            >
              Services
            </Link>
            <Link
              href="/contact"
              className="font-medium text-base text-muted-foreground hover:text-primary"
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
