import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/api/lib/prisma'
import { z } from 'zod'
import { verifyAuthHeader, verifyAuthHeaderFromAuthorization } from '@/app/api/lib/auth'

// Validação dos dados da viagem
const tripSchema = z.object({
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
  parameters_kmId: z.number().int('ID de parâmetros de KM inválido'),
  transportIds: z.array(z.number().int('ID de transporte inválido')).min(1, 'Selecione ao menos um transporte'),
  startKM: z.number(),
  endKM: z.number(),
  cpf_cnpj: z.string().min(1, 'CPF/CNPJ obrigatório')

})

export async function POST(req: NextRequest) {
  try {
    const authenticatedUser = await verifyAuthHeader()

    if (!authenticatedUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = tripSchema.safeParse(body)

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
      parameters_kmId,
      transportIds,
      startKM,
      endKM,
      cpf_cnpj
    } = parsed.data


    const existingParametersKm = await prisma.parameters_km.findUnique({
      where: {
        id: parameters_kmId
      }
    })

    const existingTransports = await prisma.transports.findMany({
      where: {
        id: {
          in: transportIds
        }
      }
    })


    if (!existingParametersKm) {
      return NextResponse.json({ error: 'Parâmetros de KM não encontrados.' }, { status: 404 })
    }

    if (existingTransports.length !== transportIds.length) {
      return NextResponse.json({ error: 'Alguns transportes não foram encontrados.' }, { status: 404 })
    }

    // Criação da viagem
    const trip = await prisma.trips.create({
      data: {
        destination,
        client,
        reason,
        escort,
        type,
        advance_value,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        userId: authenticatedUser.userId,
        parameters_kmId,
        status: 'EmAndamento',
        startKM,
        endKM,
        cpf_cnpj
      },
      select: {
        id: true,
        destination: true,
        client: true,
        reason: true,
        escort: true,
        type: true,
        advance_value: true,
        startDate: true,
        endDate: true,
        userId: true,
        parameters_kmId: true,
        status: true,
        startKM: true,
        endKM: true,
        cpf_cnpj: true,
        user : {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Criação dos vínculos com transportes
    await prisma.trip_transports.createMany({
      data: transportIds.map((transportId: number) => ({
        tripId: trip.id,
        transportId
      }))
    })

    return NextResponse.json(trip, { status: 201 })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}


export async function GET(req: NextRequest) {
  try {
    const authenticatedUser = await verifyAuthHeader()

    if (!authenticatedUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Se o usuario for ADMIN lista todas viajens 
    if (authenticatedUser.role === 'Administrador') {
        const trips = await prisma.trips.findMany({
            include: {
              trip_expenses: {
                include: {
                  expenses: true
                }
              },
              trip_transports: {
                include: {
                  transport: true
                }
              },
              parameters_km: true,
              user: {
                select: {
                  id: true,
                  name: true
                }
              }
            },
            orderBy: {
              startDate: 'desc'
            }
          })

          const tripsWithFormattedTransports = trips.map(trip => ({
            ...trip,
            transports: trip.trip_transports.map(t => t.transport),
            trip_transports: undefined // opcional: remover o relacionamento intermediário da resposta
          }))

          return NextResponse.json(tripsWithFormattedTransports, { status: 200 })
    }

    // Se o usuario for padrao lista apenas as proprias viajens
    if (authenticatedUser.role === 'UsuarioPadrao') {
      
      const trips = await prisma.trips.findMany({
            where: {
              userId: authenticatedUser.userId,
            },
            include: {
              trip_expenses: {
                include: {
                  expenses: true
                }
              },
              trip_transports: {
                include: {
                  transport: true
                }
              },
              parameters_km: true,
              user: {
                select: {
                  id: true,
                  name: true
                }
              }
            },
            orderBy: {
              startDate: 'desc'
            }
          })

          const tripsWithFormattedTransports = trips.map(trip => ({
            ...trip,
            transports: trip.trip_transports.map(t => t.transport),
            trip_transports: undefined // opcional: remover o relacionamento intermediário da resposta
          }))

          return NextResponse.json(tripsWithFormattedTransports, { status: 200 })

    }



  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}