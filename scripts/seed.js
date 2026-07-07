import { readFileSync } from 'node:fs'
import { db } from '../src/db.js'

const seed = readFileSync(new URL('../db/seed.sql',import.meta.url), 'utf8')

await db.query(seed)

console.log('✅ Seed complete (samplle of links and click inserted')

await db.end()