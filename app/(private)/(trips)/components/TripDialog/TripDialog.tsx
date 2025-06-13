import { formatDateToPadrao } from "@/app/(private)/untils/formatDateToISO";
import { Transport } from "nodemailer";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputMask, InputMaskChangeEvent } from "primereact/inputmask";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { MultiSelect } from "primereact/multiselect";
import { Toast } from "primereact/toast";
import { classNames } from "primereact/utils";
import { useRef } from "react";


export const TripDialog = ({
  visible,
  header,
  trip,
  transports,
  selectedTransports,
  setSelectedTransports,
  setTrip,
  submitted,
  footer,
  onHide,
}: any) => {

  const onInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | InputMaskChangeEvent,
    name: string
  ) => {
    const val = (e.target && e.target.value) || '';
    setTrip({ ...trip, [name]: val });
  };

  return (

      <Dialog visible={visible}
      style={{ width: '450px' }}
      header={header}
      modal className="p-fluid"
      footer={footer}
      onHide={onHide}
    >


        <div className="field">
          <label htmlFor="destination">Destino <span style={{ color: 'red' }}>*</span></label>
          <InputText
            id="destination"
            value={trip.destination}
            onChange={(e) => onInputChange(e, 'destination')}
            required
            autoFocus
            className={classNames({ 'p-invalid': submitted && !trip.destination })}
          />
          {submitted && !trip.destination && <small className="p-invalid">Destino é obrigatório!</small>}
        </div>

        <div className="field">
          <label htmlFor="client">Cliente <span style={{ color: 'red' }}>*</span></label>
          <InputText
            id="client"
            value={trip.client}
            onChange={(e) => onInputChange(e, 'client')}
            required
            className={classNames({ 'p-invalid': submitted && !trip.client })}
          />
          {submitted && !trip.client && <small className="p-invalid">Cliente é obrigatório!</small>}
        </div>

        <div className="field">
          <label htmlFor="escort">Acompanhante </label>
          <InputText
            id="escort"
            value={trip.escort}
            onChange={(e) => onInputChange(e, 'escort')}
          />
        </div>


        <div className="field">

          <label htmlFor="reason">Motivo da Viagem <span style={{ color: 'red' }}>*</span></label>
          <InputText
            id="reason"
            value={trip.reason}
            onChange={(e) => onInputChange(e, 'reason')}
            required
            className={classNames({ 'p-invalid': submitted && !trip.reason })}
          />
          {submitted && !trip.reason && <small className="p-invalid">Motivo da Viagem é obrigatório!</small>}
        </div>


        <div className="field">
          <label htmlFor="type">Tipo da Viagem <span style={{ color: 'red' }}>*</span></label>
          <Dropdown
            id="type"
            value={trip.type}
            onChange={(e) => setTrip({ ...trip, type: e.value })}
            options={['Cortesia', 'Comercial', 'Entre Unidades', 'Acordo', 'Visita']}
            placeholder="Selecione"
            className={classNames('w-full md:w-14rem', {
              'p-invalid': submitted && !trip.type,
            })}
          />
          {submitted && !trip.type && (
            <small className="p-invalid">Tipo da Viagem é obrigatório!</small>
          )}
        </div>

        <div className="field">
          <label htmlFor="transports">Meios de Transporte <span style={{ color: 'red' }}>*</span></label>
          <MultiSelect
            id="transports"
            value={selectedTransports}
            options={Array.isArray(transports) ? transports : []}
            optionLabel="name"
            optionValue="id"
            placeholder="Selecione os transportes"
            maxSelectedLabels={3}
            onChange={(e) => setSelectedTransports(e.value)}
            itemTemplate={(option: Transport) => <span>{option.name}</span>}
            showSelectAll={false}
            className={classNames('w-full md:w-20rem', {
              'p-invalid': submitted && (!selectedTransports || selectedTransports.length === 0),
            })}
          />
          {submitted && (!selectedTransports || selectedTransports.length === 0) && (
            <small className="p-invalid">Transporte é obrigatório</small>
          )}
        </div>

        <div className="field">
          <label htmlFor="startKM">KM inicial</label>
          <InputNumber
            id='startKM'
            value={trip.startKM}
            onChange={(e) => setTrip({ ...trip, startKM: e.value ?? 0 })}
          />

          <label htmlFor="endKM">KM Final</label>
          <InputNumber
            id='endKM'
            value={trip.endKM}
            onChange={(e) => setTrip({ ...trip, endKM: e.value ?? 0 })}
          />
        </div>

        <div className="field">
          <label htmlFor="advance_value">Valor do adiantamento</label>
          <InputNumber
            id="advance_value"
            value={trip.advance_value}
            onValueChange={(e) => setTrip({ ...trip, advance_value: e.value ?? 0 })}
            mode="currency"
            currency="BRL"
            locale="pt-BR"
            minFractionDigits={2}
            maxFractionDigits={2}
            className="w-full"
          />
        </div>

        <div className="field">
          <label htmlFor="startDate">Data Início <span style={{ color: 'red' }}>*</span></label>

          <InputMask
            value={trip.startDate}
            onChange={(e) => onInputChange(e, 'startDate')}
            mask="99/99/9999" placeholder="dd/mm/yyyy"
            slotChar="dd/mm/yyyy"
            className={classNames({ 'p-invalid': submitted && !trip.startDate })}
          />

          {submitted && !trip.startDate && <small className="p-invalid">A data inicio é obrigatório</small>}
        </div>

        <div className="field">
          <label htmlFor="endDate">Data Fim <span style={{ color: 'red' }}>*</span></label>

          <InputMask
            value={trip.endDate}
            onChange={(e) => onInputChange(e, 'endDate')}
            mask="99/99/9999" placeholder="dd/mm/yyyy"
            slotChar="dd/mm/yyyy"
            className={classNames({ 'p-invalid': submitted && !trip.endDate })}
          />

          {submitted && !trip.endDate && <small className="p-invalid">A data final é obrigatório</small>}
        </div>

    </Dialog>
    
  )
}