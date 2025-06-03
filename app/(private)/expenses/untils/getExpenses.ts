

export const getExpenses = async (toast: any, setExpenses:any) => {
    try {

      const res = await fetch('/api/expenses', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Erro ao buscar as Despesas:', data.error);
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao buscar as Despesas.',
          life: 3000,
        });
        return;
      }

      setExpenses(data);
    } catch (err) {
      console.error('Erro inesperado:', err);
    }
  };