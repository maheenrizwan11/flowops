import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { errorHandler } from './middleware/errorHandler'
import { router } from './routes/index'

export const app = express()

const allowed = process.env.FRONTEND_URL?.split(',').map((s) => s.trim()) ?? true
app.use(cors({ origin: allowed, credentials: true }))
app.use(morgan('dev'))
app.use(express.json())

app.get('/', (req, res) => {
  res.send('API running')
})

app.use('/api', router)
app.use(errorHandler)
