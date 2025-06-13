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

  const requiredFields = [
    { id: 'expenses', label: 'Tipo de Despesa', value: tripExpense.expenses?.name.trim() },
    { id: 'date', label: 'Data', value: tripExpense.date },
    { id: 'value', label: 'Valor', value: tripExpense.value > 0 },
    { id: 'typePayment', label: 'Tipo de Pagamento', value: tripExpense.typePayment.trim() },
    { id: 'taxDocument', label: 'Documento', value: tripExpense.taxDocument.trim() },
    { id: 'observation', label: 'Observação', value: trip.endDate },
    { id: 'proof-upload', label: 'Comprovante', value: tripExpense.proof?.trim() },
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
        tripId: trip.id,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Erro ao criar Despesa');
    }

    const createdTrip = await res.json();
    const newExpense = { ...tripExpense, id: createdTrip.id };

    setTripExpenses([...tripExpenses, newExpense]);

    toast.current?.show({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Despesa Criada',
      life: 3000,
    });

    setExpensesDialog(false);
    setTripExpense(emptyExpense);

  } catch (err: any) {
    console.error('Erro ao criar Despesa:', err);
    toast.current?.show({
      severity: 'error',
      summary: 'Erro',
      detail: err.message || 'Erro ao criar Despesa',
      life: 6000,
    });
  }
};
