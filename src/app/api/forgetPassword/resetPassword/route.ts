import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/api/lib/prisma'
import bcrypt from 'bcrypt'

export async function PATCH(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json()

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token e nova senha são obrigatórios.' }, { status: 400 })
    }

    // Verifica o token
    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!resetRecord || new Date() > resetRecord.expiresAt) {
      return NextResponse.json({ error: 'Token inválido ou expirado.' }, { status: 400 })
    }

    // Criptografa a nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Atualiza a senha do usuário
    await prisma.users.update({
      where: { id: resetRecord.user.id },
      data: { password: hashedPassword }
    })

    // Remove o token de redefinição
    await prisma.passwordReset.delete({ where: { token } })

    return NextResponse.json({ message: 'Senha redefinida com sucesso.' }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}
