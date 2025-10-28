/**
 * Formata uma string de CPF (apenas números) para o formato xxx.xxx.xxx-xx.
 * @param value A string vinda do input.
 * @returns A string formatada.
 */
export const formatCPF = (value: string): string => {
  const digitsOnly = value.replace(/\D/g, '');
  const truncatedDigits = digitsOnly.substring(0, 11);
  const len = truncatedDigits.length;

  if (len <= 3) {
    return truncatedDigits;
  } else if (len <= 6) {
    return truncatedDigits.replace(/^(\d{3})(\d{1,3})/, '$1.$2');
  } else if (len <= 9) {
    return truncatedDigits.replace(/^(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
  } else {
    return truncatedDigits.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
  }
};

/**
 * Formata uma string de telefone (apenas números) para os formatos
 * (xx) xxxx-xxxx ou (xx) xxxxx-xxxx.
 * @param value A string vinda do input.
 * @returns A string formatada.
 */
export const formatPhone = (value: string): string => {
  const digitsOnly = value.replace(/\D/g, '');
  const truncatedDigits = digitsOnly.substring(0, 11);
  const len = truncatedDigits.length;

  if (len === 0) {
    return '';
  } else if (len <= 2) {
    return `(${truncatedDigits}`;
  } else if (len <= 6) {
    return `(${truncatedDigits.substring(0, 2)}) ${truncatedDigits.substring(2)}`;
  } else if (len <= 10) {
    return `(${truncatedDigits.substring(0, 2)}) ${truncatedDigits.substring(2, 6)}-${truncatedDigits.substring(6)}`;
  } else { // len === 11
    return `(${truncatedDigits.substring(0, 2)}) ${truncatedDigits.substring(2, 7)}-${truncatedDigits.substring(7)}`;
  }
};

// Você pode adicionar outras máscaras aqui (CEP, Data, etc.) se precisar