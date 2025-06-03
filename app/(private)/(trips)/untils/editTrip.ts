import { formatDateToBR, formatDateToISO } from "../../untils/formatDateToISO";
import { Trip } from "../trips.types";


export const editTrip = async (
  trip: Trip,
  trips: Trip[],
  setTrips: any,
  setTrip: any,
  setEditTripDialog: any,
  emptyTrip: any,
  selectedTransports: any,
  toast: any,
  setSubmitted: any
) => {
  if (!trip.id) return;

    try {
      // Buscar o parâmetro correspondente à startDate
      const paramRes = await fetch('/api/parameterKm/currentParameter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          date: formatDateToBR(trip.startDate),
        }),
      });

      if (!paramRes.ok) {
        const errData = await paramRes.json();
        throw new Error(errData.message || 'Não foi possível obter o parâmetro KM.');
      }

      const parameter = await paramRes.json();
      const parameterId = parameter.id;

      const res = await fetch(`/api/trips/${trip.id}`, {
        method: 'PATCH',
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
          startDate: trip.startDate,
          endDate: trip.endDate,
          status: 'EmAndamento', // ou outro valor padrão
          parameters_kmId: parameterId,
          transportIds: selectedTransports 
        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: data.error || 'Erro ao editar a Viagem.',
          life: 3000,
        });
        return;
      }
  
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Viagem atualizado com sucesso.',
        life: 3000,
      });
  
      // Atualiza lista local
      const updatedTrips = trips.map((u) => (u.id === trip.id ? data : u));
      setTrips(updatedTrips);
      setTrip(data);
      setEditTripDialog(false);
      setTrip(emptyTrip);
  
    } catch (err) {
      console.error('Erro ao editar Viagem:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro inesperado ao editar Viagem.',
        life: 6000,
      });
    }
  };