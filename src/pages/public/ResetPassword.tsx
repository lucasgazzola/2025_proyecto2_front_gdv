// src/pages/auth/ResetPassword.tsx
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { useLanguage } from "@/hooks/useLanguage";
import { authService } from "@/services/factories/authServiceFactory";
const { resetPassword: resetPasswordService } = authService;
import { ArrowLeft } from "lucide-react";

export default function ResetPassword() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [formData, setFormData] = useState({
    tokenPass: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.tokenPass ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      toast.error(t("auth.allFieldsRequired"));
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error(t("auth.passwordMismatch"));
      return;
    }

    setLoading(true);
    const { success, message } = await resetPasswordService(
      email,
      formData.tokenPass,
      formData.newPassword,
      formData.confirmPassword
    );
    setLoading(false);
    if (!success) {
      toast.error(message || t("auth.passwordResetFailed"));
      return;
    }

    toast.success(t("auth.passwordResetSuccess"));
    navigate("/login");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#c7d7e4] px-4">
      <div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate(-1)}
          className="absolute top-10 left-10 flex items-center gap-2 px-3 py-2 bg-white text-blue-700 hover:text-blue-900 hover:bg-blue-100 transition-colors rounded-md shadow-sm"
        >
          <ArrowLeft className="w-96 h-96" />
          {/* <span className="text-sm font-medium">{t("common.back")}</span> */}
        </Button>
      </div>
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-8 w-full"
        >
          <h2 className="text-xl font-semibold mb-4">{t("auth.resetTitle")}</h2>

          <Input
            type="text"
            name="tokenPass"
            placeholder={t("auth.enterTokenPass")}
            value={formData.tokenPass}
            onChange={handleChange}
            className="mb-3"
            required
          />

          <Input
            type="password"
            name="newPassword"
            placeholder={t("auth.enterNewPassword")}
            value={formData.newPassword}
            onChange={handleChange}
            className="mb-3"
            required
          />

          <Input
            type="password"
            name="confirmPassword"
            placeholder={t("auth.confirmNewPassword")}
            value={formData.confirmPassword}
            onChange={handleChange}
            className="mb-4"
            required
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t("common.loading") : t("auth.resetPassword")}
          </Button>
        </form>
      </div>
    </div>
  );
}
