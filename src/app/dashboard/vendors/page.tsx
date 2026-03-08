import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { VendorForm } from "./vendor-form";
import { approveVendor, rejectVendor } from "./actions";

export default async function VendorsPage() {
  const user = await requireAuth();

  const vendors = await prisma.vendor.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  const canApprove = ["ADMIN", "FINANCE"].includes(user.role);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Vendors</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader><CardTitle>Add Vendor</CardTitle></CardHeader>
            <CardContent>
              <VendorForm />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>All Vendors</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Status</TableHead>
                    {canApprove && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-medium">{vendor.name}</TableCell>
                      <TableCell>{vendor.email}</TableCell>
                      <TableCell>{vendor.currency}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            vendor.status === "APPROVED"
                              ? "success"
                              : vendor.status === "REJECTED"
                              ? "destructive"
                              : "warning"
                          }
                        >
                          {vendor.status}
                        </Badge>
                      </TableCell>
                      {canApprove && (
                        <TableCell className="space-x-1">
                          {vendor.status === "PENDING" && (
                            <>
                              <form action={approveVendor.bind(null, vendor.id)} className="inline">
                                <Button variant="outline" size="sm" type="submit">Approve</Button>
                              </form>
                              <form action={rejectVendor.bind(null, vendor.id)} className="inline">
                                <Button variant="destructive" size="sm" type="submit">Reject</Button>
                              </form>
                            </>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {vendors.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={canApprove ? 5 : 4} className="text-center text-muted-foreground">
                        No vendors yet
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
