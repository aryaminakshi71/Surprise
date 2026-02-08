import { JSON_SCHEMA_REGISTRY } from '@orpc/zod/zod4'
import * as z from 'zod'

export const UserSchema = z.object({
  id: z.string(),
  name: z.string().nullable().optional(),
  email: z.string().email(),
  image: z.string().nullable().optional(),
})

export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  logo: z.string().nullable().optional(),
})

JSON_SCHEMA_REGISTRY.add(UserSchema, {
  examples: [
    {
      id: 'usr_123',
      name: 'Jordan Lee',
      email: 'jordan@parkingpro.com',
      image: null,
    },
  ],
})

JSON_SCHEMA_REGISTRY.add(OrganizationSchema, {
  examples: [
    {
      id: 'org_123',
      name: 'Downtown Parking Co',
      slug: 'downtown-parking',
      logo: null,
    },
  ],
})
