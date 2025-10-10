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
    if (
      !product.name ||
      !product.idEcommerce ||
      product.quantity === undefined
    ) {
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

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const PRODUCTS_PER_PAGE = 8;
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  return (
    <>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">{t("products.title")}</h1>
          <p className="text-muted-foreground mb-6">{t("products.subtitle")}</p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6 flex flex-col items-center gap-4 lg:flex-row lg:justify-between">
            <Input
              placeholder={t("products.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full lg:w-1/3"
            />
            <Button
              onClick={() => {
                setSelectedProduct(null);
                setModalOpen(true);
              }}
              className="w-full lg:max-w-36 lg:w-1/4 lg:ml-auto"
            >
              {t("products.createProduct")}
            </Button>
          </CardContent>
        </Card>

        <Card>
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
