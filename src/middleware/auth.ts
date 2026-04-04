import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'

export function auth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' })
  }
  try {
    const token = header.split(' ')[1]
    req.user = verifyToken(token)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
