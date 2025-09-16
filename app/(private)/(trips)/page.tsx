/* eslint-disable @next/next/no-img-element */
'use client';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { InputMask, InputMaskChangeEvent } from 'primereact/inputmask';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { useEffect, useRef, useState } from 'react';
import { Trip, TripExpense } from './trips.types';
import { Transport } from '../transport/transport.types';
import { TripTable } from './components/TripTable/TripTable';
import { TripDialog } from './components/TripDialog/TripDialog';
import { TripDialogDelete } from './components/TripDialogDelete/TripDialogDelete';
import { getTrips } from './untils/getTrips';
import { getTransports } from './untils/getTransports';
import { saveTrip } from './untils/saveTrip';
import { editTrip } from './untils/editTrip';
import { deleteTrip } from './untils/deleteTrip';
import { getExpenses } from './untils/getExpenses';
import { saveExpense } from './untils/saveExpense';
import TripExpenseDialog from './components/TripExpenseDialog/TripExpenseDialog';
import TripExpenseTable from './components/TripExpenseTable/TripExpenseTable';
import { deleteTripExpense } from './untils/deleteTripExpense';
import { TripExpenseDeleteDialog } from './components/TripExpenseDeleteDialog/TripExpenseDeleteDialog';
import { TripFinishDialog } from './components/TripFinishDialog/TripFinishDialog';
import { formatDateToBR, formatDateToPadrao } from '../untils/formatDateToISO';
import { statusTrip } from './untils/statusTrip';
import { TripReopenDialog } from './components/TripReopenDialog/TripReopenDialog';
import { updateExpense } from './untils/updateExpense';





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
    cpf_cnpj: '',
    transports: [],
    user: {
      id: '',
      name: '',
      email: ''
    },
    parameters_km: {
      id: '',
      value: 0,
      startDate: '',
      endDate: '',
    },
    trip_expenses: [],
    endKM: 0,
    startKM: 0
  };

  const emptyExpense: TripExpense = {
    id: 0,
    typePayment: '',
    value: 0,
    date: '',
    taxDocument: '',
    observation: '',
    createdAt: '',
    proof: '',
    tripId: 0,
    expenses: {
      id: 0,
      name: '',
      status: 0,
    },
  };

  const [trips, setTrips] = useState<Trip[]>([]);
  const [trip, setTrip] = useState<Trip>(emptyTrip);
  const [transports, setTransports] = useState<Transport>();
  const [selectedTransports, setSelectedTransports] = useState<Number[]>([]);

  const [tripDialog, setTripDialog] = useState(false);
  const [deleteTripDialog, setDeleteTripDialog] = useState(false);
  const [deleteTripExpenseDialog, setDeleteTripExpenseDialog] = useState(false);

  const [editTripDialog, setEditTripDialog] = useState(false);
  const [editTripExpenseDialog, setEditTripExpenseDialog] = useState(false);

  const [expensesDialog, setExpensesDialog] = useState(false);
  const [showingExpenses, setShowingExpenses] = useState(false);
  const [tripExpenses, setTripExpenses] = useState<TripExpense[]>([]);
  const [tripExpense, setTripExpense] = useState<TripExpense>(emptyExpense);
  const [typeExpenseOptions, setTypeExpenseOptions] = useState([])
  const [currentExpenseTrip, setCurrentExpenseTrip] = useState<Trip | null>(null);

  const [tripFinishDialog, setTripFinishDialog] = useState(false)
  const [tripReopenDialog, setTripReopenDialog] = useState(false);


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
    getExpenses(toast, setTypeExpenseOptions)
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
    setTrip({ 
      ...trip,
      startDate: formatDateToPadrao(trip.startDate),
      endDate: formatDateToPadrao(trip.endDate),
     });

    const transportIds = trip.transports?.map(t => t.id) || []
    setSelectedTransports(transportIds);
    setSubmitted(false);
    setEditTripDialog(true);
  };

  const openNewExpense = () => {
    setTripExpense(emptyExpense);
    setSubmitted(false);
    setExpensesDialog(true);
  }

  const openExpenses = (trip: Trip) => {
    setTripExpenses([...trip.trip_expenses])
    setCurrentExpenseTrip(trip);
    setSubmitted(false);
    setShowingExpenses(true);
  }


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

  // esconde o dialogo de despesas
  const hideTripExpenseDialog = () => {
    setSubmitted(false);
    setExpensesDialog(false);
    setEditTripExpenseDialog(false);
  }



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
      setLoading
    )
  }

  // Edita a viagem
  const handleEditTrip = () => {
    editTrip(
      trip,
      trips,
      setTrips,
      setTrip,
      setEditTripDialog,
      emptyTrip,
      selectedTransports,
      toast,
      setSubmitted,
      setLoading
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

  // Cria a despesa
  const handleSaveExpense = async () => {
    if (!currentExpenseTrip) return; // Garante que há uma trip selecionada
    await saveExpense(
      tripExpense,
      tripExpenses,
      currentExpenseTrip, // Passa a trip correta
      setExpensesDialog,
      setTripExpense,
      setTripExpenses,
      emptyExpense,
      toast,
      setSubmitted,
    )
    getTrips(toast, setTrips); // Atualiza a lista de viagens após salvar a despesa
  }

  const handleEditExpense = async () => {
    if (!currentExpenseTrip) return; // Garante que há uma trip selecionada
    await updateExpense(
      tripExpense,
      tripExpenses,
      currentExpenseTrip,
      setEditTripExpenseDialog,
      setTripExpense,
      setTripExpenses,
      emptyExpense,
      toast,
      setSubmitted,
    )
  }
  
  // Deleta a despesa
  const handleDeleteExpense = async () => {
    await deleteTripExpense(
      tripExpense,
      setTripExpense,
      setTripExpenses,
      toast,
      emptyExpense,
      setLoading,
      trips,
      setDeleteTripExpenseDialog,
      getTrips,
      setTrips
    )
  }

  const handleFinishTrip = () => {
    statusTrip(
      trip,
      setTrips,
      setTrip,
      setTripFinishDialog,
      emptyTrip,
      toast,
      setLoading,
      'Finalizada'
    )
  }
  const handleReopenTrip = () => {
    statusTrip(
      trip,
      setTrips,
      setTrip,
      setTripReopenDialog,
      emptyTrip,
      toast,
      setLoading,
      'EmAndamento'
    )
  }

  const leftToolbarTemplate = () => (
    <div className="my-2">
      <Button label="Nova Viagem" icon="pi pi-plus" severity="success" className="mr-2" onClick={openNew} />
    </div>
  );

  const leftToolbarTemplateExpense = () => (
    <div className="my-2">
      <Button label="Nova Despesa" icon="pi pi-plus" severity="info" className="mr-2" onClick={openNewExpense} />
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







  return (
    <div className="grid crud-demo">
      <div className="col-12">
        <div className="card">

          {/* Pop up de notificação */}
          <Toast ref={toast} />


          {/* Tabela de viagens */}
          {showingExpenses ? (
            <>
              <Toolbar className="mb-4" left={leftToolbarTemplateExpense} />
              <TripExpenseTable
                dt={dt}
                tripExpenses={tripExpenses}
                setShowingExpenses={setShowingExpenses}
                setTripExpense={setTripExpense}
                setDeleteTripExpenseDialog={setDeleteTripExpenseDialog}
                loading={loading}
                setEditTripExpenseDialog={setEditTripExpenseDialog}
              />
            </>
          ) : (
            <>
              <Toolbar className="mb-4" left={leftToolbarTemplate} />
              <TripTable
                dt={dt}
                trips={trips}
                selectedTrips={selectedTrips}
                setSelectedTrips={setSelectedTrips}
                loading={loading}
                setFilters={setFilters}
                filters={filters}
                setTrip={setTrip}
                setDeleteTripDialog={setDeleteTripDialog}
                openEdit={openEdit}
                openExpenses={openExpenses}
                setTripFinishDialog = {setTripFinishDialog}
                setTripReopenDialog = {setTripReopenDialog}
                
              />
            </>
          )}


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
            onHide={hideEditTripDialog}
            footer={editTripDialogFooter}

          />

          <TripDialogDelete
            deleteTripDialog={deleteTripDialog}
            setDeleteTripDialog={setDeleteTripDialog}
            handleDeleteTrip={handleDeleteTrip}
            trip={trip}
          />


          {/* Dialogo de despesas */}
          <TripExpenseDialog
            expensesDialog={expensesDialog}
            handleSaveExpense={handleSaveExpense}
            hideTripExpenseDialog={hideTripExpenseDialog}
            tripExpense={tripExpense}
            setTripExpense={setTripExpense}
            typeExpenseOptions={typeExpenseOptions}
            submitted={submitted}
            toast={toast}
          />

          <TripExpenseDialog
            expensesDialog={editTripExpenseDialog}
            handleSaveExpense={handleEditExpense}
            hideTripExpenseDialog={hideTripExpenseDialog}
            tripExpense={tripExpense}
            setTripExpense={setTripExpense}
            typeExpenseOptions={typeExpenseOptions}
            submitted={submitted}
            toast={toast}
            isEditing={true}
          />
          
          {/* Dialogo de exclusão de despesas */}
          <TripExpenseDeleteDialog
            deleteTripExpenseDialog={deleteTripExpenseDialog}
            setDeleteTripExpenseDialog={setDeleteTripExpenseDialog}
            handleDeleteExpense={handleDeleteExpense}
          />

          <TripFinishDialog 
            tripFinishDialog = {tripFinishDialog}
            setTripFinishDialog = {setTripFinishDialog}
            handleFinishTrip = {handleFinishTrip}
            trip = {trip}
          />

          <TripReopenDialog 
            tripReopenDialog={tripReopenDialog}
            setTripReopenDialog={setTripReopenDialog}
            handleReopenTrip={handleReopenTrip}
            trip={trip}
          />

        </div>
      </div>
    </div>
  );
};

export default TripsPage;
