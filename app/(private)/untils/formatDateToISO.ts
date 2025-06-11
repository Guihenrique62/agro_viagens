export function formatDateToISO(dateStr: string): string {
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month}-${day}T00:00:00.000Z`; // Data em UTC
}

export const formatDateToBR = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR'); // output: dd/mm/yyyy
};

export const formatDateToPadrao = (date: string) => {
  const dateObj = new Date(date);
  console.log(date)
  console.log(dateObj)
  if (isNaN(dateObj.getTime())) {
    return `Data inválida + ${date}`;

  }

  const [year, month, day] = dateObj.toISOString().split('T')[0].split('-');
  return `${day}/${month}/${year}`;
};
