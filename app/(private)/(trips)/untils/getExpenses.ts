import { set } from "zod";


export const getExpenses = async (toast: any, setTypeExpenseOptions: any) => {
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
        console.error('Erro ao buscar as viagens:', data.error);
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao buscar as viagens.',
          life: 3000,
        });
        return;
      }
      
      setTypeExpenseOptions(data.filter((exp: any) => exp.status === 1));
    } catch (err) {
      console.error('Erro inesperado:', err);
    }
  };