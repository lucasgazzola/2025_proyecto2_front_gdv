import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { Invoice } from "@/types/Invoice";

// Exports a DOM element (by element or id) to a multipage PDF.
// Keeps logic encapsulated here so components don't directly depend on libs.
export async function exportElementToPdf(
  elementOrId: HTMLElement | string,
  fileName = "document.pdf",
  options?: { marginMm?: number }
) {
  const marginMm = options?.marginMm ?? 10;
  const element: HTMLElement | null =
    typeof elementOrId === "string"
      ? document.getElementById(elementOrId)
      : elementOrId;
  if (!element) throw new Error("Elemento a exportar no encontrado");

  // make a clone to avoid visual changes while capturing
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.boxSizing = "border-box";
  clone.style.width = `${element.offsetWidth}px`;
  clone.style.position = "relative";
  clone.style.left = "-9999px";
  document.body.appendChild(clone);

  try {
    const scale = 2; // better quality
    let canvas;
    try {
      canvas = await html2canvas(clone, {
        scale,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });
    } catch (err: any) {
      // html2canvas may throw when encountering unsupported CSS color functions (e.g. oklch).
      // Try a fallback: copy computed color-related styles from the original element to the clone
      // so colors are resolved to values the parser can handle, then retry once.
      const isOklchError =
        err &&
        err.message &&
        String(err.message).toLowerCase().includes("oklch");
      if (isOklchError) {
        try {
          const copyComputedColors = (source: Element, target: Element) => {
            try {
              const srcStyle = window.getComputedStyle(source as Element);
              const props = [
                "color",
                "background-color",
                "background",
                "border-color",
                "border-top-color",
                "border-right-color",
                "border-bottom-color",
                "border-left-color",
                "box-shadow",
              ];
              props.forEach((p) => {
                let v = srcStyle.getPropertyValue(p);
                if (!v) return;
                // If the computed value contains unsupported color functions like oklch/oklab,
                // try to coerce it by applying to a temporary element and reading the resolved value.
                const containsOkl = /oklch|oklab/i.test(v);
                if (containsOkl) {
                  try {
                    const temp = document.createElement("div");
                    temp.style.position = "absolute";
                    temp.style.left = "-9999px";
                    // apply the problematic value to the relevant css property
                    (temp.style as any).setProperty(p, v);
                    document.body.appendChild(temp);
                    const resolved = window
                      .getComputedStyle(temp)
                      .getPropertyValue(p);
                    document.body.removeChild(temp);
                    if (resolved && !/oklch|oklab/i.test(resolved)) {
                      v = resolved;
                    } else {
                      // fallback defaults: colors -> black, shadows/borders -> none
                      if (p.includes("color")) v = "#000000";
                      else if (p.includes("shadow")) v = "none";
                      else v = v.replace(/oklch\([^)]*\)/gi, "#000000");
                    }
                  } catch (e) {
                    // fallback if any step fails
                    if (p.includes("color")) v = "#000000";
                    else if (p.includes("shadow")) v = "none";
                  }
                }
                if (v) (target as HTMLElement).style.setProperty(p, v);
              });
            } catch (e) {
              // best-effort: ignore per-node failures
            }
            const srcChildren = Array.from(source.children || []);
            const tgtChildren = Array.from(target.children || []);
            for (
              let i = 0;
              i < srcChildren.length && i < tgtChildren.length;
              i++
            ) {
              copyComputedColors(srcChildren[i], tgtChildren[i]);
            }
          };

          copyComputedColors(element, clone);
          // retry
          canvas = await html2canvas(clone, {
            scale,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
          });
        } catch (retryErr) {
          // if retry fails, rethrow original error to be handled below
          throw err;
        }
      } else {
        throw err;
      }
    }

    const imgData = canvas.toDataURL("image/png");

    // Create jsPDF in mm units
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // image width in mm, considering margins
    const imgProps = canvas;
    const imgWidthPx = imgProps.width;
    const imgHeightPx = imgProps.height;

    const pxToMm = (px: number) => (px * 25.4) / 96; // 96 dpi conversion
    const imgWidthMm = pxToMm(imgWidthPx);
    const imgHeightMm = pxToMm(imgHeightPx);

    const availableWidth = pageWidth - marginMm * 2;
    const scaleFactor = Math.min(1, availableWidth / imgWidthMm);
    const renderWidth = imgWidthMm * scaleFactor;
    const renderHeight = imgHeightMm * scaleFactor;

    // If renderHeight fits on one page, just add it. Otherwise slice across pages.
    if (renderHeight <= pageHeight - marginMm * 2) {
      const x = (pageWidth - renderWidth) / 2;
      const y = marginMm;
      pdf.addImage(imgData, "PNG", x, y, renderWidth, renderHeight);
    } else {
      // Split into pages: draw the canvas in vertical slices
      const totalPages = Math.ceil(renderHeight / (pageHeight - marginMm * 2));

      for (let i = 0; i < totalPages; i++) {
        const canvasPage = document.createElement("canvas");
        const sx = 0;
        const sy =
          ((i * (pageHeight - marginMm * 2)) / pageHeight) * imgHeightPx;
        const sWidth = imgWidthPx;
        // calculate source height in px corresponding to target page height in mm
        const sHeight = Math.min(
          imgHeightPx - sy,
          ((pageHeight - marginMm * 2) / renderHeight) * imgHeightPx
        );

        canvasPage.width = sWidth;
        canvasPage.height = sHeight;
        const ctx = canvasPage.getContext("2d");
        if (!ctx) continue;
        ctx.drawImage(canvas, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);
        const imgPageData = canvasPage.toDataURL("image/png");
        const pageRenderHeight = pxToMm(sHeight) * scaleFactor;
        const x = (pageWidth - renderWidth) / 2;
        const y = marginMm;
        if (i > 0) pdf.addPage();
        pdf.addImage(imgPageData, "PNG", x, y, renderWidth, pageRenderHeight);
      }
    }

    pdf.save(fileName);
  } finally {
    // clean up clone
    clone.remove();
  }
}

// Generate a clean, professional PDF from invoice data (not DOM capture).
export async function exportInvoiceToPdf(
  invoice: Invoice,
  fileName = "invoice.pdf"
) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 12;
  let y = margin;

  const companyName = "InvoIQ";
  const companyRuc = "RUC: 20-12345678-9";

  pdf.setFontSize(18);
  pdf.text(companyName, margin, y);
  pdf.setFontSize(10);
  pdf.setTextColor(100);
  pdf.text(companyRuc, pageWidth - margin, y, { align: "right" });
  pdf.setTextColor(0);
  y += 8;

  pdf.setDrawColor(220);
  pdf.setLineWidth(0.2);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Invoice title + metadata
  pdf.setFontSize(14);
  pdf.text(`Factura ${invoice.id ?? ""}`, margin, y);
  pdf.setFontSize(10);
  const createdAt = invoice.createdAt
    ? new Date(invoice.createdAt).toLocaleString()
    : "-";
  pdf.text(createdAt, pageWidth - margin, y, { align: "right" });
  y += 8;

  // Customer block
  pdf.setFontSize(11);
  pdf.text("Cliente:", margin, y);
  const customerName = invoice.customer
    ? `${invoice.customer.firstName ?? ""} ${invoice.customer.lastName ?? ""}`
    : `${invoice.creator?.firstName ?? ""} ${invoice.creator?.lastName ?? ""}`;
  y += 6;
  pdf.setFontSize(10);
  pdf.text(customerName.trim() || "-", margin, y);
  y += 5;
  if (invoice.customer?.email) {
    pdf.text(`Email: ${invoice.customer.email}`, margin, y);
    y += 5;
  } else if (invoice.creator?.email) {
    pdf.text(`Email: ${invoice.creator.email}`, margin, y);
    y += 5;
  }
  if (invoice.customer?.phone) {
    pdf.text(`Tel: ${invoice.customer.phone}`, margin, y);
    y += 5;
  }
  if (invoice.customer?.address) {
    pdf.text(
      `${invoice.customer.address} ${invoice.customer.city ?? ""}`,
      margin,
      y
    );
    y += 6;
  }

  y += 2;

  // Table header
  pdf.setFontSize(10);
  const colX = [
    margin,
    margin + 20,
    pageWidth - margin - 60,
    pageWidth - margin,
  ];

  // header background
  pdf.setFillColor(245, 245, 245);
  pdf.rect(margin, y - 6, pageWidth - margin * 2, 8, "F");

  pdf.setTextColor(80);
  pdf.text("Cant.", colX[0], y);
  pdf.text("Descripción", colX[1], y);
  pdf.text("Precio unit.", colX[2], y, { align: "right" });
  pdf.text("Subtotal", colX[3], y, { align: "right" });
  pdf.setTextColor(0);
  y += 6;

  pdf.setLineWidth(0.1);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 4;

  // Table rows
  const items = invoice.invoiceDetails ?? invoice.items ?? [];
  const pageInnerHeight = pdf.internal.pageSize.getHeight() - margin;
  for (const it of items) {
    if (y + 12 > pageInnerHeight) {
      pdf.addPage();
      y = margin;
    }
    const qty = String(it.quantity ?? 0);
    const desc = it.product?.name ?? "";
    const unitVal = Number(it.unitPrice ?? 0);
    const subtotalVal = Number(
      it.subtotal ?? (it.unitPrice ?? 0) * (it.quantity ?? 0)
    );
    const unit = `$${unitVal.toLocaleString()}`;
    const subtotal = `$${subtotalVal.toLocaleString()}`;

    pdf.text(qty, colX[0], y);
    // wrap description if long
    const descLines = pdf.splitTextToSize(desc, colX[2] - colX[1] - 4);
    pdf.text(descLines, colX[1], y);
    const lastLineCount = Array.isArray(descLines) ? descLines.length : 1;
    pdf.text(unit, colX[2], y + (lastLineCount - 1) * 5, { align: "right" });
    pdf.setFont("helvetica", "bold");
    pdf.text(subtotal, colX[3], y + (lastLineCount - 1) * 5, {
      align: "right",
    });
    pdf.setFont("helvetica", "normal");
    y += lastLineCount * 6;
  }

  // Totals block
  y += 6;
  if (y + 30 > pageInnerHeight) {
    pdf.addPage();
    y = margin;
  }
  const subtotalVal = items.reduce(
    (s, it) => s + (it.subtotal ?? (it.unitPrice ?? 0) * (it.quantity ?? 0)),
    0
  );
  const total = invoice.priceTotal ?? subtotalVal;

  pdf.setFontSize(11);
  const rightColX = pageWidth - margin;
  const fmt = (n: number) => `$${n.toLocaleString()}`;
  pdf.text("Subtotal:", rightColX - 50, y, { align: "right" });
  pdf.text(fmt(subtotalVal), rightColX, y, {
    align: "right",
  });
  y += 6;
  pdf.text("Impuestos:", rightColX - 50, y, { align: "right" });
  pdf.text(fmt(0), rightColX, y, { align: "right" });
  y += 6;
  pdf.setFontSize(13);
  pdf.setFont("helvetica", "bold");
  // draw total box
  pdf.setFillColor(250, 250, 250);
  pdf.rect(rightColX - 52, y - 4, 52, 10, "F");
  pdf.text("Total:", rightColX - 50, y, { align: "right" });
  pdf.text(fmt(total || 0), rightColX, y, {
    align: "right",
  });

  // Footer
  pdf.setFontSize(9);
  pdf.text(
    "Gracias por su compra.",
    margin,
    pdf.internal.pageSize.getHeight() - margin + 2
  );

  pdf.save(fileName);
}
