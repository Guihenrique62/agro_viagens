import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import path from 'path'
import fs from 'fs/promises'
import { prisma } from '../../lib/prisma'
import { fileTypeFromBuffer } from 'file-type'

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

    const safePath = decodeURIComponent(proofUrl)
    const filePath = path.join(process.cwd(), 'public', safePath.replace('/uploads/', 'uploads/'))

    let fileBuffer: Buffer
    try {
      fileBuffer = await fs.readFile(filePath)
    } catch (err) {
      console.error(`Erro ao ler o arquivo ${proofUrl}:`, err)
      continue
    }

    const type = await fileTypeFromBuffer(new Uint8Array(fileBuffer))
    if (!type) {
      console.warn(`Tipo de arquivo não reconhecido: ${proofUrl}`)
      continue
    }

    try {
      if (type.mime === 'image/png' || type.mime === 'image/jpeg') {
        const image = type.mime === 'image/png'
          ? await pdfDoc.embedPng(new Uint8Array(fileBuffer))
          : await pdfDoc.embedJpg(new Uint8Array(fileBuffer))

        const imgDims = image.scale(0.5)
        const page = pdfDoc.addPage([595, 842])

        page.drawText(`Despesa: ${expense.expenses?.name}`, {
          x: 50,
          y: 780,
          size: 14,
          font,
        })

        page.drawImage(image, {
          x: (595 - imgDims.width) / 2,
          y: 150,
          width: imgDims.width,
          height: imgDims.height,
        })
      } else if (type.mime === 'application/pdf') {
        const otherPdf = await PDFDocument.load(new Uint8Array(fileBuffer))
        const copiedPages = await pdfDoc.copyPages(otherPdf, otherPdf.getPageIndices())

        copiedPages.forEach((page) => {
          pdfDoc.addPage(page)
        })
      } else {
        console.warn(`Tipo de arquivo não suportado (${type.mime}) em ${proofUrl}`)
      }
    } catch (err) {
      console.error(`Erro ao embutir arquivo ${proofUrl}:`, err)
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
