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
import type { Added } from "@/types/Added";
import DeleteButton from "@/components/common/DeleteButton";
import { Card, CardContent } from "@/components/ui/card";


export default function AgregarFactura() {
  const { logout, getAccessToken } = useAuth();

  const [productos, setProductos] = useState<ProductDto[]>([]);
  const [added, setAdded] = useState<Added[]>([]);
  const [search, setSearch] = useState("");
  const [providers, setProviders] = useState<string[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [providersSelected, setProvidersSelected] = useState<Record<string, string>>({});

  const handleAgregar = (product: ProductDto, qty: number, provider: string) => {
    // prevent adding without provider
    if (!provider) {
      toast.error("Seleccione un proveedor antes de agregar el producto.");
      return;
    }

    const existing = added.find((a) => a.id === product.id && a.proveedor === provider);
    const lineSubtotal = (product.price || 0) * qty;
    if (existing) {
      setAdded((prev) =>
        prev.map((a) =>
          a.id === product.id && a.proveedor === provider
            ? { ...a, cantidad: (a.cantidad || 0) + qty, subtotal: (a.subtotal || 0) + lineSubtotal }
            : a
        )
      );
    } else {
      const toAdd = {
        id: product.id,
        nombre: product.name,
        codigo: product.id,
        proveedor: provider,
        cantidad: qty,
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
                        <TableRow key={`${p.id}-${p.proveedor}`}>
                          <TableCell>{p.nombre}</TableCell>
                          <TableCell>{p.codigo}</TableCell>
                          <TableCell>{p.proveedor || "—"}</TableCell>
                          <TableCell>{p.cantidad ?? 1}</TableCell>
                          <TableCell>${(p.subtotal || 0).toLocaleString()}</TableCell>
                          <TableCell className="text-center">
                            <DeleteButton
                              handleDelete={() =>
                                setAdded((prev) => prev.filter((x) => !(x.id === p.id && x.proveedor === p.proveedor)))
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
              <Button variant="destructive">Borrar Factura</Button>
              <Button variant="outline">Ver Factura</Button>
              <Button>Confirmar</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
