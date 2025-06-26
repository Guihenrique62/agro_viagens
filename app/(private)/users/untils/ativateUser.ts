
export const ativateUser = async (
  user: any,
  setDialog: any,
  setUser: any,
  setUsers: any,
  users: any,
  toast: any,
  emptyUser: any
) => {
    if (!user.id) return;
  
    try {
      const res = await fetch(`/api/users/${user.id}`, {
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
          detail: data.error || 'Erro ao ativar a Usuario.',
          life: 3000,
        });
        return;
      }
  
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Usuario ativada com sucesso.',
        life: 3000,
      });
  
      // Atualiza lista local
      const updatedUsers = users.map((u: any) => (u.id === user.id ? data : u));
      setUsers(updatedUsers);
      setDialog(false);
      setUser(emptyUser);
  
    } catch (err) {
      console.error('Erro ao ativar Usuario:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro inesperado ao ativar Usuario.',
        life: 3000,
      });
    }
  };