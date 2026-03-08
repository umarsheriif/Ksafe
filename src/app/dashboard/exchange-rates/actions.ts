"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import Decimal from "decimal.js";

const schema = z.object({
  fromCurrency: z.string().min(1),
  toCurrency: z.string().min(1),
  rate: z.string().min(1),
  fiscalYearId: z.string().min(1),
});

export async function upsertExchangeRate(formData: FormData) {
  await requireRole("ADMIN", "FINANCE");

  const data = schema.parse({
    fromCurrency: formData.get("fromCurrency"),
    toCurrency: formData.get("toCurrency"),
    rate: formData.get("rate"),
    fiscalYearId: formData.get("fiscalYearId"),
  });

  await prisma.exchangeRate.upsert({
    where: {
      fromCurrency_toCurrency_fiscalYearId: {
        fromCurrency: data.fromCurrency as any,
        toCurrency: data.toCurrency as any,
        fiscalYearId: data.fiscalYearId,
      },
    },
    update: { rate: new Decimal(data.rate) },
    create: {
      fromCurrency: data.fromCurrency as any,
      toCurrency: data.toCurrency as any,
      rate: new Decimal(data.rate),
      fiscalYearId: data.fiscalYearId,
    },
  });
  revalidatePath("/dashboard/exchange-rates");
}
