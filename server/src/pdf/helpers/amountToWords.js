const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function twoDigits(num) {
  if (num < 20) return ONES[num];

  const ten = Math.floor(num / 10);
  const one = num % 10;

  return `${TENS[ten]}${one ? " " + ONES[one] : ""}`.trim();
}

function threeDigits(num) {
  let result = "";

  const hundred = Math.floor(num / 100);
  const rest = num % 100;

  if (hundred) {
    result += `${ONES[hundred]} Hundred`;
  }

  if (rest) {
    result += `${result ? " " : ""}${twoDigits(rest)}`;
  }

  return result.trim();
}

function integerToWords(num) {
  if (num === 0) return "Zero";

  let words = "";

  const crore = Math.floor(num / 10000000);
  num %= 10000000;

  const lakh = Math.floor(num / 100000);
  num %= 100000;

  const thousand = Math.floor(num / 1000);
  num %= 1000;

  const hundred = num;

  if (crore) {
    words += `${threeDigits(crore)} Crore `;
  }

  if (lakh) {
    words += `${threeDigits(lakh)} Lakh `;
  }

  if (thousand) {
    words += `${threeDigits(thousand)} Thousand `;
  }

  if (hundred) {
    words += `${threeDigits(hundred)}`;
  }

  return words.trim();
}

export function amountToWords(amount = 0) {
  amount = Number(amount);

  if (Number.isNaN(amount)) {
    return "Zero Rupees Only";
  }

  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  let words = `${integerToWords(rupees)} Rupees`;

  if (paise > 0) {
    words += ` and ${integerToWords(paise)} Paise`;
  }

  return `${words} Only`;
}

export default amountToWords;