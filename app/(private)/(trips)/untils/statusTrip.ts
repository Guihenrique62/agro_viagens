import { Trip } from "../trips.types";
import nodemailer from 'nodemailer'
import { getTrips } from "./getTrips";


export const statusTrip = async (
  trip: Trip,
  setTrips: any,
  setTrip: any,
  setDialog: any,
  emptyTrip: any,
  toast: any,
  setLoading: any,
  status: string
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

          status: status,

        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: data.error || 'Erro ao editar status da Viagem.',
          life: 3000,
        });
        return;
      }

      if (status === 'Finalizada') {

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
      }
  
  
    } catch (err) {
      console.error('Erro ao mudar o Status da Viagem:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro inesperado ao mudar o Status da Viagem.',
        life: 6000,
      });
    }

    setDialog(false);
    setTrip(emptyTrip);
    await getTrips(toast, setTrips);
    setLoading(false)
  };