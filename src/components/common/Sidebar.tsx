import { NavLink, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getSidebarRoutesForRole } from "@/routes";
import useAuth from "@/hooks/useAuth";
import { isValidRole } from "@/types/Role";
import RightArrowSidebarMenu from "./RightArrowSidebarMenu";

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
  const { role } = useAuth();

  const sidebarItems = isValidRole(role) ? getSidebarRoutesForRole(role) : [];

  return (
    <aside
      className={cn(
        "transition-all duration-300 ease-in-out bg-white text-[#9197b3] flex flex-col justify-between overflow-y-auto border-r-[1px] border-r-[#eee]",
        isOpen ? "w-24 text-xs lg:w-72 lg:text-lg" : "w-0 lg:w-16"
      )}
    >
      {/* Logo y navegación */}
      <div className="">
        <div className={`flex w-full justify-center ${isOpen && "p-4"}`}>
          <Link title="Dashboard" to="/dashboard" className="flex items-center">
            <img
              src={isOpen ? "/logo/InvoIQLogo.png" : "/logo/InvoIQLogo.png"}
              alt="Logo"
              className={`${isOpen ? "w-32" : "h-full mb-4"}`}
            />
          </Link>
        </div>

        {isOpen && <div className="px-4 py-2 text-sm font-medium">Menú</div>}

        <nav className="px-4 space-y-1 mb-10">
          {sidebarItems.map((item) => (
            <NavLink
              title={item.label}
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col lg:flex-row items-center gap-2 lg:px-1 py-2 rounded-[8px] hover:bg-[#8061fc] hover:text-gray-100 transition",
                  isActive && "bg-[#5932EA] text-white",
                  isOpen ? "justify-start px-1 lg:px-2" : "justify-center px-0"
                )
              }
            >
              <item.icon className="w-4 h-4" />
              {isOpen && <span>{item.label}</span>}
              {isOpen && <RightArrowSidebarMenu />}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
