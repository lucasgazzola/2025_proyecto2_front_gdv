import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";

export default function MainLayout() {
  document.title = `Bienvenidos | InvoIQ`;

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const storedSidebarState = localStorage.getItem("isSidebarOpen");
    if (storedSidebarState === null) {
      localStorage.setItem("isSidebarOpen", "true");
    }
    if (storedSidebarState === "true") {
      setIsSidebarOpen(true);
    }
    if (storedSidebarState === "false") {
      setIsSidebarOpen(false);
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
    window.localStorage.setItem("isSidebarOpen", `${!isSidebarOpen}`);
  };

  return (
    <div className="flex min-h-dvh text-[#74788d]">
      <div className="max-h-screen h-full flex sticky top-0">
        <Sidebar isOpen={isSidebarOpen} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="sticky top-0 z-50">
          <Header
            onToggleSidebar={toggleSidebar}
            userAvatarUrl="https://cdn3.iconfinder.com/data/icons/communication-social-media-1/24/account_profile_user_contact_person_avatar_placeholder-512.png"
          />
        </div>

        <main className="flex-1 bg-[#f7f9ff] pt-14">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
