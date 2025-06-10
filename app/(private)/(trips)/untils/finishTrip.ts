import { Trip } from "../trips.types";


export const finishTrip = async (
  trip: Trip,
  trips: Trip[],
  setTrips: any,
  setTrip: any,
  setTripFinishDialog: any,
  emptyTrip: any,
  toast: any,
) => {
  console.log(trip)
  if (!trip.id) return;

    try {

      const res = await fetch(`/api/trips/${trip.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          
          status: 'Finalizada', // Finalizada

        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: data.error || 'Erro ao finalizar a Viagem.',
          life: 3000,
        });
        return;
      }
  
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Viagem Finalizada com sucesso.',
        life: 3000,
      });
  
      // Atualiza lista local
      const updatedTrips = trips.map((u) => (u.id === trip.id ? data : u));
      setTrips(updatedTrips);
      setTrip(data);
      setTripFinishDialog(false);
      setTrip(emptyTrip);
  
    } catch (err) {
      console.error('Erro ao Finalizar Viagem:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro inesperado ao editar Viagem.',
        life: 6000,
      });
    }
  };