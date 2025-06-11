import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { InputText } from "primereact/inputtext";
import { ProgressSpinner } from "primereact/progressspinner"
import { Trip } from "../../trips.types";
import { Button } from "primereact/button";
import { getReportFinancial } from "../../untils/getReports";
import { ListBox } from "primereact/listbox";
import { useRef, useState } from "react";
import { SplitButton } from "primereact/splitbutton";
import { Menu } from "primereact/menu";
import { OverlayPanel } from "primereact/overlaypanel";

export const TripTable = ({
  dt,
  trips,
  selectedTrips,
  setSelectedTrips,
  loading,
  setFilters,
  filters,
  openEdit,
  openExpenses,
  setTrip,
  setDeleteTripDialog,
  setTripFinishDialog
}: any) => {

  const confirmDeleteTrip = (trip: Trip) => {
    setTrip(trip);
    setDeleteTripDialog(true);
  };

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let _filters = { ...filters };

    _filters['global'].value = value;

    setFilters(_filters);
  };

  const header = (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
      <h5 className="m-0">Cadastro de Viagens</h5>
      <span className="block mt-2 md:mt-0 p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          type="search"
          value={filters.global.value}
          onChange={onGlobalFilterChange}
          placeholder="Buscar..."
        />
      </span>
    </div>
  );

const ActionBodyTemplate = (rowData: Trip) => {
  const actionsMenuRef = useRef<any>(null);
  const downloadsMenuRef = useRef<any>(null);

  // Menu de ações (Aprovar, Editar, Excluir)
  const actionItems = [
    {
      label: 'Aprovar',
      icon: 'pi pi-check',
      command: () => setTripFinishDialog(true)
    },
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      command: () => openEdit(rowData)
    },
    {
      label: 'Excluir',
      icon: 'pi pi-trash',
      command: () => confirmDeleteTrip(rowData)
    },
    {
      label: 'Despesas',
      icon: 'pi pi-cart-plus',
      command: () => openExpenses(rowData)
    }
  ];

  // Menu de downloads (2 opções como solicitado)
  const downloadItems = [
    {
      label: 'Relatório Financeiro',
      icon: 'pi pi-download',
      command: () => getReportFinancial(rowData)
    },
    {
      label: 'Relatório Cliente',
      icon: 'pi pi-download',
      command: () => console.log('Implementar download detalhado') // Placeholder para a segunda função
    }
  ];

  return (
    <div className="flex gap-1">
      {/* Botão de Ações */}
      <div>
        <Button 
          icon="pi pi-cog" 
          rounded 
          outlined
          className="p-button-sm"
          onClick={(e) => {
            e.stopPropagation();
            if (actionsMenuRef.current) {
              actionsMenuRef.current.toggle(e);
            }
          }}
        />
        <OverlayPanel 
          ref={actionsMenuRef}
          onHide={() => {}}
        >
          {actionItems.map((item, i) => (
            <Button 
              key={`action-${i}`}
              label={item.label}
              icon={item.icon}
              className="p-button-text p-button-sm w-full"
              onClick={(e) => {
                e.stopPropagation();
                item.command();
                if (actionsMenuRef.current) {
                  actionsMenuRef.current.hide();
                }
              }}
            />
          ))}
        </OverlayPanel>
      </div>

      {/* Botão de Downloads */}
      <div>
        <Button 
          icon="pi pi-download" 
          rounded 
          outlined
          className="p-button-sm"
          onClick={(e) => {
            e.stopPropagation();
            if (downloadsMenuRef.current) {
              downloadsMenuRef.current.toggle(e);
            }
          }}
        />
        <OverlayPanel 
          ref={downloadsMenuRef}
          onHide={() => {}}
        >
          {downloadItems.map((item, i) => (
            <Button 
              key={`download-${i}`}
              label={item.label}
              icon={item.icon}
              className="p-button-text p-button-sm"
              onClick={(e) => {
                e.stopPropagation();
                item.command();
                if (downloadsMenuRef.current) {
                  downloadsMenuRef.current.hide();
                }
              }}
            />
          ))}
        </OverlayPanel>
      </div>
    </div>
  );
};

  const statusBodyTemplate = (rowData: Trip) => (
    <>
      {rowData.status === "EmAndamento" ? (
        <span className="product-badge status-available">Em andamento</span>
      ) : rowData.status === "Finalizada" ? (
        <span className="product-badge status-outofstock">Finalizada</span>
      ) : rowData.status === "Cancelada" ? (
        <span className="product-badge status-lowstock">Cancelada</span>
      ) : null}
    </>
  );

  const destinationBodyTemplate = (rowData: Trip) => <span>{rowData.destination}</span>;
  const clientBodyTemplate = (rowData: Trip) => <span>{rowData.client}</span>;
  const startDateBodyTemplate = (rowData: Trip) => {
    if (!rowData.startDate) return null;
    const date = new Date(rowData.startDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return <span>{`${day}/${month}/${year}`}</span>;
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
      value={trips}
      selection={selectedTrips}
      onSelectionChange={(e) => setSelectedTrips(e.value as any)}
      paginator
      rows={5}
      rowsPerPageOptions={[5, 10, 25]}
      className="datatable-responsive cursor-pointer"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      currentPageReportTemplate="Mostrando {first} até {last} de {totalRecords} usuários"
      emptyMessage="Nenhuma viagem encontrado."
      header={header}
      responsiveLayout="scroll"
      filters={filters}
      filterDisplay="row"
      globalFilterFields={['name']}
      onRowClick={(e) => {
        openExpenses(e.data)}}
    >
      <Column field="user.name" header="Usuario" sortable headerStyle={{ minWidth: '25rem' }} />
      <Column field="destination" header="Destino" sortable body={destinationBodyTemplate} headerStyle={{ minWidth: '15rem' }} />
      <Column field="client" header="Cliente" sortable body={clientBodyTemplate} headerStyle={{ minWidth: '15rem' }} />
      <Column field="startDate" header="Data Inicio" body={startDateBodyTemplate} sortable />
      <Column field="status" header="Status" body={statusBodyTemplate} sortable headerStyle={{ minWidth: '10rem' }} />
      <Column body={ActionBodyTemplate} header="Ações" headerStyle={{ minWidth: '10rem' }} />
    </DataTable>
  )
}