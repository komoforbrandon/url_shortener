import { readFileSync } from "node:fs"
import { db } from '../src/db.js'


const schema = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8')

await db.query(schema)
console.log('Migration complete (tables are ready).')
await db.end()