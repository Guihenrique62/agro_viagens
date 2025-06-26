import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { ProgressSpinner } from "primereact/progressspinner"
import { Expense } from "../../expenses.types";
import { Button } from "primereact/button";

const ExpenseTable = ({
  dt,
  expenses,
  selectedExpenses,
  setSelectedExpenses,
  loading,
  header,
  filters,
  nameBodyTemplate,
  openEdit,
  confirmDeleteProduct,
  confirmReactivateExpense
}: any) => { 

  const statusBodyTemplate = (rowData: Expense) => (
      <>
        {rowData.status === 1 ? (
          <span className="product-badge status-available">Ativo</span>
        ) : rowData.status === 2 ? (
          <span className="product-badge status-outofstock">Inativo</span>
        ) : null}
      </>
  );

  const actionBodyTemplate = (rowData: Expense) => {
    if (rowData.status === 1) {
      // Botões para despesas ativas (editar/excluir)
      return (
        <>
          <Button
            icon="pi pi-pencil"
            rounded
            severity="info"
            className="mr-2"
            onClick={() => openEdit(rowData)}
          />
          <Button
            icon="pi pi-trash"
            rounded
            severity="danger"
            onClick={() => confirmDeleteProduct(rowData)}
          />
        </>
      );
    } else {
      // Botão para despesas inativas (reativar)
      return (
        <Button
          icon="pi pi-refresh"
          rounded
          severity="success"
          tooltip="Reativar despesa"
          tooltipOptions={{ position: 'top' }}
          onClick={() => confirmReactivateExpense(rowData)}
        />
      );
    }
  };
  
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
      value={expenses}
      selection={selectedExpenses}
      onSelectionChange={(e) => setSelectedExpenses(e.value as any)}
      paginator
      rows={5}
      rowsPerPageOptions={[5, 10, 25]}
      className="datatable-responsive"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      currentPageReportTemplate="Mostrando {first} até {last} de {totalRecords} Despesas"
      emptyMessage="Nenhuma despesa encontrada."
      header={header}
      responsiveLayout="scroll"
      filters={filters}
      filterDisplay="row"
      globalFilterFields={['name']}
    >
      <Column field="name" header="Nome" sortable body={nameBodyTemplate} headerStyle={{ minWidth: '15rem' }} />
      <Column field="status" header="Status" body={statusBodyTemplate} sortable headerStyle={{ minWidth: '10rem' }} />
      <Column body={actionBodyTemplate} header="Ações" headerStyle={{ minWidth: '10rem' }} />
    </DataTable>
  )
}

export default ExpenseTable;