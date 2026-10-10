async function initializeCounterIfNeeded(
  tx,
  shopId,
  {
    model,
    codeField,
    prefixField,
    counterField,
  }
) {
  let settings = await tx.setting.findUnique({
    where: { shopId },
  });

  if (!settings) {
    settings = await tx.setting.create({
      data: { shopId },
    });
  }

  // Already initialized
  if (settings[counterField] > 1) {
    return settings;
  }

  const latest = await tx[model].findFirst({
    where: {
      shopId,
    },
    orderBy: {
      id: "desc",
    },
  });

  if (!latest) {
    return settings;
  }

  const prefix = settings[prefixField];
  const code = latest[codeField];

  if (!code || !prefix || !code.startsWith(prefix)) {
    return settings;
  }

  const number = parseInt(
    code.slice(prefix.length),
    10
  );

  if (Number.isNaN(number)) {
    return settings;
  }

  return tx.setting.update({
    where: {
      shopId,
    },
    data: {
      [counterField]: number + 1,
    },
  });
}

async function generateCode(
  tx,
  shopId,
  {
    model,
    codeField,
    prefixField,
    counterField,
    digits = 4,
  }
) {
  const settings = await initializeCounterIfNeeded(
    tx,
    shopId,
    {
      model,
      codeField,
      prefixField,
      counterField,
    }
  );

  const prefix = settings[prefixField];
  const number = settings[counterField];

  const code =
    `${prefix}${String(number).padStart(digits, "0")}`;

  await tx.setting.update({
    where: {
      shopId,
    },
    data: {
      [counterField]: {
        increment: 1,
      },
    },
  });

  return code;
}

export async function generateInvoiceCode(tx, shopId) {
  return generateCode(tx, shopId, {
    model: "invoice",
    codeField: "invoiceCode",
    prefixField: "invoicePrefix",
    counterField: "nextInvoiceNumber",
    digits: 2,
  });
}

export async function generatePurchaseCode(tx, shopId) {
  return generateCode(tx, shopId, {
    model: "purchase",
    codeField: "purchaseCode",
    prefixField: "purchasePrefix",
    counterField: "nextPurchaseNumber",
  });
}

export async function generateCustomerCode(tx, shopId) {
  return generateCode(tx, shopId, {
    model: "customer",
    codeField: "customerCode",
    prefixField: "customerPrefix",
    counterField: "nextCustomerNumber",
  });
}

export async function generatePrescriptionCode(tx, shopId) {
  return generateCode(tx, shopId, {
    model: "prescription",
    codeField: "prescriptionCode",
    prefixField: "prescriptionPrefix",
    counterField: "nextPrescriptionNumber",
  });
}

export async function generateProductCode(tx, shopId) {
  return generateCode(tx, shopId, {
    model: "product",
    codeField: "sku",
    prefixField: "productPrefix",
    counterField: "nextProductNumber",
  });
}