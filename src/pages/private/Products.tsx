import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import type { ProductDto, ProductFormData } from "@/types/Product";
import EditButton from "@/components/common/EditButton";
import FetchingSpinner from "@/components/common/FetchingSpinner";
import useAuth from "@/hooks/useAuth";

import { productService } from "@/services/factories/productServiceFactory";

const { getAllProducts, createProduct, updateProductById, deleteProductById } =
  productService;

import EditProductModal from "@/pages/private/components/EditProductModal";
import DeleteButton from "@/components/common/DeleteButton";
import MoreDetailsButton from "@/components/common/MoreDetailsButton";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";

export default function Products() {
  const { logout, getAccessToken } = useAuth();

  const [products, setProducts] = useState<ProductDto[]>([]);
  const [orderBy, setOrderBy] = useState<string>("latest");
  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  const token = getAccessToken();

  const fetchProducts = async () => {
    if (!token) {
      toast.error("Por favor, inicia sesión para acceder a esta sección.");
      logout();
      return;
    }

    setLoading(true);
    const { success, products } = await getAllProducts(token);
    setLoading(false);

    if (!success) {
      toast.error("Error al cargar los productos. Intenta nuevamente.");
      return;
    }

    if (!products || products.length === 0) {
      toast.info("No hay productos registrados.");
      return;
    }
    console.log({ products });

    setProducts([...products]);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSaveProduct = async (
    product: ProductDto | ProductFormData,
    isEdit: boolean
  ) => {
    // If the payload is FormData, the modal already validated fields; skip JS-level shape checks.
    if (!(product instanceof FormData)) {
      if (
        !product.name ||
        !("brand" in product) ||
        !("categories" in product) ||
        product.stock === undefined
      ) {
        toast.error("Por favor, completa todos los campos obligatorios.");
        return;
      }
    }

    if (!token) {
      toast.error("Por favor, inicia sesión para realizar esta acción.");
      logout();
      return;
    }

    if (!isEdit) {
      const { success, product: newProduct } = await createProduct(
        token,
        product
      );
      if (!success || !newProduct) {
        toast.error("Error al crear el producto. Intenta nuevamente.");
        return;
      }
      setProducts((prev) => [newProduct, ...prev]);
    } else {
      if (!product) {
        toast.error("Producto no encontrado.");
        return;
      }
      if (!("id" in product) || !product.id) {
        toast.error("ID del producto es necesario para actualizar.");
        return;
      }

      const { success, message } = await updateProductById(
        token,
        product.id,
        product
      );
      if (!success) {
        toast.error(message);
        return;
      }
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, ...product } : p))
      );

      toast.success("Producto actualizado correctamente.");
    }

    setModalOpen(false);
    setSelectedProduct(null);
    setCurrentPage(1);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!token) {
      toast.error("Por favor, inicia sesión para realizar esta acción.");
      logout();
      return;
    }

    const { success } = await deleteProductById(token, id);
    if (!success) {
      toast.error("Error al eliminar el producto. Intenta nuevamente.");
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success("Producto eliminado correctamente.");
  };

  // Filtro de productos
  const filteredProducts = products.filter((product) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;

    const name = (product.name || "").toLowerCase();
    const brand = (product.brand.name || "").toLowerCase();

    return (
      name.includes(q) ||
      brand.includes(q) ||
      (product.categories || []).some((category) =>
        category.name.toLowerCase().includes(q)
      )
    );
  });

  // Ordenar por: nombre/marca/categoria de A-Z, cantidad DESC, latest = as-is
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (orderBy) {
      case "name":
        return (a.name || "").localeCompare(b.name || "");
      case "brand":
        return (a.brand.name || "").localeCompare(b.brand.name || "");
      case "quantity":
        return (b.stock || 0) - (a.stock || 0); // mayor a menor
      case "price":
        return (b.price || 0) - (a.price || 0); // mayor a menor
      case "latest":
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  return (
    <>
      <div className="p-6 space-y-6">
        <h1 className="text-4xl font-bold">Productos</h1>
        <p className="text-muted-foreground">
          Sección donde se listan todos los productos existentes dentro del
          sistema.
        </p>
        <Card className="mb-6 border-0 rounded-none">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="text-start">
                <h3 className="text-2xl font-semibold">Todos los productos</h3>
                <p className="text-md text-green-500">
                  Productos activos ({products.length})
                </p>
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

              <Select value={orderBy} onValueChange={(v) => setOrderBy(v)}>
                <SelectTrigger className="w-full lg:w-1/4 max-w-60 bg-gray-50 border-none font-semibold">
                  <span className="font-normal">Ordenar por:</span>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Más reciente</SelectItem>
                  <SelectItem value="name">Nombre</SelectItem>
                  <SelectItem value="brand">Marca</SelectItem>
                  <SelectItem value="quantity">Cantidad</SelectItem>{" "}
                  <SelectItem value="price">Precio</SelectItem>
                </SelectContent>
              </Select>

              <div className="w-full md:w-auto">
                <Button
                  onClick={() => {
                    setSelectedProduct(null);
                    setModalOpen(true);
                  }}
                >
                  Agregar producto
                </Button>
              </div>
            </div>
          </CardContent>

          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-400">Nombre</TableHead>
                    <TableHead className="text-gray-400">Marca</TableHead>
                    <TableHead className="text-gray-400">Categoría</TableHead>
                    <TableHead className="text-gray-400">Imágenes</TableHead>
                    <TableHead className="text-gray-400">Stock</TableHead>
                    <TableHead className="text-gray-400">Precio</TableHead>
                    <TableHead className="text-gray-400 text-center">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-start">
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        <FetchingSpinner />
                      </TableCell>
                    </TableRow>
                  ) : paginatedProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        No hay resultados
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.brand.name}</TableCell>
                        <TableCell>
                          {product.categories
                            .map((category) => category.name)
                            .join(", ")}
                        </TableCell>
                        <TableCell>
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        </TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>${product.price}</TableCell>
                        <TableCell className="text-center space-x-2">
                          <MoreDetailsButton
                            handleViewDetails={() => {
                              setSelectedProduct(product);
                              setModalOpen(true);
                            }}
                          />
                          <EditButton
                            handleEdit={() => {
                              setSelectedProduct(product);
                              setModalOpen(true);
                            }}
                          />
                          <DeleteButton
                            handleDelete={() => {
                              setSelectedProduct(product);
                              setDeleteModalOpen(true);
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between pt-4">
              <span className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages || 1}
              </span>
              <div className="space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((p) => (p < totalPages ? p + 1 : totalPages))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {modalOpen && (
        <EditProductModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          product={selectedProduct}
          saveProduct={handleSaveProduct}
        />
      )}
      {deleteModalOpen && selectedProduct && (
        <ConfirmDeleteModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedProduct(null);
          }}
          onConfirm={async () => {
            if (selectedProduct && selectedProduct.id) {
              await handleDeleteProduct(selectedProduct.id);
            }
            setDeleteModalOpen(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </>
  );
}
