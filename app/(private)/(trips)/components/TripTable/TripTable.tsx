import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { ProgressSpinner } from "primereact/progressspinner"

export const TripTable = ({
  dt,
  trips,
  selectedTrips,
  setSelectedTrips,
  loading,
  header,
  filters,
  destinationBodyTemplate,
  clientBodyTemplate,
  startDateBodyTemplate,
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
      value={trips}
      selection={selectedTrips}
      onSelectionChange={(e) => setSelectedTrips(e.value as any)}
      paginator
      rows={5}
      rowsPerPageOptions={[5, 10, 25]}
      className="datatable-responsive"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      currentPageReportTemplate="Mostrando {first} até {last} de {totalRecords} usuários"
      emptyMessage="Nenhuma viagem encontrado."
      header={header}
      responsiveLayout="scroll"
      filters={filters}
      filterDisplay="row"
      globalFilterFields={['name']}
    >
      <Column field="destination" header="Destino" sortable body={destinationBodyTemplate} headerStyle={{ minWidth: '15rem' }} />
      <Column field="client" header="Cliente" sortable body={clientBodyTemplate} headerStyle={{ minWidth: '15rem' }} />
      <Column field="startDate" header="Data Inicio" body={startDateBodyTemplate} sortable />
      <Column field="status" header="Status" body={statusBodyTemplate} sortable headerStyle={{ minWidth: '10rem' }} />
      <Column body={actionBodyTemplate} header="Ações" headerStyle={{ minWidth: '10rem' }} />
    </DataTable>
  )
}