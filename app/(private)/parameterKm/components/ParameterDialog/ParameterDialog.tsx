import { Dialog } from "primereact/dialog"
import { InputMask, InputMaskChangeEvent } from "primereact/inputmask"
import { InputNumber } from "primereact/inputnumber"
import { classNames } from "primereact/utils";


const ParameterDialog = ({
  parameterDialog,
  footer,
  hideDialog,
  parameter,
  setParameter,
  submitted,
  header
}: any) => {

  const onInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | InputMaskChangeEvent,
    name: string
  ) => {
    const val = (e.target && e.target.value) || '';
    setParameter({ ...parameter, [name]: val });
  };
    

  return (
    <Dialog visible={parameterDialog} style={{ width: '450px' }} header={header} modal className="p-fluid" footer={footer} onHide={hideDialog}>
      <div className="field">
        <label htmlFor="startDate">Data inicio</label>

        <InputMask
          value={parameter.startDate}
          onChange={(e) => onInputChange(e, 'startDate')}
          mask="99/99/9999" placeholder="dd/mm/yyyy"
          slotChar="dd/mm/yyyy"
          className={classNames({ 'p-invalid': submitted && !parameter.startDate })}
        />

        {submitted && !parameter.startDate && <small className="p-invalid">A data inicio é  obrigatório</small>}
      </div>

      <div className="field">
        <label htmlFor="endDate">Data Fim</label>
        <InputMask
          value={parameter.endDate}
          onChange={(e) => onInputChange(e, 'endDate')}
          mask="99/99/9999" placeholder="dd/mm/yyyy"
          slotChar="dd/mm/yyyy"
          className={classNames({ 'p-invalid': submitted && !parameter.endDate })}
        />
        {submitted && !parameter.endDate && <small className="p-invalid">A data fim é obrigatório</small>}
      </div>

      <div className="field">
        <label htmlFor="value">Valor do KM</label>
        <InputNumber
          id='value'
          value={parameter.value}
          onChange={(e) => setParameter({ ...parameter, value: e.value ?? 0 })}
          required
          autoFocus
          minFractionDigits={2} maxFractionDigits={2}
          className={classNames({ 'p-invalid': submitted && !parameter.value })}
        />

        {submitted && !parameter.value && <small className="p-invalid">O valor do KM é obrigatório</small>}
      </div>

    </Dialog>
  )
}

export default ParameterDialog