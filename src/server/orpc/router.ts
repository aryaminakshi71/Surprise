import { eq, inArray, sql } from 'drizzle-orm'
import { z } from 'zod'
import { auth } from '../auth'
import { parkingLot, parkingSpot, reservation } from '../db/schema'
import {
  CreateParkingLotSchema,
  CreateParkingSpotSchema,
  ParkingLotSchema,
  ParkingSpotSchema,
  ParkingStatsSchema,
} from '~/schemas/parking'
import { OrganizationSchema, UserSchema } from '~/schemas/auth'
import { authed, orgAuthed, pub } from './middlewares'

const HealthSchema = z.object({ ok: z.boolean() })

export const router = {
  system: {
    health: pub
      .route({
        method: 'GET',
        path: '/health',
        summary: 'Health check',
        tags: ['System'],
      })
      .output(HealthSchema)
      .handler(async () => ({ ok: true })),
  },
  auth: {
    me: authed
      .route({
        method: 'GET',
        path: '/auth/me',
        summary: 'Get current user',
        tags: ['Authentication'],
      })
      .output(UserSchema)
      .handler(async ({ context }) => context.user!),
  },
  org: {
    list: authed
      .route({
        method: 'GET',
        path: '/orgs',
        summary: 'List organizations',
        tags: ['Organizations'],
      })
      .output(z.array(OrganizationSchema))
      .handler(async ({ context }) => {
        const result = await auth.api.listOrganizations({ headers: context.request.headers })
        return 'data' in result ? (result.data as typeof result.data) : (result as any)
      }),
  },
  parking: {
    stats: orgAuthed
      .route({
        method: 'GET',
        path: '/parking/stats',
        summary: 'Get parking overview stats',
        tags: ['Parking'],
      })
      .output(ParkingStatsSchema)
      .handler(async ({ context }) => {
        const orgId = context.organizationId!
        const lots = await context.db.select({ id: parkingLot.id }).from(parkingLot).where(eq(parkingLot.organizationId, orgId))
        const lotIds = lots.map((lot) => lot.id)

        if (!lotIds.length) {
          return { totalSpots: 0, availableSpots: 0, occupiedSpots: 0, activeVehicles: 0, revenueToday: 0 }
        }

        const spots = await context.db.select().from(parkingSpot).where(inArray(parkingSpot.lotId, lotIds))
        const totalSpots = spots.length
        const availableSpots = spots.filter((spot) => spot.status === 'available').length
        const occupiedSpots = spots.filter((spot) => spot.status === 'occupied').length

        const [{ count: activeVehicles }] = await context.db
          .select({ count: sql<number>`count(*)` })
          .from(reservation)
          .where(eq(reservation.organizationId, orgId))

        return {
          totalSpots,
          availableSpots,
          occupiedSpots,
          activeVehicles: Number(activeVehicles ?? 0),
          revenueToday: 0,
        }
      }),
    lots: {
      list: orgAuthed
        .route({
          method: 'GET',
          path: '/parking/lots',
          summary: 'List parking lots',
          tags: ['Parking'],
        })
        .output(z.array(ParkingLotSchema))
        .handler(async ({ context }) => {
          const lots = await context.db
            .select()
            .from(parkingLot)
            .where(eq(parkingLot.organizationId, context.organizationId!))

          return lots.map((lot) => ({
            ...lot,
            createdAt: lot.createdAt.toISOString(),
            updatedAt: lot.updatedAt.toISOString(),
          }))
        }),
      create: orgAuthed
        .route({
          method: 'POST',
          path: '/parking/lots',
          summary: 'Create a parking lot',
          tags: ['Parking'],
        })
        .input(CreateParkingLotSchema)
        .output(ParkingLotSchema)
        .handler(async ({ context, input }) => {
          const [lot] = await context.db
            .insert(parkingLot)
            .values({
              id: crypto.randomUUID(),
              organizationId: context.organizationId!,
              name: input.name,
              address: input.address ?? null,
              timezone: input.timezone ?? null,
            })
            .returning()

          return {
            ...lot,
            createdAt: lot.createdAt.toISOString(),
            updatedAt: lot.updatedAt.toISOString(),
          }
        }),
    },
    spots: {
      list: orgAuthed
        .route({
          method: 'GET',
          path: '/parking/spots',
          summary: 'List parking spots',
          tags: ['Parking'],
        })
        .input(z.object({ lotId: z.string().optional() }).optional())
        .output(z.array(ParkingSpotSchema))
        .handler(async ({ context, input }) => {
          const lots = await context.db
            .select({ id: parkingLot.id })
            .from(parkingLot)
            .where(eq(parkingLot.organizationId, context.organizationId!))
          const lotIds = lots.map((lot) => lot.id)
          const filter = input?.lotId ? [input.lotId] : lotIds

          if (!filter.length) return []

          return context.db.select().from(parkingSpot).where(inArray(parkingSpot.lotId, filter))
        }),
      create: orgAuthed
        .route({
          method: 'POST',
          path: '/parking/spots',
          summary: 'Create a parking spot',
          tags: ['Parking'],
        })
        .input(CreateParkingSpotSchema)
        .output(ParkingSpotSchema)
        .handler(async ({ context, input }) => {
          const [spot] = await context.db
            .insert(parkingSpot)
            .values({
              id: crypto.randomUUID(),
              lotId: input.lotId,
              label: input.label,
              level: input.level ?? null,
              type: input.type ?? 'standard',
              status: 'available',
            })
            .returning()

          return spot
        }),
    },
  },
}
