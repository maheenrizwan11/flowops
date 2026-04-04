import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { errorHandler } from './middleware/errorHandler'
import { authRouter } from './routes/auth.routes'
import { orgsRouter  } from './routes/organizations.routes'
import { membersRouter } from './routes/members.routes'

export const app = express()

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

app.get('/', (req, res) => {
  res.send('API running')
})

app.use('/api/auth', authRouter)
app.use('/api/orgs', orgsRouter)
app.use('/api/orgs/:orgId/members', membersRouter)
app.use(errorHandler)
