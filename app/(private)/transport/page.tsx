/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';

interface Transport {
  id: number;
  name: string;
  calculateKM: boolean;
  status: number;
}


const TransportPage = () => {
  const emptyTransport = {
    id: 0,
    name: '',
    calculateKM: false,
    status: 1,

  };

  const [transports, setTransports] = useState<Transport[]>([]);
  const [transport, setTransport] = useState<Transport>(emptyTransport);

  const [transportDialog, setTransportDialog] = useState(false);
  const [deleteTransportDialog, setDeleteTransportDialog] = useState(false);
  const [editTransportDialog, setEditTransportDialog] = useState(false);

  
  const [selectedTransports, setSelectedTransports] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const [globalFilter, setGlobalFilter] = useState('');
  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable<any>>(null);
  const [loading, setLoading] = useState(false);

  // BUsca a lista de transportes
  const fetchTransports = async () => {
    try {

      const res = await fetch('/api/transport', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Erro ao buscar os transportes:', data.error);
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao buscar os transportes.',
          life: 3000,
        });
        return;
      }

      setTransports(data);
    } catch (err) {
      console.error('Erro inesperado:', err);
    }
  };

  useEffect(() => {
    fetchTransports();
  }, []);

  //Abre o dialogo de novo transporte
  const openNew = () => {
    setTransport(emptyTransport);
    setSubmitted(false);
    setTransportDialog(true);
  };

  //Abre o dialogo de editar transporte
  const openEdit = (transport: Transport) => {
    setTransport({ ...transport });
    setSubmitted(false);
    setEditTransportDialog(true);
  };

  // esconde o diagolo 
  const hideDialog = () => {
    setSubmitted(false);
    setTransportDialog(false);
  };

  // esconde o dialogo de editar transport
  const hideEditUserDialog = () => {
    setSubmitted(false);
    setEditTransportDialog(false);
  };

  // esconde o dialogo de deletar transport
  const hideDeleteProductDialog = () => setDeleteTransportDialog(false);

  // Salva o transporte
  const saveTransport = async () => {
    setSubmitted(true);

  if (transport.name.trim()) {
    let _transports = [...transports];
    let _transport = { ...transport };

    if (transport.id) {
      const index = findIndexById(transport.id);
      _transports[index] = _transport;
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Transporte Atualizado',
        life: 3000,
      });
      setTransports(_transports);
    } else {
      try {
        const res = await fetch('/api/transport', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            name: transport.name,
            calculateKM: !!transport.calculateKM,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Erro ao criar Transporte');
        }

        const createdTransport = await res.json();
        _transport.id = createdTransport.id; // assumindo que o back retorna o ID
        _transports.push(_transport);

        toast.current?.show({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Transporte Criado',
          life: 3000,
        });

        setTransports(_transports);
      } catch (err: any) {
        console.error('Erro ao criar transporte:', err);
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: err.message || 'Erro ao criar transporte',
          life: 3000,
        });
        return;
      }
    }

    setTransportDialog(false);
    setTransport(emptyTransport);
  }
  };

  // Edita o transporte
  const editTransport = async () => {
    if (!transport.id) return;
  
    try {
      const res = await fetch(`/api/transport/${transport.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: transport.name,
          calculateKM: transport.calculateKM,
        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: data.error || 'Erro ao editar o transporte.',
          life: 3000,
        });
        return;
      }
  
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Transporte atualizado com sucesso.',
        life: 3000,
      });
  
      // Atualiza lista local
      const updatedTransports = transports.map((u) => (u.id === transport.id ? data : u));
      setTransports(updatedTransports);
      setTransport(data);
      setEditTransportDialog(false);
      setTransport(emptyTransport);
  
    } catch (err) {
      console.error('Erro ao editar transporte:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro inesperado ao editar transporte.',
        life: 3000,
      });
    }
  };
  
  // Deleta o transporte
  const deleteTransport = async () => {
    if (!transport.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/transport/${transport.id}`, {
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
          detail: data.error || 'Erro ao Excluir o transporte.',
          life: 3000,
        });
        return;
      }
  
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'transporte excluido com sucesso.',
        life: 3000,
      });
  
      // Atualiza lista local
      const updatedTransports = transports.map((u) => (u.id === transport.id ? data : u));
      setTransports(updatedTransports);
      setTransport(data);
      setSelectedTransports(null);
      setDeleteTransportDialog(false);
      fetchTransports()
      setTransport(emptyTransport);
      setLoading(false)
  
    } catch (err) {
      console.error('Erro ao excluir Transporte:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro inesperado ao excluir Transporte.',
        life: 3000,
      });
    }
  };


  // Confirma a exclusão do transporte
  const confirmDeleteProduct = (transport: Transport) => {
    setTransport(transport);
    setDeleteTransportDialog(true);
  };

  const findIndexById = (id: number) => transports.findIndex((u) => u.id === id);

  const onInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    name: string
  ) => {
    const val = (e.target && e.target.value) || '';
    setTransport({ ...transport, [name]: val });
  };


  const nameBodyTemplate = (rowData: Transport) => <span>{rowData.name}</span>;
  const calculateKMBodyTemplate = (rowData: Transport) => {
    return rowData.calculateKM ? 'Sim' : 'Não';
  };

  const statusBodyTemplate = (rowData: Transport) => (
      <>
        {rowData.status === 1 ? (
          <span className="product-badge status-available">Ativo</span>
        ) : rowData.status === 2 ? (
          <span className="product-badge status-outofstock">Inativo</span>
        ) : null}
      </>
  );

  const actionBodyTemplate = (rowData: Transport) => (
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
      <Button label="Novo Transporte" icon="pi pi-plus" severity="success" className="mr-2" onClick={openNew} />
    </div>
  );


  const header = (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
      <h5 className="m-0">Cadastro de Transportes</h5>
      {/* <span className="block mt-2 md:mt-0 p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          type="search"
          onInput={(e) => setGlobalFilter(e.currentTarget.value)}
          placeholder="Buscar..."
        />
      </span> */}
    </div>
  );

  const TransportDialogFooter = (
    <>
      <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
      <Button label="Salvar" icon="pi pi-check" text onClick={saveTransport} />
    </>
  );

  const editTransportDialogFooter = (
    <>
      <Button label="Cancelar" icon="pi pi-times" text onClick={hideEditUserDialog} />
      <Button label="Salvar" icon="pi pi-check" text onClick={editTransport} />
    </>
  );

  const deleteTransportDialogFooter = (
    <>
      <Button label="Não" icon="pi pi-times" text onClick={hideDeleteProductDialog} />
      <Button label="Sim" icon="pi pi-check" text onClick={deleteTransport} />
    </>
  );


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
              value={transports}
              selection={selectedTransports}
              onSelectionChange={(e) => setSelectedTransports(e.value as any)}
              paginator
              rows={5}
              rowsPerPageOptions={[5, 10, 25]}
              className="datatable-responsive"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Mostrando {first} até {last} de {totalRecords} transportes"
              emptyMessage="Nenhum transporte encontrado."
              header={header}
              responsiveLayout="scroll"
            >
              <Column field="name" header="Nome" sortable body={nameBodyTemplate} headerStyle={{ minWidth: '15rem' }} />
              <Column field="calculateKM" header="Calcula KM?" sortable body={calculateKMBodyTemplate} headerStyle={{ minWidth: '15rem' }} />
              <Column field="status" header="Status" body={statusBodyTemplate} sortable headerStyle={{ minWidth: '10rem' }} />
              <Column body={actionBodyTemplate} header="Ações" headerStyle={{ minWidth: '10rem' }} />
            </DataTable>
          )}

          <Dialog visible={transportDialog} style={{ width: '450px' }} header="Novo Transporte" modal className="p-fluid" footer={TransportDialogFooter} onHide={hideDialog}>
            <div className="field">
              <label htmlFor="name">Nome</label>
              <InputText
                id="name"
                value={transport.name}
                onChange={(e) => onInputChange(e, 'name')}
                required
                autoFocus
                className={classNames({ 'p-invalid': submitted && !transport.name })}
              />
              {submitted && !transport.name && <small className="p-invalid">O nome é obrigatório</small>}
            </div>
            <div className="field flex items-center gap-2">
              <label htmlFor="calculateKM">Calcular KM?</label>
              <Checkbox 
              id='calculateKM'
              onChange={e => setTransport({ ...transport, calculateKM: e.checked ?? false })}
              checked={transport.calculateKM}
              >
              
              </Checkbox>
            </div>
          </Dialog>

          <Dialog visible={editTransportDialog} style={{ width: '450px' }} header="Editar Transporte" modal className="p-fluid" footer={editTransportDialogFooter} onHide={hideEditUserDialog}>
            <div className="field">
                <label htmlFor="name">Nome</label>
                <InputText
                  id="name"
                  value={transport.name}
                  onChange={(e) => onInputChange(e, 'name')}
                  required
                  autoFocus
                  className={classNames({ 'p-invalid': submitted && !transport.name })}
                />
                {submitted && !transport.name && <small className="p-invalid">O nome é obrigatório</small>}
              </div>
              <div className="field flex items-center gap-2">
                <label htmlFor="calculateKM">Calcular KM?</label>
                <Checkbox 
                id='calculateKM'
                onChange={e => setTransport({ ...transport, calculateKM: e.checked ?? false })}
                checked={transport.calculateKM}
                >
                
                </Checkbox>
              </div>
          </Dialog>

          <Dialog visible={deleteTransportDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteTransportDialogFooter} onHide={hideDeleteProductDialog}>
            <div className="confirmation-content">
              <i className="pi pi-exclamation-triangle mr-3" />
              {transport && <span>Tem certeza que deseja excluir <b>{transport.name}</b>?</span>}
            </div>
          </Dialog>

          
        </div>
      </div>
    </div>
  );
};

export default TransportPage;
