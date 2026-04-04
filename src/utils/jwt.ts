// import jwt from 'jsonwebtoken'

// const SECRET = process.env.JWT_SECRET!
// const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

// export function signToken(payload: { id: string; email: string; name: string }) {
//   return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN })
// }

// export function verifyToken(token: string) {
//   return jwt.verify(token, SECRET) as { id: string; email: string; name: string }
// }

import jwt, { SignOptions } from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET as string
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export function signToken(payload: { id: string; email: string; name: string }) {
  const options: SignOptions = {
    expiresIn: EXPIRES_IN as jwt.SignOptions['expiresIn']
  }

  return jwt.sign(payload, SECRET, options)
}

export function verifyToken(token: string) {
  return jwt.verify(token, SECRET) as { id: string; email: string; name: string }
}