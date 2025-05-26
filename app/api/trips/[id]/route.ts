import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/api/lib/prisma'
import { z } from 'zod'
import { verifyAuthHeaderFromAuthorization } from '@/app/api/lib/auth'

// Schema de validação para update
const updateTripSchema = z.object({
  destination: z.string().min(1, 'Destino obrigatório'),
  client: z.string().min(1, 'Cliente obrigatório'),
  reason: z.string().min(1, 'Motivo obrigatório'),
  escort: z.string().optional(),
  type: z.string().min(1, 'Tipo obrigatório'),
  advance_value: z.number().nonnegative('Adiantamento deve ser positivo'),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Data de início inválida',
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Data de fim inválida',
  }),
  expensesId: z.number().int('ID de despesa inválido'),
  parameters_kmId: z.number().int('ID de parâmetros de KM inválido'),
  transportIds: z.array(z.number().int('ID de transporte inválido')).min(1, 'Selecione ao menos um transporte')
})

export async function PATCH(req: NextRequest, {params}: {params: Promise<{ id: string }>}) {

  const { id } = await params;

  try {
    const authenticatedUser = await verifyAuthHeaderFromAuthorization(req.headers.get('Authorization'))

    if (!authenticatedUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const tripId = Number(id)
    if (isNaN(tripId)) {
      return NextResponse.json({ error: 'ID da viagem inválido' }, { status: 400 })
    }

    const body = await req.json()
    const parsed = updateTripSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.format() }, { status: 400 })
    }

    const {
      destination,
      client,
      reason,
      escort,
      type,
      advance_value,
      startDate,
      endDate,
      expensesId,
      parameters_kmId,
      transportIds
    } = parsed.data

    const existingTrip = await prisma.trips.findUnique({ where: { id: tripId } })

    if (!existingTrip) {
      return NextResponse.json({ error: 'Viagem não encontrada.' }, { status: 404 })
    }

    const [existingExpense, existingParametersKm, existingTransports] = await Promise.all([
      prisma.expenses.findUnique({ where: { id: expensesId } }),
      prisma.parameters_km.findUnique({ where: { id: parameters_kmId } }),
      prisma.transports.findMany({ where: { id: { in: transportIds } } })
    ])

    if (!existingExpense) {
      return NextResponse.json({ error: 'Despesa não encontrada.' }, { status: 404 })
    }

    if (!existingParametersKm) {
      return NextResponse.json({ error: 'Parâmetros de KM não encontrados.' }, { status: 404 })
    }

    if (existingTransports.length !== transportIds.length) {
      return NextResponse.json({ error: 'Alguns transportes não foram encontrados.' }, { status: 404 })
    }

    // Atualiza a trip
    const updatedTrip = await prisma.trips.update({
      where: { id: tripId },
      data: {
        destination,
        client,
        reason,
        escort,
        type,
        advance_value,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        expensesId,
        parameters_kmId
      }
    })

    // Atualiza os transportes: remove e recria
    await prisma.trip_transports.deleteMany({ where: { tripId } })

    await prisma.trip_transports.createMany({
      data: transportIds.map(transportId => ({
        tripId,
        transportId
      }))
    })

    return NextResponse.json(updatedTrip, { status: 200 })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro interno ao atualizar a viagem.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const authenticatedUser = await verifyAuthHeaderFromAuthorization(req.headers.get('Authorization'))

    if (!authenticatedUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const tripId = Number(id)
    if (isNaN(tripId)) {
      return NextResponse.json({ error: 'ID da viagem inválido' }, { status: 400 })
    }

    const existingTrip = await prisma.trips.findUnique({ where: { id: tripId } })

    if (!existingTrip) {
      return NextResponse.json({ error: 'Viagem não encontrada.' }, { status: 404 })
    }

    // Deleta a viagem (e todas as relações em cascade)
    await prisma.trips.delete({
      where: { id: tripId }
    })

    return NextResponse.json({ message: 'Viagem deletada com sucesso.' }, { status: 200 })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao deletar a viagem.' }, { status: 500 })
  }
}