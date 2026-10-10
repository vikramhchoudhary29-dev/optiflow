import prisma from "../../config/prisma.js";

const startOfDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

export async function getDashboardSummary(shopId) {
  const today = startOfDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6);

  const [
    todaySales,
    yesterdaySales,
    totalCustomers,
    newCustomersThisWeek,
    pendingDeliveries,
    products,
    recentInvoices,
    weeklyInvoices,
    categoryItems,
  ] = await Promise.all([
    prisma.invoice.aggregate({
      where: { shopId, invoiceDate: { gte: today, lt: tomorrow }, deliveryStatus: { not: "CANCELLED" } },
      _sum: { grandTotal: true },
    }),
    prisma.invoice.aggregate({
      where: { shopId, invoiceDate: { gte: yesterday, lt: today }, deliveryStatus: { not: "CANCELLED" } },
      _sum: { grandTotal: true },
    }),
    prisma.customer.count({ where: { shopId, active: true } }),
    prisma.customer.count({ where: { shopId, active: true, createdAt: { gte: weekStart } } }),
    prisma.invoice.count({ where: { shopId, deliveryStatus: { in: ["PENDING", "READY"] } } }),
    prisma.product.findMany({
      where: { shopId, active: true },
      select: { id: true, name: true, sku: true, stock: true, minimumStock: true, purchasePrice: true, category: { select: { name: true } } },
    }),
    prisma.invoice.findMany({
      where: { shopId },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { name: true, mobile: true } } },
    }),
    prisma.invoice.findMany({
      where: { shopId, invoiceDate: { gte: weekStart, lt: tomorrow }, deliveryStatus: { not: "CANCELLED" } },
      select: { invoiceDate: true, grandTotal: true },
    }),
    prisma.invoiceitem.findMany({
      where: { invoice: { shopId, invoiceDate: { gte: weekStart, lt: tomorrow }, deliveryStatus: { not: "CANCELLED" } } },
      select: { total: true, product: { select: { category: { select: { name: true } } } }, itemType: true },
    }),
  ]);

  const lowStockItems = products.filter((product) => product.stock <= product.minimumStock);
  const salesByDay = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + index);
    const total = weeklyInvoices
      .filter((invoice) => startOfDay(invoice.invoiceDate).getTime() === date.getTime())
      .reduce((sum, invoice) => sum + Number(invoice.grandTotal), 0);
    return { date: date.toISOString(), total };
  });

  const categoryTotals = new Map();
  categoryItems.forEach((item) => {
    const category = item.product?.category?.name || item.itemType || "Other";
    categoryTotals.set(category, (categoryTotals.get(category) || 0) + Number(item.total));
  });
  const salesByCategory = [...categoryTotals.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);

  return {
    todaySales: Number(todaySales._sum.grandTotal || 0),
    yesterdaySales: Number(yesterdaySales._sum.grandTotal || 0),
    totalCustomers,
    newCustomersThisWeek,
    pendingDeliveries,
    lowStock: lowStockItems.length,
    lowStockItems: lowStockItems.map((item) => ({ ...item, purchasePrice: Number(item.purchasePrice), stockValue: Number(item.purchasePrice) * item.stock })),
    recentInvoices,
    salesByDay,
    salesByCategory,
  };
}
