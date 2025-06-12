import { Trip } from "../trips.types";
import nodemailer from 'nodemailer'
import { getTrips } from "./getTrips";


export const finishTrip = async (
  trip: Trip,
  setTrips: any,
  setTrip: any,
  setTripFinishDialog: any,
  emptyTrip: any,
  toast: any,
  setLoading: any
) => {
  if (!trip.id) return;

    try {
      setLoading(true)

      const res = await fetch(`/api/trips/${trip.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({

          status: 'Finalizada', // Finalizada

        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: data.error || 'Erro ao finalizar a Viagem.',
          life: 3000,
        });
        return;
      }

      const resEmail = await fetch(`/api/sendFinishEmail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userName: trip.user.name
        })
      });

       if (!resEmail.ok) {
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: data.error || 'Erro ao enviar e-mail de finalização para o ADM',
          life: 3000,
        });
        return;
      }
  
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Viagem Finalizada com sucesso.',
        life: 3000,
      });
  
  
    } catch (err) {
      console.error('Erro ao Finalizar Viagem:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro inesperado ao finalizar Viagem.',
        life: 6000,
      });
    }

    setTripFinishDialog(false);
    setTrip(emptyTrip);
    await getTrips(toast, setTrips);
    setLoading(false)
  };