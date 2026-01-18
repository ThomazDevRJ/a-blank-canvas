import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Package,
  Image,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  Store,
  ChevronLeft,
  Bell,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { title: "Produtos", icon: Package, href: "/admin/produtos" },
  { title: "Banners", icon: Image, href: "/admin/banners" },
  { title: "Pedidos", icon: ShoppingCart, href: "/admin/pedidos" },
  { title: "Configurações", icon: Settings, href: "/admin/configuracoes" },
];

interface SidebarProps {
  className?: string;
  onLogout?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  className,
  onLogout,
  collapsed = false,
  onToggleCollapse,
}) => {
  const location = useLocation();

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "flex flex-col h-full bg-[hsl(168,30%,16%)] transition-all duration-300",
          collapsed ? "w-[72px]" : "w-72",
          className
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "border-b border-white/15 flex items-center",
            collapsed ? "p-4 justify-center" : "p-5"
          )}
        >
          <button
            onClick={onToggleCollapse}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="bg-primary/25 rounded-xl p-2.5 shrink-0">
              <Store className="w-6 h-6 text-primary" />
            </div>
            {!collapsed && (
              <span className="font-bold text-xl text-white tracking-tight">
                Admin
              </span>
            )}
          </button>
        </div>

        {/* Menu Label */}
        {!collapsed && (
          <div className="px-5 pt-6 pb-2">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              Menu
            </span>
          </div>
        )}

        {/* Navigation */}
        <nav
          className={cn(
            "flex-1 space-y-1",
            collapsed ? "px-2 pt-4" : "px-3 pt-2"
          )}
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const linkContent = (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl transition-all duration-200 text-sm font-medium",
                  collapsed ? "p-3 justify-center" : "px-4 py-3",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "text-white/80 hover:bg-white/12 hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && item.title}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="bg-[hsl(220,14%,18%)] border-white/15 text-white"
                  >
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return linkContent;
          })}
        </nav>

        {/* Footer */}
        <div
          className={cn(
            "border-t border-white/15 space-y-1",
            collapsed ? "p-2" : "p-3"
          )}
        >
          {/* Back to store */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/"
                className={cn(
                  "flex items-center gap-2 rounded-xl text-sm text-white/70 hover:bg-white/12 hover:text-white transition-all",
                  collapsed ? "p-3 justify-center" : "px-4 py-2.5"
                )}
              >
                <ChevronLeft className="w-5 h-5 shrink-0" />
                {!collapsed && "Voltar à loja"}
              </Link>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent
                side="right"
                className="bg-[hsl(220,14%,18%)] border-white/15 text-white"
              >
                Voltar à loja
              </TooltipContent>
            )}
          </Tooltip>

          {/* Logout */}
          {onLogout && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onLogout}
                  className={cn(
                    "flex items-center gap-2 rounded-xl text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all w-full",
                    collapsed ? "p-3 justify-center" : "px-4 py-2.5"
                  )}
                >
                  <LogOut className="w-5 h-5 shrink-0" />
                  {!collapsed && "Sair"}
                </button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent
                  side="right"
                  className="bg-[hsl(220,14%,18%)] border-white/15 text-white"
                >
                  Sair
                </TooltipContent>
              )}
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

const AdminLayout: React.FC = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Load collapsed state from localStorage
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    return saved === "true";
  });

  // Persist collapsed state
  useEffect(() => {
    localStorage.setItem("admin-sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  if (!user) return null;

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const userInitials = user.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email?.slice(0, 2).toUpperCase();

  const userName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuário";

  return (
    <div className="min-h-screen bg-[hsl(220,15%,13%)] admin-dark flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block shrink-0">
        <Sidebar
          className="fixed top-0 left-0 h-screen"
          onLogout={handleLogout}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />
      </aside>

      {/* Spacer for fixed sidebar */}
      <div
        className={cn(
          "hidden lg:block shrink-0 transition-all duration-300",
          collapsed ? "w-[72px]" : "w-72"
        )}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[hsl(220,14%,16%)]/90 backdrop-blur-xl border-b border-white/10 h-16 flex items-center px-4 lg:px-6 gap-4">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-white/80 hover:text-white hover:bg-white/12"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="p-0 w-72 bg-[hsl(168,30%,16%)] border-0"
            >
              <Sidebar onLogout={handleLogout} />
            </SheetContent>
          </Sheet>

          {/* Search */}
          <div className="hidden md:flex max-w-md">
            <div className="relative w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar..."
                className="pl-10 bg-gray-600/50 border-gray-500/50 text-white placeholder:text-gray-400 focus-visible:ring-primary/50 focus-visible:border-primary/50 rounded-lg h-10"
              />
            </div>
          </div>

          {/* Spacer to push everything to the right */}
          <div className="flex-1" />

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white/60 hover:text-white hover:bg-white/12 relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-primary rounded-full" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 hover:bg-white/12 px-2 py-1.5 h-auto rounded-lg"
                >
                  <Avatar className="w-9 h-9 ring-2 ring-primary/30">
                    <AvatarFallback className="bg-primary/25 text-primary font-semibold text-sm">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-white">{userName}</p>
                    <p className="text-xs text-white/50">
                      {isAdmin ? "Administrador" : "Usuário"}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-[hsl(220,14%,18%)] border-white/15"
              >
                <div className="px-3 py-2.5">
                  <p className="text-sm font-medium text-white">{userName}</p>
                  <p className="text-xs text-white/50 truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-white/15" />
                <DropdownMenuItem
                  onClick={() => navigate("/admin/configuracoes")}
                  className="text-white/80 focus:text-white focus:bg-white/12"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/15" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-400 focus:text-red-300 focus:bg-red-500/15"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
