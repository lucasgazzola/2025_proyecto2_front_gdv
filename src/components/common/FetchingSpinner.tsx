export default function FetchingSpinner() {
  return (
    <div className="flex justify-center py-10">
      <div className="flex flex-col items-center space-y-2 text-sm text-muted-foreground">
        <div className="w-6 h-6 border-4 border-t-[#2C638B] border-gray-200 rounded-full animate-spin" />
        <span>Cargando registros</span>
      </div>
    </div>
  );
}
