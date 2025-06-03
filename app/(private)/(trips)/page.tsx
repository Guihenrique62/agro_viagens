/* eslint-disable @next/next/no-img-element */
'use client';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { InputMaskChangeEvent } from 'primereact/inputmask';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { useEffect, useRef, useState } from 'react';
import { Trip } from './trips.types';
import { Transport } from '../transport/transport.types';
import { TripTable } from './components/TripTable/TripTable';
import { TripDialog } from './components/TripDialog/TripDialog';
import { TripDialogDelete } from './components/TripDialogDelete/TripDialogDelete';
import { getTrips } from './untils/getTrips';
import { getTransports } from './untils/getTransports';
import { saveTrip } from './untils/saveTrip';
import { editTrip } from './untils/editTrip';
import { deleteTrip } from './untils/deleteTrip';






const TripsPage = () => {
  const emptyTrip: Trip = {
    id: 0,
    userId: '',
    destination: '',
    client: '',
    reason: '',
    escort: '',
    type: '',
    advance_value: 0,
    startDate: '',
    endDate: '',
    status: '',
    parameters_kmId: '',
    transports: [],
    user: {
      id: '',
      name: '',
    },
    parameters_km: {
      id: '',
      value: 0,
      startDate: '',
      endDate: '',
    },
    trip_expenses: [],
  };

  const [trips, setTrips] = useState<Trip[]>([]);
  const [trip, setTrip] = useState<Trip>(emptyTrip);
  const [transports, setTransports] = useState<Transport>(); 
  const [selectedTransports, setSelectedTransports] = useState<Transport[]>([]);

  const [tripDialog, setTripDialog] = useState(false);
  const [deleteTripDialog, setDeleteTripDialog] = useState(false);
  const [editTripDialog, setEditTripDialog] = useState(false);

  
  const [selectedTrips, setSelectedTrips] = useState(null);
  const [submitted, setSubmitted] = useState(false);


  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable<any>>(null);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
      global: { value: '', matchMode: FilterMatchMode.CONTAINS }
    });

  useEffect(() => {
    getTrips(toast, setTrips);
  }, []);

  useEffect(() => {
    getTransports(toast, setTransports);
  }, [tripDialog, editTripDialog]);

  //Abre o dialogo de novo usuario
  const openNew = () => {
    setTrip(emptyTrip);
    setSubmitted(false);
    setTripDialog(true);
  };

  //Abre o dialogo de editar usuario
  const openEdit = (trip: Trip) => {
    setTrip({ ...trip });
    setSubmitted(false);
    setEditTripDialog(true);
  };

  // esconde o diagolo 
  const hideDialog = () => {
    setSubmitted(false);
    setTripDialog(false);
  };

  // esconde o dialogo de editar usuario
  const hideEditTripDialog = () => {
    setSubmitted(false);
    setEditTripDialog(false);
  };

  // esconde o dialogo de deletar usuario
  const hideDeleteProductDialog = () => setDeleteTripDialog(false);

  const findIndexById = (id: number) => trips.findIndex((u) => u.id === id);
  
  

  // Salva a viagem
  const handleSaveTrip = () => {
    saveTrip(
      trip,
      trips,
      setTrips,
      setTripDialog,
      setTrip,
      emptyTrip,
      toast,
      setSubmitted,
      selectedTransports,
      findIndexById
    )
}

  // Edita a viagem
  const handleEditTrip = () => {
    editTrip(
      trip,
      trips,
      setTrips,
      setEditTripDialog,
      setTrip,
      emptyTrip,
      selectedTransports,
      toast
    )
}
  
  // Deleta a viagem
  const handleDeleteTrip = () => {
    deleteTrip(
      trip,
      setTrip,
      setTrips,
      setSelectedTrips,
      setDeleteTripDialog,
      toast,
      getTrips,
      emptyTrip,
      setLoading,
      trips
    )
  }
    


  // Confirma a exclusão do usuario
  const confirmDeleteProduct = (trip: Trip) => {
    setTrip(trip);
    setDeleteTripDialog(true);
  };

  

  const onInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | InputMaskChangeEvent,
    name: string
  ) => {
    const val = (e.target && e.target.value) || '';
    setTrip({ ...trip, [name]: val });
  };


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

  const actionBodyTemplate = (rowData: Trip) => (
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

  const leftToolbarTemplate = () => (
    <div className="my-2">
      <Button label="Nova Viagem" icon="pi pi-plus" severity="success" className="mr-2" onClick={openNew} />
    </div>
  );

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

  const tripDialogFooter = (
    <>
      <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
      <Button
        label="Salvar"
        icon="pi pi-check"
        text
        onClick={() => handleSaveTrip()}
      />
    </>
  );

  const editTripDialogFooter = (
    <>
      <Button label="Cancelar" icon="pi pi-times" text onClick={hideEditTripDialog} />
      <Button
        label="Salvar"
        icon="pi pi-check"
        text
        onClick={() => handleEditTrip()}
      />
    </>
  );

  const deleteTripDialogFooter = (
    <>
      <Button label="Não" icon="pi pi-times" text onClick={hideDeleteProductDialog} />
      <Button label="Sim" icon="pi pi-check" text onClick={() => handleDeleteTrip()} />
    </>
  );


  return (
    <div className="grid crud-demo">
      <div className="col-12">
        <div className="card">
          
          {/* Pop up de notificação */}
          <Toast ref={toast} />
          <Toolbar className="mb-4" left={leftToolbarTemplate}  />
          
          {/* Tabela de viagens */}
          <TripTable 
            dt={dt}
            trips={trips}
            selectedTrips={selectedTrips}
            setSelectedTrips={setSelectedTrips}
            loading={loading}
            header={header}
            filters={filters}
            destinationBodyTemplate={destinationBodyTemplate}
            clientBodyTemplate={clientBodyTemplate}
            startDateBodyTemplate={startDateBodyTemplate}
            statusBodyTemplate={statusBodyTemplate}
            actionBodyTemplate={actionBodyTemplate}
          /> 

          {/* Dialogo de nova Viagem */}
          <TripDialog 
            visible={tripDialog}
            header="Nova Viagem"
            trip={trip}
            setTrip={setTrip}
            transports={transports}
            selectedTransports={selectedTransports}
            setSelectedTransports={setSelectedTransports}
            submitted={submitted}
            onInputChange={onInputChange}
            onHide={hideDialog}
            footer={tripDialogFooter}
          
          /> 

          {/* Dialogo de editar Viagem */}
          <TripDialog 
            visible={editTripDialog}
            header="Editar Viagem"
            trip={trip}
            setTrip={setTrip}
            transports={transports}
            selectedTransports={selectedTransports}
            setSelectedTransports={setSelectedTransports}
            submitted={submitted}
            onInputChange={onInputChange}
            onHide={hideEditTripDialog}
            footer={editTripDialogFooter}
        
          /> 

          <TripDialogDelete 
            deleteTripDialog={deleteTripDialog}
            hideDeleteProductDialog={hideDeleteProductDialog}
            deleteTripDialogFooter={deleteTripDialogFooter}
            trip={trip}
          /> 


          
        </div>
      </div>
    </div>
  );
};

export default TripsPage;
