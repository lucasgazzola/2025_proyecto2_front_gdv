import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ConfirmDeleteModalProps = {
  confirmDeleteOpen: boolean;
  setConfirmDeleteOpen: (open: boolean) => void;
};

export default function ConfirmDeleteModal({
  confirmDeleteOpen,
  setConfirmDeleteOpen,
}: ConfirmDeleteModalProps) {
  const handleDeleteCompany = () => {
    // if (companyToDelete.id) {
    //   deleteCompany(companyToDelete.id);
    //   setConfirmDeleteOpen(false);
    // }
  };

  return (
    <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Confirmar eliminación?</DialogTitle>
          <DialogDescription>
            Estás por eliminar <strong></strong>. Esta acción no se puede
            deshacer. ¿Estás seguro?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setConfirmDeleteOpen(false);
            }}
          >
            Cancelar
          </Button>
          <Button variant="destructive" onClick={() => handleDeleteCompany()}>
            Sí, eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
