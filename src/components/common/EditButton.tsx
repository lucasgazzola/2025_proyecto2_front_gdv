import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

type EditButtonProps = {
  handleEdit: () => void;
};

export default function EditButton({ handleEdit }: EditButtonProps) {
  return (
    <Button variant="secondary" title="Editar" size="sm" onClick={handleEdit}>
      <Pencil className="h-3 w-3" />
    </Button>
  );
}
