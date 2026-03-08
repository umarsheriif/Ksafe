import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { ExchangeRateForm } from "./exchange-rate-form";

export default async function ExchangeRatesPage() {
  await requireRole("ADMIN", "FINANCE");

  const [rates, fiscalYears] = await Promise.all([
    prisma.exchangeRate.findMany({
      orderBy: { createdAt: "desc" },
      include: { fiscalYear: true },
    }),
    prisma.fiscalYear.findMany({ orderBy: { startDate: "desc" } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Exchange Rates</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader><CardTitle>Set Rate</CardTitle></CardHeader>
            <CardContent>
              <ExchangeRateForm fiscalYears={fiscalYears} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>All Rates</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Fiscal Year</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rates.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.fromCurrency}</TableCell>
                      <TableCell>{r.toCurrency}</TableCell>
                      <TableCell className="font-mono">{r.rate.toString()}</TableCell>
                      <TableCell>{r.fiscalYear.name}</TableCell>
                      <TableCell>{formatDate(r.updatedAt)}</TableCell>
                    </TableRow>
                  ))}
                  {rates.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">No rates yet</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
