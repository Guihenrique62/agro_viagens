import { formatDateToBR, formatDateToISO } from "../../untils/formatDateToISO";
import { Trip } from "../trips.types";
import { getTrips } from "./getTrips";


export const editTrip = async (
  trip: Trip,
  trips: Trip[],
  setTrips: any,
  setTrip: any,
  setEditTripDialog: any,
  emptyTrip: any,
  selectedTransports: any,
  toast: any,
  setSubmitted: any,
  setloading: any
) => {
  if (!trip.id) return;

    try {
      setloading(true)

        // if ( trip.startKM > trip.endKM) {
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

      // Buscar o parâmetro correspondente à startDate
      const paramRes = await fetch('/api/parameterKm/currentParameter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          date: trip.startDate
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
          startDate: formatDateToISO(trip.startDate),
          endDate: formatDateToISO(trip.endDate),
          status: 'EmAndamento', 
          parameters_kmId: parameterId,
          transportIds: selectedTransports,
          startKM: trip.startKM,
          endKM: trip.endKM
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
  
    } catch (err) {
      console.error('Erro ao editar Viagem:', err);
      if (err instanceof Error && err.message.includes('administrativo')) {
        toast.current?.show({
          severity: 'warning',
          summary: 'Alerta',
          detail: err.message,
          life: 6000,
        });
      }else {
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: (err instanceof Error ? err.message : 'Erro inesperado ao editar a Viagem.'),
          life: 6000,
        });
      }
  }

    setEditTripDialog(false);
    setTrip(emptyTrip);
    await getTrips(toast, setTrips);
    setloading(false)
  };