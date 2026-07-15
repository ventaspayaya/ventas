"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Menu, Bell, Calendar, ChevronDown, X, ShoppingCart, LogOut 
} from "lucide-react";

import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [menuDesplegable, setMenuDesplegable] = useState(false);
  
  const [cargando, setCargando] = useState(true);
  const [nombreUsuario, setNombreUsuario] = useState("");

  const pathname = usePathname();
  const router = useRouter();

  // VALIDACIÓN DE SESIÓN
  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    const userName = localStorage.getItem("userName");

    if (!userRole && pathname !== '/login') {
      router.push('/login');
    } else {
      setNombreUsuario(userName || "Usuario");
      setCargando(false);
    }
  }, [pathname, router]);

  // FUNCIÓN PARA CERRAR SESIÓN
  const cerrarSesion = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    setSidebarAbierto(false);
    setMenuDesplegable(false);
    router.push('/login');
  };

  const obtenerTitulo = () => {
    if (pathname === '/' || pathname === '') return 'Inicio';
    return pathname.replace('/', '').charAt(0).toUpperCase() + pathname.slice(2);
  };

  const isLoginPage = pathname === '/login';

  return (
    <html lang="es">
      <body className="font-sans overflow-hidden">
        
        {cargando ? (
          <div className="flex h-screen w-full items-center justify-center bg-[#f4f6f9] font-semibold text-gray-500">
            Validando credenciales...
          </div>
        ) : isLoginPage ? (
          <div className="h-screen w-full overflow-y-auto bg-[#f4f6f9]">
            {children}
          </div>
        ) : (
          <div className="flex h-screen bg-[#f4f6f9] text-sm relative w-full">
            
            {sidebarAbierto && (
              <div 
                className="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity"
                onClick={() => setSidebarAbierto(false)}
              />
            )}

            {/* SIDEBAR */}
            <aside className={`
              fixed inset-y-0 left-0 z-50 w-[220px] bg-[#2a3f54] text-slate-300 flex flex-col shrink-0
              transition-transform duration-300 transform lg:translate-x-0 lg:static lg:inset-auto
              ${sidebarAbierto ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
            `}>
              <div className="p-4 bg-[#2a3f54] text-white font-bold text-2xl flex items-center justify-between lg:justify-start gap-2 mb-4 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
                    <span className="text-[#2a3f54] text-xs">☁️</span>
                  </div> 
                  Payaya
                </div>
                <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarAbierto(false)}>
                  <X size={20} />
                </button>
              </div>
              
              <nav className="flex-1 space-y-1">
                <Link href="/ventas" onClick={() => setSidebarAbierto(false)} className={`flex items-center gap-3 px-4 py-3 transition-colors border-l-4 ${pathname?.includes('/ventas') || pathname === '/' ? 'bg-[#3a4e63] text-white border-[#3b82f6]' : 'hover:bg-[#35495e] border-transparent'}`}>
                  <ShoppingCart size={18} /> Ventas
                </Link>
                <Link href="/caja" onClick={() => setSidebarAbierto(false)} className={`flex items-center gap-3 px-4 py-3 transition-colors border-l-4 ${pathname?.includes('/caja') ? 'bg-[#3a4e63] text-white border-[#3b82f6]' : 'hover:bg-[#35495e] border-transparent'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><path d="M12 18V6"></path></svg> Caja
                </Link>
              </nav>
              
              {/* Logo PAYAYA con acción de cerrar sesión */}
              <div 
                onClick={cerrarSesion}
                className="p-4 border-t border-slate-600 cursor-pointer hover:bg-[#35495e] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-400 rounded-md text-[#2a3f54] font-black flex items-center justify-center text-xs shrink-0">
                    PY
                  </div>
                  <div className="leading-tight overflow-hidden">
                    <p className="text-white font-semibold text-xs truncate">PAYAYA</p>
                    <p className="text-red-400 text-[10px] truncate">Cerrar Sesión</p>
                  </div>
                </div>
              </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col bg-white overflow-hidden w-full relative min-w-0">
              <header className="bg-white h-[60px] border-b border-gray-200 flex items-center justify-between px-4 shrink-0 shadow-sm z-10 w-full">
                <div className="flex items-center gap-2 md:gap-4">
                  <button className="text-gray-500 hover:text-gray-700 p-1 rounded-md lg:hidden" onClick={() => setSidebarAbierto(true)}>
                    <Menu size={24} />
                  </button>
                  <h1 className="text-lg md:text-[22px] text-gray-700 tracking-tight font-medium">
                    {obtenerTitulo()}
                  </h1>
                </div>
                
                <div className="flex items-center gap-2 md:gap-4 relative">
                  <div className="flex items-center gap-2 md:gap-3 text-gray-500 border-l pl-2 md:pl-4">
                    <Calendar size={16} className="cursor-pointer hover:text-gray-700 hidden sm:inline" />
                    <Bell size={16} className="cursor-pointer hover:text-gray-700" />
                    
                    {/* Botón Usuario con Dropdown */}
                    <div className="relative">
                      <div 
                        className="flex items-center gap-1 cursor-pointer group"
                        onClick={() => setMenuDesplegable(!menuDesplegable)}
                      >
                        <span className="text-xs font-semibold text-gray-600 truncate hidden sm:inline-block group-hover:text-[#00b4d8] transition-colors">
                          {nombreUsuario}
                        </span>
                        <ChevronDown size={12} className="group-hover:text-[#00b4d8]" />
                      </div>

                      {menuDesplegable && (
                        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-lg shadow-xl py-1 z-50">
                          <button 
                            onClick={cerrarSesion}
                            className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                          >
                            <LogOut size={14} /> Cerrar Sesión
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto bg-white flex flex-col min-h-0 w-full">
                {children}
              </div>
            </main>
          </div>
        )}
      </body>
    </html>
  );
}