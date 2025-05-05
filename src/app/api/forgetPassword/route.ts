import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/api/lib/prisma'
import nodemailer from 'nodemailer'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    // Validação do formulário para redefinição de senha
    const body = await req.json()
    const { email } = body

    // Verifica se o e-mail existe no banco de dados
    const user = await prisma.users.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: 'E-mail não encontrado.' }, { status: 400 })
    }

    // Gera um token de redefinição de senha
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000) // Expira em 30 minutos

    // Salva o token e a data de expiração no banco de dados
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt: resetTokenExpiry
      }
    })

    // Configura o transporter de e-mail usando o nodemailer
    const transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false, // TLS é usado automaticamente
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // Use sua senha real ou app password
      },
      tls: {
        ciphers: 'SSLv3'
      }
    })
    

    // Configura o link de redefinição
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`

    // Envia o e-mail
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🔐 Redefinição de Senha - Plataforma AgroFinances',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #2E86DE;">Solicitação de Redefinição de Senha</h2>
          <p>Olá <strong>${user.name}</strong>,</p>
          <p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova senha:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #2E86DE; color: #fff; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              Redefinir Senha
            </a>
          </div>
          <p>Esse link é válido por <strong>30 minutos</strong>. Se você não solicitou essa mudança, ignore este e-mail.</p>
          <p style="color: #999; font-size: 12px;">© 2025 AgroFinances. Todos os direitos reservados.</p>
        </div>
      `
    })

    return NextResponse.json({ message: 'E-mail de redefinição enviado.' }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}
