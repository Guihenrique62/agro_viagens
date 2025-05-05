import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/api/lib/prisma'
import bcrypt from 'bcrypt'
import { z } from 'zod'


// Validação do formulário para criação de usuário
const userSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  role: z.enum(['Administrador', 'UsuarioPadrao'])
})

// Schema de validação parcial para atualização de usuário
const userUpdateSchema = z.object({
  id: z.string().uuid('ID inválido'),
  name: z.string().min(1, 'Nome obrigatório').optional(),
  email: z.string().email('E-mail inválido').optional(),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional(),
  role: z.enum(['Administrador', 'UsuarioPadrao']).optional()
})

export async function POST(req: NextRequest) {
  try {
    // Simulação de autenticação de administrador
    // const isAdmin = req.headers.get('x-user-role') === 'Administrador'
    // if (!isAdmin) {
    //   return NextResponse.json({ error: 'Acesso negado. Apenas administradores.' }, { status: 403 })
    // }

    //Valida os dados do usuário
    const body = await req.json()
    const parsed = userSchema.safeParse(body)

    // Se a validação falhar, retorna os erros
    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.format() }, { status: 400 })
    }

    // Se a validação for bem-sucedida, extrai os dados
    const { name, email, password, role } = parsed.data

    // Verifica se o e-mail já existe
    const existingUser = await prisma.users.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'E-mail já cadastrado.' }, { status: 400 })
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 10)

    // Cria o usuário
    const user = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    return NextResponse.json(user, { status: 201 })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) { 
  try {
    // Simulação de autenticação de administrador
    // const isAdmin = req.headers.get('x-user-role') === 'Administrador'
    // if (!isAdmin) {
    //   return NextResponse.json({ error: 'Acesso negado. Apenas administradores.' }, { status: 403 })
    // }

    const users = await prisma.users.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    })

    return NextResponse.json(users, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return NextResponse.json({ error: 'Erro ao buscar usuários.' }, { status: 500 })
  }
}