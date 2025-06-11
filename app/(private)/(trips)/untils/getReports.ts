import { Trip } from "../trips.types";

export const getReportFinancial = async (rowdata: Trip) => {
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
    a.download = `Relatório Financeiro de Viagem - ${rowdata.user.name}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.error('Erro inesperado:', err);
  }
};


export const getReportClient = async (rowdata: any) => {
  try {
    const res = await fetch(`/api/trips/${rowdata.id}/reportClient`, {
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
    a.download = `Relatório Cliente de Viagem - ${rowdata.user.name}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.error('Erro inesperado:', err);
  }
};