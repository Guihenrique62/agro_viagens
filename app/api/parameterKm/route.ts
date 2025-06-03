import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/api/lib/prisma'
import bcrypt from 'bcrypt'
import { z } from 'zod'

import { verifyAuthHeaderFromAuthorization, verifyAuthHeader } from '@/app/api/lib/auth'
import { start } from 'repl'


// Validação do formulário para criação de Parametro
const parameterSchema = z.object({
  value: z.number().min(0, { message: 'O valor deve ser maior que 0' }),
  startDate: z.string().transform((val) => {
    const [year, month, day] = val.split('-').map(Number);
    return new Date(year, month - 1, day);
  }),
  endDate: z.string().transform((val) => {
    const [year, month, day] = val.split('-').map(Number);
    return new Date(year, month - 1, day);
  }),
}).refine((data) => data.startDate <= data.endDate, {
  message: 'A data inicial deve ser menor ou igual à data final',
  path: ['endDate'],
});


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

    //Valida os dados do parametro
    const body = await req.json()

    const parsed = parameterSchema.safeParse(body)

    // Se a validação falhar, retorna os erros
    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.format() }, { status: 400 })
    }

    // Se a validação for bem-sucedida, extrai os dados
    const { value, startDate, endDate } = parsed.data

    // Valida sobreposição de período
    const overlappingParameter = await prisma.parameters_km.findFirst({
      where: {
        OR: [
          {
            startDate: {
              lte: endDate,
            },
            endDate: {
              gte: startDate,
            },
          },
        ],
      },
    })

    if (overlappingParameter) {
      return NextResponse.json(
        { message: 'Atenção! Já existe um parâmetro dentro do período selecionado!' },
        { status: 400 }
      )
    }

    // Cria o parametro
    const parameter = await prisma.parameters_km.create({
      data: {
        value,
        startDate,
        endDate,
      },
      select: {
        id: true,
        value: true,
        startDate: true,
        endDate: true,
        createdAt: true,
      }
    })

    return NextResponse.json(parameter, { status: 201 })

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
    
    // Valida se o usuário é um administrador
    if (authenticatedUser.role !== 'Administrador') {
      return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 })
    }


    const parameters = await prisma.parameters_km.findMany({
      select: {
        id: true,
        value: true,
        startDate: true,
        endDate: true,
        createdAt: true,
      }
    })

    return NextResponse.json(parameters, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar Parametros:', error)
    return NextResponse.json({ error: 'Erro ao buscar Parametros.' }, { status: 500 })
  }
}