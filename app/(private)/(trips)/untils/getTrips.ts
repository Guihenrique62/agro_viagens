

export const getTrips = async (toast: any, setTrips:any) => {
    try {

      const res = await fetch('/api/trips', {
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

      setTrips(data);
      return(data)
    } catch (err) {
      console.error('Erro inesperado:', err);
    }
  };