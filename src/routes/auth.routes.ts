import { Router } from 'express'
import { register, login, getMe, changePassword } from '../controllers/auth.controller'
import { auth } from '../middleware/auth'

export const authRouter = Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.get('/me', auth, getMe)
authRouter.post('/change-password', auth, changePassword)
