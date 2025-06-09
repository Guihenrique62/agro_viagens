import { formatDateToISO } from "../../untils/formatDateToISO";
import { Trip } from "../trips.types";

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
) => {

  const findIndexById = (id: number) => trips.findIndex((u) => u.id === id);

  setSubmitted(true);

  if (trip.destination.trim() && trip.client.trim() && trip.reason.trim() && trip.type.trim() && trip.startDate && trip.endDate) {
    let _trips = [...trips];
    let _trip = { ...trip };

    if (trip.id) {
      const index = findIndexById(trip.id);
      _trips[index] = _trip;
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Usuário Atualizado',
        life: 3000,
      });
      setTrips(_trips);
    } else {
      try {
        // Buscar o parâmetro correspondente à startDate
        const paramRes = await fetch('/api/parameterKm/currentParameter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            date: trip.startDate,
          }),
        });

        if (!paramRes.ok) {
          const errData = await paramRes.json();
          throw new Error(errData.message || 'Não foi possível obter o parâmetro KM.');
        }

        const parameter = await paramRes.json();
        const parameterId = parameter.id;

        const res = await fetch('/api/trips', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
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
            status: 'EmAndamento', // ou outro valor padrão
            parameters_kmId: parameterId,
            transportIds: selectedTransports,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Erro ao criar Viagem');
        }

        const createdTrip = await res.json();
        _trip.id = createdTrip.id; // assumindo que o back retorna o ID
        _trips.push(_trip);

        toast.current?.show({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Viagem Criada',
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
  }
};