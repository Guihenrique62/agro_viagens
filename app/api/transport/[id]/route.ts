import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/api/lib/prisma'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import { verifyAuthHeader } from '../../lib/auth'


const updateSchema = z.object({
  name: z.string().optional(),
  calculateKM: z.boolean().optional(),
})

export async function PATCH(req: NextRequest, {params}: {params: Promise<{ id: string }>}) {

  //Transforma o id em número
  const { id } = await params;
  const numericId = Number(id);

  // Verifica se o ID é um número válido
  if (isNaN(numericId)) {
    return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
  }

  // Valida o token de autenticação
  // const authenticatedUser = await verifyAuthHeader()

  // if (!authenticatedUser) {
  //   return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  // }
  
  // // Valida se o usuário é um administrador
  // if (authenticatedUser.role !== 'Administrador') {
  //   return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 })
  // }


  // validação do formulário para atualização de usuário
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)

  // Se a validação falhar, retorna os erros
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.format() }, { status: 400 })
  }

  // Se a validação for bem-sucedida, extrai os dados
  const data = parsed.data

  try {

    // edita o transporte
    const updatedTransport = await prisma.transports.update({
      where: { id: numericId },
      data,
      select: {
        id: true,
        name: true,
        calculateKM: true,
        status: true,
      }
    })

    return NextResponse.json(updatedTransport, { status: 200 })

  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Transporte não encontrado.' }, { status: 404 })
    }
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ja existe um transporte com esse nome!' }, { status: 404 })
    }
    console.error(error)
    return NextResponse.json({ error: 'Erro ao atualizar transporte.' }, { status: 500 })
  }
}


export async function GET(req: NextRequest, {params}: {params: Promise<{ id: string }>}) {
  const { id } = await params;
   const numericId = Number(id);

  // Verifica se o ID é um número válido
  if (isNaN(numericId)) {
    return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
  }

  // const authenticatedUser = await verifyAuthHeader()

  // if (!authenticatedUser) {
  //   return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  // }

  // if (authenticatedUser.role !== 'Administrador') {
  //   return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 })
  // }

  try {
    const transport = await prisma.transports.findUnique({
      where: { id: numericId },
      select: {
        id: true,
        name: true,
        calculateKM: true,
        status: true
      }
    })

    if (!transport) {
      return NextResponse.json({ error: 'Transporte não encontrado.' }, { status: 404 })
    }

    return NextResponse.json(transport, { status: 200 })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao buscar transporte.' }, { status: 500 })
  }
}



export async function DELETE(req: NextRequest, {params}: {params: Promise<{ id: string }>}) {
  
  const { id } = await params;
  const numericId = Number(id);

  // Verifica se o ID é um número válido
  if (isNaN(numericId)) {
    return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
  }

  // Valida o token de autenticação
  // const authenticatedUser = await verifyAuthHeader()

  // if (!authenticatedUser) {
  //   return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  // }
  
  // // Valida se o usuário é um administrador
  // if (authenticatedUser.role !== 'Administrador') {
  //   return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 })
  // }

  try {

    // Deleta o transporte pelo ID
    await prisma.transports.delete({ where: { id: numericId } })

    return NextResponse.json({ message: 'Transporte deletado com sucesso.' }, { status: 200 })

  } catch (error: any) {
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Transporte não encontrado.' }, { status: 404 })
    }

    console.error(error)
    return NextResponse.json({ error: 'Erro ao deletar transporte.' }, { status: 500 })
  }
}