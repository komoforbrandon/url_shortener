import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { rateLimit } from 'express-rate-limit'
import PinoHttp from 'pino-http'
import createError from 'http-errors'
import authRoutes from './routes/auth.js'


const app = express()
app.use(express.json())
app.use(routes);

export default app;