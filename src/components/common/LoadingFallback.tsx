import { useLanguage } from "@/hooks/useLanguage";

export default function LoadingFallback() {
  const { t } = useLanguage();
  document.title = `${t("common.loading")} | GDV`;

  return (
    <div className="flex items-center justify-center h-screen w-full bg-[#f5f7fa]">
      <div className="flex flex-col items-center space-y-4">
        {/* Spinner limpio y elegante */}
        <div className="border-4 border-t-[#2C638B] border-gray-200 rounded-full w-12 h-12 animate-spin" />

        {/* Mensaje de carga */}
        <p className="text-sm text-gray-700">{t("common.loading")}...</p>
      </div>
    </div>
  );
}
