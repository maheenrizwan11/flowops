import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { errorHandler } from './middleware/errorHandler'
import { authRouter } from './routes/auth.routes'

export const app = express()

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

app.get('/', (req, res) => {
  res.send('API running')
})

app.use('/api/auth', authRouter)
app.use(errorHandler)
