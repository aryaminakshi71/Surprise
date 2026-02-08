import 'dotenv/config'
import { db } from './index'
import { parkingLot, parkingSpot, vehicle, reservation, payment } from './schema'
import { user, organization, member } from './auth-schema'

// Helper to generate IDs
const generateId = () => crypto.randomUUID()

async function seed() {
  console.log('🌱 Seeding database...')

  try {
    // Create test organization
    const [testOrg] = await db
      .insert(organization)
      .values({
        id: generateId(),
        name: 'Test Parking Co',
        slug: 'test-parking-co',
        createdAt: new Date(),
      })
      .returning()

    console.log('✓ Created organization:', testOrg.name)

    // Create test users
    const testUsers = await db
      .insert(user)
      .values([
        {
          id: generateId(),
          email: 'admin@parkingpro.com',
          name: 'Admin User',
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: generateId(),
          email: 'user@parkingpro.com',
          name: 'Test User',
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])
      .returning()

    console.log('✓ Created users:', testUsers.length)

    // Link users to organization
    for (const testUser of testUsers) {
      await db.insert(member).values({
        id: generateId(),
        organizationId: testOrg.id,
        userId: testUser.id,
        role: 'admin',
        createdAt: new Date(),
      })
    }

    console.log('✓ Linked users to organization')

    // Createparking lots
    const lots = await db
      .insert(parkingLot)
      .values([
        {
          id: generateId(),
          name: 'Downtown Parking Garage',
          address: '123 Main Street',
          organizationId: testOrg.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: generateId(),
          name: 'Airport Long-Term Parking',
          address: '456 Airport Blvd',
          organizationId: testOrg.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: generateId(),
          name: 'Shopping Mall Parking',
          address: '789 Commerce Way',
          organizationId: testOrg.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])
      .returning()

    console.log('✓ Created parking lots:', lots.length)

    // Create parking spots for each lot
    const spotTypes = ['standard', 'compact', 'ev', 'handicap'] as const
    const spotStatuses = ['available', 'occupied', 'reserved', 'maintenance'] as const
    const allSpots = []
    const spotsPerLot = [50, 100, 75] // Match the lots

    for (let lotIndex = 0; lotIndex < lots.length; lotIndex++) {
      const lot = lots[lotIndex]
      const totalSpots = spotsPerLot[lotIndex]
      const spotsToCreate = []
      
      for (let i = 1; i <= totalSpots; i++) {
        const spotType = spotTypes[Math.floor(Math.random() * spotTypes.length)]
        // 60% available, 30% occupied, 8% reserved, 2% maintenance
        const rand = Math.random()
        const status =
          rand < 0.6
            ? 'available'
            : rand < 0.9
              ? 'occupied'
              : rand < 0.98
                ? 'reserved'
                : 'maintenance'

        spotsToCreate.push({
          id: generateId(),
          lotId: lot.id,
          label: `${String.fromCharCode(65 + Math.floor(i / 10))}-${(i % 10) + 1}`,
          type: spotType,
          status,
        })
      }

      if (spotsToCreate.length > 0) {
        const createdSpots = await db.insert(parkingSpot).values(spotsToCreate).returning()
        allSpots.push(...createdSpots)
      }
    }

    console.log('✓ Created parking spots:', allSpots.length)

    // Create vehicles
    const vehicles = await db
      .insert(vehicle)
      .values([
        {
          id: generateId(),
          plate: 'ABC-1234',
          make: 'Tesla',
          model: 'Model 3',
          color: 'White',
          ownerUserId: testUsers[0].id,
          organizationId: testOrg.id,
          createdAt: new Date(),
        },
        {
          id: generateId(),
          plate: 'XYZ-5678',
          make: 'Toyota',
          model: 'Camry',
          color: 'Blue',
          ownerUserId: testUsers[1].id,
          organizationId: testOrg.id,
          createdAt: new Date(),
        },
        {
          id: generateId(),
          plate: 'DEF-9012',
          make: 'Honda',
          model: 'Civic',
          color: 'Red',
          ownerUserId: testUsers[0].id,
          organizationId: testOrg.id,
          createdAt: new Date(),
        },
      ])
      .returning()

    console.log('✓ Created vehicles:', vehicles.length)

    // Create reservations for occupied spots
    const occupiedSpots = allSpots.filter((spot) => spot.status === 'occupied')
    const reservations = []

    for (let i = 0; i < Math.min(occupiedSpots.length, vehicles.length * 10); i++) {
      const spot = occupiedSpots[i]
      const vehicle = vehicles[i % vehicles.length]
      const startTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Within last week
      const durationHours = Math.floor(Math.random() * 8) + 1 // 1-8 hours
      const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000)

      reservations.push({
        id: generateId(),
        spotId: spot.id,
        vehicleId: vehicle.id,
        organizationId: testOrg.id,
        startsAt: startTime,
        endsAt: endTime,
        status: 'active' as const,
        createdAt: new Date(),
      })
    }

    const createdReservations = await db.insert(reservation).values(reservations).returning()
    console.log('✓ Created reservations:', createdReservations.length)

    // Create payments for reservations
    const payments = []
    for (const res of createdReservations) {
      const amount = (Math.floor(Math.random() * 50) + 10) * 100 // $10-$60 in cents
      payments.push({
        id: generateId(),
        reservationId: res.id,
        amountCents: amount,
        currency: 'usd',
        provider: 'stripe',
        status: Math.random() > 0.1 ? ('succeeded' as const) : ('pending' as const),
        createdAt: new Date(),
      })
    }

    await db.insert(payment).values(payments)
    console.log('✓ Created payments:', payments.length)

    console.log('\n🎉 Database seeded successfully!')
    console.log('\n📊 Summary:')
    console.log(`   - Organizations: 1`)
    console.log(`   - Users: ${testUsers.length}`)
    console.log(`   - Parking Lots: ${lots.length}`)
    console.log(`   - Parking Spots: ${allSpots.length}`)
    console.log(`   - Vehicles: ${vehicles.length}`)
    console.log(`   - Reservations: ${createdReservations.length}`)
    console.log(`   - Payments: ${payments.length}`)
    console.log('\n🔐 Test Credentials:')
    console.log(`   Email: admin@parkingpro.com`)
    console.log(`   (Demo mode - no password needed)`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

// Run seed
seed()

export { seed }
