import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { FileUpload } from "primereact/fileupload";
import { InputMask, InputMaskChangeEvent } from "primereact/inputmask";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { classNames } from "primereact/utils";
import { useRef, useState } from "react";
import { Trip, TripExpense } from "../../trips.types";

export default function TripExpenseDialog(
  {
    expensesDialog,
    handleSaveExpense,
    hideTripExpenseDialog,
    tripExpense,
    setTripExpense,
    typeExpenseOptions,
    submitted,
    toast,
  }: {
    expensesDialog: boolean;
    handleSaveExpense: () => void;
    hideTripExpenseDialog: () => void;
    tripExpense: TripExpense;
    setTripExpense: (tripExpense: TripExpense) => void;
    typeExpenseOptions: { id: number; name: string }[];
    submitted: boolean;
    toast: React.RefObject<any>;
  }

) {

  const fileUploadRef = useRef<FileUpload>(null);
  const [uploading, setUploading] = useState(false);


  const newExpenseDialogFooter = (
    <>
      <Button label="Cancelar" icon="pi pi-times" text onClick={hideTripExpenseDialog} />
      <Button
        label="Salvar"
        icon="pi pi-check"
        text
        disabled={uploading}
        onClick={() => handleSaveExpense()}
      />
    </>
  );

  const onInputChangeExpense = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | InputMaskChangeEvent,
    name: string
  ) => {
    const val = (e.target && e.target.value) || '';
    setTripExpense({ ...tripExpense, [name]: val });
  }

  return (
    <Dialog
      visible={expensesDialog}
      style={{ width: '50vw' }}
      header="Nova Despesa"
      modal
      className="p-fluid"
      onHide={hideTripExpenseDialog}
      footer={newExpenseDialogFooter}
    >
      <div className="field">
        <label htmlFor="expenses">Tipo de Despesa</label>
        <Dropdown
          value={tripExpense.expenses}
          onChange={(e) => setTripExpense({ ...tripExpense, expenses: e.value })}
          options={typeExpenseOptions}
          optionLabel="name" // ou "label", depende do formato dos dados
          placeholder="Selecione"
          className="w-full md:w-14rem"
        />
        {submitted && !tripExpense.expenses && <small className="p-invalid">Transporte é obrigatório</small>}
      </div>

      <div className="field">
        <label htmlFor="date">Data</label>

        <InputMask
          value={tripExpense.date}
          onChange={(e) => onInputChangeExpense(e, 'date')}
          mask="99/99/9999" placeholder="dd/mm/yyyy"
          slotChar="dd/mm/yyyy"
          className={classNames({ 'p-invalid': submitted && !tripExpense.date })}
        />

        {submitted && !tripExpense.date && <small className="p-invalid">A data é obrigatória</small>}
      </div>

      <div className="field">
        <label htmlFor="value">Valor</label>
        <InputNumber
          id='value'
          value={tripExpense.value}
          onChange={(e) => setTripExpense({ ...tripExpense, value: e.value ?? 0 })}
          autoFocus
          minFractionDigits={2} maxFractionDigits={2}
        />
        {submitted && !tripExpense.value && <small className="p-invalid">O valor é obrigatório</small>}
      </div>

      <div className="field">
        <label htmlFor="typePayment">Tipo de Pagamento</label>
        <Dropdown
          value={tripExpense.typePayment}
          onChange={(e) => setTripExpense({ ...tripExpense, typePayment: e.value })}
          options={['Pessoal', 'Agrocontar']}
          placeholder="Selecione" className="w-full md:w-14rem"
        />
        {submitted && !tripExpense.typePayment && <small className="p-invalid">O tipo de pagamento é obrigatório</small>}
      </div>

      <div className="field">
        <label htmlFor="taxDocument">Documento</label>
        <InputText
          id="taxDocument"
          value={tripExpense.taxDocument}
          onChange={(e) => onInputChangeExpense(e, 'taxDocument')}
        />
      </div>

      <div className="field">
        <label htmlFor="observation">Observação</label>
        <InputTextarea
          id="observation"
          autoResize
          value={tripExpense.observation}
          onChange={(e) => onInputChangeExpense(e, 'observation')}
          rows={5} cols={30}
        />
      </div>

      <div>
        <FileUpload
          ref={fileUploadRef}
          mode="basic"
          name="file" // nome do campo para o backend
          url="/api/upload"
          accept="image/*,application/pdf"
          multiple
          auto
          maxFileSize={1000000}
          onUpload={(e) => {
            setUploading(false);
            try {
              const response = JSON.parse(e.xhr.response);
              if (response.path) {
                setTripExpense({ ...tripExpense, proof: response.path });
              }
            } catch (err) {
              toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao fazer upload do arquivo',
                life: 3000,
              });
              console.error("Erro no upload:", err);
            }
          }}
          chooseLabel="Comprovante"
          className="mr-2"
        />


      </div>

    </Dialog>
  );
}