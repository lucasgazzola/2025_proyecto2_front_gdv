import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { Pencil } from "lucide-react";

type EditButtonProps = {
  handleEdit: () => void;
};

export default function EditButton({ handleEdit }: EditButtonProps) {
  const { t } = useLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      className="min-w-[80px] h-8"
      onClick={handleEdit}
    >
      <Pencil className="h-3 w-3" />
      {t("common.edit")}
    </Button>
  );
}
