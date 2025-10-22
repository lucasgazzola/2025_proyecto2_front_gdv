import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import useAuth from "@/hooks/useAuth";
import type { Provider, ProviderFormData } from "@/types/Provider";
import EditProviderModal from "@/pages/private/components/EditProviderModal";
import { providerService } from "@/services/factories/providerServiceFactory";
const { deleteProviderById, getAllProviders, getProviderById, createProvider, updateProviderById } = providerService;
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableRow, 
  TableCell, 
  TableHead, 
  TableHeader 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import DeleteButton from "@/components/common/DeleteButton";
import EditButton from "@/components/common/EditButton";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import { Input } from "@/components/ui/input";
import FetchingSpinner from "@/components/common/FetchingSpinner";


export default function Provider() {
  const { getAccessToken, logout } = useAuth();
  const token = getAccessToken();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
      null
    );
  const [search, setSearch] = useState("");
  const providersPerPage = 10;

  const fetchProviders = async () => {
    if (!token) {
      toast.error("Por favor, inicia sesión para acceder a esta sección.");
      logout();
      return;
    }

    setLoading(true);
    const { success, providers } = await getAllProviders(token);
    setLoading(false);

    if (!success) {
      toast.error("Error al cargar los proveedores. Intenta nuevamente.");
      return;
    }

    if (!providers || providers.length === 0) {
      toast.info("No hay proveedores registrados.");
      return;
    }

    setProviders(providers);
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleSaveProvider = async (
    provider: Provider | ProviderFormData,
    isEdit: boolean
  ) => {
    if (!provider.name) {
      toast.error("El nombre es obligatorio.");
    }
    
    if (!token) {
      toast.error("Por favor, inicia sesión para realizar esta acción.");
      logout();
      return;
    }

    if (!isEdit) {
      const { success, provider: newProvider } = await createProvider(token, provider);
      if (!success || !newProvider) {
        toast.error("Error al crear el proveedor. Intenta nuevamente.");
        return;
      }
      setProviders((prev) => [newProvider, ...prev]);
      toast.success("Proveedor creado correctamente.");
    } else {
      if (!provider) {
        toast.error("Proveedor no encontrado.");
        return;
      }
      if (!("id" in provider) || !provider.id) {
        toast.error("ID del proveedor es necesario para actualizar.");
        return;
      }
      const { success, message } = await updateProviderById(
        token,
        provider.id,
        provider
      );
      if (!success) {
        toast.error(message);
        return;
      }
      setProviders((prev) =>
        prev.map((p) => (p.id === provider.id ? { ...p, ...provider } : p))
      );
      toast.success("Proveedor actualizado correctamente.");
    }
    setModalOpen(false);
    setSelectedProvider(null);
    setCurrentPage(1);
  };

  const handleDeleteProvider = async (p: Provider) => {
    if (!token) {
      toast.error("Por favor, inicia sesión para realizar esta acción.");
      logout();
      return;
    }
    const { success } = await deleteProviderById(token, p.id);
    if (!success) {
      toast.error("Error al eliminar el proveedor. Intenta nuevamente.");
      return;
    }
    setProviders((prev) => prev.filter((x) => x.id !== p.id));
    toast.success("Proveedor eliminado correctamente.");
  };

  const filteredProviders = providers.filter((provider) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;

    return (
      provider.name.toLowerCase().includes(q) ||
      String(provider.productsCount).toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredProviders.length / providersPerPage);
  const paginatedProviders = filteredProviders.slice(
    (currentPage - 1) * providersPerPage,
    currentPage * providersPerPage
  );

  return (
    <>
      <div className="p-6 space-y-6">
        <h1 className="text-4xl font-bold">Proveedores</h1>
        <Card className="mb-6 border-0 rounded-none">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="text-start">
                <h3 className="text-2xl font-semibold">Todos los proveedores</h3>
              </div>
              <div className="relative w-full max-w-60 md:w-1/3 ml-auto bg-gray-50">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search size={16} />
                </span>
                <Input
                  aria-label="Buscar proveedor"
                  placeholder="Buscar"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 border-none"
                />
              </div>
              <div className="w-full md:w-auto">
                <Button
                  onClick={() => {
                    setSelectedProvider(null);
                    setModalOpen(true);
                  }}
                >
                  Agregar Proveedor
                </Button>
              </div>
            </div>
          </CardContent>
          
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-400">Código</TableHead>
                    <TableHead className="text-gray-400">Nombre</TableHead>
                    <TableHead className="text-gray-400">Dirección</TableHead>
                    <TableHead className="text-gray-400">Cantidad productos</TableHead>
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
                  ) : paginatedProviders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        No hay resultados
                      </TableCell>
                    </TableRow> 
                  ) : (
                    paginatedProviders.map((provider) => (
                      <TableRow key={provider.id}>
                        <TableCell>{provider.code}</TableCell>
                        <TableCell>{provider.name}</TableCell>
                        <TableCell>{provider.address ?? "-"}</TableCell>
                        <TableCell>{provider.productsCount ?? 0}</TableCell>
                        <TableCell className="text-center space-x-2">
                          <EditButton 
                            handleEdit={() => {
                              setSelectedProvider(provider);
                              setModalOpen(true);
                            }} 
                          />
                          <DeleteButton 
                            handleDelete={() => {
                              setSelectedProvider(provider);
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
          </CardContent>
        </Card>
      </div>
      {modalOpen && (
        <EditProviderModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          provider={selectedProvider}
          saveProvider={handleSaveProvider}
        />
      )}
      {deleteModalOpen && selectedProvider && (
        <ConfirmDeleteModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedProvider(null);
          }}
          onConfirm={async () => {
            if (selectedProvider && selectedProvider.id) {
              await handleDeleteProvider(selectedProvider.id);
            }
            setDeleteModalOpen(false);
            setSelectedProvider(null);
          }}
        />
      )}
    </>
  );
}