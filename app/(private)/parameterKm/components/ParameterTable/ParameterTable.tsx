import { Button } from "primereact/button";
import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { InputText } from "primereact/inputtext"
import { Parameter } from "../../parameter.types";
import { useState } from "react";


const ParameterTable = ({
  parameters,
  openEdit,
  confirmDeleteProduct,
  filters,
  setFilters,
  dt



}: any) => {

  const [selectedParameters, setSelectedParameters] = useState(null);


  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let _filters = { ...filters };

    _filters['global'].value = value;

    setFilters(_filters);
  };

  const safeParameters = parameters.map((p: Parameter) => ({
    ...p,
    startDate: p.startDate ?? '',
    endDate: p.endDate ?? '',
    value: p.value ?? 0,
  }));

  const startBodyTemplate = (rowData: Parameter) => {
    let dateStr = rowData.startDate;

    let date: Date;

    if (typeof dateStr === 'string' && dateStr.includes('/')) {
      // Ex: "15/06/2025"
      const [day, month, year] = dateStr.split('/');
      date = new Date(`${year}-${month}-${day}`);
    } else {
      // Ex: "2025-06-15T00:00:00.000Z"
      date = new Date(dateStr);
    }

    if (isNaN(date.getTime())) {
      return <span style={{ color: 'red' }}>Data inválida</span>;
    }

    const formatted = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'UTC',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);

    return <span>{formatted}</span>;
  }

  const endBodyTemplate = (rowData: Parameter) => {
    let dateStr = rowData.endDate;

    let date: Date;

    if (typeof dateStr === 'string' && dateStr.includes('/')) {
      // Ex: "15/06/2025"
      const [day, month, year] = dateStr.split('/');
      date = new Date(`${year}-${month}-${day}`);
    } else {
      // Ex: "2025-06-15T00:00:00.000Z"
      date = new Date(dateStr);
    }

    if (isNaN(date.getTime())) {
      return <span style={{ color: 'red' }}>Data inválida</span>;
    }

    const formatted = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'UTC',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);

    return <span>{formatted}</span>;
  }

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

  return (

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


  )
}

export default ParameterTable