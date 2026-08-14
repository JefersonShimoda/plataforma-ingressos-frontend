/**
 * Format currency to Brazilian Real (BRL)
 * e.g., 150 -> "R$ 150,00"
 */
export const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Format ISO date string to Brazilian Date/Time
 * e.g., "2026-10-25T21:00:00" -> "25 de Outubro • 21:00" or "25/10/2026 21:00"
 */
export const formatDateTime = (
  dateString: string | undefined | null,
  options?: { showYear?: boolean; longMonth?: boolean }
): string => {
  if (!dateString) return 'Data a confirmar';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    if (options?.longMonth) {
      const day = date.getDate().toString().padStart(2, '0');
      const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      if (options.showYear) {
        return `${day} de ${month}, ${year} • ${hours}:${minutes}`;
      }
      return `${day} ${month} • ${hours}:${minutes}`;
    }

    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return dateString || '';
  }
};

/**
 * Format date for input datetime-local fields (YYYY-MM-DDTHH:mm)
 */
export const formatForDateTimeInput = (date: Date = new Date()): string => {
  const pad = (num: number) => num.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Format countdown seconds into MM:SS
 * e.g., 599 -> "09:59"
 */
export const formatCountdown = (seconds: number): string => {
  if (seconds <= 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
