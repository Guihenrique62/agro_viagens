import { TripExpense } from "../trips.types";

export const deleteTripExpense = async (
  tripExpense: any,
  setTripExpense: any,
  setTripExpenses: any,
  toast: any,
  emptyTrip: any,
  setLoading: any,
  trips: any,
  setDeleteTripExpenseDialog: any,
  getTrips: any,
  setTrips: any
) => {
  if (!tripExpense.id) return;
  setLoading(true);
  try {
    const res = await fetch(`/api/tripExpenses/${tripExpense.id}`, {
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
        detail: data.error || 'Erro ao Excluir a Despesa.',
        life: 3000,
      });
      return;
    }

    toast.current?.show({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Despesa excluida com sucesso.',
      life: 3000,
    });

    setDeleteTripExpenseDialog(false)
      setTripExpenses((prev: TripExpense[]) =>
        prev.filter((expense) => expense.id !== tripExpense.id)
      );

      const updatedTrips = await getTrips(toast, setTrips);
      const currentTrip = updatedTrips.find((trip:any) => trip.id === tripExpense.tripId);

      if (currentTrip) {
        setTripExpenses([...currentTrip.trip_expenses]);
      }

      setLoading(false)
      

  } catch (err) {
    console.error('Erro ao excluir Despesa:', err);
    toast.current?.show({
      severity: 'error',
      summary: 'Erro',
      detail: 'Erro inesperado ao excluir Despesa.',
      life: 3000,
    });
  }
};