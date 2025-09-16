import { formatDateToISO } from "../../untils/formatDateToISO";
import { Trip, TripExpense } from "../trips.types";

export const updateExpense = async (
  tripExpense: TripExpense,
  tripExpenses: TripExpense[],
  trip: Trip,
  setEditExpensesDialog: (visible: boolean) => void,
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
    // Removemos a validação do comprovante para edição, pois não é editável
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
    const res = await fetch(`/api/tripExpenses/${tripExpense.id}`, {
      method: 'PATCH',
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
        // Não enviamos o proof pois não é editável
        expensesId: tripExpense.expenses.id,
        tripId: trip.id,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Erro ao atualizar Despesa');
    }

    // Atualiza a lista de despesas com a despesa editada
    const updatedExpenses = tripExpenses.map(exp => 
      exp.id === tripExpense.id ? tripExpense : exp
    );

    setTripExpenses(updatedExpenses);

    toast.current?.show({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Despesa Atualizada',
      life: 3000,
    });

    setEditExpensesDialog(false);
    setTripExpense(emptyExpense);

  } catch (err: any) {
    console.error('Erro ao atualizar Despesa:', err);
    toast.current?.show({
      severity: 'error',
      summary: 'Erro',
      detail: err.message || 'Erro ao atualizar Despesa',
      life: 6000,
    });
  }
};