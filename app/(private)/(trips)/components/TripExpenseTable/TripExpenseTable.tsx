import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { TripExpense } from "../../trips.types";
import { ProgressSpinner } from "primereact/progressspinner";

export default function TripExpenseTable({
  dt,
  tripExpenses,
  setShowingExpenses,
  setTripExpense,
  setDeleteTripExpenseDialog,
  loading
}: any) {

  const headerExpenses = (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
      <h5 className="m-0">Despesas da Viagem</h5>
      <Button
        label="Voltar"
        icon="pi pi-arrow-left"
        severity="secondary"
        className="mt-2 md:mt-0"
        onClick={() => setShowingExpenses(false)}
      />
    </div>
  );

  const dateBodyTemplate = (rowData: TripExpense) => {
    let dateStr = rowData.date;

    let date: Date;

    if (typeof dateStr === 'string' && dateStr.includes('/')) {
      // Ex: "15/06/2025"
      const [day, month, year] = dateStr.split('/');
      date = new Date(`${year}-${month}-${day}`);
    } else {
      // Ex: "2025-06-15T00:00:00.000Z"
      date = new Date(dateStr);
    }

    if (isNaN(date.getTime())) {
      return <span style={{ color: 'red' }}>Data inválida</span>;
    }

    const formatted = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'UTC',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);

    return <span>{formatted}</span>;
  };

  const confirmDeleteExpense = (trip: TripExpense) => {
    setTripExpense(trip);
    setDeleteTripExpenseDialog(true);
  };


  const actionBodyTemplate = (rowData: TripExpense) => (
    <>
      <Button
        icon="pi pi-download"
        rounded
        severity="info"
        onClick={() => {
          const link = document.createElement('a')
          link.href = `${window.location.origin}${rowData.proof}`
          link.download = rowData.proof.split('/').pop() || 'comprovante'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }}
      />

      <Button
        icon="pi pi-trash"
        rounded
        severity="danger"
        onClick={() => confirmDeleteExpense(rowData)}
      />
    </>
  );

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    })
  }


  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <ProgressSpinner
          style={{ width: '60px', height: '60px' }}
          strokeWidth="8"
          fill="var(--surface-ground)"
          animationDuration=".5s"
        />
      </div>
    )
  }

  return (
    <DataTable
      ref={dt}
      value={tripExpenses}
      tableStyle={{ minWidth: '50rem' }}
      className="p-datatable-striped"
      emptyMessage="Nenhuma Despesa Cadastrada."
      scrollable
      scrollHeight="400px"
      header={headerExpenses}
    >
      <Column field="expenses.name" header="Despesa" />
      <Column field="date" body={dateBodyTemplate} header="Data" />
      <Column field="value" header="Valor" body={(rowData: TripExpense) => formatCurrency(rowData.value)} />
      <Column field="typePayment" header="Tipo de Pagamento" />
      <Column field="proof" body={actionBodyTemplate} header="Comprovante" />

    </DataTable>
  )
}