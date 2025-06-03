

export const saveExpense = async (
  expense: any,
  setExpenseDialog: any,
  setExpense: any,
  setExpenses: any,
  expenses: any,
  toast: any,
  setSubmitted: any,
  emptyExpense: any,
  findIndexById: any
) => {
    setSubmitted(true);

  if (expense.name.trim()) {
    let _expenses = [...expenses];
    let _expense = { ...expense };

    if (expense.id) {
      const index = findIndexById(expense.id);
      _expenses[index] = _expense;
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Despesa Atualizada',
        life: 3000,
      });
      setExpenses(_expenses);
    } else {
      try {
        const res = await fetch('/api/expenses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            name: expense.name,

          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Erro ao criar Despesa');
        }

        const createdExpense = await res.json();
        _expense.id = createdExpense.id; // assumindo que o back retorna o ID
        _expenses.push(_expense);

        toast.current?.show({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Despesa Criada',
          life: 3000,
        });

        setExpenses(_expenses);
      } catch (err: any) {
        console.error('Erro ao criar despesa:', err);
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: err.message || 'Erro ao criar despesa',
          life: 3000,
        });
        return;
      }
    }

    setExpenseDialog(false);
    setExpense(emptyExpense);
  }
  };