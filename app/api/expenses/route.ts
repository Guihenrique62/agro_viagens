import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/api/lib/prisma'
import { z } from 'zod'

import { verifyAuthHeaderFromAuthorization, verifyAuthHeader } from '@/app/api/lib/auth'


// Validação do formulário para criação de Despesa
const expenseSchema = z.object({
  name: z.string().min(1, 'Nome da Despesa obrigatório'),
})

export async function POST(req: NextRequest) {
  try {

    // Valida o token de autenticação
    const authenticatedUser = await verifyAuthHeader()

    if (!authenticatedUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Valida se o usuário é um administrador
    if (authenticatedUser.role !== 'Administrador') {
      return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 })
    }

    //Valida os dados do expense
    const body = await req.json()
    const parsed = expenseSchema.safeParse(body)

    // Se a validação falhar, retorna os erros
    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.format() }, { status: 400 })
    }

    // Se a validação for bem-sucedida, extrai os dados
    const { name } = parsed.data

    // Verifica se a expense já existe
    const existingExpense = await prisma.expenses.findUnique({ where: { name } })
    if (existingExpense) {
      return NextResponse.json({ message: 'Despesa já cadastrada' }, { status: 400 })
    }

    // Cria o expense
    const expense = await prisma.expenses.create({
      data: {
        name,
        status: 1 // Cadastra como expense ativo
      },
      select: {
        id: true,
        name: true,
        status: true,
      }
    })

    return NextResponse.json(expense, { status: 201 })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) { 
  try {
    // Valida o token de autenticação
    const authenticatedUser = await verifyAuthHeader()

    if (!authenticatedUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }


    const expenses = await prisma.expenses.findMany({
      select: {
        id: true,
        name: true,
        status: true
      }
    })

    return NextResponse.json(expenses, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar Despesas:', error)
    return NextResponse.json({ error: 'Erro ao buscar Transportes.' }, { status: 500 })
  }
}