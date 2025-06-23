import { Parameter } from "../parameter.types";



export const getParameters = async (
  toast: any,
  setParameters: any
) => {
    try {

      const res = await fetch('/api/parameterKm', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Erro ao buscar os parametros:', data.error);
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao buscar os Paramêtros .',
          life: 3000,
        });
        return;
      }

      setParameters(data);
    } catch (err) {
      console.error('Erro inesperado:', err);
    }
  };