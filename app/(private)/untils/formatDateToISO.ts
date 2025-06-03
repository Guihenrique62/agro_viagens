
export function formatDateToISO(dateStr: string): string {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`; // yyyy-MM-dd
}

export const formatDateToBR = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR'); // output: dd/mm/yyyy
};