import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";
// import { useCurrency } from "@/contexts/CurrencyContext";
import { Globe } from "lucide-react";

export default function Config() {
  const { t, language, setLanguage } = useLanguage();
  // const { currency, setCurrency } = useCurrency();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">{t("config.title")}</h1>
      <p className="text-muted-foreground">{t("config.description")}</p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t("config.language")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs">
            <Select
              value={language}
              onValueChange={(value) => setLanguage(value as "es" | "en")}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("config.selectLanguage")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">{t("config.spanish")}</SelectItem>
                <SelectItem value="en">{t("config.english")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {/*
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t("config.currency")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs">
            <Select
              value={currency}
              onValueChange={(value) => setCurrency(value as "USD" | "EUR")}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("config.selectCurrency")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">{t("config.usd")}</SelectItem>
                <SelectItem value="EUR">{t("config.euro")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
