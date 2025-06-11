export const getReportFinancial = async (rowdata: any) => {
  try {
    const res = await fetch(`/api/trips/${rowdata.id}/report`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!res.ok) {
      const error = await res.json(); // Aqui ainda pode pegar o JSON se for erro
      console.error('Erro ao baixar arquivo:', error.error);
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `viagem-${rowdata.id}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.error('Erro inesperado:', err);
  }
};