import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import path from 'path'
import fs from 'fs/promises'
import { prisma } from '../../lib/prisma'

export const runtime = 'nodejs'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const tripId = Number(params.id)

  const trip = await prisma.trips.findUnique({
    where: { id: tripId },
    include: {
      user: true,
      trip_expenses: { include: { expenses: true } },
    }
  })

  if (!trip) {
    return NextResponse.json({ error: 'Viagem não encontrada' }, { status: 404 })
  }

  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)


  // Capa
  const cover = pdfDoc.addPage([595, 842]) // A4
  const { height } = cover.getSize()

  cover.drawText(`Relatório de Comprovantes de Viagem`, {
    x: 160,
    y: height - 70,
    size: 18,
    font,
    color: rgb(0, 0, 0),
  })

  let textY = height - 130
  const infoLines = [
    `Colaborador: ${trip.user.name}`,
    `Cliente: ${trip.client}`,
    `Destino: ${trip.destination}`,
    `Motivo da viagem: ${trip.reason}`,
    `ID da Viagem: ${trip.id}`,
    `Quantidade de Despesas: ${trip.trip_expenses.length}`,
  ]

  for (const line of infoLines) {
    cover.drawText(line, {
      x: 50,
      y: textY,
      size: 12,
      font,
      color: rgb(0.1, 0.1, 0.1),
    })
    textY -= 18
  }

  for (const expense of trip.trip_expenses) {
    const proofUrl = expense.proof
    if (!proofUrl) continue

    const filePath = path.join(process.cwd(), 'public', proofUrl.replace('/uploads/', 'uploads/'))
    const fileBuffer = await fs.readFile(filePath)
    const fileType = proofUrl.split('.').pop()

    if (!fileType) continue

    if(fileType != 'pdf') {
      // ✅ Imagem: título + imagem na mesma página
      const imageBytes = new Uint8Array(fileBuffer)
      const image = fileType === 'png'
        ? await pdfDoc.embedPng(imageBytes)
        : await pdfDoc.embedJpg(imageBytes)

      const imgDims = image.scale(0.5) // você pode ajustar o scale conforme necessário
      const page = pdfDoc.addPage([595, 842])

      page.drawText(`Despesa: ${expense.expenses?.name}`, {
        x: 50,
        y: 780,
        size: 14,
        font,
      })

      // 🖼 centralizar e posicionar a imagem mais abaixo
      page.drawImage(image, {
        x: (595 - imgDims.width) / 2,
        y: 150,
        width: imgDims.width,
        height: imgDims.height,
      })
    }
    
  }

  const pdfBytes = await pdfDoc.save()

  return new NextResponse(new Uint8Array(pdfBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="comprovantes-viagem-${tripId}.pdf"`
    }
  })
}