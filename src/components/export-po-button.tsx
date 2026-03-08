"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";

interface POData {
  poNumber: string;
  description?: string | null;
  status: string;
  totalAmount: string;
  currency: string;
  createdAt: string;
  vendor: { name: string; email: string };
  department: { name: string };
  requester: { name: string };
  lineItems: {
    description: string;
    quantity: string;
    unitPrice: string;
    totalPrice: string;
  }[];
}

export function ExportPOButton({ data }: { data: POData }) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const { generatePOPDF } = await import("@/components/po-pdf");
      await generatePOPDF(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={loading}>
      <Download className="mr-2 h-4 w-4" />
      {loading ? "Generating..." : "Export PDF"}
    </Button>
  );
}
