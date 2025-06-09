import { formatDateToISO } from "../../untils/formatDateToISO";
import { Trip, TripExpense } from "../trips.types";


export const saveExpense = async (
  tripExpense: TripExpense,
  tripExpenses: TripExpense[],
  trip: Trip,
  setExpensesDialog: (visible: boolean) => void,
  setTripExpense: (tripExpense: TripExpense) => void,
  setTripExpenses: (tripExpenses: TripExpense[]) => void,
  emptyExpense: TripExpense,
  toast: any,
  setSubmitted: (submitted: boolean) => void,

) => {

  setSubmitted(true);
  const findIndexById = (id: number) => tripExpenses.findIndex((u) => u.id === id);

  if (tripExpense.value && tripExpense.taxDocument.trim() && tripExpense.date) {
    let _trips = [...tripExpenses];
    let _trip = { ...tripExpense };

    if (tripExpense.id) {
      const index = findIndexById(tripExpense.id);
      _trips[index] = _trip;
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Despesa Atualizada',
        life: 3000,
      });
      setTripExpenses(_trips);
    } else {
      try {

        const res = await fetch('/api/tripExpenses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            typePayment: tripExpense.typePayment,
            value: tripExpense.value,
            date: formatDateToISO(tripExpense.date),
            taxDocument: tripExpense.taxDocument,
            observation: tripExpense.observation,
            proof: tripExpense.proof,
            expensesId: tripExpense.expenses.id,
            tripId: trip.id, // assumindo que a despesa está vinculada à viagem
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Erro ao criar Despesa');
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

        setTripExpenses(_trips);
      } catch (err: any) {
        console.error('Erro ao criar Despesa:', err);
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: err.message || 'Erro ao criar Despesa',
          life: 6000,
        });
        return;
      }
    }

    setExpensesDialog(false);
    setTripExpense(emptyExpense);
  }
};