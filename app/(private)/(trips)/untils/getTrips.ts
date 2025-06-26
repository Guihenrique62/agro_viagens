import { Trip } from "../trips.types";

export const getTrips = async (toast: any, setTrips: any) => {
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

    // Filtra os transports com status diferente de 2
    const filteredTrips = data.map((trip: Trip) => ({
      ...trip,
      transports: trip.transports.filter(transport => transport.status !== 2)
    }));

    setTrips(filteredTrips);
    return filteredTrips;
  } catch (err) {
    console.error('Erro inesperado:', err);
  }
};