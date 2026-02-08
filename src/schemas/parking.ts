import { JSON_SCHEMA_REGISTRY } from '@orpc/zod/zod4'
import * as z from 'zod'

export const DateTimeSchema = z.string().datetime()

export const ParkingLotSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  name: z.string(),
  address: z.string().nullable().optional(),
  timezone: z.string().nullable().optional(),
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema,
})

export const CreateParkingLotSchema = ParkingLotSchema.pick({
  name: true,
  address: true,
  timezone: true,
})

export const ParkingSpotSchema = z.object({
  id: z.string(),
  lotId: z.string(),
  label: z.string(),
  level: z.string().nullable().optional(),
  type: z.enum(['standard', 'ev', 'accessible']).default('standard'),
  status: z.enum(['available', 'reserved', 'occupied']).default('available'),
})

export const CreateParkingSpotSchema = ParkingSpotSchema.pick({
  lotId: true,
  label: true,
  level: true,
  type: true,
})

export const ReservationSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  spotId: z.string(),
  vehicleId: z.string().nullable().optional(),
  startsAt: DateTimeSchema,
  endsAt: DateTimeSchema,
  status: z.enum(['reserved', 'active', 'completed', 'canceled']),
})

export const ParkingStatsSchema = z.object({
  totalSpots: z.number(),
  availableSpots: z.number(),
  occupiedSpots: z.number(),
  activeVehicles: z.number(),
  revenueToday: z.number(),
})

JSON_SCHEMA_REGISTRY.add(ParkingLotSchema, {
  examples: [
    {
      id: 'lot_123',
      organizationId: 'org_123',
      name: 'Downtown Garage',
      address: '123 Main St',
      timezone: 'America/Los_Angeles',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
})
