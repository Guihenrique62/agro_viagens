
 function formatDateToISO(dateStr: string): string {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month}-${day}`; // yyyy-MM-dd
    }


export const editParameter = async (
  parameter: any,
  parameters: any,
  setEditParameterDialog: any,
  setParameter: any,
  setParameters: any,
  toast: any,
  emptyParameter: any



) => {
    if (!parameter.id) return;
  
    try {
      const res = await fetch(`/api/parameterKm/${parameter.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          startDate: formatDateToISO(parameter.startDate),
          endDate: formatDateToISO(parameter.endDate),
          value: parameter.value,
        }),
      });
  
      const data = await res.json();

      if (!res.ok) {
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: data.message || 'Erro ao editar o Paramêtro.',
          life: 3000,
        });
        return;
      }
  
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Paramêtro atualizada com sucesso.',
        life: 3000,
      });
  
      // Atualiza lista local
      const updatedParameters = parameters.map((u: any) => (u.id === parameter.id ? data : u));

      // Formatar datas no padrão dd/mm/yyyy
      const formattedData = {
        ...data,
        startDate: new Date(data.startDate).toLocaleDateString('pt-BR'),
        endDate: new Date(data.endDate).toLocaleDateString('pt-BR'),
      };

      setParameters(updatedParameters.map((u: any) =>
        u.id === formattedData.id ? formattedData : u
      ));

      setEditParameterDialog(false);
      setParameter(emptyParameter);
  
    } catch (err) {
      console.error('Erro ao editar Paramêtro:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro inesperado ao editar Paramêtro.',
        life: 3000,
      });
    }
  };