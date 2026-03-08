import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { FiscalYearForm } from "./fiscal-year-form";
import { setCurrentFiscalYear, toggleLockFiscalYear } from "./actions";

export default async function FiscalYearsPage() {
  await requireRole("ADMIN", "FINANCE");

  const fiscalYears = await prisma.fiscalYear.findMany({
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Fiscal Years</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add Fiscal Year</CardTitle>
            </CardHeader>
            <CardContent>
              <FiscalYearForm />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>All Fiscal Years</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fiscalYears.map((fy) => (
                    <TableRow key={fy.id}>
                      <TableCell className="font-medium">{fy.name}</TableCell>
                      <TableCell>{formatDate(fy.startDate)}</TableCell>
                      <TableCell>{formatDate(fy.endDate)}</TableCell>
                      <TableCell className="space-x-1">
                        {fy.isCurrent && <Badge variant="success">Current</Badge>}
                        {fy.isLocked && <Badge variant="warning">Locked</Badge>}
                        {!fy.isCurrent && !fy.isLocked && <Badge variant="secondary">Inactive</Badge>}
                      </TableCell>
                      <TableCell className="space-x-1">
                        {!fy.isCurrent && (
                          <form action={setCurrentFiscalYear.bind(null, fy.id)} className="inline">
                            <Button variant="outline" size="sm" type="submit">
                              Set Current
                            </Button>
                          </form>
                        )}
                        <form action={toggleLockFiscalYear.bind(null, fy.id)} className="inline">
                          <Button variant="ghost" size="sm" type="submit">
                            {fy.isLocked ? "Unlock" : "Lock"}
                          </Button>
                        </form>
                      </TableCell>
                    </TableRow>
                  ))}
                  {fiscalYears.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No fiscal years yet
                      </TableCell>
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
