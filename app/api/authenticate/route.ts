import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/api/lib/prisma'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

// Validação de entrada com Zod
const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
})

export async function POST(req: NextRequest) {
  try {

     // Lê o corpo cru da requisição
     const rawBody = await req.text();

     // Verifica se o corpo está vazio
     if (!rawBody) {
       return NextResponse.json({ error: 'Corpo da requisição vazio.' }, { status: 400 });
     }

    let body;
    try {
      // Tenta fazer o parse do JSON manualmente
      body = JSON.parse(rawBody);
    } catch (err) {
      return NextResponse.json({ error: 'JSON malformado.' }, { status: 400 });
    }


    const parsed = loginSchema.safeParse(body)

    // Se a validação falhar, retorna os erros
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error}, { status: 400 })
    }

    // Se a validação for bem-sucedida, extrai os dados
    const { email, password } = parsed.data

    // Verifica se o usuário existe no banco de dados
    const user = await prisma.users.findUnique({
      where: { email }
    })

    // Se o usuário não existir, retorna erro
    if (!user) {
      return NextResponse.json({ error: 'E-mail ou senha inválidos.' }, { status: 400 })
    }

    // Verifica a senha
    const isPasswordValid = await bcrypt.compare(password, user.password)

    // Se a senha estiver incorreta, retorna erro
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'E-mail ou senha inválidos.' }, { status: 400 })
    }

    // Se o usuário estiver inativo, retorna erro
    if (user.status !== 1) {
      return NextResponse.json({ error: 'Usuário inativo. Entre em contato com o administrador.' }, { status: 403 })
    }

    

    // Verifica se a SECRET do JWT está definida
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables.');
    }
    
    // Gera token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role, // <-- ADICIONE O ROLE AQUI
        name: user.name,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h'
      }
    )

    // Verifica se é necessário trocar a senha
    if (user.mustChangePassword) {
      return NextResponse.json({
      message: 'Troca de senha obrigatória',
      mustChangePassword: true,
      token: token
      }, { status: 200 }) // ainda é sucesso, só exige ação do front
    }

    // Salva o token no cookie (seguro e httpOnly)
    const response = NextResponse.json({ message: 'Autenticado com sucesso', token})
    response.cookies.set('AgroFinancesToken', token, {
      httpOnly: true,  // Impede o acesso via JS no navegador
      path: '/',       // Disponível em toda a aplicação
      maxAge: 60 * 60, // 1 hora de validade
      sameSite: 'lax', // Protege contra CSRF
      // secure: process.env.NODE_ENV === 'production'  // Garante que só será enviado por HTTPS em produção
      secure: false
    })

    return response

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}
