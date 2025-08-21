import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { fileTypeFromBuffer } from 'file-type'

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

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9.-]/g, '_')
}

export async function POST(request: NextRequest) {

  await ensureUploadDir()

  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'Arquivo não enviado ou inválido.' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const fileType = await fileTypeFromBuffer(new Uint8Array(buffer))

    let ext = 'jpg'

    if (fileType) {
      ext = fileType.ext
    } else {
      // Fallback: tenta determinar pelo nome ou content-type
      const fileName = file.name || ''
      const nameExt = fileName.split('.').pop()?.toLowerCase()
      if (nameExt && ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'heic'].includes(nameExt)) {
        ext = nameExt === 'jpeg' ? 'jpg' : nameExt
      }
    }

    // Converte HEIC para JPG (IOS)
    if (ext === 'heic') {
      ext = 'jpg'
    }

    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const finalFileName = `${timestamp}-${randomStr}-proof.${ext}`
    const sanitizedFileName = sanitizeFilename(finalFileName)
    const filePath = path.join(uploadDir, sanitizedFileName)


    //Retorna erro se for maior que 5MB
    if (buffer.length > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo excede 50MB.' }, { status: 400 })
    }
    await fs.writeFile(filePath, new Uint8Array(buffer))

    const fileUrl = `/uploads/${sanitizedFileName}`

    return NextResponse.json({
      path: fileUrl,
      filename: sanitizedFileName,
      size: buffer.length
    }, { status: 201 })
  } catch (error) {
    console.error('Erro no upload:', error)
    return NextResponse.json({
      error: 'Erro interno do servidor ao processar o arquivo.'
    }, { status: 500 })
  }
}