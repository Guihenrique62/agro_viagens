import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { InputText } from "primereact/inputtext";
import { ProgressSpinner } from "primereact/progressspinner"
import { Trip } from "../../trips.types";
import { Button } from "primereact/button";
import { getReportClient, getReportFinancial, getReportProof } from "../../untils/getReports";
import { useEffect, useRef, useState } from "react";
import { OverlayPanel } from "primereact/overlaypanel";
import { jwtDecode } from "jwt-decode";

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
  setTripFinishDialog,
  setTripReopenDialog
}: any) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch('/api/isAdmin', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!res.ok) return;
      const data = await res.json();
      setUser(data);
    };
    fetchUser();
  }, []);

 

  const confirmDeleteTrip = (trip: Trip) => {
    setTrip(trip);
    setDeleteTripDialog(true);
  };

  const confirmFinishTrip = (trip: Trip) => {
    setTrip(trip);
    setTripFinishDialog(true);
  };

  const confirmReopenTrip = (trip: Trip) => {
    setTrip(trip);
    setTripReopenDialog(true);
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
  let isAdmin = false;

  user?.role === 'Administrador' ? isAdmin = true : isAdmin = false;

  // Menu base de ações (só visível para admin ou viagens não finalizadas)
  const getActionItems = () => {
    if (rowData.status === "Finalizada") {
      if (!isAdmin) return []; // Usuários comuns não veem ações para viagens finalizadas
      
      return [
        {
          label: 'Excluir',
          icon: 'pi pi-trash',
          command: () => confirmDeleteTrip(rowData)
        },
        {
          label: 'Reabrir',
          icon: 'pi pi-refresh',
          command: () => confirmReopenTrip(rowData)
        }
      ];
    } else {
      // Todas as ações para viagens não finalizadas
      return [
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
        },
        {
          label: 'Finalizar',
          icon: 'pi pi-check',
          command: () => confirmFinishTrip(rowData)
        }
      ];
    }
  };

  const actionItems = getActionItems();

  // Menu de downloads (sempre visível)
  const downloadItems = [
    {
      label: 'Relatório Financeiro',
      icon: 'pi pi-download',
      command: () => getReportFinancial(rowData)
    },
    {
      label: 'Relatório Cliente',
      icon: 'pi pi-download',
      command: () => getReportClient(rowData)
    },
    {
      label: 'Relatório Comprovantes',
      icon: 'pi pi-download',
      command: () => getReportProof(rowData)
    }
  ];

  return (
    <div className="flex gap-1">
      {/* Botão de Ações - Só mostra se houver ações disponíveis */}
      {actionItems.length > 0 && (
        <div>
          <Button 
            icon="pi pi-cog" 
            rounded 
            outlined
            className="p-button-sm"
            onClick={(e) => {
              e.stopPropagation();
              actionsMenuRef.current?.toggle(e);
            }}
          />
          <OverlayPanel ref={actionsMenuRef}>
            {actionItems.map((item, i) => (
              <Button 
                key={`action-${i}`}
                label={item.label}
                icon={item.icon}
                className="p-button-text p-button-sm w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  item.command();
                  actionsMenuRef.current?.hide();
                }}
              />
            ))}
          </OverlayPanel>
        </div>
      )}

      {/* Botão de Downloads (sempre visível) */}
      <div>
        <Button 
          icon="pi pi-download" 
          rounded 
          outlined
          className="p-button-sm"
          onClick={(e) => {
            e.stopPropagation();
            downloadsMenuRef.current?.toggle(e);
          }}
        />
        <OverlayPanel ref={downloadsMenuRef}>
          {downloadItems.map((item, i) => (
            <Button 
              key={`download-${i}`}
              label={item.label}
              icon={item.icon}
              className="p-button-text p-button-sm"
              onClick={(e) => {
                e.stopPropagation();
                item.command();
                downloadsMenuRef.current?.hide();
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
        <span className="product-badge status-instock">Finalizada</span>
      ) : rowData.status === "Cancelada" ? (
        <span className="product-badge status-lowstock">Cancelada</span>
      ) : null}
    </>
  );

  const destinationBodyTemplate = (rowData: Trip) => <span>{rowData.destination}</span>;
  const clientBodyTemplate = (rowData: Trip) => <span>{rowData.client} - {rowData.cpf_cnpj}</span>;
  const startDateBodyTemplate = (rowData: Trip) => {

    const [year, month, day] = new Date(rowData.startDate).toISOString().split('T')[0].split('-');
    return <span>{day}/{month}/{year}</span>;

      
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
      <Column field="user.name" header="Usuario" sortable headerStyle={{ minWidth: '25rem' }} />
      <Column field="destination" header="Destino" sortable body={destinationBodyTemplate} headerStyle={{ minWidth: '15rem' }} />
      <Column field="client" header="Cliente" sortable body={clientBodyTemplate} headerStyle={{ minWidth: '15rem' }} />
      <Column field="startDate" header="Data Início" body={startDateBodyTemplate} sortable />
      <Column field="status" header="Status" body={statusBodyTemplate} sortable headerStyle={{ minWidth: '10rem' }} />
      <Column body={ActionBodyTemplate} header="Ações" headerStyle={{ minWidth: '10rem' }} />
    </DataTable>
  )
}