import { getExpenses } from "./getExpenses";

export const deleteExpense = async (
  expense: any,
  setDeleteExpenseDialog: any,
  setExpense: any,
  setExpenses: any,
  expenses: any,
  toast: any,
  emptyExpense: any,
  setSelectedExpenses: any,
  setLoading: any
) => {
    if (!expense.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/expenses/${expense.id}`, {
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
      const updatedExpenses = expenses.map((u:any) => (u.id === expense.id ? data : u));
      setExpenses(updatedExpenses);
      setExpense(data);
      setSelectedExpenses(null);
      setDeleteExpenseDialog(false);
      getExpenses(toast, setExpenses);
      setExpense(emptyExpense);
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