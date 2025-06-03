import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/api/lib/prisma';
import { z } from 'zod';
import { verifyAuthHeader } from '@/app/api/lib/auth';

// Esquema para validar a data enviada no body
const dateSchema = z.object({
  date: z.string().refine((val) => {
    // Verifica se a data está no formato esperado dd/MM/yyyy
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    return regex.test(val);
  }, {
    message: 'Formato de data inválido. Use dd/MM/yyyy',
  }).transform((val) => {
    const [day, month, year] = val.split('/');
    return new Date(Number(year), Number(month) - 1, Number(day)); // Data correta no formato JS
  }),
});

export async function POST(req: NextRequest) {
  try {
    // Valida o token de autenticação
    const authenticatedUser = await verifyAuthHeader();

    if (!authenticatedUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Parse da data vinda do body
    const body = await req.json();
    const parsed = dateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.format() }, { status: 400 });
    }

    const inputDate = new Date(parsed.data.date);

    // Busca o parâmetro que contenha a data no intervalo
    const parameter = await prisma.parameters_km.findFirst({
      where: {
        startDate: {
          lte: inputDate,
        },
        endDate: {
          gte: inputDate,
        },
      },
      select: {
        id: true,
        value: true,
        startDate: true,
        endDate: true,
      },
    });

    if (!parameter) {
      return NextResponse.json({ message: 'Não existe um parametro de KM para a data selecionada, favor entrar em contato com o administrativo!' }, { status: 404 });
    }

    return NextResponse.json(parameter, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar parâmetro por data:', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
