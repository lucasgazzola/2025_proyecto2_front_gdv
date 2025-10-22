import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import useAuth from "@/hooks/useAuth";
import type { Category } from "@/types/Category";
import { categoryService } from "@/services/factories/categoryServiceFactory";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableRow, TableCell, TableHeader } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import FetchingSpinner from "@/components/common/FetchingSpinner";
import EditCategoryModal from "@/pages/private/components/EditCategoryModal";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import EditButton from "@/components/common/EditButton";
import DeleteButton from "@/components/common/DeleteButton";

export default function Category() {
  const { getAccessToken, logout } = useAuth();
  const token = getAccessToken();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const { getAllCategories } = categoryService;

  const fetchCategories = async () => {
    if (!token) {
      toast.error("Por favor, inicia sesión para acceder a esta sección.");
      logout();
      return;
    }
    setLoading(true);
    const { success, categories } = await getAllCategories(token);
    setLoading(false);
    if (!success) {
      toast.error("Error al cargar categorías.");
      return;
    }
    setCategories(categories || []);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSaveCategory = async (cat: Category, isEdit: boolean) => {
    if (!cat.name) return toast.error("El nombre es obligatorio");
    if (!token) {
      toast.error("Por favor, inicia sesión para realizar esta acción.");
      logout();
      return;
    }
    if (!isEdit) {
      const { success, category: created, message } = await categoryService.createCategory(token, {
        name: cat.name,
        description: cat.description,
      });
      if (!success || !created) {
        toast.error(message || "No se pudo crear la categoría.");
        return;
      }
      setCategories((p) => [created, ...p]);
      toast.success("Categoría creada");
    } else {
      setCategories((p) => p.map((c) => (c.id === cat.id ? { ...c, ...cat } : c)));
      toast.success("Categoría actualizada");
    }
    setModalOpen(false);
    setSelectedCategory(null);
  };

  const handleDeleteCategory = async (id: string) => {
    setCategories((p) => p.filter((c) => c.id !== id));
    toast.success("Categoría eliminada");
  };

  const filtered = categories.filter((c) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || (c.description || "").toLowerCase().includes(q) || c.id.includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <>
      <div className="p-6 space-y-6">
        <h1 className="text-4xl font-bold">Categorías</h1>
        <Card className="mb-6 border-0 rounded-none">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="text-start">
                <h3 className="text-2xl font-semibold">Todas las categorías</h3>
              </div>
              <div className="relative w-full max-w-60 md:w-1/3 ml-auto bg-gray-50">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search size={16} />
                </span>
                <Input 
                  placeholder="Buscar" 
                  value={search} 
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} 
                  className="w-full pl-10 border-none" 
                />
              </div>
              <div className="w-full md:w-auto">
                <Button 
                  onClick={() => { 
                    setSelectedCategory(null); 
                    setModalOpen(true); 
                  }}
                >
                  Agregar Categoría
                </Button>
              </div>
            </div>
          </CardContent>

          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-400">ID</TableHead>
                    <TableHead className="text-gray-400">Nombre</TableHead>
                    <TableHead className="text-gray-400">Descripción</TableHead>
                    <TableHead className="text-gray-400">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-start">
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        <FetchingSpinner />
                      </TableCell>
                    </TableRow>
                  ) : paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        No hay resultados
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.id}</TableCell>
                        <TableCell>{c.name}</TableCell>
                        <TableCell>{c.description}</TableCell>
                        <TableCell className="text-center space-x-2">
                          <EditButton handleEdit={() => { 
                            setSelectedCategory(c); 
                            setModalOpen(true); }}
                          />
                          <DeleteButton handleDelete={() => { 
                            setSelectedCategory(c); 
                            setDeleteModalOpen(true); }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {modalOpen && (
          <EditCategoryModal 
            open={modalOpen} 
            onOpenChange={setModalOpen} 
            category={selectedCategory} 
            saveCategory={handleSaveCategory} 
          />
        )}
        {deleteModalOpen && selectedCategory && (
          <ConfirmDeleteModal 
            isOpen={deleteModalOpen} 
            onClose={() => { 
              setDeleteModalOpen(false); 
              setSelectedCategory(null); 
            }} 
            onConfirm={async () => {
            if (selectedCategory && selectedCategory.id) {
              await handleDeleteCategory(selectedCategory.id);
            }
            setDeleteModalOpen(false);
            setSelectedCategory(null);
          }}
          />
        )}
      </div>
    </>
  );
}
