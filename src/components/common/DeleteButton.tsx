import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type DeleteButtonProps = {
  handleDelete: () => void;
};

export default function DeleteButton({ handleDelete }: DeleteButtonProps) {
  return (
    <Button variant="destructive" onClick={handleDelete}>
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}
