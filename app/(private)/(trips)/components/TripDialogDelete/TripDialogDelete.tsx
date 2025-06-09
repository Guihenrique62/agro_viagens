import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog"


export const TripDialogDelete = ({
  deleteTripDialog,
  trip,
  handleDeleteTrip,
  setDeleteTripDialog
}: any
) => {

  const deleteTripDialogFooter = (
    <>
      <Button label="Não" icon="pi pi-times" text onClick={() => setDeleteTripDialog(false)} />
      <Button label="Sim" icon="pi pi-check" text onClick={() => handleDeleteTrip()} />
    </>
  );

  return (

    <Dialog visible={deleteTripDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteTripDialogFooter} onHide={() => setDeleteTripDialog(false)}>
      <div className="confirmation-content">
        <i className="pi pi-exclamation-triangle mr-3" />
        {trip && <span>Tem certeza que deseja excluir a Viagem?</span>}
      </div>
    </Dialog>
  )
}