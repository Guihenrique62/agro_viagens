
export const deleteTrip = async (
  trip: any,
  setTrip: any,
  setTrips: any,
  setSelectedTrips: any,
  setDeleteTripDialog: any,
  toast: any,
  getTrips: any,
  emptyTrip: any,
  setLoading: any,
  trips: any
) => {
    if (!trip.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/trips/${trip.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: data.error || 'Erro ao Excluir o Viagem.',
          life: 3000,
        });
        return;
      }
  
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Viagem excluido com sucesso.',
        life: 3000,
      });
  
      // Atualiza lista local
      const updatedTrips = trips.map((u:any) => (u.id === trip.id ? data : u));
      setTrips(updatedTrips);
      setTrip(data);
      setSelectedTrips(null);
      setDeleteTripDialog(false);
      getTrips(toast, setTrips);
      setTrip(emptyTrip);
      setLoading(false)
  
    } catch (err) {
      console.error('Erro ao excluir Viagem:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro inesperado ao excluir Viagem.',
        life: 3000,
      });
    }
  };