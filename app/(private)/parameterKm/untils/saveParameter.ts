
 function formatDateToISO(dateStr: string): string {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month}-${day}`; // yyyy-MM-dd
    }



export const saveParameter = async (
  setSubmitted: any,
  parameter: any,
  parameters: any,
  setParameter: any,
  setParameters: any,
  setParameterDialog: any,
  toast: any,
  emptyParameter: any

) => {
    setSubmitted(true);

   
  const findIndexById = (id: number) => parameters.findIndex((u: any) => u.id === id);

  if (parameter.value && parameter.startDate && parameter.endDate) {
    let _parameters = [...parameters];
    let _parameter = { ...parameter };

    if (parameter.id) {
      const index = findIndexById(parameter.id);
      _parameters[index] = _parameter;
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Paramêtro Atualizado',
        life: 3000,
      });
      setParameters(_parameters);
    } else {
      try {
        const res = await fetch('/api/parameterKm', {
          method: 'POST',
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

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Erro ao criar Paramêtro');
        }

        const createdParameter = await res.json();
        _parameter.id = createdParameter.id; // assumindo que o back retorna o ID
        _parameters.push(_parameter);

        toast.current?.show({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Paramêtro Criado',
          life: 3000,
        });

        setParameters(_parameters);
      } catch (err: any) {
        console.error('Erro ao criar Paramêtro:', err);
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: err.message || 'Erro ao criar Paramêtro',
          life: 3000,
        });
        return;
      }
    }

    setParameterDialog(false);
    setParameter(emptyParameter);
  }
  };