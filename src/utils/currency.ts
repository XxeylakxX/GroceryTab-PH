/**
 * Philippine Peso (₱) Currency and Number Utilities
 * Specially formatted with clear spacing for readability by elderly users
 */

export const formatPHP = (amount: number, showSymbol = true): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return showSymbol ? '₱0.00' : '0.00';
  }

  const parts = amount.toFixed(2).split('.');
  const wholePart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const decimalPart = parts[1];

  const formatted = `${wholePart}.${decimalPart}`;
  return showSymbol ? `₱${formatted}` : formatted;
};

export const parsePHP = (input: string): number => {
  if (!input) return 0;
  // Remove ₱, PHP, commas, spaces
  const cleaned = input.replace(/[₱\s,PHPphp]/g, '');
  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : Math.max(0, val);
};

export const formatDateTimePH = (isoString: string): { dateStr: string; timeStr: string } => {
  try {
    const d = new Date(isoString);
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const month = months[d.getMonth()];
    const day = d.getDate();
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 becomes 12

    return {
      dateStr: `${month} ${day}, ${year}`,
      timeStr: `${hours}:${minutes} ${ampm}`
    };
  } catch {
    return { dateStr: 'Invalid Date', timeStr: '' };
  }
};
