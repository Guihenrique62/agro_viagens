
export const editExpense = async (
  expense: any,
  setEditExpenseDialog: any,
  setExpense: any,
  setExpenses: any,
  expenses: any,
  toast: any,
  emptyExpense: any
) => {
    if (!expense.id) return;
  
    try {
      const res = await fetch(`/api/expenses/${expense.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: expense.name,
        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: data.error || 'Erro ao editar a Despesa.',
          life: 3000,
        });
        return;
      }
  
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Despesa atualizada com sucesso.',
        life: 3000,
      });
  
      // Atualiza lista local
      const updatedExpenses = expenses.map((u: any) => (u.id === expense.id ? data : u));
      setExpenses(updatedExpenses);
      setExpense(data);
      setEditExpenseDialog(false);
      setExpense(emptyExpense);
  
    } catch (err) {
      console.error('Erro ao editar Despesa:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro inesperado ao editar Despesa.',
        life: 3000,
      });
    }
  };