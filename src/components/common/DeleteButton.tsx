import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";

type DeleteButtonProps = {
  handleDelete: () => void;
};

export default function DeleteButton({ handleDelete }: DeleteButtonProps) {
  const { t } = useLanguage();
  return (
    <Button variant="destructive" onClick={handleDelete}>
      <Trash2 className="w-4 h-4" />
      <span className="text-sm">{t("common.delete")}</span>
    </Button>
  );
}
