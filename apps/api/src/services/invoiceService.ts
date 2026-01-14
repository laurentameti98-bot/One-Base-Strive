import * as invoiceRepo from '../repos/invoiceRepo.js';
import * as invoiceItemRepo from '../repos/invoiceItemRepo.js';
import * as invoiceCustomerRepo from '../repos/invoiceCustomerRepo.js';

interface InvoiceItemInput {
  description: string;
  quantity: number;
  unitPriceCents: number;
  taxRateBps: number;
  sortOrder?: number;
}

interface CreateInvoiceWithItemsData {
  customerId: string;
  invoiceNumber?: string;
  status: string;
  currency: string;
  issueDate: string;
  dueDate?: string;
  notes?: string;
  items: InvoiceItemInput[];
}

interface UpdateInvoiceWithItemsData {
  customerId?: string;
  invoiceNumber?: string;
  status?: string;
  currency?: string;
  issueDate?: string;
  dueDate?: string;
  notes?: string;
  items?: InvoiceItemInput[];
}

// Calculate totals from items
function calculateTotals(items: InvoiceItemInput[]) {
  let subtotalCents = 0;
  let taxCents = 0;

  for (const item of items) {
    const lineSubtotal = item.quantity * item.unitPriceCents;
    const lineTax = Math.round((lineSubtotal * item.taxRateBps) / 10000);

    subtotalCents += lineSubtotal;
    taxCents += lineTax;
  }

  return {
    subtotalCents,
    taxCents,
    totalCents: subtotalCents + taxCents,
  };
}

export async function createInvoiceWithItems(orgId: string, data: CreateInvoiceWithItemsData) {
  // Validate customer exists and belongs to org
  const customer = invoiceCustomerRepo.getInvoiceCustomerById(orgId, data.customerId);
  if (!customer) {
    throw new Error('Customer not found');
  }

  // Generate invoice number if not provided
  const invoiceNumber = data.invoiceNumber || invoiceRepo.generateInvoiceNumber(orgId);

  // Check invoice number uniqueness
  const existing = invoiceRepo.getInvoiceByNumber(orgId, invoiceNumber);
  if (existing) {
    throw new Error('Invoice number already exists');
  }

  // Calculate totals
  const totals = calculateTotals(data.items);

  // Create invoice
  const invoice = invoiceRepo.createInvoice(orgId, {
    customerId: data.customerId,
    invoiceNumber,
    status: data.status,
    currency: data.currency,
    issueDate: data.issueDate,
    dueDate: data.dueDate,
    notes: data.notes,
    ...totals,
  });

  // Create items
  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i];
    const lineSubtotal = item.quantity * item.unitPriceCents;
    const lineTax = Math.round((lineSubtotal * item.taxRateBps) / 10000);

    invoiceItemRepo.createInvoiceItem(orgId, {
      invoiceId: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      taxRateBps: item.taxRateBps,
      lineTotalCents: lineSubtotal + lineTax,
      sortOrder: item.sortOrder ?? i + 1,
    });
  }

  // Return invoice with items
  const items = invoiceItemRepo.listInvoiceItems(orgId, invoice.id);
  return { ...invoice, items };
}

export async function updateInvoiceWithItems(
  orgId: string,
  invoiceId: string,
  data: UpdateInvoiceWithItemsData
) {
  // Validate invoice exists and belongs to org
  const existingInvoice = invoiceRepo.getInvoiceById(orgId, invoiceId);
  if (!existingInvoice) {
    throw new Error('Invoice not found');
  }

  // Validate customer if changing
  if (data.customerId) {
    const customer = invoiceCustomerRepo.getInvoiceCustomerById(orgId, data.customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }
  }

  // Check invoice number uniqueness if changing
  if (data.invoiceNumber && data.invoiceNumber !== existingInvoice.invoiceNumber) {
    const existing = invoiceRepo.getInvoiceByNumber(orgId, data.invoiceNumber);
    if (existing) {
      throw new Error('Invoice number already exists');
    }
  }

  // If items are provided, recalculate totals and replace items
  let totals = {};
  if (data.items) {
    totals = calculateTotals(data.items);

    // Delete old items
    invoiceItemRepo.deleteInvoiceItemsByInvoiceId(orgId, invoiceId);

    // Create new items
    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      const lineSubtotal = item.quantity * item.unitPriceCents;
      const lineTax = Math.round((lineSubtotal * item.taxRateBps) / 10000);

      invoiceItemRepo.createInvoiceItem(orgId, {
        invoiceId,
        description: item.description,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
        taxRateBps: item.taxRateBps,
        lineTotalCents: lineSubtotal + lineTax,
        sortOrder: item.sortOrder ?? i + 1,
      });
    }
  }

  // Update invoice
  const invoice = invoiceRepo.updateInvoice(orgId, invoiceId, {
    ...data,
    ...totals,
  });

  // Return invoice with items
  const items = invoiceItemRepo.listInvoiceItems(orgId, invoiceId);
  return { ...invoice!, items };
}

export function getInvoiceWithItems(orgId: string, invoiceId: string) {
  const invoice = invoiceRepo.getInvoiceById(orgId, invoiceId);
  if (!invoice) {
    return null;
  }

  const items = invoiceItemRepo.listInvoiceItems(orgId, invoiceId);
  return { ...invoice, items };
}

export function deleteInvoiceWithItems(orgId: string, invoiceId: string) {
  // Items will be cascade deleted by FK constraint
  invoiceRepo.deleteInvoice(orgId, invoiceId);
}
