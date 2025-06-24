import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog"


export const TripReopenDialog = ({
  tripReopenDialog,
  setTripReopenDialog,
  handleReopenTrip,
}: any
) => {

  const tripFinishFooter = (
    <>
      <Button label="Não" icon="pi pi-times" text onClick={() => setTripReopenDialog(false)} />
      <Button label="Sim Reabrir!" icon="pi pi-check" text onClick={() => handleReopenTrip()} />
    </>
  );

  return (

    <Dialog visible={tripReopenDialog} style={{ width: '450px' }} header="Confirmar" modal footer={tripFinishFooter} onHide={() => setTripReopenDialog(false)}>
      <div className="confirmation-content">
        <i className="pi pi-exclamation-triangle mr-3" />
        {<span>Tem certeza que deseja Reabrir a Viagem?</span>}
      </div>
    </Dialog>
  )
}