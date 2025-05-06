import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/api/lib/prisma'
import bcrypt from 'bcrypt'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(['Administrador', 'UsuarioPadrao']).optional()
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {

  // validação do formulário para atualização de usuário
  const { id } = params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)

  // Se a validação falhar, retorna os erros
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.format() }, { status: 400 })
  }

  // Se a validação for bem-sucedida, extrai os dados
  const data = parsed.data

  try {

    // Valida a senha
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10)
    }

    // edita o usuário
    const updatedUser = await prisma.users.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json(updatedUser, { status: 200 })

  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
    }
    console.error(error)
    return NextResponse.json({ error: 'Erro ao atualizar usuário.' }, { status: 500 })
  }
}



export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params

  try {

    // Procura o usuário pelo ID
    const user = await prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    // Se o usuário não for encontrado, retorna um erro 404
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
    }

    return NextResponse.json(user, { status: 200 })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao buscar usuário.' }, { status: 500 })
  }
}



export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params

  try {

    // Deleta o usuário pelo ID
    await prisma.users.delete({ where: { id } })

    return NextResponse.json({ message: 'Usuário deletado com sucesso.' }, { status: 200 })

  } catch (error: any) {
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
    }

    console.error(error)
    return NextResponse.json({ error: 'Erro ao deletar usuário.' }, { status: 500 })
  }
}