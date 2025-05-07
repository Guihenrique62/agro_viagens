import jwt from 'jsonwebtoken'

type JwtPayload = {
  userId: string
  email: string
  role: 'Administrador' | 'UsuarioPadrao'
  exp: number
}

export function verifyAuthHeader(authHeader: string | null): JwtPayload | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null

  const token = authHeader.split(' ')[1]

  try {
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not set')
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload
    return decoded
  } catch (err) {
    return null
  }
}

