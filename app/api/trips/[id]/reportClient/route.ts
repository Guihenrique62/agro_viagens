import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/api/lib/prisma'
import puppeteer from 'puppeteer'
import path from 'path'
import fs from 'fs'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const tripId = Number(params.id)

  if (isNaN(tripId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  const logoPath = path.join(process.cwd(), 'public/layout/images/logo-agrocontar.webp')
  const logoBase64 = fs.readFileSync(logoPath).toString('base64')
  const logoSrc = `data:image/webp;base64,${logoBase64}`


  const trip = await prisma.trips.findUnique({
    where: { id: tripId },
    include: {
      user: true,
      parameters_km: true,
      trip_transports: {
        include: { transport: true }
      },
      trip_expenses: {
        include: { expenses: true }
      }
    }
  })

  if (!trip) {
    return NextResponse.json({ error: 'Viagem não encontrada' }, { status: 404 })
  }

  // Calcular totais
  const totalExpenses = trip.trip_expenses.reduce((sum:any, exp:any) => sum + exp.value, 0)

  const totalAgrocontarExpenses = trip.trip_expenses
  .filter((exp: any) => exp.typePayment === 'Agrocontar')
  .reduce((sum:any, exp:any) => sum + exp.value, 0);

  const totalPessoalExpenses = trip.trip_expenses
  .filter((exp: any) => exp.typePayment === 'Pessoal')
  .reduce((sum:any, exp:any) => sum + exp.value, 0);
 
  const combustivelExpense = trip.trip_expenses
  .filter((exp: any) => exp.name === 'Combustivel')

  const calculateKMTransport = trip.trip_transports.some(
    trp => trp.transport.calculateKM
  );

  let valorKm = 0

  if(calculateKMTransport){
    valorKm = (trip.endKM - trip.startKM) * trip.parameters_km.value
  }
  


  const formatedDate = (date: any) => {
      const [year, month, day] = new Date(date).toISOString().split('T')[0].split('-');
      return `${day}/${month}/${year}`;
  }
  

const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Relatório de Viagem</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
      body {
        font-family: 'Roboto', sans-serif;
        font-size: 14px;
        color: #333;
        margin: 0;
        padding: 0;
      }

      .container-finish {
        max-width: 1000px;
        margin: 0 auto;
        padding: 20px;
      }

      .text-center {
        text-align: center;
      }

      .text-right {
        text-align: right;
      }

      h2 {
        font-size: 20px;
        font-weight: 700;
        margin-bottom: 30px;
      }

      .header {
        display: flex;
        align-items: center;
        border-bottom: 2px solid #ccc;
        margin-bottom: 20px;
        padding-bottom: 10px;
      }

      .logo img {
        max-width: 120px;
        height: auto;
      }

      .header-info {
        flex-grow: 1;
        padding-left: 20px;
      }

      .header-info div {
        margin-bottom: 6px;
        font-size: 14px;
      }

      .table {
        width: 100%;
        margin-bottom: 20px;
        border-collapse: collapse;
      }

      .table-bordered {
        border: 1px solid #ccc;
      }

      .table-bordered th,
      .table-bordered td {
        border: 1px solid #ccc;
        padding: 10px;
        vertical-align: top;
      }

      .table thead th {
        background-color: #f5f5f5;
        font-weight: 500;
      }

      .table-title {
        background-color: #e9e9e9;
        font-weight: bold;
        text-align: center;
        font-size: 15px;
      }

      #sign {
        margin-top: 100px;
        clear: both;
      }

      #sign .pull-left,
      #sign .pull-right {
        width: 48%;
        display: inline-block;
        vertical-align: top;
      }

      #sign hr {
        border: none;
        border-top: 1px solid #333;
        margin: 10px 0;
      }

      strong {
        font-weight: 700;
      }
    </style>
  </head>
  <body>
    <div class="container-finish">
      <h2 class="text-center">Despesas da viagem - Relatório Cliente</h2>

      <div class="header">
        <div class="logo">
          <img alt="Logo" src="${logoSrc}" />
        </div>
        <div class="header-info">
          <div><strong>Colaborador:</strong> ${trip.user.name}</div>
          <div><strong>Empresa:</strong> Agrocontar Consultoria Contábil Ltda</div>
          <div><strong>Cliente:</strong> ${trip.client}</div>
          <div><strong>Destino:</strong> ${trip.destination}</div>
          <div><strong>Motivo da viagem:</strong> ${trip.reason}</div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>Data</th>
              <th>Cliente</th>
              <th>Tipo da Viagem</th>
              <th>Destino</th>
              <th>Km rodados</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${formatedDate(trip.startDate)}</td>
              <td>${trip.client}</td>
              <td>${trip.type}</td>
              <td>${trip.destination}</td>
              <td>${trip.endKM - trip.startKM} KM</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-responsive">
        <table class="table table-bordered">
          <thead>
            <tr>
              <th class="text-center">Meio(s) de Transporte(s)</th>
            </tr>
          </thead>
          <tbody>
            ${trip.trip_transports
              .map(
                (t) => `
                <tr>
                  <td>${t.transport.name}</td>
                </tr>
              `
              )
              .join('')}
          </tbody>
        </table>
        <table class="table table-bordered text-center">
          <thead>
            <tr>
              <th colspan="5" class="text-center">Despesas</th>
            </tr>
            <tr>
              <td>Tipo</td>
              <td>Data</td>
              <td>Documento</td>
              <td>Tipo de Pagamento</td>
              <td>Valor</td>
            </tr>
          </thead>
          <tbody>
            ${trip.trip_expenses.map((t) => {
              // Se for combustível E tiver cálculo por KM, não mostra essa linha
              if (t.expenses.name === 'Combustivel' && calculateKMTransport) {
                return '';
              }
              
              return `
                <tr>
                  <td>${t.expenses.name}</td>
                  <td>${formatedDate(t.date)}</td>
                  <td>${t.taxDocument}</td>
                  <td>${t.typePayment}</td>
                  <td>R$ ${t.value.toFixed(2).replace('.', ',')}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div class="table-responsive">
        <table class="table table-bordered">
          <thead>
            <tr>
              <th colspan="2" class="text-center">Fechamento</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Total de Despesas com Recurso Pessoal</td>
              <td class="text-right">R$ ${totalPessoalExpenses.toFixed(2).replace('.', ',')}</td>
            </tr>
            <tr>
              <td>Total de Despesas com Recurso Agrocontar</td>
              <td class="text-right">R$ ${totalAgrocontarExpenses.toFixed(2).replace('.', ',')}</td>
            </tr>
            ${calculateKMTransport ? `

              <tr>
                <td>Valor de KM rodados</td>
                <td class="text-right">R$ ${valorKm.toFixed(2).replace('.', ',')}</td>
              </tr>
            
            ` : ``}

            <tr>
              <td>Total</td>
              <td class="text-right"><strong>R$ ${
              calculateKMTransport ?
              (totalExpenses + valorKm).toFixed(2).replace('.', ',') :
              totalExpenses.toFixed(2).replace('.', ',')}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div id="sign">
        <div class="pull-left">
          <strong>Data</strong> <br>
          <span class="data">_______/_______/_______</span>
        </div>

        <div class="pull-right">
          <strong>Assinatura</strong> <br>
          <span class="assinar" style="display: inline-block; margin-top: 8px;"
          >________________________________________________________</span>
        </div>
      </div>

    </div> <!-- container-finish -->
  </body>
  </html>
`;

  const browser = await puppeteer.launch({
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: 'networkidle0' })
  const pdf = await page.pdf({ format: 'A4' })
  await browser.close()

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="viagem-${trip.id}.pdf"`,
    },
  })
}