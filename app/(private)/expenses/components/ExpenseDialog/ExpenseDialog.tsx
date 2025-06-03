import { Dialog } from "primereact/dialog"
import { InputText } from "primereact/inputtext"
import { classNames } from "primereact/utils"

export const ExpenseDialog = ({
  expenseDialog,
  expense,
  hideDialog,
  onInputChange,
  submitted,
  expenseDialogFooter
}:any) => {

  return (
    <Dialog visible={expenseDialog} style={{ width: '450px' }} header="Novo tipo de Despesa" modal className="p-fluid" footer={expenseDialogFooter} onHide={hideDialog}>
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