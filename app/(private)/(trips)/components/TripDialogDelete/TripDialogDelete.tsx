import { Dialog } from "primereact/dialog"


export const TripDialogDelete = ({
  deleteTripDialog,
  hideDeleteProductDialog,
  deleteTripDialogFooter,
  trip
}: any
) => {

  return (
    
    <Dialog visible={deleteTripDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteTripDialogFooter} onHide={hideDeleteProductDialog}>
      <div className="confirmation-content">
        <i className="pi pi-exclamation-triangle mr-3" />
        {trip && <span>Tem certeza que deseja excluir a Viagem?</span>}
      </div>
    </Dialog>
  )
}