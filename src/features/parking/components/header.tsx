"use client";

import { Button } from "@/components/ui/button";
import { Car, MapPin, Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Car className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold tracking-tight">ParkSpot</span>
        </div>

        <div className="hidden md:flex md:items-center md:gap-8">
          <a
            href="#"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Find Parking
          </a>
          <a
            href="#"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Reservations
          </a>
          <a
            href="#"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Pricing
          </a>
          <a
            href="#"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            For Business
          </a>
        </div>

        <div className="hidden md:flex md:items-center md:gap-3">
          <Button variant="ghost" size="sm">
            Log in
          </Button>
          <Button size="sm">Sign up</Button>
        </div>

        <button
          type="button"
          className="md:hidden -m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="sr-only">Toggle menu</span>
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border">
          <div className="space-y-1 px-4 py-3">
            <a
              href="#"
              className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
            >
              Find Parking
            </a>
            <a
              href="#"
              className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
            >
              Reservations
            </a>
            <a
              href="#"
              className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
            >
              Pricing
            </a>
            <a
              href="#"
              className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
            >
              For Business
            </a>
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              <Button variant="ghost" className="w-full justify-center">
                Log in
              </Button>
              <Button className="w-full">Sign up</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
