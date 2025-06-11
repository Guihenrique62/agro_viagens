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

      // Formatar datas no padrão dd/mm/yyyy
      const formatted = data.map((param : Parameter) => ({
        ...param,
        startDate: new Date(param.startDate).toLocaleDateString('pt-BR'),
        endDate: new Date(param.endDate).toLocaleDateString('pt-BR'),
      }));

      setParameters(formatted);
    } catch (err) {
      console.error('Erro inesperado:', err);
    }
  };