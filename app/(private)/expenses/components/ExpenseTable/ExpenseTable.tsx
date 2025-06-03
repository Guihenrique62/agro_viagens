import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { ProgressSpinner } from "primereact/progressspinner"

const ExpenseTable = ({
  dt,
  expenses,
  selectedExpenses,
  setSelectedExpenses,
  loading,
  header,
  filters,
  nameBodyTemplate,
  statusBodyTemplate,
  actionBodyTemplate
}: any) => { 
  
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