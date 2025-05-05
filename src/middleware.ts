// src/middleware.ts
export const config = {
  matcher: ['/api/:path*'], // Protege todas as rotas de API
}

// Middleware para autenticação
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Extending NextRequest to include a user property
declare module 'next/server' {
  interface NextRequest {
    user?: any;
  }
}


export async function middleware(req: NextRequest) {
  // Roteamento para exceções (não protegemos essas rotas)
  const url = req.url;

  // Verifica se a URL corresponde àquelas que você deseja excluir
  if (url.includes('/api/forgetPassword') || url.includes('/api/authenticate')) {
    return NextResponse.next(); // Permite o acesso a essas rotas sem verificação de token
  }

  // Se o token não for encontrado, redireciona para a tela de login
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect('/login');
  }

  try {
    // Verifica o token JWT
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in the environment variables');
    }

    const decoded = jwt.verify(token as string, process.env.JWT_SECRET);
    req.user = decoded; // Atribui o usuário decodificado ao request
    return NextResponse.next(); // Permite que a requisição prossiga
  } catch (err) {
    return NextResponse.redirect('/login');
  }
}
