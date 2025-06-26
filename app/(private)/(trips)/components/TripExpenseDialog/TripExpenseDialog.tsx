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
import { ProgressSpinner } from "primereact/progressspinner";

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
  const [uploadSuccess, setUploadSuccess] = useState(false);


  const newExpenseDialogFooter = (
    <>
      {uploading ? (
        <div className="flex justify-content-center">
          <ProgressSpinner
            style={{ width: '20px', height: '20px' }}
            strokeWidth="4"
            fill="var(--surface-ground)"
            animationDuration=".5s"
          />
        </div>
      ) : (
        <>
          <Button label="Cancelar" icon="pi pi-times" text onClick={hideTripExpenseDialog} />
          <Button
            label="Salvar"
            icon="pi pi-check"
            text
            onClick={() => {
              handleSaveExpense();
              setUploadSuccess(false);
              }
            }
          />
        </>
      )}
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
      style={{ width: '450px' }}
      header="Nova Despesa"
      modal
      className="p-fluid"
      onHide={hideTripExpenseDialog}
      footer={newExpenseDialogFooter}
    >
      <div className="field">
        <label htmlFor="expenses">Tipo de Despesa <span style={{ color: 'red' }}>*</span></label>
        <Dropdown
          id="expenses"
          value={tripExpense.expenses}
          onChange={(e) => setTripExpense({ ...tripExpense, expenses: e.value })}
          options={typeExpenseOptions}
          optionLabel="name"
          placeholder="Selecione"
          autoFocus
          className={classNames('w-full md:w-14rem', {
              'p-invalid': submitted && !tripExpense.expenses,
            })}
        />
        {submitted && !tripExpense.expenses && <small className="p-invalid">Transporte é obrigatório</small>}
      </div>

      <div className="field">
        <label htmlFor="date">Data <span style={{ color: 'red' }}>*</span></label>

        <InputMask
          id="date"
          value={tripExpense.date}
          onChange={(e) => onInputChangeExpense(e, 'date')}
          mask="99/99/9999" placeholder="dd/mm/yyyy"
          slotChar="dd/mm/yyyy"
          className={classNames({ 'p-invalid': submitted && !tripExpense.date })}
        />

        {submitted && !tripExpense.date && <small className="p-invalid">A data é obrigatória</small>}
      </div>

      <div className="field">
        <label htmlFor="value">Valor <span style={{ color: 'red' }}>*</span></label>
        <InputNumber
          id="value"
          value={tripExpense.value}
          onValueChange={(e) => setTripExpense({ ...tripExpense, value: e.value ?? 0 })}
          mode="currency"
          currency="BRL"
          locale="pt-BR"
          minFractionDigits={2}
          maxFractionDigits={2}
          className={classNames({ 'p-invalid': submitted && !tripExpense.value })}
        />
        {submitted && !tripExpense.value && (
          <small className="p-invalid">O valor é obrigatório</small>
        )}
      </div>

      <div className="field">
        <label htmlFor="typePayment">Tipo de Pagamento <span style={{ color: 'red' }}>*</span></label>
        <Dropdown
          id="typePayment"
          value={tripExpense.typePayment}
          onChange={(e) => setTripExpense({ ...tripExpense, typePayment: e.value })}
          options={['Pessoal', 'Agrocontar']}
          placeholder="Selecione"
          className={classNames('w-full md:w-14rem', {
              'p-invalid': submitted && !tripExpense.typePayment,
            })}
        />
        {submitted && !tripExpense.typePayment && <small className="p-invalid">O tipo de pagamento é obrigatório</small>}
      </div>

      <div className="field">
        <label htmlFor="taxDocument">Documento <span style={{ color: 'red' }}>*</span></label>
        <InputText
          id="taxDocument"
          value={tripExpense.taxDocument}
          onChange={(e) => onInputChangeExpense(e, 'taxDocument')}
          className={classNames({ 'p-invalid': submitted && !tripExpense.taxDocument })}
        />
        {submitted && !tripExpense.taxDocument && <small className="p-invalid">O Documento é obrigatório</small>}
      </div>

      <div className="field">
        <label htmlFor="observation">Observação</label>
        <InputText
          id="observation"
          value={tripExpense.observation}
          onChange={(e) => onInputChangeExpense(e, 'observation')}
        />
      </div>

      <div className="flex">
        <FileUpload
          id="proof-upload"
          ref={fileUploadRef}
          mode="basic"
          name="file"
          url="/api/upload"
          accept="image/*, application/pdf"
          auto
          maxFileSize={5000000}
          onBeforeUpload={() => setUploading(true)}
          onUpload={(e) => {
        try {
          const response = JSON.parse(e.xhr.response);
          if (response.path) {
            setTripExpense({ ...tripExpense, proof: response.path });
            }
            setUploadSuccess(true)
          } catch (err) {
            toast.current?.show({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao fazer upload do arquivo',
              life: 3000,
            });
            console.error("Erro no upload:", err);
          }
          setUploading(false);
        
          }}
          onError={(e) => {
            let errorMessage = 'Erro ao enviar o arquivo';

            try {
              const response = JSON.parse(e.xhr.response);
              if (response?.error) {
                errorMessage = response.error;
              }
            } catch (parseErr) {
              console.error('Erro ao tentar parsear resposta do erro:', parseErr);
            }

            toast.current?.show({
              severity: 'error',
              summary: 'Erro',
              detail: errorMessage,
              life: 3000,
            });

            setUploading(false);
          }}

          chooseLabel="Comprovante"
          className="mr-2"

          onValidationFail={(e) => {
            console.error("Erro de validação:", e);
            toast.current?.show({
              severity: 'warn',
              summary: 'Arquivo inválido',
              detail: 'O arquivo deve ser PNG, JPG ou PDF com no máximo 5MB',
              life: 3000,
            });
          }}
        />
        {uploadSuccess && <i className="pi pi-check"></i>}
        {submitted && !tripExpense.proof && (
          <small className="p-invalid">O comprovante é obrigatório</small>
        )}
      </div>

    </Dialog>
  );
}