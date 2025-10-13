import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Search, Plus } from "lucide-react";
import { productService } from "@/services/factories/productServiceFactory";
import { providerService } from "@/services/factories/providerServiceFactory";
import { toast } from "react-toastify";
import useAuth from "@/hooks/useAuth";
import type { ProductDto } from "@/types/Product";
import DeleteButton from "@/components/common/DeleteButton";
import { Card, CardContent } from "@/components/ui/card";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import { invoiceService } from "@/services/factories/invoiceServiceFactory";
import type { InvoiceLine, Invoice, Added } from "@/types/Invoice";


export default function AgregarFactura() {
  const { logout, getAccessToken } = useAuth();

  const [productos, setProductos] = useState<ProductDto[]>([]);
  const [added, setAdded] = useState<Added[]>([]);
  const [search, setSearch] = useState("");
  const [providers, setProviders] = useState<string[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [providersSelected, setProvidersSelected] = useState<Record<string, string>>({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);

  const handleAgregar = (product: ProductDto, qty: number, provider: string) => {
    // prevent adding without provider
    if (!provider) {
      toast.error("Seleccione un proveedor antes de agregar el producto.");
      return;
    }

    const lineSubtotal = (product.price || 0) * qty;
    const existing = added.find((a) => a.id === product.id && a.provider === provider);
    if (existing) {
      setAdded((prev) =>
        prev.map((a) =>
          a.id === product.id && a.provider === provider
            ? { ...a, quantity: (a.quantity || 0) + qty, subtotal: (a.subtotal || 0) + lineSubtotal }
            : a
        )
      );
    } else {
      const toAdd: Added = {
        id: product.id,
        name: product.name,
        provider: provider,
        quantity: qty,
        unitPrice: product.price || 0,
        subtotal: lineSubtotal,
      };
      setAdded((prev) => [...prev, toAdd]);
    }
  };

  const productosFiltrados = productos.filter((p) =>
    (p.name || "").toLowerCase().includes(search.toLowerCase())
  );

  // load products and providers from mock services on mount (uses token like Products)
  useEffect(() => {
    const load = async () => {
      const token = getAccessToken();
      if (!token) {
        toast.error("Por favor, inicia sesión para acceder a esta sección.");
        logout();
        return;
      }

      const prodRes = await productService.getAllProducts(token);
      if (prodRes.success && prodRes.products) {
        setProductos(prodRes.products);
        const initialQuantities: Record<string, number> = {};
        prodRes.products.forEach((p) => (initialQuantities[p.id] = 1));
        setQuantities(initialQuantities);
      }

      const provRes = await providerService.getAllProviders(token);
      if (provRes.success && provRes.providers) {
        setProviders(provRes.providers.map((p) => p.name));
      }
    };
    load();
  }, []);


  // 🟩 INICIO MODIFICACIÓN: mover lógica del botón "Confirmar" a una función aparte
  const handleConfirmInvoice = async () => {
    if (added.length === 0) return;

    const token = getAccessToken();
    if (!token) {
      toast.error("Por favor inicia sesión.");
      logout();
      return;
    }

    // Construir la factura
    const lines: InvoiceLine[] = added.map((a) => ({
      // Added already tiene la forma requerida por InvoiceLine
      id: a.id,
      name: a.name,
      provider: a.provider,
      quantity: a.quantity,
      unitPrice: a.unitPrice,
      subtotal: a.subtotal,
    } as unknown as InvoiceLine));

    const invoice: Invoice = {
      lines: lines as unknown as InvoiceLine[],
      priceTotal: lines.reduce((s, l) => s + (l.subtotal || 0), 0),
    };

    try {
      setIsCreatingInvoice(true);
      const res = await invoiceService.createInvoice(token, invoice);
      if (res.success) {
        toast.success("Factura creada correctamente.");
        setAdded([]); // opcional: limpiar
      } else {
        const resultWithMessage = res as { message?: string };
        toast.error(resultWithMessage.message || "Error al crear la factura.");
      }
    } catch {
      toast.error("Ocurrió un error al enviar la factura.");
    } finally {
      setIsCreatingInvoice(false);
    }
  };
  // 🟩 FIN MODIFICACIÓN


  const total = added.reduce((acc, p) => acc + (p.subtotal || 0), 0);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-center">Agregar Factura</h1>
      <Card className="space-y-6 p-6">
        <CardContent className="p-2">
          {/* Buscador */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-1/2  bg-gray-50">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={16} />
              </span>
              <Input
                placeholder="Buscar"
                className="w-full pl-10 border-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button>Buscar</Button>
            <Button className="absolute right-20">Ver Historial</Button>
          </div>
        </CardContent>
        <CardContent className="p-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Tabla izquierda */}
            <div className="border rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-2 text-sm text-gray-600 flex justify-between">
                <span>Encontrados {productosFiltrados.length} elementos</span>
              </div>
              <div className="overflow-y-auto max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Proveedor</TableHead>
                      <TableHead>Cantidad</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productosFiltrados.map((p: ProductDto) => (
                        <TableRow key={p.id} className="hover:bg-primary/10 transition">
                          <TableCell>{p.name}</TableCell>
                          <TableCell>{p.id}</TableCell>
                          <TableCell>${(p.price || 0).toLocaleString()}</TableCell>
                          <TableCell>
                            <Select
                              value={providersSelected[p.id] ?? ""}
                              onValueChange={(v) =>
                                setProvidersSelected((prev) => ({ ...prev, [p.id]: v }))
                              }
                            >
                              <SelectTrigger className="w-32 h-8 text-sm">
                                <SelectValue placeholder="Proveedor" />
                              </SelectTrigger>
                              <SelectContent>
                                {providers.map((prov) => (
                                  <SelectItem key={prov} value={prov}>
                                    {prov}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center gap-2 justify-center">
                              <Input
                                type="number"
                                value={quantities[p.id] ?? 1}
                                min={1}
                                className="w-15 h-8 text-sm"
                                onChange={(e) =>
                                  setQuantities((prev) => ({
                                    ...prev,
                                    [p.id]: Math.max(1, Number(e.target.value) || 1),
                                  }))
                                }
                              />
                              <Button
                                size="sm"
                                className="rounded-full h-8 w-8 p-0"
                                onClick={() =>
                                  handleAgregar(p, quantities[p.id] ?? 1, providersSelected[p.id] ?? "")
                                }
                              >
                                <Plus size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Tabla derecha */}
            <div className="border rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-2 text-sm text-gray-600 flex justify-between">
                <span>Productos agregados ({added.length})</span>
              </div>
              <div className="overflow-y-auto max-h-[400px]">
                <div className="text-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Proveedor</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Subtotal</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {added.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-400">
                          Aún no se han agregado productos
                        </TableCell>
                      </TableRow>
                    ) : (
                      added.map((p) => (
                        <TableRow key={`${p.id}-${p.provider}`}>
                          <TableCell>{p.name}</TableCell>
                          <TableCell>{p.id}</TableCell>
                          <TableCell>{p.provider || "—"}</TableCell>
                          <TableCell>{p.quantity ?? 1}</TableCell>
                          <TableCell>${(p.subtotal || 0).toLocaleString()}</TableCell>
                          <TableCell className="text-center">
                            <DeleteButton
                              handleDelete={() =>
                                setAdded((prev) => prev.filter((x) => !(x.id === p.id && x.provider === p.provider)))
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                </div>
              </div>
            </div>
          </div>

          {/* Totales */}
          <div className="flex justify-between items-center border-t pt-4">
            <div className="text-lg">
              <strong>Total:</strong> ${total.toLocaleString()}
            </div>
            <div className="flex gap-4">
                <Button variant="destructive" onClick={() => setDeleteModalOpen(true)} disabled={added.length === 0}>
                  Borrar Factura
                </Button>
                <Button
                  onClick={handleConfirmInvoice}
                  disabled={added.length === 0 || isCreatingInvoice}
                >
                  {isCreatingInvoice ? "Enviando..." : "Confirmar"}
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          setAdded([]);
          setDeleteModalOpen(false);
          toast.success("Se han eliminado todos los productos de la factura.");
        }}
      />
    </div>
  );
}
