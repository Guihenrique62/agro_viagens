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

  // Página de capa
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

  // Processar cada despesa
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

        // NOVO CÓDIGO - Redimensionamento responsivo
        const page = pdfDoc.addPage([595, 842])
        const margin = 50
        const maxWidth = 595 - (margin * 2) // Largura máxima disponível
        const maxHeight = 600 - (margin * 2) // Altura máxima disponível

        // Obter dimensões originais
        const originalWidth = image.width
        const originalHeight = image.height

        // Calcular proporções mantendo aspect ratio
        let width = originalWidth
        let height = originalHeight

        // Redimensionar se exceder a largura máxima
        if (width > maxWidth) {
          const ratio = maxWidth / width
          width = maxWidth
          height = height * ratio
        }

        // Redimensionar se exceder a altura máxima
        if (height > maxHeight) {
          const ratio = maxHeight / height
          height = maxHeight
          width = width * ratio
        }

        // Centralizar a imagem na página
        const x = (595 - width) / 2
        const y = 700 - height // Posicionar mais acima na página

        // Adicionar informações da despesa
        page.drawText(`Despesa: ${expense.expenses?.name || 'N/A'}`, {
          x: margin,
          y: 780,
          size: 14,
          font,
        })

        page.drawText(`Valor: R$ ${expense.value.toFixed(2)}`, {
          x: margin,
          y: 760,
          size: 12,
          font,
        })

        page.drawText(`Observação: ${expense.observation || 'Sem observação'}`, {
          x: margin,
          y: 740,
          size: 10,
          font,
          maxWidth: 500,
        })

        // Desenhar a imagem com o tamanho calculado
        page.drawImage(image, {
          x,
          y,
          width,
          height,
        })

        // Adicionar borda ao redor da imagem (opcional)
        page.drawRectangle({
          x: x - 2,
          y: y - 2,
          width: width + 4,
          height: height + 4,
          borderColor: rgb(0.8, 0.8, 0.8),
          borderWidth: 1,
        })

      } else if (type.mime === 'application/pdf') {
        const otherPdf = await PDFDocument.load(new Uint8Array(fileBuffer))
        const copiedPages = await pdfDoc.copyPages(otherPdf, otherPdf.getPageIndices())

        copiedPages.forEach((page) => {
          pdfDoc.addPage(page)
        })
      } else {
        console.warn(`Tipo de arquivo não suportado (${type.mime}) em ${proofUrl}`)
        
        // Adicionar página informativa para arquivos não suportados
        const page = pdfDoc.addPage([595, 842])
        page.drawText(`Despesa: ${expense.expenses?.name || 'N/A'}`, {
          x: 50,
          y: 780,
          size: 14,
          font,
        })
        page.drawText(`Arquivo não suportado: ${proofUrl}`, {
          x: 50,
          y: 750,
          size: 12,
          font,
          color: rgb(1, 0, 0),
        })
      }
    } catch (err) {
      console.error(`Erro ao processar arquivo ${proofUrl}:`, err)
      
      // Adicionar página de erro
      const page = pdfDoc.addPage([595, 842])
      page.drawText(`Erro ao processar comprovante: ${expense.expenses?.name || 'N/A'}`, {
        x: 50,
        y: 780,
        size: 14,
        font,
        color: rgb(1, 0, 0),
      })
    }
  }

  // Se não houver comprovantes, adicionar mensagem
  if (trip.trip_expenses.length === 0 || trip.trip_expenses.every(e => !e.proof)) {
    const page = pdfDoc.addPage([595, 842])
    page.drawText('Nenhum comprovante encontrado para esta viagem', {
      x: 150,
      y: 400,
      size: 16,
      font,
      color: rgb(0.5, 0.5, 0.5),
    })
  }

  const pdfBytes = await pdfDoc.save()

  return new NextResponse(new Uint8Array(pdfBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="comprovantes-viagem-${tripId}.pdf"`
    }
  })
}