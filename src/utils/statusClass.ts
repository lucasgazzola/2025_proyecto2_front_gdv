const getUserStatusClass = (isBlocked: boolean) =>
  !isBlocked ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";

const getStatusClass = (status: string) => {
  switch (status) {
    case "activo":
      return "bg-green-100 text-green-800";
    case "bloqueado":
      return "bg-red-100 text-red-800";
    case "inactivo":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-blue-100 text-blue-800";
  }
};

export type Token = {
  id: number;
  servicio: string;
  tipo: "texto" | "imagen" | "audio";
  modelo: string;
  proveedor: string;
  precio: number; // en USD por millón
  status: "activo" | "bloqueado" | "inactivo";
  moneda: "USD" | "EUR";
};

export { getStatusClass, getUserStatusClass };
