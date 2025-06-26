import { formatDateToISO } from "../../untils/formatDateToISO";
import { Trip } from "../trips.types";
import { getTrips } from "./getTrips";

export const saveTrip = async (
  trip: Trip,
  trips: Trip[],
  setTrips: (trips: Trip[]) => void,
  setTripDialog: (visible: boolean) => void,
  setTrip: (trip: Trip) => void,
  emptyTrip: Trip,
  toast: any,
  setSubmitted: (submitted: boolean) => void,
  selectedTransports: any,
  setLoading: any
) => {
  const findIndexById = (id: number) => trips.findIndex((u) => u.id === id);
  setSubmitted(true);

  const requiredFields = [
    { id: 'client', label: 'Cliente - Razão Social e CNPJ', value: trip.client?.trim() },
    { id: 'destination', label: 'Destino', value: trip.destination?.trim() },
    { id: 'reason', label: 'Motivo', value: trip.reason?.trim() },
    { id: 'type', label: 'Tipo da Viagem', value: trip.type?.trim() },
    { id: 'startDate', label: 'Data Início', value: trip.startDate },
    { id: 'endDate', label: 'Data Fim', value: trip.endDate },
    { id: 'transports', label: 'Transportes', value: selectedTransports?.length > 0 },
  ];

  const invalidField = requiredFields.find(field => !field.value);

  if (invalidField) {
    const el = document.getElementById(invalidField.id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus?.();
    }

    toast.current?.show({
      severity: 'error',
      summary: 'Preencha todos os campos obrigatórios',
      detail: `O campo "${invalidField.label}" precisa ser preenchido.`,
      life: 4000,
    });

    return;
  }

  if (trip.startDate > trip.endDate) {
    const el = document.getElementById('startDate');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus?.();
    }

    toast.current?.show({
      severity: 'error',
      summary: 'Erro de Validação',
      detail: 'Data de início deve ser menor do que a data final.',
      life: 4000,
    });

    return;
  }

  // // Validação de KM
  // if (trip.startKM > trip.endKM) {
  //   const el = document.getElementById('startKM');
  //   if (el) {
  //     el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  //     el.focus?.();
  //   }

  //   toast.current?.show({
  //     severity: 'error',
  //     summary: 'Erro de Validação',
  //     detail: 'KM inicial deve ser menor do que o KM final.',
  //     life: 4000,
  //   });

  //   return;
  // }

  let _trips = [...trips];
  let _trip = { ...trip };

  if (trip.id) {
    const index = findIndexById(trip.id);
    _trips[index] = _trip;
    toast.current?.show({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Viagem atualizada',
      life: 3000,
    });
    setTrips(_trips);
  } else {
    try {
      setLoading(true);

      const paramRes = await fetch('/api/parameterKm/currentParameter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ date: trip.startDate }),
      });

      if (!paramRes.ok) {
        const errData = await paramRes.json();
        throw new Error(errData.message || 'Não foi possível obter o parâmetro KM.');
      }

      const parameter = await paramRes.json();
      const parameterId = parameter.id;

      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          destination: trip.destination,
          client: trip.client,
          reason: trip.reason,
          escort: trip.escort,
          type: trip.type,
          advance_value: trip.advance_value,
          startDate: formatDateToISO(trip.startDate),
          endDate: formatDateToISO(trip.endDate),
          status: 'EmAndamento',
          parameters_kmId: parameterId,
          transportIds: selectedTransports,
          startKM: trip.startKM,
          endKM: trip.endKM
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Erro ao criar Viagem');
      }

      const createdTrip = await res.json();
      _trip.id = createdTrip.id;
      _trips.push(_trip);

      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Viagem criada com sucesso!',
        life: 3000,
      });

      setTrips(_trips);
    } catch (err: any) {
      console.error('Erro ao criar Viagem:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: err.message || 'Erro ao criar Viagem',
        life: 6000,
      });
      return;
    }
  }

  setTripDialog(false);
  setTrip(emptyTrip);
  await getTrips(toast, setTrips);
  setLoading(false);
};