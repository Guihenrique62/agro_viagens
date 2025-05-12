import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers';

type JwtPayload = {
  userId: string
  email: string
  role: 'Administrador' | 'UsuarioPadrao'
  name: string
  exp: number
}

//Para verificar o token JWT no header Authorization
export function verifyAuthHeaderFromAuthorization(authHeader: string | null): JwtPayload | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  const token = authHeader.split(' ')[1]

  try {
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not set')
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload
    return decoded as JwtPayload
  } catch (err) {
    return null
  }
}

// Para verificar o token JWT no cookie
export async function verifyAuthHeader() {
  const cookieStore = await cookies();
  const token = cookieStore.get('AgroFinancesToken')?.value;

  if (!token || !process.env.JWT_SECRET) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded as JwtPayload
  } catch (err) {
    console.error('Token inválido:', err);
    return null;
  }
}

