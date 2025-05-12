import { NextRequest, NextResponse } from "next/server";
import {jwtDecode} from "jwt-decode";
import path from "path";

const publicRoutes = [
  {path: '/login', whenAuthenticated: 'redirect'},
  {path: '/resetPassword', whenAuthenticated: 'next'},
] as const

const adminRoutes = [
  {path: '/users', whenAuthenticated: 'next'},
] as const

type JwtPayload = {
  exp: number;
  user?: {
    role?: string;
    [key: string]: any;
  };
  [key: string]: any;
};

type TokenStatus = {
  expired: boolean;
  isAdmin: boolean;
  payload?: JwtPayload;
};

export function checkTokenStatus(token: string): TokenStatus {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const now = Math.floor(Date.now() / 1000);

    return {
      expired: decoded.exp < now,
      isAdmin: decoded.role === 'Administrador',
      payload: decoded
    };
  } catch {
    return { expired: true, isAdmin: false };
  }
}

export function middleware(req: NextRequest){
  const pathname = req.nextUrl.pathname

  console.log('Middleware:', pathname)

  const publicRoute = publicRoutes.find(route => route.path === pathname)
  const adminRoute = adminRoutes.find(route => route.path === pathname)
  const authToken = req.cookies.get('AgroFinancesToken')?.value

  //Usuario não esta autenticado e a rota é publica
  if(!authToken && publicRoute){
    return NextResponse.next()
  }

  //Usuario não esta autenticado e a rota não é publica
  if(!authToken && !publicRoute){

    //Redireciona para o login
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
    
  }

  //Usuario esta autenticado e a rota é publica e o comportamento é redirecionar
  if(authToken && publicRoute && publicRoute.whenAuthenticated === 'redirect'){

    //Redireciona direto para a home
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/'
    return NextResponse.redirect(redirectUrl)
  }

  //Usuario esta autenticado e a rota é privada
  if(authToken && !publicRoute && !adminRoute){

    //Verifica se o token é valido
    const { expired } = checkTokenStatus(authToken);

    if (expired) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/login'
      req.cookies.delete('AgroFinancesToken')
      return NextResponse.redirect(redirectUrl)
    }
    
    return NextResponse.next()
  }

  //Usuario esta autenticado e a rota é privada e admin
  if(authToken && !publicRoute && adminRoute){

    //Verifica se o usuario é admin e esta valido
    const { expired,  isAdmin } = checkTokenStatus(authToken);

    if (expired) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/login'
      req.cookies.delete('AgroFinancesToken')
      return NextResponse.redirect(redirectUrl)
    }

    // Se o usuário não for admin, redireciona para a home
    if (!isAdmin) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/'
      return NextResponse.redirect(redirectUrl)
    }
    
    return NextResponse.next()
  }


  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next|favicon.ico|api|static|images|layout|fonts|themes).*)',
  ],
}
export default middleware
