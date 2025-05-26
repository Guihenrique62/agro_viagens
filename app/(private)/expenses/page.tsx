/* eslint-disable @next/next/no-img-element */
'use client';
import { FilterMatchMode } from 'primereact/api';
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

interface Expense {
  id: number;
  name: string;
  status: number;
}


const ExpensesPage = () => {
  const emptyExpense = {
    id: 0,
    name: '',
    status: 1,

  };

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expense, setExpense] = useState<Expense>(emptyExpense);

  const [expenseDialog, setExpenseDialog] = useState(false);
  const [deleteExpenseDialog, setDeleteExpenseDialog] = useState(false);
  const [editExpenseDialog, setEditExpenseDialog] = useState(false);

  
  const [selectedExpenses, setSelectedExpenses] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const [globalFilter, setGlobalFilter] = useState('');
  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable<any>>(null);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    global: { value: '', matchMode: FilterMatchMode.CONTAINS }
  });

  // BUsca a lista de despesas
  const fetchExpenses = async () => {
    try {

      const res = await fetch('/api/expenses', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Erro ao buscar as Despesas:', data.error);
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao buscar as Despesas.',
          life: 3000,
        });
        return;
      }

      setExpenses(data);
    } catch (err) {
      console.error('Erro inesperado:', err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  //Abre o dialogo de novo despesa
  const openNew = () => {
    setExpense(emptyExpense);
    setSubmitted(false);
    setExpenseDialog(true);
  };

  //Abre o dialogo de editar despesa
  const openEdit = (expense: Expense) => {
    setExpense({ ...expense });
    setSubmitted(false);
    setEditExpenseDialog(true);
  };

  // esconde o diagolo 
  const hideDialog = () => {
    setSubmitted(false);
    setExpenseDialog(false);
  };

  // esconde o dialogo de editar expense
  const hideEditUserDialog = () => {
    setSubmitted(false);
    setEditExpenseDialog(false);
  };

  // esconde o dialogo de deletar expense
  const hideDeleteProductDialog = () => setDeleteExpenseDialog(false);

  // Salva a despesa
  const saveExpense = async () => {
    setSubmitted(true);

  if (expense.name.trim()) {
    let _expenses = [...expenses];
    let _expense = { ...expense };

    if (expense.id) {
      const index = findIndexById(expense.id);
      _expenses[index] = _expense;
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Despesa Atualizada',
        life: 3000,
      });
      setExpenses(_expenses);
    } else {
      try {
        const res = await fetch('/api/expenses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            name: expense.name,

          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Erro ao criar Despesa');
        }

        const createdExpense = await res.json();
        _expense.id = createdExpense.id; // assumindo que o back retorna o ID
        _expenses.push(_expense);

        toast.current?.show({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Despesa Criada',
          life: 3000,
        });

        setExpenses(_expenses);
      } catch (err: any) {
        console.error('Erro ao criar despesa:', err);
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: err.message || 'Erro ao criar despesa',
          life: 3000,
        });
        return;
      }
    }

    setExpenseDialog(false);
    setExpense(emptyExpense);
  }
  };

  // Edita a Despesa
  const editExpense = async () => {
    if (!expense.id) return;
  
    try {
      const res = await fetch(`/api/expenses/${expense.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: expense.name,
        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: data.error || 'Erro ao editar a Despesa.',
          life: 3000,
        });
        return;
      }
  
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Despesa atualizada com sucesso.',
        life: 3000,
      });
  
      // Atualiza lista local
      const updatedExpenses = expenses.map((u) => (u.id === expense.id ? data : u));
      setExpenses(updatedExpenses);
      setExpense(data);
      setEditExpenseDialog(false);
      setExpense(emptyExpense);
  
    } catch (err) {
      console.error('Erro ao editar Despesa:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro inesperado ao editar Despesa.',
        life: 3000,
      });
    }
  };
  
  // Deleta a despesa
  const deleteExpense = async () => {
    if (!expense.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/expenses/${expense.id}`, {
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
          detail: data.error || 'Erro ao Excluir a Despesa.',
          life: 3000,
        });
        return;
      }
  
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Despesa excluida com sucesso.',
        life: 3000,
      });
  
      // Atualiza lista local
      const updatedExpenses = expenses.map((u) => (u.id === expense.id ? data : u));
      setExpenses(updatedExpenses);
      setExpense(data);
      setSelectedExpenses(null);
      setDeleteExpenseDialog(false);
      fetchExpenses()
      setExpense(emptyExpense);
      setLoading(false)
  
    } catch (err) {
      console.error('Erro ao excluir Despesa:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro inesperado ao excluir Despesa.',
        life: 3000,
      });
    }
  };


  // Confirma a exclusão do despesa
  const confirmDeleteProduct = (expense: Expense) => {
    setExpense(expense);
    setDeleteExpenseDialog(true);
  };

  const findIndexById = (id: number) => expenses.findIndex((u) => u.id === id);

  const onInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    name: string
  ) => {
    const val = (e.target && e.target.value) || '';
    setExpense({ ...expense, [name]: val });
  };


  const nameBodyTemplate = (rowData: Expense) => <span>{rowData.name}</span>;

  const statusBodyTemplate = (rowData: Expense) => (
      <>
        {rowData.status === 1 ? (
          <span className="product-badge status-available">Ativo</span>
        ) : rowData.status === 2 ? (
          <span className="product-badge status-outofstock">Inativo</span>
        ) : null}
      </>
  );

  const actionBodyTemplate = (rowData: Expense) => (
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
      <Button label="Novo tipo de Despesa" icon="pi pi-plus" severity="success" className="mr-2" onClick={openNew} />
    </div>
  );

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters = { ...filters };
      
        _filters['global'].value = value;
      
        setFilters(_filters);
      };


  const header = (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
      <h5 className="m-0">Cadastro de Despesas</h5>
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
  );

  const expenseDialogFooter = (
    <>
      <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
      <Button label="Salvar" icon="pi pi-check" text onClick={saveExpense} />
    </>
  );

  const editExpenseDialogFooter = (
    <>
      <Button label="Cancelar" icon="pi pi-times" text onClick={hideEditUserDialog} />
      <Button label="Salvar" icon="pi pi-check" text onClick={editExpense} />
    </>
  );

  const deleteExpenseDialogFooter = (
    <>
      <Button label="Não" icon="pi pi-times" text onClick={hideDeleteProductDialog} />
      <Button label="Sim" icon="pi pi-check" text onClick={deleteExpense} />
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
              value={expenses}
              selection={selectedExpenses}
              onSelectionChange={(e) => setSelectedExpenses(e.value as any)}
              paginator
              rows={5}
              rowsPerPageOptions={[5, 10, 25]}
              className="datatable-responsive"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Mostrando {first} até {last} de {totalRecords} Despesas"
              emptyMessage="Nenhuma despesa encontrada."
              header={header}
              responsiveLayout="scroll"
              filters={filters}
              filterDisplay="row"
              globalFilterFields={['name']}
            >
              <Column field="name" header="Nome" sortable body={nameBodyTemplate} headerStyle={{ minWidth: '15rem' }} />
              <Column field="status" header="Status" body={statusBodyTemplate} sortable headerStyle={{ minWidth: '10rem' }} />
              <Column body={actionBodyTemplate} header="Ações" headerStyle={{ minWidth: '10rem' }} />
            </DataTable>
          )}

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

          <Dialog visible={deleteExpenseDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteExpenseDialogFooter} onHide={hideDeleteProductDialog}>
            <div className="confirmation-content">
              <i className="pi pi-exclamation-triangle mr-3" />
              {expense && <span>Tem certeza que deseja excluir <b>{expense.name}</b>?</span>}
            </div>
          </Dialog>

          
        </div>
      </div>
    </div>
  );
};

export default ExpensesPage;
