import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/api/lib/prisma'
import bcrypt from 'bcrypt'
import { z } from 'zod'

import {  verifyAuthHeader } from '@/app/api/lib/auth'


// Validação do formulário para criação de Transporte
const transportSchema = z.object({
  name: z.string().min(1, 'Nome do transporte obrigatório'),
  calculateKM: z.boolean(),
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

    //Valida os dados do transporte
    const body = await req.json()
    const parsed = transportSchema.safeParse(body)

    // Se a validação falhar, retorna os erros
    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.format() }, { status: 400 })
    }

    // Se a validação for bem-sucedida, extrai os dados
    const { name, calculateKM } = parsed.data

    // Verifica se o transport já existe
    const existingTransport = await prisma.transports.findUnique({ where: { name } })
    if (existingTransport) {
      return NextResponse.json({ message: 'Transporte já cadastrado' }, { status: 400 })
    }

    // Cria o transport
    const transport = await prisma.transports.create({
      data: {
        name,
        calculateKM,
        status: 1 // Cadastra como user ativo
      },
      select: {
        id: true,
        name: true,
        calculateKM: true,
        status: true,
      }
    })

    return NextResponse.json(transport, { status: 201 })

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


    const transports = await prisma.transports.findMany({
      select: {
        id: true,
        name: true,
        calculateKM: true,
        status: true
      }
    })

    return NextResponse.json(transports, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar Transportes:', error)
    return NextResponse.json({ error: 'Erro ao buscar Transportes.' }, { status: 500 })
  }
}