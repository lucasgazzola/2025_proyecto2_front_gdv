import { NavLink, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { footerLinks, getSidebarRoutesForRole } from "@/routes";
import useAuth from "@/hooks/useAuth";
import { isValidRole } from "@/types/Role";

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
  const { t } = useLanguage();
  const { role } = useAuth();

  const sidebarItems = isValidRole(role) ? getSidebarRoutesForRole(role) : [];

  return (
    <aside
      className={cn(
        "transition-all duration-300 ease-in-out bg-[#001D31] text-[#6595bf] flex flex-col justify-between overflow-y-auto",
        isOpen ? "w-24 text-xs lg:w-64 lg:text-lg" : "w-0 lg:w-16"
      )}
    >
      {/* Logo y navegación */}
      <div className="">
        <div className="flex w-full justify-center p-4">
          <Link
            title={t("nav.dashboard")}
            to="/dashboard"
            className="flex items-center"
          >
            <img
              src={isOpen ? "/logo.png" : "/logo-collapsed.png"}
              alt="Logo"
              className={`${isOpen ? "w-24" : "h-10 mb-4"}`}
            />
          </Link>
        </div>

        {isOpen && (
          <div className="px-4 py-2 text-sm font-medium">
            {t("nav.company")}
          </div>
        )}

        <nav className="px-2 space-y-1 mb-10">
          {sidebarItems.map((item) => (
            <NavLink
              title={t(item.label)}
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col lg:flex-row items-center gap-2 lg:px-4 py-2 rounded hover:bg-[#006396] hover:text-gray-200 transition",
                  isActive ? "bg-[#006497] text-white" : "text-[#6595bf]",
                  isOpen ? "justify-start px-1 lg:px-4" : "justify-center px-0"
                )
              }
            >
              <item.icon className="w-4 h-4" />
              {isOpen && <span>{t(item.label)}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Enlaces inferiores */}
      <div className="flex flex-col gap-2 px-2 pb-6">
        {footerLinks.map((item) => (
          <NavLink
            title={t(item.label)}
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col lg:flex-row items-center gap-0 lg:gap-2 lg:px-4 py-1 lg:py-2 rounded hover:text-gray-200 transition",
                isActive ? "text-white font-medium" : "text-[#6595bf]",
                isOpen ? "justify-start px-0 lg:px-4" : "justify-center px-0"
              )
            }
          >
            <item.icon className="w-4 h-4 lg:block hidden" />
            {isOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
