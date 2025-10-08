import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";

type ToggleBlockButtonProps = {
  isBlocked: boolean;
  handleToggle: () => void;
};

export default function ToggleBlockButton({
  isBlocked,
  handleToggle,
}: ToggleBlockButtonProps) {
  const { t } = useLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      className={`min-w-[80px] h-8 ${
        !isBlocked
          ? "text-red-500 border-red-200 hover:bg-red-50"
          : "text-green-500 border-green-200 hover:bg-green-50"
      }`}
      onClick={handleToggle}
    >
      {isBlocked ? t("users.unblock") : t("users.block")}
    </Button>
  );
}
