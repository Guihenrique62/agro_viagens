import { NextRequest, NextResponse } from "next/server"
import { verifyAuthHeader } from "../lib/auth"
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  try {

    // Valida o token de autenticação
    const authenticatedUser = await verifyAuthHeader()

    if (!authenticatedUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    //Valida os dados do transporte
    const {userName} = await req.json()

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

    
        // Envia o e-mail
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_ADM,
          subject: 'Agro Viagens - Confirmação de Finalização de Viagem',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #fafafa;">
              <h2 style="color: #2E86DE; text-align: center;">Viagem Finalizada com Sucesso</h2>
              
              <p style="font-size: 16px; color: #333;">Prezados,</p>
              
              <p style="font-size: 16px; color: #333;">
                Informamos que a viagem realizada por <strong>${userName}</strong> foi concluída com êxito e seu status foi atualizado na plataforma Agro Viagens.
              </p>

              <p style="font-size: 16px; color: #333;">
                Para mais detalhes, acesse o painel da plataforma utilizando suas credenciais.
              </p>

              <p style="font-size: 16px; color: #333;">
                Em caso de dúvidas, entre em contato com a equipe responsável.
              </p>

              <p style="margin-top: 40px; font-size: 14px; color: #999; text-align: center;">
                © 2025 Agro Viagens. Todos os direitos reservados.
              </p>
            </div>
          `,
        });
    
        return NextResponse.json({ message: 'E-mail de redefinição enviado.' }, { status: 200 })



  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}