export function money(value = 0) {
  return `₹ ${Number(value).toFixed(2)}`;
}