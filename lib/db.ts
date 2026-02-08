import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import * as schema from "./schema"

const client = createClient({
  url: "file:surprise.db",
})

export const db = drizzle(client, { schema })

export { sql, eq, and, or, desc, asc } from "drizzle-orm"
export { schema }
