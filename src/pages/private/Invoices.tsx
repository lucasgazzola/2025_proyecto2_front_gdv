import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
  useRef,
  Fragment,
} from "react";
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

import { Search, Plus, FileText, Users as IconUsers } from "lucide-react";
import { Link } from "react-router-dom";
import FetchingSpinner from "@/components/common/FetchingSpinner";
import { productService } from "@/services/factories/productServiceFactory";
import { toast } from "react-toastify";
import useAuth from "@/hooks/useAuth";
import type { ProductDto } from "@/types/Product";
import DeleteButton from "@/components/common/DeleteButton";
import { Card, CardContent } from "@/components/ui/card";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import SelectCustomerModal from "./components/SelectCustomerModal";
import { invoiceService } from "@/services/factories/invoiceServiceFactory";
import type { Invoice, InvoiceDetail } from "@/types/Invoice";
import type { Customer } from "@/types/Customer";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function AgregarFactura() {
  const { logout, getAccessToken } = useAuth();

  const [productos, setProductos] = useState<ProductDto[]>([]);
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetail[]>([]);
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [orderBy, setOrderBy] = useState<string>("name");
  const [currentPage, setCurrentPage] = useState<number>(1);
  // store only providerId to avoid holding objects in per-row state (reduces re-renders)
  type Selection = { quantity: number; providerId?: string };
  const [selections, setSelections] = useState<Record<string, Selection>>({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [selectCustomerOpen, setSelectCustomerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  // estados de carga separados para que la interfaz sea responsiva
  const [loadingProducts, setLoadingProducts] = useState(true);
  const PRODUCTS_PER_PAGE = 8;

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleAgregar = (product: ProductDto, qty: number) => {
    if (qty <= 0) return;
    if (product.stock < qty) {
      toast.error(
        `No hay suficiente stock para el producto "${product.name}". Stock disponible: ${product.stock}`
      );
      return;
    }

    const lineSubtotal = (product.price || 0) * qty;

    setInvoiceDetails((prev) => {
      // Buscar existing por product.id + provider.id
      const existing = prev.find(
        (invDetail) => invDetail.product.id === product.id
      );

      if (existing) {
        product.stock -= qty; // Decrease stock locally
        return prev.map((invDetail) =>
          invDetail.product.id === product.id
            ? {
                ...invDetail,
                quantity: (invDetail.quantity || 0) + qty,
                subtotal: (invDetail.subtotal || 0) + lineSubtotal,
              }
            : invDetail
        );
      }

      const toAdd: InvoiceDetail = {
        id: `${product.id}-${Date.now()}`, // unique id
        product: product,
        quantity: qty,
        unitPrice: product.price || 0,
        subtotal: lineSubtotal,
      };

      product.stock -= qty; // Decrease stock locally

      return [...prev, toAdd];
    });
  };

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

  const productosFiltrados = useMemo(() => {
    const q = search.toLowerCase().trim();
    return productos
      .filter((p) => {
        if (q === "") return true;
        return (
          (p.name || "").toLowerCase().includes(q) ||
          (p.brand?.name || "").toLowerCase().includes(q) ||
          (p.id || "").toLowerCase().includes(q)
        );
      })
      .filter((p) => {
        if (brandFilter === "all") return true;
        return (p.brand?.name || "Sin marca") === brandFilter;
      })
      .filter((p) => {
        if (categoryFilter === "all") return true;
        return (p.categories || []).some((c) => c.name === categoryFilter);
      });
  }, [productos, search, brandFilter, categoryFilter]);

  // sort
  const productosOrdenados = useMemo(() => {
    return [...productosFiltrados].sort((a, b) => {
      switch (orderBy) {
        case "priceAsc":
          return (a.price || 0) - (b.price || 0);
        case "priceDesc":
          return (b.price || 0) - (a.price || 0);
        case "stockDesc":
          return (b.stock || 0) - (a.stock || 0);
        case "name":
        default:
          return (a.name || "").localeCompare(b.name || "");
      }
    });
  }, [productosFiltrados, orderBy]);

  // pagination
  const totalPages = Math.max(
    1,
    Math.ceil(productosOrdenados.length / PRODUCTS_PER_PAGE)
  );
  useEffect(
    () => setCurrentPage(1),
    [search, brandFilter, categoryFilter, orderBy]
  );
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return productosOrdenados.slice(start, start + PRODUCTS_PER_PAGE);
  }, [productosOrdenados, currentPage]);

  // grouping for current page (representative division by brand)
  const groupedByBrand = useMemo(() => {
    const map = new Map<string, ProductDto[]>();
    paginatedProducts.forEach((p) => {
      const key = p.brand?.name || "Sin marca";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    });
    return Array.from(map.entries());
  }, [paginatedProducts]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfirmInvoice = async () => {
    if (invoiceDetails.length === 0) {
      toast.error("Agregue al menos un producto a la factura.");
      return;
    }
    if (!selectedCustomer) {
      toast.error("Agregue un cliente a la factura.");
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
      customer: selectedCustomer,
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
      setSelectedCustomer(null);
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
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setSelectCustomerOpen(true)}
              >
                <IconUsers size={16} />
                Seleccionar Cliente
              </Button>
              {/*TEMPORAL*/}
              {selectedCustomer ? (
                <div className="text-sm">
                  Seleccionado:{" "}
                  <span>
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </span>
                </div>
              ) : null}
            </div>
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
            <div className="flex items-center gap-3">
              <Select
                value={brandFilter}
                onValueChange={(v) => setBrandFilter(v)}
              >
                <SelectTrigger className="w-40 bg-gray-50 border-none font-semibold">
                  <span className="font-normal">Marca</span>
                  <SelectValue placeholder="Marca" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {Array.from(
                    new Set(productos.map((p) => p.brand?.name || "Sin marca"))
                  ).map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={categoryFilter}
                onValueChange={(v) => setCategoryFilter(v)}
              >
                <SelectTrigger className="w-40 bg-gray-50 border-none font-semibold">
                  <span className="font-normal">Categoría</span>
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {Array.from(
                    new Set(
                      productos.flatMap(
                        (p) => p.categories?.map((c) => c.name) || []
                      )
                    )
                  ).map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={orderBy} onValueChange={(v) => setOrderBy(v)}>
                <SelectTrigger className="w-44 bg-gray-50 border-none font-semibold">
                  <span className="font-normal">Ordenar</span>
                  <SelectValue placeholder="Orden" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nombre (A-Z)</SelectItem>
                  <SelectItem value="priceAsc">Precio ↑</SelectItem>
                  <SelectItem value="priceDesc">Precio ↓</SelectItem>
                  <SelectItem value="stockDesc">Stock ↓</SelectItem>
                </SelectContent>
              </Select>
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
                  <div>
                    <Table className="min-w-full">
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="py-3">Nombre</TableHead>
                          <TableHead className="py-3">Código</TableHead>
                          <TableHead className="py-3">Precio</TableHead>
                          <TableHead className="py-3">Stock Actual</TableHead>
                          <TableHead className="py-3">Cantidad</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupedByBrand.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-6">
                              No hay productos
                            </TableCell>
                          </TableRow>
                        ) : (
                          groupedByBrand.map(([brandName, items]) => (
                            <Fragment key={`group-${brandName}`}>
                              <TableRow className="bg-gray-100">
                                <TableCell
                                  colSpan={5}
                                  className="font-semibold text-sm py-2"
                                >
                                  {brandName}
                                </TableCell>
                              </TableRow>
                              {items.map((p) => (
                                <RowItem
                                  key={p.id}
                                  product={p}
                                  quantity={selections[p.id]?.quantity ?? 1}
                                  onQuantityChange={handleQuantityChange}
                                  onAdd={handleAgregar}
                                />
                              ))}
                            </Fragment>
                          ))
                        )}
                      </TableBody>
                    </Table>

                    {/* Paginación de productos */}
                    <div className="flex items-center justify-between pt-4">
                      <span className="text-sm text-muted-foreground">
                        Página {currentPage} de {totalPages}
                      </span>
                      <div className="space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          disabled={currentPage === 1}
                        >
                          Anterior
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={currentPage === totalPages}
                        >
                          Siguiente
                        </Button>
                      </div>
                    </div>
                  </div>
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
      <SelectCustomerModal
        open={selectCustomerOpen}
        onOpenChange={setSelectCustomerOpen}
        onSelect={(c) => {
          setSelectedCustomer(c);
          setSelectCustomerOpen(false);
        }}
      />
    </div>
  );
}

// Row item memoized to avoid re-rendering unrelated rows
const RowItem = memo(function RowItemInner({
  product,
  quantity,
  onQuantityChange,
  onAdd,
}: {
  product: ProductDto;
  quantity: number;
  onQuantityChange: (productId: string, quantity: number) => void;
  onAdd: (product: ProductDto, qty: number, providerId?: string) => void;
}) {
  return (
    <TableRow key={product.id} className="hover:bg-primary/10 transition">
      <TableCell className="text-start">{product.name}</TableCell>
      <TableCell className="text-start">{product.id}</TableCell>
      <TableCell className="text-start">
        ${(product.price || 0).toLocaleString()}
      </TableCell>
      <TableCell className="text-start">{product.stock}</TableCell>
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
            onClick={() => onAdd(product, quantity)}
          >
            <Plus size={16} />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});
