export function formatCurrency(
  amount,
  currency = "INR"
) {

  const symbols = {

    INR: "₹",

    USD: "$",

    EUR: "€",

  };

  return `${symbols[currency] || ""}${Number(amount).toFixed(2)}`;

}