import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { ThresholdForm } from "./threshold-form";
import { toggleThreshold } from "./actions";

export default async function ApprovalThresholdsPage() {
  await requireRole("ADMIN");

  const thresholds = await prisma.approvalThreshold.findMany({
    orderBy: { minAmount: "asc" },
    include: { roles: { orderBy: { stepOrder: "asc" } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Approval Thresholds</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader><CardTitle>Add Threshold</CardTitle></CardHeader>
            <CardContent>
              <ThresholdForm />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>All Thresholds</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Range</TableHead>
                    <TableHead>Approval Chain</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {thresholds.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell>
                        {formatCurrency(t.minAmount.toString(), t.currency)} - {formatCurrency(t.maxAmount.toString(), t.currency)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {t.roles.map((r) => (
                            <Badge key={r.id} variant="outline">
                              {r.stepOrder}. {r.role}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={t.isActive ? "success" : "secondary"}>
                          {t.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <form action={toggleThreshold.bind(null, t.id)}>
                          <Button variant="ghost" size="sm" type="submit">
                            {t.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </form>
                      </TableCell>
                    </TableRow>
                  ))}
                  {thresholds.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">No thresholds yet</TableCell>
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
