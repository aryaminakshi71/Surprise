import { relations } from 'drizzle-orm'
import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { organization, user } from './auth-schema'

export const parkingLot = pgTable('parking_lot', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  address: text('address'),
  timezone: text('timezone'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().$onUpdate(() => new Date()).notNull(),
})

export const parkingSpot = pgTable('parking_spot', {
  id: text('id').primaryKey(),
  lotId: text('lot_id')
    .notNull()
    .references(() => parkingLot.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  level: text('level'),
  type: text('type').default('standard').notNull(),
  status: text('status').default('available').notNull(),
})

export const vehicle = pgTable('vehicle', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  ownerUserId: text('owner_user_id').references(() => user.id, { onDelete: 'set null' }),
  plate: text('plate').notNull(),
  make: text('make'),
  model: text('model'),
  color: text('color'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
})

export const reservation = pgTable('reservation', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  spotId: text('spot_id')
    .notNull()
    .references(() => parkingSpot.id, { onDelete: 'cascade' }),
  vehicleId: text('vehicle_id').references(() => vehicle.id, { onDelete: 'set null' }),
  startsAt: timestamp('starts_at', { mode: 'date' }).notNull(),
  endsAt: timestamp('ends_at', { mode: 'date' }).notNull(),
  status: text('status').default('reserved').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
})

export const payment = pgTable('payment', {
  id: text('id').primaryKey(),
  reservationId: text('reservation_id')
    .notNull()
    .references(() => reservation.id, { onDelete: 'cascade' }),
  amountCents: integer('amount_cents').notNull(),
  currency: text('currency').default('USD').notNull(),
  provider: text('provider').default('stripe').notNull(),
  status: text('status').default('pending').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
})

export const parkingLotRelations = relations(parkingLot, ({ many, one }) => ({
  organization: one(organization, {
    fields: [parkingLot.organizationId],
    references: [organization.id],
  }),
  spots: many(parkingSpot),
}))

export const parkingSpotRelations = relations(parkingSpot, ({ many, one }) => ({
  lot: one(parkingLot, {
    fields: [parkingSpot.lotId],
    references: [parkingLot.id],
  }),
  reservations: many(reservation),
}))

export const vehicleRelations = relations(vehicle, ({ many, one }) => ({
  owner: one(user, {
    fields: [vehicle.ownerUserId],
    references: [user.id],
  }),
  reservations: many(reservation),
}))

export const reservationRelations = relations(reservation, ({ many, one }) => ({
  organization: one(organization, {
    fields: [reservation.organizationId],
    references: [organization.id],
  }),
  spot: one(parkingSpot, {
    fields: [reservation.spotId],
    references: [parkingSpot.id],
  }),
  vehicle: one(vehicle, {
    fields: [reservation.vehicleId],
    references: [vehicle.id],
  }),
  payments: many(payment),
}))

export const paymentRelations = relations(payment, ({ one }) => ({
  reservation: one(reservation, {
    fields: [payment.reservationId],
    references: [reservation.id],
  }),
}))
