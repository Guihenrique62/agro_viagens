import { Dialog } from "primereact/dialog"
import { InputText } from "primereact/inputtext"
import { classNames } from "primereact/utils"

export const ExpenseDialogEdit = ({
  editExpenseDialog,
  expense,
  hideEditUserDialog,
  onInputChange,
  submitted,
  editExpenseDialogFooter
}: any) => {

  return (
    <Dialog visible={editExpenseDialog} style={{ width: '450px' }} header="Editar Despesa" modal className="p-fluid" footer={editExpenseDialogFooter} onHide={hideEditUserDialog}>
      <div className="field">
          <label htmlFor="name">Nome</label>
          <InputText
            id="name"
            value={expense.name}
            onChange={(e) => onInputChange(e, 'name')}
            required
            autoFocus
            className={classNames({ 'p-invalid': submitted && !expense.name })}
          />
          {submitted && !expense.name && <small className="p-invalid">O nome é obrigatório</small>}
        </div>
        
    </Dialog>
)
}