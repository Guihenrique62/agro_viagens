import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/api/lib/prisma'
import { z } from 'zod'
import { verifyAuthHeader } from '../../lib/auth'


const updateSchema = z.object({
  name: z.string().optional(),
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
  const authenticatedUser = await verifyAuthHeader()

  if (!authenticatedUser) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  
  // Valida se o usuário é um administrador
  if (authenticatedUser.role !== 'Administrador') {
    return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 })
  }


  // validação do formulário para atualização da despesa
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)

  // Se a validação falhar, retorna os erros
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.format() }, { status: 400 })
  }

  // Se a validação for bem-sucedida, extrai os dados
  const data = parsed.data

  try {

    // edita a despesa
    const updatedExpense = await prisma.expenses.update({
      where: { id: numericId },
      data,
      select: {
        id: true,
        name: true,
        status: true,
      }
    })

    return NextResponse.json(updatedExpense, { status: 200 })

  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Despesa não encontrada.' }, { status: 404 })
    }
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ja existe uma despesa com esse nome!' }, { status: 404 })
    }
    console.error(error)
    return NextResponse.json({ error: 'Erro ao atualizar Despesa.' }, { status: 500 })
  }
}


export async function GET(req: NextRequest, {params}: {params: Promise<{ id: string }>}) {
  const { id } = await params;
   const numericId = Number(id);

  // Verifica se o ID é um número válido
  if (isNaN(numericId)) {
    return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
  }

  const authenticatedUser = await verifyAuthHeader()

  if (!authenticatedUser) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  if (authenticatedUser.role !== 'Administrador') {
    return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 })
  }

  try {
    const expense = await prisma.expenses.findUnique({
      where: { id: numericId },
      select: {
        id: true,
        name: true,
        status: true
      }
    })

    if (!expense) {
      return NextResponse.json({ error: 'Despesa não encontrada.' }, { status: 404 })
    }

    return NextResponse.json(expense, { status: 200 })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao buscar Despesa.' }, { status: 500 })
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
  const authenticatedUser = await verifyAuthHeader()

  if (!authenticatedUser) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  
  // Valida se o usuário é um administrador
  if (authenticatedUser.role !== 'Administrador') {
    return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 })
  }

  try {
    // Verifica se existem trip_expenses vinculadas a esta expense
    const tripExpensesCount = await prisma.trip_expenses.count({
      where: { expensesId: numericId }
    });

    if (tripExpensesCount > 0) {
      // Se existirem trip_expenses vinculadas, apenas atualiza o status para 2 (inativo)
      await prisma.expenses.update({
        where: { id: numericId },
        data: { status: 2 }
      });
      
      return NextResponse.json(
        { message: 'Despesa marcada como inativa, pois possui registros vinculados.' }, 
        { status: 200 }
      );
    } else {
      // Se não houver trip_expenses vinculadas, deleta a expense
      await prisma.expenses.delete({ where: { id: numericId } });
      
      return NextResponse.json(
        { message: 'Despesa deletada com sucesso.' }, 
        { status: 200 }
      );
    }

  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Despesa não encontrada.' }, { status: 404 })
    }

    console.error(error)
    return NextResponse.json({ error: 'Erro ao processar a solicitação.' }, { status: 500 })
  }
}