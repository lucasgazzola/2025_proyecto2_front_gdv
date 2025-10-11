import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

type MoreDetailsButtonProps = {
  handleViewDetails: () => void;
};

export default function MoreDetailsButton({
  handleViewDetails,
}: MoreDetailsButtonProps) {
  return (
    <Button
      variant="outline"
      title="Ver más detalles"
      size="sm"
      onClick={handleViewDetails}
    >
      <Eye className="h-3 w-3" />
    </Button>
  );
}
