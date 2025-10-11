import { useNavigate } from "react-router";
import { LogOut, Menu, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import useAuth from "@/hooks/useAuth";

interface HeaderProps {
  userAvatarUrl?: string;
  onToggleSidebar: () => void;
}

export default function Header({
  userAvatarUrl,
  onToggleSidebar,
}: HeaderProps) {
  const navigate = useNavigate();

  const { logout, name, lastname } = useAuth();

  return (
    <header className="bg-[#ffffff] px-6 py-4 flex justify-between items-center shadow-md">
      <button
        type="button"
        title="Open Menu"
        onClick={onToggleSidebar}
        className="p-2 rounded-md"
      >
        <Menu className="h-6 w-6" />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-3 cursor-pointer">
            <Avatar>
              <AvatarImage src={userAvatarUrl} alt={`Avatar de ${name}`} />
              <AvatarFallback>{name}</AvatarFallback>
            </Avatar>
            <span className="hidden sm:text-sm sm:inline md:text-sm text-[#001d31] font-medium">
              {name} {lastname}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white text-black">
          <DropdownMenuItem
            onClick={() => navigate("/profile")}
            className="cursor-pointer"
          >
            <User className="w-4 h-4 mr-2" />
            {"Mi perfil"}
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="cursor-pointer">
            <LogOut className="w-4 h-4 mr-2" />
            {"Cerrar sesión"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
