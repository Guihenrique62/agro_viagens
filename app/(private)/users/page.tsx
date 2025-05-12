/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { set } from 'zod';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: number;
  password?: string;
}

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}


const UsersPage = () => {
  const emptyUser = {
    id: '',
    name: '',
    email: '',
    role: '',
    status: 1,
    password: '',
  };

  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User>(emptyUser);

  const [userDialog, setUserDialog] = useState(false);
  const [deleteUserDialog, setDeleteUserDialog] = useState(false);
  const [editUserDialog, setEditUserDialog] = useState(false);

  
  const [selectedUsers, setSelectedUsers] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const [globalFilter, setGlobalFilter] = useState('');
  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable<any>>(null);
  const [loading, setLoading] = useState(false);

  // BUsca a lista de usuarios
  const fetchUsers = async () => {
    try {

      const res = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Erro ao buscar os usuários:', data.error);
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao buscar os usuários.',
          life: 3000,
        });
        return;
      }

      setUsers(data);
    } catch (err) {
      console.error('Erro inesperado:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  //Abre o dialogo de novo usuario
  const openNew = () => {
    setUser(emptyUser);
    setSubmitted(false);
    setUserDialog(true);
  };

  //Abre o dialogo de editar usuario
  const openEdit = (user: User) => {
    setUser({ ...user });
    setSubmitted(false);
    setEditUserDialog(true);
  };

  // esconde o diagolo 
  const hideDialog = () => {
    setSubmitted(false);
    setUserDialog(false);
  };

  // esconde o dialogo de editar usuario
  const hideEditUserDialog = () => {
    setSubmitted(false);
    setEditUserDialog(false);
  };

  // esconde o dialogo de deletar usuario
  const hideDeleteProductDialog = () => setDeleteUserDialog(false);

  // Salva o usuario
  const saveUser = async () => {
    setSubmitted(true);

  if (user.name.trim() && user.email.trim() && user.password && user.role) {
    let _users = [...users];
    let _user = { ...user };

    if (user.id) {
      const index = findIndexById(user.id);
      _users[index] = _user;
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Usuário Atualizado',
        life: 3000,
      });
      setUsers(_users);
    } else {
      try {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            name: user.name,
            email: user.email,
            password: user.password,
            role: user.role,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Erro ao criar usuário');
        }

        const createdUser = await res.json();
        _user.id = createdUser.id; // assumindo que o back retorna o ID
        _users.push(_user);

        toast.current?.show({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Usuário Criado',
          life: 3000,
        });

        setUsers(_users);
      } catch (err: any) {
        console.error('Erro ao criar usuário:', err);
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: err.message || 'Erro ao criar usuário',
          life: 3000,
        });
        return;
      }
    }

    setUserDialog(false);
    setUser(emptyUser);
  }
  };

  // Edita o usuario
  const editUser = async () => {
    if (!user.id) return;
  
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          role: user.role,
        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        toast.current?.show({
          severity: 'error',
          summary: 'Erro',
          detail: data.error || 'Erro ao editar o usuário.',
          life: 3000,
        });
        return;
      }
  
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Usuário atualizado com sucesso.',
        life: 3000,
      });
  
      // Atualiza lista local
      const updatedUsers = users.map((u) => (u.id === user.id ? data : u));
      setUsers(updatedUsers);
      setUser(data);
      setEditUserDialog(false);
      setUser(emptyUser);
  
    } catch (err) {
      console.error('Erro ao editar usuário:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro inesperado ao editar usuário.',
        life: 3000,
      });
    }
  };
  
  // Deleta o usuario
  const deleteUser = async () => {
    if (!user.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
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
          detail: data.error || 'Erro ao Excluir o usuário.',
          life: 3000,
        });
        return;
      }
  
      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Usuário excluido com sucesso.',
        life: 3000,
      });
  
      // Atualiza lista local
      const updatedUsers = users.map((u) => (u.id === user.id ? data : u));
      setUsers(updatedUsers);
      setUser(data);
      setSelectedUsers(null);
      setDeleteUserDialog(false);
      fetchUsers()
      setUser(emptyUser);
      setLoading(false)
  
    } catch (err) {
      console.error('Erro ao excluir usuário:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro inesperado ao excluir usuário.',
        life: 3000,
      });
    }
  };


  // Confirma a exclusão do usuario
  const confirmDeleteProduct = (user: User) => {
    setUser(user);
    setDeleteUserDialog(true);
  };

  const findIndexById = (id: string) => users.findIndex((u) => u.id === id);

  const onInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    name: string
  ) => {
    const val = (e.target && e.target.value) || '';
    setUser({ ...user, [name]: val });
  };


  const nameBodyTemplate = (rowData: User) => <span>{rowData.name}</span>;
  const emailBodyTemplate = (rowData: User) => <span>{rowData.email}</span>;
  const roleBodyTemplate = (rowData: User) => <span>{rowData.role}</span>;

  const statusBodyTemplate = (rowData: User) => (
      <>
        {rowData.status === 1 ? (
          <span className="product-badge status-available">Ativo</span>
        ) : rowData.status === 2 ? (
          <span className="product-badge status-outofstock">Inativo</span>
        ) : null}
      </>
  );

  const actionBodyTemplate = (rowData: User) => (
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
      <Button label="Novo Usuário" icon="pi pi-plus" severity="success" className="mr-2" onClick={openNew} />
    </div>
  );


  const header = (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
      <h5 className="m-0">Cadastro de Usuários</h5>
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

  const UserDialogFooter = (
    <>
      <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
      <Button label="Salvar" icon="pi pi-check" text onClick={saveUser} />
    </>
  );

  const editUserDialogFooter = (
    <>
      <Button label="Cancelar" icon="pi pi-times" text onClick={hideEditUserDialog} />
      <Button label="Salvar" icon="pi pi-check" text onClick={editUser} />
    </>
  );

  const deleteUserDialogFooter = (
    <>
      <Button label="Não" icon="pi pi-times" text onClick={hideDeleteProductDialog} />
      <Button label="Sim" icon="pi pi-check" text onClick={deleteUser} />
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
              value={users}
              selection={selectedUsers}
              onSelectionChange={(e) => setSelectedUsers(e.value as any)}
              paginator
              rows={5}
              rowsPerPageOptions={[5, 10, 25]}
              className="datatable-responsive"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Mostrando {first} até {last} de {totalRecords} usuários"
              emptyMessage="Nenhum usuário encontrado."
              header={header}
              responsiveLayout="scroll"
            >
              <Column field="name" header="Nome" sortable body={nameBodyTemplate} headerStyle={{ minWidth: '15rem' }} />
              <Column field="email" header="E-mail" sortable body={emailBodyTemplate} headerStyle={{ minWidth: '15rem' }} />
              <Column field="role" header="Permissão" body={roleBodyTemplate} sortable />
              <Column field="status" header="Status" body={statusBodyTemplate} sortable headerStyle={{ minWidth: '10rem' }} />
              <Column body={actionBodyTemplate} header="Ações" headerStyle={{ minWidth: '10rem' }} />
            </DataTable>
          )}

          <Dialog visible={userDialog} style={{ width: '450px' }} header="Novo Usuário" modal className="p-fluid" footer={UserDialogFooter} onHide={hideDialog}>
            <div className="field">
              <label htmlFor="name">Nome</label>
              <InputText
                id="name"
                value={user.name}
                onChange={(e) => onInputChange(e, 'name')}
                required
                autoFocus
                className={classNames({ 'p-invalid': submitted && !user.name })}
              />
              {submitted && !user.name && <small className="p-invalid">O nome é obrigatório</small>}
            </div>
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <InputText
                id="email"
                value={user.email}
                onChange={(e) => onInputChange(e, 'email')}
                required
                className={classNames({ 'p-invalid': submitted && !user.email })}
              />
              {submitted && !user.email && <small className="p-invalid">O e-mail é obrigatório</small>}
            </div>
            <div className="field">
              <label htmlFor="password">Senha do Usuário</label>
              <InputText
                id="password"
                value={user.password}
                onChange={(e) => onInputChange(e, 'password')}
                required
                className={classNames({ 'p-invalid': submitted && !user.password })}
              />
              {submitted && !user.password && <small className="p-invalid">O usuário é obrigatório</small>}
            </div>
            <div className="field">
              <label htmlFor="role">Permissão</label>
              <Dropdown 
                value={user.role} 
                onChange={(e) => setUser({ ...user, role: e.value })} 
                options={['Administrador', 'UsuarioPadrao']} 
                placeholder="Selecione" className="w-full md:w-14rem" 
              />
              {submitted && !user.role && <small className="p-invalid">O usuário é obrigatório</small>}
            </div>
          </Dialog>

          <Dialog visible={editUserDialog} style={{ width: '450px' }} header="Editar Usuário" modal className="p-fluid" footer={editUserDialogFooter} onHide={hideEditUserDialog}>
            <div className="field">
                <label htmlFor="name">Nome</label>
                <InputText
                  id="name"
                  value={user.name}
                  onChange={(e) => onInputChange(e, 'name')}
                  required
                  autoFocus
                  className={classNames({ 'p-invalid': submitted && !user.name })}
                />
                {submitted && !user.name && <small className="p-invalid">O nome é obrigatório</small>}
              </div>
              <div className="field">
                <label htmlFor="email">E-mail</label>
                <InputText
                  id="email"
                  value={user.email}
                  onChange={(e) => onInputChange(e, 'email')}
                  required
                  className={classNames({ 'p-invalid': submitted && !user.email })}
                />
                {submitted && !user.email && <small className="p-invalid">O e-mail é obrigatório</small>}
              </div>
              <div className="field">
                <label htmlFor="role">Permissão</label>
                <Dropdown 
                  value={user.role} 
                  onChange={(e) => setUser({ ...user, role: e.value })} 
                  options={['Administrador', 'UsuarioPadrao']} 
                  placeholder="Selecione" className="w-full md:w-14rem" 
                />
                {submitted && !user.role && <small className="p-invalid">a permissão é obrigatório</small>}
              </div>
          </Dialog>

          <Dialog visible={deleteUserDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteUserDialogFooter} onHide={hideDeleteProductDialog}>
            <div className="confirmation-content">
              <i className="pi pi-exclamation-triangle mr-3" />
              {user && <span>Tem certeza que deseja excluir <b>{user.name}</b>?</span>}
            </div>
          </Dialog>

          
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
