"use client";

import { Button } from "@/components/ui/button";
import { type ParkingSpot } from "@/components/parking-map";
import { Calendar, Car, CheckCircle2, Clock, CreditCard, MapPin } from "lucide-react";
import { useState } from "react";

interface BookingPanelProps {
  selectedSpot: ParkingSpot | null;
  onBook: () => void;
}

export function BookingPanel({ selectedSpot, onBook }: BookingPanelProps) {
  const [isBooked, setIsBooked] = useState(false);

  const handleBook = () => {
    setIsBooked(true);
    onBook();
  };

  if (isBooked && selectedSpot) {
    return (
      <div className="rounded-2xl border border-accent bg-accent/10 p-6">
        <div className="flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center mb-4">
            <CheckCircle2 className="h-6 w-6 text-accent-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Booking Confirmed!
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Spot {selectedSpot.id} has been reserved for you
          </p>
          <div className="w-full space-y-3 text-left bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm font-medium">Downtown Parking Garage</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Car className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Spot</p>
                <p className="text-sm font-medium">{selectedSpot.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-medium">Jan 25, 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="text-sm font-medium">10:00 AM - 1:00 PM</p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full mt-4 bg-transparent"
            onClick={() => setIsBooked(false)}
          >
            Book Another Spot
          </Button>
        </div>
      </div>
    );
  }

  if (!selectedSpot) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Car className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-card-foreground mb-2">
            Select a Parking Spot
          </h3>
          <p className="text-sm text-muted-foreground max-w-[200px]">
            Click on an available spot in the map to see details and book
          </p>
        </div>
      </div>
    );
  }

  const duration = 3;
  const total = selectedSpot.price * duration;

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">
        Booking Details
      </h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">
                {selectedSpot.id}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-card-foreground">
                Spot {selectedSpot.id}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {selectedSpot.type === "ev"
                  ? "EV Charging"
                  : selectedSpot.type === "handicap"
                  ? "Accessible"
                  : "Standard"}{" "}
                Spot
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-card-foreground">
              ${selectedSpot.price}/hr
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium">Jan 25, 2026</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Time</span>
            <span className="font-medium">10:00 AM - 1:00 PM</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Duration</span>
            <span className="font-medium">{duration} hours</span>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-card-foreground">
              Total
            </span>
            <span className="text-xl font-bold text-card-foreground">
              ${total.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Includes all taxes and fees
          </p>
        </div>

        <Button className="w-full gap-2" size="lg" onClick={handleBook}>
          <CreditCard className="h-4 w-4" />
          Reserve Now
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          {"You won't be charged yet"}
        </p>
      </div>
    </div>
  );
}
