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

import EditButton from "@/components/common/EditButton";
import FetchingSpinner from "@/components/common/FetchingSpinner";
import useAuth from "@/hooks/useAuth";

import { brandService } from "@/services/factories/brandServiceFactory";

const { getAllBrands, createBrand, updateBrandById, deleteBrandById } =
  brandService;

import DeleteButton from "@/components/common/DeleteButton";
import MoreDetailsButton from "@/components/common/MoreDetailsButton";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import type { Brand, BrandFormData } from "@/types/Brand";
import EditBrandModal from "./components/EditBrandModal";

export default function Brands() {
  const { logout, getAccessToken } = useAuth();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [orderBy, setOrderBy] = useState<string>("latest");
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const brandsPerPage = 10;

  const token = getAccessToken();

  const fetchBrands = async () => {
    if (!token) {
      toast.error("Por favor, inicia sesión para acceder a esta sección.");
      logout();
      return;
    }

    setLoading(true);
    const { success, brands } = await getAllBrands(token);
    setLoading(false);

    if (!success) {
      toast.error("Error al cargar las marcas. Intenta nuevamente.");
      return;
    }

    if (!brands || brands.length === 0) {
      toast.info("No hay marcas registradas.");
      return;
    }

    setBrands(brands);
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleSaveBrand = async (
    brand: Brand | BrandFormData,
    isEdit: boolean
  ) => {
    if (
      !brand.name ||
      !("logo" in brand) ||
      !("description" in brand) ||
      !("state" in brand)
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
      const { success, brand: newBrand } = await createBrand(token, brand);
      if (!success || !newBrand) {
        toast.error("Error al crear la marca. Intenta nuevamente.");
        return;
      }
      setBrands((prev) => [newBrand, ...prev]);
      toast.success("Marca creada correctamente.");
    } else {
      if (!brand) {
        toast.error("Marca no encontrada.");
        return;
      }
      if (!("id" in brand) || !brand.id) {
        toast.error("ID de la marca es necesario para actualizar.");
        return;
      }
      const { success, message } = await updateBrandById(
        token,
        brand.id,
        brand
      );
      if (!success) {
        toast.error(message);
        return;
      }
      setBrands((prev) =>
        prev.map((p) => (p.id === brand.id ? { ...p, ...brand } : p))
      );
      toast.success("Marca actualizada correctamente.");
    }

    setModalOpen(false);
    setSelectedBrand(null);
    setCurrentPage(1);
  };

  const handleDeleteBrand = async (id: string) => {
    if (!token) {
      toast.error("Por favor, inicia sesión para realizar esta acción.");
      logout();
      return;
    }

    const { success } = await deleteBrandById(token, id);
    if (!success) {
      toast.error("Error al eliminar la marca. Intenta nuevamente.");
      return;
    }
    setBrands((prev) => prev.filter((p) => p.id !== id));
    toast.success("Marca eliminada correctamente.");
  };

  const filteredBrands = brands.filter((brand) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;

    return (
      brand.name.toLowerCase().includes(q) ||
      brand.description.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredBrands.length / brandsPerPage);
  const paginatedBrands = filteredBrands.slice(
    (currentPage - 1) * brandsPerPage,
    currentPage * brandsPerPage
  );

  return (
    <>
      <div className="p-6 space-y-6">
        <h1 className="text-4xl font-bold">Marcas</h1>
        <p className="text-muted-foreground">
          Sección donde se listan todas las marcas existentes dentro del
          sistema.
        </p>
        <Card className="mb-6 border-0 rounded-none">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="text-start">
                <h3 className="text-2xl font-semibold">Todas las marcas</h3>
                <p className="text-md text-green-500">
                  Marcas activas ({brands.length})
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
                  <SelectItem value="category">Categoría</SelectItem>
                  <SelectItem value="quantity">Cantidad</SelectItem>{" "}
                </SelectContent>
              </Select>

              <div className="w-full md:w-auto">
                <Button
                  onClick={() => {
                    setSelectedBrand(null);
                    setModalOpen(true);
                  }}
                >
                  Agregar marca
                </Button>
              </div>
            </div>
          </CardContent>

          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-400">Logo</TableHead>
                    <TableHead className="text-gray-400">Nombre</TableHead>
                    <TableHead className="text-gray-400">Descripción</TableHead>
                    <TableHead className="text-gray-400">
                      Productos asociados
                    </TableHead>
                    <TableHead className="text-gray-400">Estado</TableHead>
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
                  ) : paginatedBrands.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        No hay resultados
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedBrands.map((brand) => (
                      <TableRow key={brand.id}>
                        <TableCell>
                          <img
                            alt={`Logo de la marca ${brand.name}`}
                            src={brand.logo}
                            className="w-12 h-12 object-cover rounded"
                          />
                        </TableCell>
                        <TableCell>{brand.name}</TableCell>
                        <TableCell>{brand.description}</TableCell>
                        <TableCell>{brand.productsCount}</TableCell>
                        <TableCell>
                          {brand.state ? (
                            <span className="block text-center w-24 text-emerald-700 p-4 rounded-sm bg-emerald-100 text-xs">
                              Activo
                            </span>
                          ) : (
                            <span className="block text-center w-24 text-rose-700 p-4 rounded-sm bg-rose-100 text-xs">
                              Inactivo
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center space-x-2">
                          <MoreDetailsButton
                            handleViewDetails={() => {
                              setSelectedBrand(brand);
                              setModalOpen(true);
                            }}
                          />
                          <EditButton
                            handleEdit={() => {
                              setSelectedBrand(brand);
                              setModalOpen(true);
                            }}
                          />
                          <DeleteButton
                            handleDelete={() => {
                              setSelectedBrand(brand);
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
        <EditBrandModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          brand={selectedBrand}
          saveBrand={handleSaveBrand}
          onClose={() => {
            setModalOpen(false);
            setSelectedBrand(null);
          }}
        />
      )}
      {deleteModalOpen && selectedBrand && (
        <ConfirmDeleteModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedBrand(null);
          }}
          onConfirm={async () => {
            if (selectedBrand && selectedBrand.id) {
              await handleDeleteBrand(selectedBrand.id);
            }
            setDeleteModalOpen(false);
            setSelectedBrand(null);
          }}
        />
      )}
    </>
  );
}
