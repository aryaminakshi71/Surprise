import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { BookingPanel } from '~/features/parking/components/booking-panel'
import { Features } from '~/features/parking/components/features'
import { Footer } from '~/features/parking/components/footer'
import { Header } from '~/features/parking/components/header'
import { ParkingMap, type ParkingSpot } from '~/features/parking/components/parking-map'
import { SearchForm } from '~/features/parking/components/search-form'
import { Stats } from '~/features/parking/components/stats'

export const Route = createFileRoute('/reserve')({
  component: ReservePage,
})

function ReservePage() {
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null)

  const handleBook = () => {
    // Hook into orpc reservation create when wiring real data.
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-start">
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
                Find parking in seconds
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-lg text-pretty leading-relaxed">
                Skip the stress of searching for parking. Reserve your spot ahead of time and arrive with confidence.
              </p>
              <div className="mt-10">
                <SearchForm />
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl bg-secondary/50 p-4 lg:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-sm font-medium text-foreground">Downtown Parking Garage</span>
                  <span className="text-xs text-muted-foreground">• 0.2 mi away</span>
                </div>
                <ParkingMap onSpotSelect={setSelectedSpot} selectedSpot={selectedSpot} />
              </div>
              <BookingPanel selectedSpot={selectedSpot} onBook={handleBook} />
            </div>
          </div>
        </div>
      </section>

      <Stats />
      <Features />
      <Footer />
    </div>
  )
}
