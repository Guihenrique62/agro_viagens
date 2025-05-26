import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/api/lib/prisma'
import { z } from 'zod'
import { verifyAuthHeaderFromAuthorization } from '@/app/api/lib/auth'

// Validação dos dados para atualização da despesa de viagem
const updateTripExpenseSchema = z.object({
  typePayment: z.string().min(1, 'Tipo de pagamento obrigatório'),
  value: z.number().nonnegative('Valor deve ser positivo'),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Data inválida',
  }),
  taxDocument: z.string().min(1, 'Documento fiscal obrigatório'),
  observation: z.string().optional(),
  proof: z.string().min(1, 'Comprovante obrigatório').optional()
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const authenticatedUser = await verifyAuthHeaderFromAuthorization(req.headers.get('Authorization'))

    if (!authenticatedUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const expenseId = Number(id)
    if (isNaN(expenseId)) {
      return NextResponse.json({ error: 'ID da despesa inválido' }, { status: 400 })
    }

    const body = await req.json()
    const parsed = updateTripExpenseSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.format() }, { status: 400 })
    }

    const {
      typePayment,
      value,
      date,
      taxDocument,
      observation,
      proof
    } = parsed.data

    const existingTripExpense = await prisma.trip_expenses.findUnique({
      where: { id: expenseId }
    })

    if (!existingTripExpense) {
      return NextResponse.json({ error: 'Despesa da viagem não encontrada.' }, { status: 404 })
    }

    const updatedExpense = await prisma.trip_expenses.update({
      where: { id: expenseId },
      data: {
        typePayment,
        value,
        date: new Date(date),
        taxDocument,
        observation: observation?.trim() || '',
        proof: proof?.trim() || ''
      }
    })

    return NextResponse.json(updatedExpense, { status: 200 })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}


export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const authenticatedUser = await verifyAuthHeaderFromAuthorization(req.headers.get('Authorization'))

    if (!authenticatedUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const expenseId = Number(id)
    if (isNaN(expenseId)) {
      return NextResponse.json({ error: 'ID da despesa inválido' }, { status: 400 })
    }

    const existingExpense = await prisma.trip_expenses.findUnique({
      where: { id: expenseId }
    })

    if (!existingExpense) {
      return NextResponse.json({ error: 'Despesa da viagem não encontrada.' }, { status: 404 })
    }

    await prisma.trip_expenses.delete({
      where: { id: expenseId }
    })

    return NextResponse.json({ message: 'Despesa da viagem deletada com sucesso.' }, { status: 200 })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}