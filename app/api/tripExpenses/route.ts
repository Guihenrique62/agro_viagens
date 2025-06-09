import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/api/lib/prisma'
import { z } from 'zod'
import { verifyAuthHeader } from '@/app/api/lib/auth'

// Validação dos dados da despesa de viagem
const tripExpenseSchema = z.object({
  typePayment: z.string().min(1, 'Tipo de pagamento obrigatório'),
  value: z.number().nonnegative('Valor deve ser positivo'),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Data inválida',
  }),
  taxDocument: z.string().min(1, 'Documento fiscal obrigatório'),
  observation: z.string().optional(),
  proof: z.string().min(1, 'Comprovante obrigatório').optional(),
  expensesId: z.number().int('ID de despesa inválido'),
  tripId: z.number().int('ID da viagem inválido')
})

export async function POST(req: NextRequest) {
  try {
    const authenticatedUser = await verifyAuthHeader()

    if (!authenticatedUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = tripExpenseSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.format() }, { status: 400 })
    }

    const {
      typePayment,
      value,
      date,
      taxDocument,
      observation,
      proof,
      expensesId,
      tripId
    } = parsed.data

    const existingExpense = await prisma.expenses.findUnique({
      where: {
        id: expensesId
      }
    })

    const existingTrip = await prisma.trips.findUnique({
      where: {
        id: tripId
      }
    })

    if (!existingExpense) {
      return NextResponse.json({ error: 'Despesa não encontrada.' }, { status: 404 })
    }

    if (!existingTrip) {
      return NextResponse.json({ error: 'Viagem não encontrada.' }, { status: 404 })
    }

    const obsevationTratada = observation ? observation.trim() : ''
    const proofTratado = proof ? proof.trim() : ''

    const newExpense = await prisma.trip_expenses.create({
      data: {
        typePayment,
        value,
        date: new Date(date),
        taxDocument,
        observation: obsevationTratada,
        proof: proofTratado,
        expensesId,
        tripId
      }
    })

    return NextResponse.json(newExpense, { status: 201 })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}