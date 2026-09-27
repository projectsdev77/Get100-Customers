import { getStripeClient } from "./client";

export interface InvoiceSummary {
  id: string;
  date: string;
  amount: string;
  status: string;
  hostedInvoiceUrl: string | null;
}

function formatAmount(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

// Real billing history (design handoff's "Billing history" list) instead of
// only a link to the Stripe portal — read-only, so no admin client needed;
// the founder's own subscription row already gates access to this page.
export async function listInvoices(customerId: string, limit = 5): Promise<InvoiceSummary[]> {
  const stripe = getStripeClient();
  const invoices = await stripe.invoices.list({ customer: customerId, limit });

  return invoices.data.map((invoice) => ({
    id: invoice.id ?? invoice.number ?? crypto.randomUUID(),
    date: new Date((invoice.created ?? 0) * 1000).toISOString(),
    amount: formatAmount(invoice.amount_paid || invoice.amount_due, invoice.currency),
    status: invoice.status ?? "unknown",
    hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
  }));
}
