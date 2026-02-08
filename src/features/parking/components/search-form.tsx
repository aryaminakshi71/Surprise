"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, MapPin, Search } from "lucide-react";
import { useState } from "react";

export function SearchForm() {
  const [location, setLocation] = useState("");

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
      <h2 className="text-lg font-semibold text-card-foreground mb-5">
        Find parking near
      </h2>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="location" className="sr-only">
            Location
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="location"
              placeholder="Enter address or location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="date" className="text-xs text-muted-foreground">
              Date
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="date"
                type="date"
                defaultValue="2026-01-25"
                className="pl-10 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time" className="text-xs text-muted-foreground">
              Time
            </Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="time"
                type="time"
                defaultValue="10:00"
                className="pl-10 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration" className="text-xs text-muted-foreground">
            Duration
          </Label>
          <select
            id="duration"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="1">1 hour</option>
            <option value="2">2 hours</option>
            <option value="3" selected>
              3 hours
            </option>
            <option value="4">4 hours</option>
            <option value="8">8 hours</option>
            <option value="24">Full day</option>
          </select>
        </div>

        <Button className="w-full gap-2 mt-2" size="lg">
          <Search className="h-4 w-4" />
          Search
        </Button>
      </div>
    </div>
  );
}
