/* eslint-disable @next/next/no-img-element */
'use client';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import React, { useEffect, useRef, useState } from 'react';
import { getExpenses } from './untils/getExpenses';
import { Expense } from './expenses.types';
import { saveExpense } from './untils/saveExpense';
import { editExpense } from './untils/editExpense';
import { deleteExpense } from './untils/deleteExpense';
import { ExpenseDialog } from './components/ExpenseDialog/ExpenseDialog';

import { ExpenseDialogEdit } from './components/ExpenseDialogEdit/ExpenseDialogEdit';
import ExpenseTable from './components/ExpenseTable/ExpenseTable';




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


  useEffect(() => {
    getExpenses(toast, setExpenses);
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
  const handleSaveExpense = () => {
    saveExpense(
      expense,
      setExpenseDialog,
      setExpense,
      setExpenses,
      expenses,
      toast,
      setSubmitted,
      emptyExpense,
      findIndexById
    )
}

  // Edita a Despesa
   const handleEditExpense = () => {
     editExpense(
      expense,
      setEditExpenseDialog,
      setExpense,
      setExpenses,
      expenses,
      toast,
      emptyExpense
     )
 }
  
  // Deleta a despesa
  const handleDeleteExpense = () => {
    deleteExpense(
      expense,
      setDeleteExpenseDialog,
      setExpense,
      setExpenses,
      expenses,
      toast,
      emptyExpense,
      setSelectedExpenses,
      setLoading
    )
  }


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
      <Button label="Salvar" icon="pi pi-check" text onClick={handleSaveExpense} />
    </>
  );

  const editExpenseDialogFooter = (
    <>
      <Button label="Cancelar" icon="pi pi-times" text onClick={hideEditUserDialog} />
      <Button label="Salvar" icon="pi pi-check" text onClick={handleEditExpense} />
    </>
  );

  const deleteExpenseDialogFooter = (
    <>
      <Button label="Não" icon="pi pi-times" text onClick={hideDeleteProductDialog} />
      <Button label="Sim" icon="pi pi-check" text onClick={handleDeleteExpense} />
    </>
  );


  return (
    <div className="grid crud-demo">
      <div className="col-12">
        <div className="card">
          
          <Toast ref={toast} />
          <Toolbar className="mb-4" left={leftToolbarTemplate}  />
          
          <ExpenseTable 
            dt={dt}
            expenses={expenses}
            selectedExpenses={selectedExpenses}
            setSelectedExpenses={setSelectedExpenses}
            loading={loading}
            header={header}
            filters={filters}
            nameBodyTemplate={nameBodyTemplate}
            statusBodyTemplate={statusBodyTemplate}
            actionBodyTemplate={actionBodyTemplate}

          />

          <ExpenseDialog 
            expenseDialog={expenseDialog}
            expense={expense}
            hideDialog={hideDialog}
            onInputChange={onInputChange}
            submitted={submitted}
            expenseDialogFooter={expenseDialogFooter}
          />

          <ExpenseDialogEdit 
            editExpenseDialog={editExpenseDialog}
            expense={expense}
            hideEditUserDialog={hideEditUserDialog}
            onInputChange={onInputChange}
            submitted={submitted}
            editExpenseDialogFooter={editExpenseDialogFooter}
          />

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
