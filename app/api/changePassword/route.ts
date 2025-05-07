import { prisma } from '@/app/api/lib/prisma'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthHeaderFromAuthorization } from '../lib/auth'

const schema = z.object({
  newPassword: z.string().min(6, 'A nova senha deve ter no mínimo 6 caracteres'),
  token: z.string()
})

export async function PATCH(req: NextRequest) {
  try {
    // Valida o token dos cookies
    const authenticatedUser = verifyAuthHeaderFromAuthorization( req.headers.get('Authorization'))

    if (!authenticatedUser) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    
    }

    // Parse e valida a nova senha
    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const { newPassword, token } = parsed.data
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Atualiza a senha apenas para o próprio usuário autenticado
    await prisma.users.update({
      where: { id: authenticatedUser.userId },
      data: {
        password: hashedPassword,
        mustChangePassword: false
      }
    })



    // Salva o token no cookie (seguro e httpOnly)
    const response = NextResponse.json({ message: 'Autenticado com sucesso', token})
    response.cookies.set('AgroFinancesToken', token, {
      httpOnly: true,  // Impede o acesso via JS no navegador
      path: '/',       // Disponível em toda a aplicação
      maxAge: 60 * 60, // 1 hora de validade
      sameSite: 'lax', // Protege contra CSRF
      secure: process.env.NODE_ENV === 'production'  // Garante que só será enviado por HTTPS em produção
    })

    return response

    return NextResponse.json({ message: 'Senha atualizada com sucesso.' })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro ao atualizar a senha.' }, { status: 500 })
  }
}
