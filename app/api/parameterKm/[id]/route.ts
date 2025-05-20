import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/api/lib/prisma'
import { z } from 'zod'
import { verifyAuthHeader } from '../../lib/auth'

const updateSchema = z.object({
  value: z.number().min(0, { message: 'O valor deve ser maior que 0' }),
  startDate: z.string().min(1, { message: 'Data de início é obrigatória' }),
  endDate: z.string().min(1, { message: 'Data de término é obrigatória' }),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numericId = Number(id);

  if (isNaN(numericId)) {
    return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
  }

  const authenticatedUser = await verifyAuthHeader();

  if (!authenticatedUser) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  if (authenticatedUser.role !== 'Administrador') {
    return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.format() }, { status: 400 });
  }
  // Se a validação for bem-sucedida, extrai os dados
  const { value, startDate, endDate } = parsed.data;

  const start = new Date(startDate);
  const end = new Date(endDate);

  try {
    // Verifica se há sobreposição com outros parâmetros (excluindo o próprio)
    const overlapping = await prisma.parameters_km.findFirst({
      where: {
        id: {
          not: numericId,
        },
        OR: [
          {
            startDate: {
              lte: end,
            },
            endDate: {
              gte: start,
            },
          }
        ],
      }
    });
    // Se houver sobreposição, retorna um erro
    if (overlapping) {
      return NextResponse.json(
        { message: 'Atenção! Já existe um parâmetro dentro do período selecionado!' },
        { status: 400 }
      );
    }

    // Atualiza o parâmetro
    const updatedParameter = await prisma.parameters_km.update({
      where: { id: numericId },
      data: {
        value,
        startDate: start,
        endDate: end,
      },
      select: {
        id: true,
        value: true,
        startDate: true,
        endDate: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedParameter, { status: 200 });

  } catch (error: any) {
    // Verifica se o erro é do tipo P2025 (registro não encontrado)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Parâmetro não encontrado.' }, { status: 404 });
    }

    console.error(error);
    return NextResponse.json({ error: 'Erro ao atualizar Parâmetro.' }, { status: 500 });
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

    // Deleta o parametro pelo ID
    await prisma.parameters_km.delete({ where: { id: numericId } })

    return NextResponse.json({ message: 'Parametro deletado com sucesso.' }, { status: 200 })

  } catch (error: any) {
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Parametro não encontrado.' }, { status: 404 })
    }

    console.error(error)
    return NextResponse.json({ error: 'Erro ao deletar Parametro.' }, { status: 500 })
  }
}