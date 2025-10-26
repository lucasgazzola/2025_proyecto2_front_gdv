import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { exportElementToPdf, exportInvoiceToPdf } from "@/lib/pdfExport";
import type { Invoice } from "@/types/Invoice";

export default function InvoiceExportButton({
  elementId,
  fileName,
  disabled,
  invoice,
}: {
  elementId: string;
  fileName?: string;
  disabled?: boolean;
  invoice?: Invoice | null;
}) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (disabled) return;
    setLoading(true);
    try {
      if (invoice) {
        await exportInvoiceToPdf(
          invoice,
          fileName ?? `factura-${invoice.id}.pdf`
        );
      } else {
        await exportElementToPdf(elementId, fileName ?? "invoice.pdf");
      }
      toast.success("PDF generado y descargado");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Error al exportar a PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleExport}
      disabled={disabled || loading}
      className="flex items-center gap-2"
      // Override computed color-related styles to safe hex values to avoid html2canvas
      // failing on unsupported color functions (e.g. oklch) coming from Tailwind variables.
      style={{
        color: "#000000",
        backgroundColor: "transparent",
        boxShadow: "none",
        borderColor: "#d1d5db",
      }}
    >
      <Download size={16} />
      {loading ? "Exportando..." : "Exportar PDF"}
    </Button>
  );
}
