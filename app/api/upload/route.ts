import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { verifyAuthHeader } from '../lib/auth'

// Next.js 13+ App Router usa isso para indicar que a rota deve rodar no Node.js (não Edge)
export const runtime = 'nodejs'

const uploadDir = path.join(process.cwd(), 'public', 'uploads')

async function ensureUploadDir() {
  try {
    await fs.access(uploadDir)
  } catch {
    await fs.mkdir(uploadDir, { recursive: true })
  }
}

export async function POST(request: NextRequest) {

  await ensureUploadDir()

  const formData = await request.formData()
  const file = formData.get('file')

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'Arquivo não enviado ou inválido.' }, { status: 400 })
  }

  const timestamp = Date.now()
  const fileType = file.type || 'application/octet-stream'
  const ext = fileType.split('/')[1] || 'bin'
  const finalFileName = `${timestamp}-proof.${ext}`
  const filePath = path.join(uploadDir, finalFileName)

  const buffer = Buffer.from(await file.arrayBuffer())

  //Retorna erro se for maior que 5MB
  if (buffer.length > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Arquivo excede 5MB.' }, { status: 400 })
  }
  await fs.writeFile(filePath, buffer)

  const fileUrl = `/uploads/${finalFileName}`

  return NextResponse.json({ path: fileUrl }, { status: 201 })
}