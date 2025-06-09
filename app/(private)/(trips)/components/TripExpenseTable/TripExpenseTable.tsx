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
        onClick={()=> setShowingExpenses(false) }
      />
    </div>
  );

   const dateBodyTemplate = (rowData: TripExpense) => {
       if (!rowData.date) return null;
       const date = new Date(rowData.date);
       const day = String(date.getDate()).padStart(2, '0');
       const month = String(date.getMonth() + 1).padStart(2, '0');
       const year = date.getFullYear();
       return <span>{`${day}/${month}/${year}`}</span>;
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
             onClick={() => window.open(rowData.proof, '_blank')}
           />

           <Button
             icon="pi pi-trash"
             rounded
             severity="danger"
             onClick={() => confirmDeleteExpense(rowData)}
           />
         </>
       );

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
      scrollable
      scrollHeight="400px"
      header={headerExpenses}
    >
      <Column field="expenses.name" header="Despesa" />
      <Column field="date" body={dateBodyTemplate} header="Data" />
      <Column field="value" header="Valor" />
      <Column field="typePayment" header="Tipo de Pagamento" />
      <Column field="proof" body={actionBodyTemplate} header="Comprovante" />
      
    </DataTable>
  )
}