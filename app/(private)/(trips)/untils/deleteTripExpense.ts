
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

    // Atualiza lista local
    setDeleteTripExpenseDialog(false);
    await getTrips(toast, setTrips);
    const updatedTrip = trips.find((t: any) => t.id === tripExpense.trip_id);
    if (updatedTrip) {
      setTripExpenses([...updatedTrip.trip_expenses]);
    } else {
      setTripExpenses([]);
    }
    setTripExpense(emptyTrip);
    setLoading(false);

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