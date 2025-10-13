import { useState, useEffect, useMemo, useCallback, memo, useRef } from "react";
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
import { Search, Plus, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import FetchingSpinner from "@/components/common/FetchingSpinner";
import { productService } from "@/services/factories/productServiceFactory";
import { providerService } from "@/services/factories/providerServiceFactory";
import { toast } from "react-toastify";
import useAuth from "@/hooks/useAuth";
import type { ProductDto } from "@/types/Product";
import type { Provider } from "@/types/Provider";
import DeleteButton from "@/components/common/DeleteButton";
import { Card, CardContent } from "@/components/ui/card";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import { invoiceService } from "@/services/factories/invoiceServiceFactory";
import type { Invoice, InvoiceDetail } from "@/types/Invoice";

export default function AgregarFactura() {
  const { logout, getAccessToken } = useAuth();

  const [productos, setProductos] = useState<ProductDto[]>([]);
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetail[]>([]);
  const [search, setSearch] = useState("");
  const [providers, setProviders] = useState<Provider[]>([]);
  // store only providerId to avoid holding objects in per-row state (reduces re-renders)
  type Selection = { quantity: number; providerId?: string };
  const [selections, setSelections] = useState<Record<string, Selection>>({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  // estados de carga separados para que la interfaz sea responsiva
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingProviders, setLoadingProviders] = useState(false);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleAgregar = useCallback(
    (product: ProductDto, qty: number, providerId?: string) => {
      // prevent adding without provider
      if (!providerId) {
        toast.error("Seleccione un proveedor antes de agregar el producto.");
        return;
      }

      const providerObj = providers.find((p) => p.id === providerId);
      if (!providerObj) {
        toast.error("Proveedor inválido.");
        return;
      }

      const lineSubtotal = (product.price || 0) * qty;

      setInvoiceDetails((prev) => {
        // Buscar existing por product.id + provider.id
        const existing = prev.find(
          (invDetail) =>
            invDetail.product.id === product.id &&
            invDetail.provider.id === providerObj.id
        );

        if (existing) {
          return prev.map((invDetail) =>
            invDetail.product.id === product.id &&
            invDetail.provider.id === providerObj.id
              ? {
                  ...invDetail,
                  quantity: (invDetail.quantity || 0) + qty,
                  subtotal: (invDetail.subtotal || 0) + lineSubtotal,
                }
              : invDetail
          );
        }

        const toAdd: InvoiceDetail = {
          id: `${product.id}-${providerObj.id}`,
          product: product,
          provider: providerObj,
          quantity: qty,
          unitPrice: product.price || 0,
          subtotal: lineSubtotal,
        };
        return [...prev, toAdd];
      });
    },
    [providers]
  );

  // stable handlers to update per-row selection without recreating functions per render
  const handleQuantityChange = useCallback(
    (productId: string, quantity: number) => {
      setSelections((prev) => ({
        ...prev,
        [productId]: {
          ...(prev[productId] ?? { quantity: 1 }),
          quantity,
        },
      }));
    },
    []
  );

  const handleProviderChange = useCallback(
    (productId: string, providerId?: string) => {
      setSelections((prev) => ({
        ...prev,
        [productId]: {
          ...(prev[productId] ?? { quantity: 1 }),
          providerId: providerId || undefined,
        },
      }));
    },
    []
  );

  const productosFiltrados = useMemo(
    () =>
      productos.filter((p) =>
        (p.name || "").toLowerCase().includes(search.toLowerCase())
      ),
    [productos, search]
  );

  // load products and providers from mock services on mount (uses token like Products)
  useEffect(() => {
    // fetch productos
    const fetchProducts = async () => {
      const token = getAccessToken();
      if (!token) {
        toast.error("Por favor, inicia sesión para acceder a esta sección.");
        logout();
        return;
      }
      const start = Date.now();
      // ensure UI shows loading state; avoid clearing productos (keeps logic simple)
      if (isMountedRef.current) {
        setLoadingProducts(true);
      }
      const {
        success: prodSuccess,
        products,
        message: prodMessage,
      } = await productService.getAllProducts(token);
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, elapsed);
      if (isMountedRef.current) {
        if (remaining > 0) {
          setTimeout(() => {
            if (isMountedRef.current) setLoadingProducts(false);
          }, remaining);
        } else {
          setLoadingProducts(false);
        }
      }
      if (!prodSuccess) {
        toast.error(prodMessage || "Error al cargar los productos.");
        return;
      }
      if (prodSuccess && products) {
        setProductos(products);
      }
    };
    fetchProducts();
    // eager load providers again so the Select is instant when opened
    fetchProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fetchProviders is available to call lazily when the Select opens
  const fetchProviders = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      toast.error("Por favor, inicia sesión para acceder a esta sección.");
      logout();
      return;
    }
    setLoadingProviders(true);
    const {
      success: provSuccess,
      providers: provs,
      message: provMessage,
    } = await providerService.getAllProviders(token);
    setLoadingProviders(false);
    if (!provSuccess) {
      toast.error(provMessage || "Error al cargar los proveedores.");
      return;
    }
    if (provSuccess && provs) {
      setProviders(provs);
    }
  }, [getAccessToken, logout]);

  const handleConfirmInvoice = async () => {
    if (invoiceDetails.length === 0) {
      toast.error("Agregue al menos un producto a la factura.");
      return;
    }

    const token = getAccessToken();
    if (!token) {
      toast.error("Por favor inicia sesión.");
      logout();
      return;
    }

    const invoice: Omit<Invoice, "id" | "creator" | "createdAt"> = {
      invoiceDetails: invoiceDetails,
      priceTotal: invoiceDetails.reduce((s, l) => s + (l.subtotal || 0), 0),
    };

    try {
      setIsCreatingInvoice(true);
      const { success, message } = await invoiceService.createInvoice(
        token,
        invoice
      );
      if (!success) {
        toast.error(message || "Error al crear la factura.");
        return;
      }
      toast.success("Factura creada correctamente.");
      setInvoiceDetails([]);
    } catch {
      toast.error("Ocurrió un error al enviar la factura.");
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  const total = invoiceDetails.reduce((acc, p) => acc + (p.subtotal || 0), 0);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-4xl font-bold">Agregar Factura</h1>
      <p className="text-muted-foreground">
        Sección donde se crea una nueva factura registrando los productos
        adquiridos.
      </p>
      <Card className="space-y-6 p-6">
        <CardContent className="p-2">
          {/* Buscador */}
          <div className="flex md:flex-row gap-4 items-center">
            <div className="relative w-full max-w-60 md:w-1/3 ml-auto bg-gray-50">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={16} />
              </span>
              <Input
                aria-label="Buscar productos"
                placeholder="Buscar"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 border-none"
              />
            </div>
            <div className="flex items-center gap-4">
              <Link to="/invoice-history" className="inline-block">
                <Button size="sm" className="flex items-center gap-2">
                  <FileText size={16} />
                  Ver Historial
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
        <CardContent className="p-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Tabla izquierda */}
            <div className="border rounded-xl shadow-sm overflow-hidden bg-white min-h-[420px]">
              <div className="px-6 py-3 text-sm text-gray-600 flex justify-between items-center">
                <span className="font-medium">
                  Encontrados {productosFiltrados.length} elementos
                </span>
              </div>
              <div className="overflow-y-auto max-h-[420px] p-4">
                {loadingProducts ? (
                  <div className="flex items-center justify-center p-12">
                    <FetchingSpinner />
                  </div>
                ) : (
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="py-3">Nombre</TableHead>
                        <TableHead className="py-3">Código</TableHead>
                        <TableHead className="py-3">Precio</TableHead>
                        <TableHead className="py-3">Proveedor</TableHead>
                        <TableHead className="py-3">Cantidad</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productosFiltrados.map((p: ProductDto) => (
                        <RowItem
                          key={p.id}
                          product={p}
                          quantity={selections[p.id]?.quantity ?? 1}
                          providerId={selections[p.id]?.providerId}
                          onQuantityChange={handleQuantityChange}
                          onProviderChange={handleProviderChange}
                          onAdd={handleAgregar}
                          providers={providers}
                          loadingProviders={loadingProviders}
                          fetchProviders={fetchProviders}
                        />
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>

            {/* Tabla derecha */}
            <div className="border rounded-xl shadow-sm overflow-hidden bg-white min-h-[420px]">
              <div className="px-6 py-3 text-sm text-gray-600 flex justify-between items-center">
                <span className="font-medium">
                  Productos agregados ({invoiceDetails.length})
                </span>
              </div>
              <div className="overflow-y-auto max-h-[420px] p-4">
                <div className="text-sm">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="py-3">Nombre</TableHead>
                        <TableHead className="py-3">Código</TableHead>
                        <TableHead className="py-3">Proveedor</TableHead>
                        <TableHead className="py-3">Cantidad</TableHead>
                        <TableHead className="py-3">Subtotal</TableHead>
                        <TableHead className="py-3"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoiceDetails.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center text-gray-400 py-8"
                          >
                            Aún no se han agregado productos
                          </TableCell>
                        </TableRow>
                      ) : (
                        invoiceDetails.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="px-4 py-3 text-start">
                              <span className="font-medium">
                                {p.product.name}
                              </span>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-start">
                              {p.product.id}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-start">
                              {p.provider?.name || "—"}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-start">
                              {p.quantity ?? 1}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-start">
                              ${(p.subtotal || 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-start flex px-4 py-3">
                              <DeleteButton
                                handleDelete={() =>
                                  setInvoiceDetails((prev) =>
                                    prev.filter((x) => x.id !== p.id)
                                  )
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
          <div className="flex flex-col justify-center items-end border-t pt-4 gap-4">
            <div className="text-lg font-semibold px-6">
              <span className="block text-sm text-muted-foreground">Total</span>
              <div className="text-2xl">${total.toLocaleString()}</div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="destructive"
                onClick={() => setDeleteModalOpen(true)}
                disabled={invoiceDetails.length === 0}
                className="min-w-[140px]"
              >
                Borrar Factura
              </Button>
              <Button
                onClick={handleConfirmInvoice}
                disabled={invoiceDetails.length === 0 || isCreatingInvoice}
                variant="default"
                className="min-w-[160px]"
              >
                {isCreatingInvoice ? "Creando..." : "Crear factura"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          setInvoiceDetails([]);
          setDeleteModalOpen(false);
          toast.success("Se han eliminado todos los productos de la factura.");
        }}
      />
    </div>
  );
}

// Memoized ProviderSelect to reduce per-row render work
function ProviderSelectInner({
  value,
  onChange,
  providers,
  loading,
  onOpen,
}: {
  value: string;
  onChange: (v: string) => void;
  providers: Provider[];
  loading: boolean;
  onOpen?: () => void;
}) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v)}
      onOpenChange={(open) => open && onOpen && onOpen()}
    >
      <SelectTrigger className="w-32 h-8 text-sm">
        <SelectValue placeholder="Proveedor" />
      </SelectTrigger>
      <SelectContent>
        {loading ? (
          <SelectItem value="__loading" disabled>
            Cargando proveedores...
          </SelectItem>
        ) : providers.length === 0 ? (
          <SelectItem value="__no_providers" disabled>
            No hay proveedores
          </SelectItem>
        ) : (
          providers.map((prov) => (
            <SelectItem key={prov.id} value={prov.id}>
              {prov.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}

const ProviderSelect = memo(ProviderSelectInner);

// Row item memoized to avoid re-rendering unrelated rows
const RowItem = memo(function RowItemInner({
  product,
  quantity,
  providerId,
  onQuantityChange,
  onProviderChange,
  onAdd,
  providers,
  loadingProviders,
  fetchProviders,
}: {
  product: ProductDto;
  quantity: number;
  providerId?: string;
  onQuantityChange: (productId: string, quantity: number) => void;
  onProviderChange: (productId: string, providerId?: string) => void;
  onAdd: (product: ProductDto, qty: number, providerId?: string) => void;
  providers: Provider[];
  loadingProviders: boolean;
  fetchProviders: () => void;
}) {
  return (
    <TableRow key={product.id} className="hover:bg-primary/10 transition">
      <TableCell className="text-start">{product.name}</TableCell>
      <TableCell className="text-start">{product.id}</TableCell>
      <TableCell className="text-start">
        ${(product.price || 0).toLocaleString()}
      </TableCell>
      <TableCell>
        <ProviderSelect
          value={providerId || ""}
          onChange={(v) => onProviderChange(product.id, v)}
          providers={providers}
          loading={loadingProviders}
          onOpen={() => {
            if (providers.length === 0 && !loadingProviders) fetchProviders();
          }}
        />
      </TableCell>
      <TableCell className="text-center">
        <div className="flex items-center gap-2 justify-center">
          <Input
            type="number"
            value={quantity}
            min={1}
            className="w-15 h-8 text-sm"
            onChange={(e) =>
              onQuantityChange(
                product.id,
                Math.max(1, Number(e.target.value) || 1)
              )
            }
          />
          <Button
            size="sm"
            variant="default"
            title="Agregar producto"
            aria-label={`Agregar ${product.name}`}
            className="rounded-full h-8 w-8 p-0 bg-[#5932EA] text-white hover:bg-[#502DD3] active:bg-[#4728BB] shadow-sm flex items-center justify-center"
            onClick={() => onAdd(product, quantity, providerId)}
          >
            <Plus size={16} />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});
