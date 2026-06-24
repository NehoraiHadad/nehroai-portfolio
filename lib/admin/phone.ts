// Normalize a stored phone string into a wa.me-compatible international number
// (digits only, no '+'). Defaults Israeli local numbers (0XXXXXXXXX) to the
// +972 country code. Returns null when there are no usable digits.
export function toWhatsAppNumber(phone: string): string | null {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('0')) return '972' + digits.slice(1);
  return digits;
}
