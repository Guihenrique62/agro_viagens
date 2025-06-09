import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog"


export const TripExpenseDeleteDialog = ({
  deleteTripExpenseDialog,
  setDeleteTripExpenseDialog,
  handleDeleteExpense,
}: any
) => {

  const deleteExpenseDialogFooter = (
    <>
      <Button label="Não" icon="pi pi-times" text onClick={() => setDeleteTripExpenseDialog(false)} />
      <Button label="Sim" icon="pi pi-check" text onClick={() => handleDeleteExpense()} />
    </>
  );

  return (

    <Dialog visible={deleteTripExpenseDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteExpenseDialogFooter} onHide={() => setDeleteTripExpenseDialog(false)}>
      <div className="confirmation-content">
        <i className="pi pi-exclamation-triangle mr-3" />
        {<span>Tem certeza que deseja excluir a Despesa?</span>}
      </div>
    </Dialog>
  )
}