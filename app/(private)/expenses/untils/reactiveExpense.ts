
export const reactiveExpense = async (
  expense: any,
  setDialog: any,
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
          status: 1 // Reativa a despesa
        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: data.error || 'Erro ao ativar a Despesa.',
          life: 3000,
        });
        return;
      }
  
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Despesa ativada com sucesso.',
        life: 3000,
      });
  
      // Atualiza lista local
      const updatedExpenses = expenses.map((u: any) => (u.id === expense.id ? data : u));
      setExpenses(updatedExpenses);
      setExpense(data);
      setDialog(false);
      setExpense(emptyExpense);
  
    } catch (err) {
      console.error('Erro ao ativar Despesa:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro inesperado ao ativar Despesa.',
        life: 3000,
      });
    }
  };