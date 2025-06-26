
export const reactiveTrasnport = async (
  transport: any,
  setDialog: any,
  setTransport: any,
  setTransports: any,
  transports: any,
  toast: any,
  emptyTransport: any
) => {
    if (!transport.id) return;
  
    try {
      const res = await fetch(`/api/transport/${transport.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: 1 // Reativa a despesa
        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: data.error || 'Erro ao ativar a Transporte.',
          life: 3000,
        });
        return;
      }
  
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Transporte ativada com sucesso.',
        life: 3000,
      });
  
      // Atualiza lista local
      const updatedExpenses = transports.map((u: any) => (u.id === transport.id ? data : u));
      setTransports(updatedExpenses);
      setDialog(false);
      setTransport(emptyTransport);
  
    } catch (err) {
      console.error('Erro ao ativar Transporte:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro inesperado ao ativar Transporte.',
        life: 3000,
      });
    }
  };