import { useLanguage } from "@/hooks/useLanguage";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-[#F2F2F4] flex justify-between text-[#006497] text-center p-4">
      <p>&copy; {t("footer.copyright")}</p>
      <p>{t("footer.developedBy")}</p>
    </footer>
  );
}
