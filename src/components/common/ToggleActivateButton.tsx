import { Button } from "../ui/button";

type ToggleActivateButtonProps = {
  status: string;
  handleToggle: () => void;
};

export default function ToggleActivateButton({
  status,
  handleToggle,
}: ToggleActivateButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={`${
        status === "activo"
          ? "text-red-500 border-red-200 hover:bg-red-50"
          : "text-green-500 border-green-200 hover:bg-green-50"
      }`}
      onClick={handleToggle}
    >
      {status === "activo" ? "Desactivar" : "Activar"}
    </Button>
  );
}
