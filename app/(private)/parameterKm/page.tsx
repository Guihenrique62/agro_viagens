/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';

import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import React, { useEffect, useRef, useState } from 'react';
import { FilterMatchMode } from 'primereact/api';
import { Parameter } from './parameter.types';
import ParameterTable from './components/ParameterTable/ParameterTable';
import { getParameters } from './untils/getParameters';
import { saveParameter } from './untils/saveParameter';
import { editParameter } from './untils/editParameter';
import { deleteParameter } from './untils/deleteParameter';
import ParameterDialog from './components/ParameterDialog/ParameterDialog';



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

  
  const [submitted, setSubmitted] = useState(false);

  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable<any>>(null);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    getParameters(toast,setParameters);
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
  const hideEditDialog = () => {
    setSubmitted(false);
    setEditParameterDialog(false);
  };

  // esconde o dialogo de deletar Parameter
  const hideDeleteProductDialog = () => setDeleteParameterDialog(false);



  // Salva o parametro
  const handleSaveParameter = () => {
    saveParameter(
      setSubmitted,
      parameter,
      parameters,
      setParameter,
      setParameters,
      setParameterDialog,
      toast,
      emptyParameter
    )
  }


  // Edita o parametro
  const handleEditParameter = () => {
    editParameter(
      parameter,
      parameters,
      setEditParameterDialog,
      setParameter,
      setParameters,
      toast,
      emptyParameter
    )
  }
  
  // Deleta o parametro
  const handleDeleteParameter = () => {
    deleteParameter(
      parameter,
      parameters,
      setLoading,
      setParameters,
      setParameter,
      setDeleteParameterDialog,
      getParameters,
      toast,
      emptyParameter
    )
  }


  // Confirma a exclusão do despesa
  const confirmDeleteProduct = (parameter: Parameter) => {
    setParameter(parameter);
    setDeleteParameterDialog(true);
  };

  const leftToolbarTemplate = () => (
    <div className="my-2">
      <Button label="Novo Paramêtro" icon="pi pi-plus" severity="success" className="mr-2" onClick={openNew} />
    </div>
  );

  const parameterDialogFooter = (
    <>
      <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
      <Button label="Salvar" icon="pi pi-check" text onClick={handleSaveParameter} />
    </>
  );

  const editParameterDialogFooter = (
    <>
      <Button label="Cancelar" icon="pi pi-times" text onClick={hideEditDialog} />
      <Button label="Salvar" icon="pi pi-check" text onClick={handleEditParameter} />
    </>
  );

  const deleteParameterDialogFooter = (
    <>
      <Button label="Não" icon="pi pi-times" text onClick={hideDeleteProductDialog} />
      <Button label="Sim" icon="pi pi-check" text onClick={handleDeleteParameter} />
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
            
            <ParameterTable 
              parameters={parameters}
              openEdit={openEdit}
              confirmDeleteProduct={confirmDeleteProduct}
              filters={filters}
              setFilters={setFilters}
              dt={dt}
            /> 
           
          )}


          {/* Salvar Parametro */}

          <ParameterDialog 
            parameterDialog={parameterDialog}
            footer= {parameterDialogFooter}
            hideDialog= {hideDialog}
            parameter= {parameter}
            setParameter={setParameter}
            submitted={submitted}
            header={'Salvar Parametro'}
          />


          {/* Editar Parametro */}

          <ParameterDialog 
            parameterDialog={editParameterDialog}
            footer= {editParameterDialogFooter}
            hideDialog= {hideEditDialog}
            parameter= {parameter}
            setParameter={setParameter}
            submitted={submitted}
            header={'Editar Parametro'}
          
          />

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
