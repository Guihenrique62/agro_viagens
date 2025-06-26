

export const getTransports = async (toast: any, setTransports: any) => {
    try {
      const res = await fetch('/api/transport', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Erro ao buscar os transportes:', data.error);
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao buscar os transportes.',
          life: 3000,
        });
        return;
      }

      setTransports(data.filter((transport: any) => transport.status === 1));
    } catch (err) {
      console.error('Erro inesperado:', err);
    }
  }