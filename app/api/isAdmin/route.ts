// /pages/api/isAdmin.ts
import { verifyAuthHeader } from '../lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
    // Valida o token de autenticação
    const authenticatedUser = await verifyAuthHeader()

    if (!authenticatedUser) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    
    return NextResponse.json(authenticatedUser, { status: 200 })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
    }
}


export const dynamic = 'force-dynamic'