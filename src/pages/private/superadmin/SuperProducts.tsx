import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
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
// import DeleteButton from "@/components/common/DeleteButton";
import FetchingSpinner from "@/components/common/FetchingSpinner";
import useAuth from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";

import { productService } from "@/services/factories/productServiceFactory";

const {
  getAllProducts: getAllProductsService,
  addNewProduct: addNewProductService,
  updateProduct: updateProductService,
} = productService;

import SuperEditProductModal from "./components/SuperEditProductModal";

export default function SuperProducts() {
  const { logout, getAccessToken } = useAuth();
  const { t } = useLanguage();

  const [products, setProducts] = useState<ProductDto[]>([]);
  const [searchBy, setSearchBy] = useState<string>("name");
  const [productsPerPage, setProductsPerPage] = useState<number>(10);
  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const token = getAccessToken();

  const fetchProducts = async () => {
    if (!token) {
      toast.error("Por favor, inicia sesión para acceder a esta sección.");
      logout();
      return;
    }

    setLoading(true);
    const { success, products } = await getAllProductsService(token);
    setLoading(false);

    if (!success) {
      toast.error("Error al cargar los productos. Intenta nuevamente.");
      return;
    }

    if (!products || products.length === 0) {
      toast.info("No hay productos registrados.");
      return;
    }

    setProducts(products);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSaveProduct = async (
    product: ProductDto | ProductFormData,
    isEdit: boolean
  ) => {
    if (!product.name || !("brand" in product) || !("category" in product) || product.quantity === undefined) {
      toast.error("Por favor, completa todos los campos obligatorios.");
      return;
    }

    if (!token) {
      toast.error("Por favor, inicia sesión para realizar esta acción.");
      logout();
      return;
    }

    if (!isEdit) {
      const { success, product: newProduct } = await addNewProductService(
        token,
        product
      );
      if (!success || !newProduct) {
        toast.error("Error al crear el producto. Intenta nuevamente.");
        return;
      }
      // setProducts((prev) => [{ ...newProduct }, ...prev]);
      fetchProducts();
    } else {
      if (!product) {
        toast.error("Producto no encontrado.");
        return;
      }
      if (!("id" in product) || !product.id) {
        toast.error("ID del producto es necesario para actualizar.");
        return;
      }
      const { success, message } = await updateProductService(
        token,
        product.id,
        product
      );
      if (!success) {
        toast.error(message);
        return;
      }
      // TODO: Agregar que en el nombre se agrege _X para la cantidad de producto que tiene
      // setProducts((prev) =>
      //   prev.map((p) => (p.id === product.id ? { ...p, ...product } : p))
      // );
      fetchProducts();
    }

    setModalOpen(false);
    setSelectedProduct(null);
    setCurrentPage(1);
  };

  // const handleDeleteProduct = async (id: string) => {
  //   if (!token) {
  //     toast.error("Por favor, inicia sesión para realizar esta acción.");
  //     logout();
  //     return;
  //   }

  //   const { success } = await deleteProductService(token, id);
  //   if (!success) {
  //     toast.error("Error al eliminar el producto. Intenta nuevamente.");
  //     return;
  //   }
  //   setProducts((prev) => prev.filter((p) => p.id !== id));
  //   toast.success("Producto eliminado correctamente.");
  // };

  const filteredProducts = products.filter((product) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    switch (searchBy) {
      case "name":
        return product.name.toLowerCase().includes(q);
      case "brand":
        return product.brand.toLowerCase().includes(q);
      case "category":
        return product.category.toLowerCase().includes(q);
      case "quantity":
        return String(product.quantity).includes(q);
      default:
        return product.name.toLowerCase().includes(q);
    }
  });

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  return (
    <>
      <div className="p-6 space-y-6">

        <Card className="mb-6">

          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {t("products.title")}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {t("products.subtitle")}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <Input
                placeholder={t("common.search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-1/3"
              />

              <Select value={searchBy} onValueChange={(v) => setSearchBy(v)}>
                <span>{t("common.by")}</span>
                <SelectTrigger className="w-full md:w-30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">{t("products.name")}</SelectItem>
                  <SelectItem value="brand">{t("products.brand")}</SelectItem>
                  <SelectItem value="category">{t("products.category")}</SelectItem>
                  <SelectItem value="quantity">{t("products.quantity")}</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <span>{t("common.show")}:</span>
                <Select value={String(productsPerPage)} onValueChange={(value) => setProductsPerPage(Number(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span>{t("common.perPage")}</span>
              </div>

              <div className="ml-auto w-full md:w-auto">
                <Button
                  onClick={() => {
                    setSelectedProduct(null);
                    setModalOpen(true);
                  }}
                >
                  {t("products.createProduct")}
                </Button>
              </div>
            </div>
          </CardContent>
      
          <CardHeader className="px-6 py-4">
            <CardTitle>
              {t("products.listTitle")} ({filteredProducts.length})
            </CardTitle>
            <CardDescription>{t("products.listDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("products.name")}</TableHead>
                    <TableHead>{t("products.brand")}</TableHead>
                    <TableHead>{t("products.category")}</TableHead>
                    <TableHead>{t("products.image")}</TableHead>
                    <TableHead>{t("products.quantity")}</TableHead>
                    <TableHead>{t("products.price")}</TableHead>
                    <TableHead>{t("products.state")}</TableHead>
                    <TableHead className="text-center">
                      {t("common.actions")}
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
                        {t("products.noResults")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.brand}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        </TableCell>
                        <TableCell>{product.quantity}</TableCell>
                        <TableCell>${product.price}</TableCell>
                        <TableCell>{product.state ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs">
                              {t("common.active")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-rose-100 text-rose-700 text-xs">
                              {t("common.inactive")}
                            </span> 
                          )}
                        </TableCell>
                        <TableCell className="text-center space-x-2">
                          <EditButton
                            handleEdit={() => {
                              setSelectedProduct(product);
                              setModalOpen(true);
                            }}
                          />
                          {/* <DeleteButton
                            handleDelete={() =>
                              handleDeleteProduct(product.id!)
                            }
                          /> */}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between pt-4">
              <span className="text-sm text-muted-foreground">
                {t("common.page")} {currentPage} {t("common.of")}{" "}
                {totalPages || 1}
              </span>
              <div className="space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  {t("common.previous")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((p) => (p < totalPages ? p + 1 : totalPages))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  {t("common.next")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {modalOpen && (
        <SuperEditProductModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          product={selectedProduct}
          saveProduct={handleSaveProduct}
        />
      )}
    </>
  );
}
