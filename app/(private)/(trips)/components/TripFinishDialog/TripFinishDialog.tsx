import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog"


export const TripFinishDialog = ({
  tripFinishDialog,
  setTripFinishDialog,
  handleFinishTrip,
}: any
) => {

  const tripFinishFooter = (
    <>
      <Button label="Não" icon="pi pi-times" text onClick={() => setTripFinishDialog(false)} />
      <Button label="Sim Finalizar!" icon="pi pi-check" text onClick={() => handleFinishTrip()} />
    </>
  );

  return (

    <Dialog visible={tripFinishDialog} style={{ width: '450px' }} header="Confirmar" modal footer={tripFinishFooter} onHide={() => setTripFinishDialog(false)}>
      <div className="confirmation-content">
        <i className="pi pi-exclamation-triangle mr-3" />
        {<span>Tem certeza que deseja Finalizar a Viagem? Após essa ação, não serão permitidas alterações!</span>}
      </div>
    </Dialog>
  )
}