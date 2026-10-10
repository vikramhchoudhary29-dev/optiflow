import prisma from "../config/prisma.js";

export async function countCustomers(shopId) {
  return prisma.customer.count({
    where: {
      shopId,
    },
  });
}

export async function findCustomerByMobile(shopId, mobile) {
  return prisma.customer.findFirst({
    where: {
      shopId,
      mobile,
    },
  });
}

export async function createCustomer(data) {
  return prisma.customer.create({
    data,
  });
}

export async function findCustomers(
  shopId,
  search = "",
  active
) {
  const where = {
    shopId,

    OR: [
      {
        name: {
          contains: search,
        },
      },
      {
        mobile: {
          contains: search,
        },
      },
      {
        customerCode: {
          contains: search,
        },
      },
    ],
  };

  if (active !== undefined) {
    where.active = active;
  }

  return prisma.customer.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
  });
}
export async function findCustomerById(shopId, id) {
  return prisma.customer.findFirst({
    where: {
      id: Number(id),
      shopId,
    },
  });
}

export async function updateCustomer(id, data) {
  return prisma.customer.update({
    where: {
      id: Number(id),
    },
    data,
  });
}

export async function updateCustomerStatus(id, active) {
  return prisma.customer.update({
    where: {
      id: Number(id),
    },
    data: {
      active,
    },
  });
}