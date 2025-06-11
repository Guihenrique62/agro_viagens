

export const deleteParameter = async (
  parameter: any,
  parameters: any,
  setLoading: any,
  setParameters: any,
  setParameter: any,
  setDeleteParameterDialog: any,
  getParameters: any,
  toast: any,
  emptyParameter: any
) => {
    if (!parameter.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/parameterKm/${parameter.id}`, {
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
          detail: data.error || 'Erro ao Excluir a Paramêtro.',
          life: 3000,
        });
        return;
      }
  
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Paramêtro excluida com sucesso.',
        life: 3000,
      });
  
      // Atualiza lista local
      const updatedParameters = parameters.map((u: any) => (u.id === parameter.id ? data : u));
      setParameters(updatedParameters);
      setParameter(data);
      setDeleteParameterDialog(false);
      getParameters(toast, setParameters)
      setParameter(emptyParameter);
      setLoading(false)
  
    } catch (err) {
      console.error('Erro ao excluir Paramêtro:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro inesperado ao excluir Paramêtro.',
        life: 3000,
      });
    }
  };