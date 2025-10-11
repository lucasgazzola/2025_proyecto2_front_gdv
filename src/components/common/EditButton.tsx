import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

type EditButtonProps = {
  handleEdit: () => void;
};

export default function EditButton({ handleEdit }: EditButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="min-w-[80px] h-8"
      onClick={handleEdit}
    >
      <Pencil className="h-3 w-3" />
      Editar
    </Button>
  );
}
