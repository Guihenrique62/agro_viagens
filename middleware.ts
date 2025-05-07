import { MiddlewareConfig, NextRequest, NextResponse } from "next/server";
import {jwtDecode} from "jwt-decode";

const publicRoutes = [
  {path: '/login', whenAuthenticated: 'redirect'},
  {path: '/resetPassword', whenAuthenticated: 'next'},
] as const

type JwtPayload = {
  exp: number
  [key: string]: any
}

function isJwtExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<JwtPayload>(token)
    const now = Math.floor(Date.now() / 1000)
    return decoded.exp < now
  } catch (error) {
    return true // Considera expirado se não for possível decodificar
  }
}

export function middleware(req: NextRequest){
  const pathname = req.nextUrl.pathname

  console.log('Middleware:', pathname)

  const publicRoute = publicRoutes.find(route => route.path === pathname)
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
  if(authToken && !publicRoute){

    //Verifica se o token é valido
    const expired = isJwtExpired(authToken)

    if (expired) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/login'
      req.cookies.delete('AgroFinancesToken')
      return NextResponse.redirect(redirectUrl)
    }
    
    return NextResponse.next()
  }


  return NextResponse.next()
}

export const config: MiddlewareConfig = {
  matcher: [
    '/((?!_next|favicon.ico|api|static|images|layout|fonts|themes).*)',
  ],
}
export default middleware
