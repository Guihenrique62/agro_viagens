/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { InputMask, InputMaskChangeEvent } from 'primereact/inputmask';
import { FilterMatchMode } from 'primereact/api';

interface Parameter {
  id: number;
  startDate: string;
  endDate: string;
  value: number;
}


const ParameterPage = () => {
  const emptyParameter = {
    id: 0,
    startDate: '',
    endDate: '',
    value: 0,

  };

  const [filters, setFilters] = useState({
    global: { value: '', matchMode: FilterMatchMode.CONTAINS }
  });
  

  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [parameter, setParameter] = useState<Parameter>(emptyParameter);

  const [parameterDialog, setParameterDialog] = useState(false);
  const [deleteParameterDialog, setDeleteParameterDialog] = useState(false);
  const [editParameterDialog, setEditParameterDialog] = useState(false);

  
  const [selectedParameters, setSelectedParameters] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable<any>>(null);
  const [loading, setLoading] = useState(false);


  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  let _filters = { ...filters };

  _filters['global'].value = value;

  setFilters(_filters);
};


  // BUsca a lista de despesas
  const fetchParameters = async () => {
    try {

      const res = await fetch('/api/parameterKm', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Erro ao buscar os parametros:', data.error);
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao buscar os Paramêtros .',
          life: 3000,
        });
        return;
      }

      // Formatar datas no padrão dd/mm/yyyy
      const formatted = data.map((param : Parameter) => ({
        ...param,
        startDate: new Date(param.startDate).toLocaleDateString('pt-BR'),
        endDate: new Date(param.endDate).toLocaleDateString('pt-BR'),
      }));

      setParameters(formatted);
    } catch (err) {
      console.error('Erro inesperado:', err);
    }
  };

  useEffect(() => {
    fetchParameters();
  }, []);

  //Abre o dialogo de novo despesa
  const openNew = () => {
    setParameter(emptyParameter);
    setSubmitted(false);
    setParameterDialog(true);
  };

  //Abre o dialogo de editar despesa
  const openEdit = (parameter: Parameter) => {
    setParameter({ ...parameter });
    setSubmitted(false);
    setEditParameterDialog(true);
  };

  // esconde o diagolo 
  const hideDialog = () => {
    setSubmitted(false);
    setParameterDialog(false);
  };

  // esconde o dialogo de editar expense
  const hideEditUserDialog = () => {
    setSubmitted(false);
    setEditParameterDialog(false);
  };

  // esconde o dialogo de deletar Parameter
  const hideDeleteProductDialog = () => setDeleteParameterDialog(false);

  function formatDateToISO(dateStr: string): string {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`; // yyyy-MM-dd
  }


  // Salva a despesa
  const saveParameter = async () => {
    setSubmitted(true);

  if (parameter.value, parameter.startDate, parameter.endDate) {
    let _parameters = [...parameters];
    let _parameter = { ...parameter };

    if (parameter.id) {
      const index = findIndexById(parameter.id);
      _parameters[index] = _parameter;
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Paramêtro Atualizado',
        life: 3000,
      });
      setParameters(_parameters);
    } else {
      try {
        const res = await fetch('/api/parameterKm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            startDate: formatDateToISO(parameter.startDate),
            endDate: formatDateToISO(parameter.endDate),
            value: parameter.value,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Erro ao criar Paramêtro');
        }

        const createdParameter = await res.json();
        _parameter.id = createdParameter.id; // assumindo que o back retorna o ID
        _parameters.push(_parameter);

        toast.current?.show({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Paramêtro Criado',
          life: 3000,
        });

        setParameters(_parameters);
      } catch (err: any) {
        console.error('Erro ao criar Paramêtro:', err);
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: err.message || 'Erro ao criar Paramêtro',
          life: 3000,
        });
        return;
      }
    }

    setParameterDialog(false);
    setParameter(emptyParameter);
  }
  };

  const parseBrDateToIso = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/');
    return new Date(`${year}-${month}-${day}`).toISOString(); // ou apenas `${year}-${month}-${day}`
  };


  // Edita a Despesa
  const editParameter = async () => {
    if (!parameter.id) return;
  
    try {
      const res = await fetch(`/api/parameterKm/${parameter.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          startDate: formatDateToISO(parameter.startDate),
          endDate: formatDateToISO(parameter.endDate),
          value: parameter.value,
        }),
      });
  
      const data = await res.json();

      if (!res.ok) {
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: data.message || 'Erro ao editar o Paramêtro.',
          life: 3000,
        });
        return;
      }
  
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Paramêtro atualizada com sucesso.',
        life: 3000,
      });
  
      // Atualiza lista local
      const updatedParameters = parameters.map((u) => (u.id === parameter.id ? data : u));

      // Formatar datas no padrão dd/mm/yyyy
      const formattedData = {
        ...data,
        startDate: new Date(data.startDate).toLocaleDateString('pt-BR'),
        endDate: new Date(data.endDate).toLocaleDateString('pt-BR'),
      };

      setParameters(updatedParameters.map((u) =>
        u.id === formattedData.id ? formattedData : u
      ));

      setEditParameterDialog(false);
      setParameter(emptyParameter);
  
    } catch (err) {
      console.error('Erro ao editar Paramêtro:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro inesperado ao editar Paramêtro.',
        life: 3000,
      });
    }
  };
  
  // Deleta o parametro
  const deleteParameter = async () => {
    if (!parameter.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/parameterKm/${parameter.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: data.error || 'Erro ao Excluir a Paramêtro.',
          life: 3000,
        });
        return;
      }
  
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Paramêtro excluida com sucesso.',
        life: 3000,
      });
  
      // Atualiza lista local
      const updatedParameters = parameters.map((u) => (u.id === parameter.id ? data : u));
      setParameters(updatedParameters);
      setParameter(data);
      setSelectedParameters(null);
      setDeleteParameterDialog(false);
      fetchParameters()
      setParameter(emptyParameter);
      setLoading(false)
  
    } catch (err) {
      console.error('Erro ao excluir Paramêtro:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro inesperado ao excluir Paramêtro.',
        life: 3000,
      });
    }
  };


  // Confirma a exclusão do despesa
  const confirmDeleteProduct = (parameter: Parameter) => {
    setParameter(parameter);
    setDeleteParameterDialog(true);
  };

  const findIndexById = (id: number) => parameters.findIndex((u) => u.id === id);

  const onInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | InputMaskChangeEvent,
    name: string
  ) => {
    const val = (e.target && e.target.value) || '';
    setParameter({ ...parameter, [name]: val });
  };


  const startBodyTemplate = (rowData: Parameter) => <span>{rowData.startDate}</span>;
  const endBodyTemplate = (rowData: Parameter) => <span>{rowData.endDate}</span>;
  const valueBodyTemplate = (rowData: Parameter) => <span>{rowData.value}</span>;

  const actionBodyTemplate = (rowData: Parameter) => (
    <>
      <Button
        icon="pi pi-pencil"
        rounded
        severity="info"
        className="mr-2"
        onClick={() => openEdit(rowData)}
      />
      <Button
        icon="pi pi-trash"
        rounded
        severity="danger"
        onClick={() => confirmDeleteProduct(rowData)}
      />
    </>
  );

  const leftToolbarTemplate = () => (
    <div className="my-2">
      <Button label="Novo Paramêtro" icon="pi pi-plus" severity="success" className="mr-2" onClick={openNew} />
    </div>
  );


  

  const parameterDialogFooter = (
    <>
      <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
      <Button label="Salvar" icon="pi pi-check" text onClick={saveParameter} />
    </>
  );

  const editParameterDialogFooter = (
    <>
      <Button label="Cancelar" icon="pi pi-times" text onClick={hideEditUserDialog} />
      <Button label="Salvar" icon="pi pi-check" text onClick={editParameter} />
    </>
  );

  const deleteParameterDialogFooter = (
    <>
      <Button label="Não" icon="pi pi-times" text onClick={hideDeleteProductDialog} />
      <Button label="Sim" icon="pi pi-check" text onClick={deleteParameter} />
    </>
  );

  const header = () => {
   return (
      <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
        <h5 className="m-0">Parâmetros por KM</h5>
        <span className="block mt-2 md:mt-0 p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            type="search"
            value={filters.global.value}
            onChange={onGlobalFilterChange}
            placeholder="Buscar..."
          />
        </span>
      </div>
    )
  }


  const safeParameters = parameters.map(p => ({
    ...p,
    startDate: p.startDate ?? '',
    endDate: p.endDate ?? '',
    value: p.value ?? 0,
  }));

  console.log(safeParameters)
  return (
    <div className="grid crud-demo">
      <div className="col-12">
        <div className="card">
          
          <Toast ref={toast} />
          <Toolbar className="mb-4" left={leftToolbarTemplate}  />
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
              <ProgressSpinner
                style={{ width: '60px', height: '60px' }}
                strokeWidth="8"
                fill="var(--surface-ground)"
                animationDuration=".5s"
              />
            </div>
          ) : (
            
            <DataTable
              ref={dt}
              value={safeParameters}
              selection={selectedParameters}
              onSelectionChange={(e) => setSelectedParameters(e.value as any)}
              filters={filters}
              filterDisplay="row"
              globalFilterFields={['startDate', 'endDate']}
              paginator
              rows={5}
              rowsPerPageOptions={[5, 10, 25]}
              className="datatable-responsive"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Mostrando {first} até {last} de {totalRecords} Paramêtros"
              emptyMessage="Nenhum paramêtro encontrado."
              header={header}
              responsiveLayout="scroll"
            >
              <Column field="startDate" header="Data inicio" sortable body={startBodyTemplate} headerStyle={{ minWidth: '15rem' }} />
              <Column field="endDate" header="Data fim" body={endBodyTemplate} sortable headerStyle={{ minWidth: '10rem' }} />
              <Column field="value" header="Valor do KM" body={valueBodyTemplate} sortable headerStyle={{ minWidth: '10rem' }} />
              <Column body={actionBodyTemplate} header="Ações" headerStyle={{ minWidth: '10rem' }} />
            </DataTable>
          )}

          <Dialog visible={parameterDialog} style={{ width: '450px' }} header="Novo paramêtro" modal className="p-fluid" footer={parameterDialogFooter} onHide={hideDialog}>
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

          <Dialog visible={editParameterDialog} style={{ width: '450px' }} header="Editar Despesa" modal className="p-fluid" footer={editParameterDialogFooter} onHide={hideEditUserDialog}>
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

          <Dialog visible={deleteParameterDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteParameterDialogFooter} onHide={hideDeleteProductDialog}>
            <div className="confirmation-content">
              <i className="pi pi-exclamation-triangle mr-3" />
              {parameter && <span>Tem certeza que deseja excluir o paramêtro?</span>}
            </div>
          </Dialog>

          
        </div>
      </div>
    </div>
  );
};

export default ParameterPage;
