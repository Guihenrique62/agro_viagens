import { NextResponse } from 'next/server';

export async function GET() {
  const response = NextResponse.redirect(new URL('/login', process.env.FRONTEND_URL));

  // Apaga o cookie definindo ele como expirado
  response.cookies.set('AgroFinancesToken', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  return response;
}
