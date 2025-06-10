import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/api/lib/prisma'
import puppeteer from 'puppeteer'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const tripId = Number(params.id)

  if (isNaN(tripId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

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
  const totalFoodHosting = trip.trip_expenses
    .filter(exp => exp.expenses.name === 'Hospedagem' || exp.expenses.name === 'Alimentação')
    .reduce((sum, exp) => sum + exp.value, 0)

  const totalFuel = trip.trip_expenses
    .filter(exp => exp.expenses.name === 'Combustível')
    .reduce((sum, exp) => sum + exp.value, 0)

  const totalMisc = trip.trip_expenses
    .filter(exp => !['Hospedagem', 'Alimentação', 'Combustível'].includes(exp.expenses.name))
    .reduce((sum, exp) => sum + exp.value, 0)

  const paymentTypes = {
    Dinheiro: trip.trip_expenses
      .filter(exp => exp.typePayment === 'Dinheiro')
      .reduce((sum, exp) => sum + exp.value, 0),
    Débito: trip.trip_expenses
      .filter(exp => exp.typePayment === 'Débito')
      .reduce((sum, exp) => sum + exp.value, 0),
    Crédito: trip.trip_expenses
      .filter(exp => exp.typePayment === 'Crédito')
      .reduce((sum, exp) => sum + exp.value, 0)
  }

  // Calcular KM rodados (assumindo que temos esses dados)
  const kmRodados = trip.trip_transports.reduce((sum, tt) => {
    // Aqui você precisaria adicionar a lógica para calcular os km baseado no seu modelo
    return sum + 100 // Exemplo simplificado
  }, 0)

  const valorKm = kmRodados * (trip.parameters_km?.value || 0)

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Relatório de Viagem</title>
      <style>
        body { font-family: Arial, sans-serif; }
        .container-finish { max-width: 1000px; margin: 0 auto; padding: 20px; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .table { width: 100%; margin-bottom: 20px; border-collapse: collapse; }
        .table-bordered { border: 1px solid #ddd; }
        .table-bordered th, .table-bordered td { border: 1px solid #ddd; padding: 8px; }
        .table-responsive { margin-bottom: 20px; }
        .btn { display: inline-block; padding: 6px 12px; margin-bottom: 0; font-size: 14px; font-weight: 400; line-height: 1.42857143; text-align: center; white-space: nowrap; vertical-align: middle; cursor: pointer; background-image: none; border: 1px solid transparent; border-radius: 4px; text-decoration: none; }
        .btn-primary { color: #fff; background-color: #337ab7; border-color: #2e6da4; }
        .pull-left { float: left; }
        .pull-right { float: right; }
        .row { margin-right: -15px; margin-left: -15px; }
        .col-xs-2, .col-sm-2, .col-md-2, .col-lg-2, 
        .col-xs-10, .col-sm-10, .col-md-10, .col-lg-10 { position: relative; min-height: 1px; padding-right: 15px; padding-left: 15px; }
        .header-print div { margin-bottom: 5px; }
        #sign { margin-top: 100px; clear: both; }
        strong { font-weight: bold; }
      </style>
    </head>
    <div class="container-finish">
      <body>
        <h2 class="text-center">Despesas com viagens - Relatório financeiro</h2>
        <div class="buttons-finish">
          <a class="btn btn-primary" href="/viagens/${trip.id}">
            <i class="fa fa-backward fa-lg"></i> Voltar
          </a>
        </div>

        <div class="head">
          <div class="row">
            <div class="col-xs-2 col-sm-2 col-md-2 col-lg-2">
              <div class="logo"><img alt="Logo" src="/assets/logo-1572f895096e93c26f8ddad041978699.png" /></div>
            </div>
            <div class="col-xs-10 col-sm-10 col-md-10 col-lg-10 header-print">
              <div>Colaborador: ${trip.user.name}</div>
              <div>Empresa: Agrocontar Consultoria Contabil Ltda</div>
              <div>Cliente: ${trip.client}</div>
              <div>Cidade/UF: ${trip.destination}</div>
              <div>Motivo da viagem: ${trip.reason}</div>
            </div>
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
                <th>KM rodados</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${new Date(trip.startDate).toLocaleDateString('pt-BR')}</td>
                <td>${trip.client}</td>
                <td>${trip.type}</td>
                <td>${trip.destination}</td>
                <td>${kmRodados.toFixed(1)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="table-responsive">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th>Veículo</th>
                <th>KM Inicial</th>
                <th>KM Final</th>
                <th>Valor do adiantamento</th>
                <th>Devolver</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${trip.trip_transports[0]?.transport?.name || 'Carro próprio'}</td>
                <td>1000.0</td>
                <td>${(1000 + kmRodados).toFixed(1)}</td>
                <td>R$ ${trip.advance_value.toFixed(2).replace('.', ',')}</td>
                <td>R$ ${(trip.advance_value - valorKm - totalFoodHosting - totalFuel - totalMisc).toFixed(2).replace('.', ',')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="table-responsive">
          <table class="table table-bordered text-center">
            <tr>
              <th colspan="10" class="text-center">Despesas com Hospedagem/Alimentação</th>
            </tr>
            <tr>
              <td rowspan="2">Data</td>
              <td rowspan="2">Documento</td>
              <td rowspan="2">Nome do Restaurante/Hotel</td>
              <td colspan="3">Alimentação</td>
              <td colspan="3">Hotel</td>
              <td rowspan="2">Valor Total</td>
            </tr>
            <tr>
              <td>Qtde</td>
              <td>Vlr. Unid</td>
              <td>Tipo Pgt.</td>
              <td>Qtde</td>
              <td>Vlr. Unid</td>
              <td>Tipo Pgt.</td>
            </tr>
            ${trip.trip_expenses
              .filter(exp => exp.expenses.name === 'Hospedagem' || exp.expenses.name === 'Alimentação')
              .map(exp => `
                <tr>
                  <td>${new Date(exp.date).toLocaleDateString('pt-BR')}</td>
                  <td>${exp.taxDocument}</td>
                  <td>${exp.observation || '-'}</td>
                  <td>1</td>
                  <td>R$ ${exp.value.toFixed(2).replace('.', ',')}</td>
                  <td>${exp.typePayment}</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>R$ ${exp.value.toFixed(2).replace('.', ',')}</td>
                </tr>
              `).join('')}
            <tr>
              <td colspan="9" class="text-right"><strong>Totais</strong></td>
              <td id="sum_food_hosting"><strong>R$ ${totalFoodHosting.toFixed(2).replace('.', ',')}</strong></td>
            </tr>
          </table>
        </div>

        <div class="table-responsive">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th class="text-center" colspan="7">Despesas com combustivel</th>
              </tr>
              <tr>
                <th>Data</th>
                <th>Origem</th>
                <th>Destino</th>
                <th>Observação</th>
                <th>Pagamento</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              ${trip.trip_expenses
                .filter(exp => exp.expenses.name === 'Combustível')
                .map(exp => `
                  <tr>
                    <td>${new Date(exp.date).toLocaleDateString('pt-BR')}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>${exp.observation || '-'}</td>
                    <td>${exp.typePayment}</td>
                    <td>R$ ${exp.value.toFixed(2).replace('.', ',')}</td>
                  </tr>
                `).join('')}
              <tr>
                <td colspan="5" class="text-right"><strong>Totais</strong></td>
                <td class="text-center"><strong>R$ ${totalFuel.toFixed(2).replace('.', ',')}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="table-responsive">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th colspan="8" class="text-center">Outras despesas</th>
              </tr>
              <tr>
                <th>Data</th>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Documento</th>
                <th>Quantidade</th>
                <th>Valor Unid</th>
                <th>Tipo Pgt.</th>
                <th>Valor total</th>
              </tr>
            </thead>
            <tbody>
              ${trip.trip_expenses
                .filter(exp => !['Hospedagem', 'Alimentação', 'Combustível'].includes(exp.expenses.name))
                .map(exp => `
                  <tr>
                    <td>${new Date(exp.date).toLocaleDateString('pt-BR')}</td>
                    <td>${exp.expenses.name}</td>
                    <td>${exp.observation || '-'}</td>
                    <td>${exp.taxDocument}</td>
                    <td>1</td>
                    <td>R$ ${exp.value.toFixed(2).replace('.', ',')}</td>
                    <td>${exp.typePayment}</td>
                    <td>R$ ${exp.value.toFixed(2).replace('.', ',')}</td>
                  </tr>
                `).join('')}
              <tr>
                <td colspan="7" class="text-right"><strong>Totais</strong></td>
                <td class="text-center" id="misc-total"><strong>R$ ${totalMisc.toFixed(2).replace('.', ',')}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="table-responsive">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th colspan="4" class="text-center">Despesas por tipo de pagamento</th>
              </tr>
              <tr>
                <th>Dinheiro</th>
                <th>Débito</th>
                <th>Crédito</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>R$ ${paymentTypes.Dinheiro.toFixed(2).replace('.', ',')}</td>
                <td>R$ ${paymentTypes.Débito.toFixed(2).replace('.', ',')}</td>
                <td>R$ ${paymentTypes.Crédito.toFixed(2).replace('.', ',')}</td>
                <td><strong>R$ ${(paymentTypes.Dinheiro + paymentTypes.Débito + paymentTypes.Crédito).toFixed(2).replace('.', ',')}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="table-responsive">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th colspan="7" class="text-center">Fechamento</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Kilometros rodados</td>
                <td class="text-right" id="travel-sum-km-value">
                  R$ ${valorKm.toFixed(2).replace('.', ',')}
                </td>
              </tr>
              <tr>
                <td>Despesas com Hospedagem/Alimentação</td>
                <td class="text-right" id="travel-sum-food-hosting">R$ ${totalFoodHosting.toFixed(2).replace('.', ',')}</td>
              </tr>
              <tr>
                <td>Outras Despesas</td>
                <td class="text-right" id="travel-misc-total">R$ ${totalMisc.toFixed(2).replace('.', ',')}</td>
              </tr>
              <tr>
                <td>Despesas com combustível</td>
                <td class="text-right" id="travel-transit-total">R$ ${totalFuel.toFixed(2).replace('.', ',')}</td>
              </tr>
              <tr>
                <td>Pagamento Final</td>
                <td class="text-right" id="travel-final-value"><strong>R$ ${(trip.advance_value - valorKm - totalFoodHosting - totalFuel - totalMisc).toFixed(2).replace('.', ',')}</strong></td>
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
            <span class="assinar">________________________________________________________</span>
          </div>
        </div>
      </body>
    </div>
    </html>
  `

  const browser = await puppeteer.launch()
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