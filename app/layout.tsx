"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, Bell, Calendar, HeadphonesIcon, ChevronDown, X, ShoppingCart 
} from "lucide-react";

import "./globals.css"; // Asegúrate de que esta ruta apunte a tu archivo de Tailwind

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Estado para controlar el menú lateral en dispositivos móviles
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  
  // Para saber en qué página estamos y cambiar estilos dinámicamente
  const pathname = usePathname();

  // Función para formatear el título del Topbar según la ruta
  const obtenerTitulo = () => {
    if (pathname === '/' || pathname === '') return 'Inicio';
    return pathname.replace('/', '').charAt(0).toUpperCase() + pathname.slice(2);
  };

  return (
    <html lang="es">
      <body className="font-sans overflow-hidden">
        <div className="flex h-screen bg-[#f4f6f9] text-sm relative w-full">
          
          {/* 1. CORTINA OSCURA PARA MÓVILES (Fondo semitransparente) */}
          {sidebarAbierto && (
            <div 
              className="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity"
              onClick={() => setSidebarAbierto(false)}
            />
          )}

          {/* 2. SIDEBAR RESPONSIVO */}
          <aside className={`
            fixed inset-y-0 left-0 z-50 w-[220px] bg-[#2a3f54] text-slate-300 flex flex-col shrink-0
            transition-transform duration-300 transform lg:translate-x-0 lg:static lg:inset-auto
            ${sidebarAbierto ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
          `}>
            {/* Header del Sidebar */}
            <div className="p-4 bg-[#2a3f54] text-white font-bold text-2xl flex items-center justify-between lg:justify-start gap-2 mb-4 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
                  <span className="text-[#2a3f54] text-xs">☁️</span>
                </div> 
                Payaya
              </div>
              {/* Botón para cerrar en móvil */}
              <button 
                className="lg:hidden text-slate-400 hover:text-white" 
                onClick={() => setSidebarAbierto(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Navegación del Sidebar */}
            <nav className="flex-1 space-y-1">
              <Link 
                href="/ventas" 
                onClick={() => setSidebarAbierto(false)}
                className={`flex items-center gap-3 px-4 py-3 transition-colors border-l-4 ${
                  pathname?.includes('/ventas') || pathname === '/'
                    ? 'bg-[#3a4e63] text-white border-[#3b82f6] shadow-sm' 
                    : 'hover:bg-[#35495e] border-transparent'
                }`}
              >
                <ShoppingCart size={18} /> Ventas
              </Link>
              <Link 
                href="/caja" 
                onClick={() => setSidebarAbierto(false)}
                className={`flex items-center gap-3 px-4 py-3 transition-colors border-l-4 ${
                  pathname?.includes('/caja') 
                    ? 'bg-[#3a4e63] text-white border-[#3b82f6] shadow-sm' 
                    : 'hover:bg-[#35495e] border-transparent'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"  aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><path d="M12 18V6"></path></svg> Caja
              </Link>
            </nav>
            
            {/* Footer del Sidebar (Usuario/Empresa) */}
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3 border-t border-slate-600 pt-4">
                <div className="w-8 h-8 bg-yellow-400 rounded-md text-[#2a3f54] font-black flex items-center justify-center text-xs shrink-0">
                  PY
                </div>
                <div className="leading-tight overflow-hidden">
                  <p className="text-white font-semibold text-xs truncate">PAYAYA</p>
                  <p className="text-slate-400 text-[10px] truncate">Empresa</p>
                </div>
              </div>
            </div>
          </aside>

          {/* 3. CONTENEDOR PRINCIPAL (Lado Derecho) */}
          <main className="flex-1 flex flex-col bg-white overflow-hidden w-full relative min-w-0">
            
            {/* Topbar Fijo */}
            <header className="bg-white h-[60px] border-b border-gray-200 flex items-center justify-between px-4 shrink-0 shadow-sm z-10 w-full">
              <div className="flex items-center gap-2 md:gap-4">
                {/* Botón de Hamburguesa exclusivo para móvil */}
                <button 
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-md lg:hidden" 
                  onClick={() => setSidebarAbierto(true)}
                >
                  <Menu size={24} />
                </button>
                <h1 className="text-lg md:text-[22px] text-gray-700 tracking-tight font-medium">
                  {obtenerTitulo()}
                </h1>
              </div>
              
              <div className="flex items-center gap-2 md:gap-4">
                <div className="flex items-center gap-2 md:gap-3 text-gray-500 border-l pl-2 md:pl-4">
                  <Calendar size={16} className="cursor-pointer hover:text-gray-700 hidden sm:inline" />
                  <Bell size={16} className="cursor-pointer hover:text-gray-700" />
                  <div className="flex items-center gap-1 cursor-pointer">
                    <span className="text-xs font-semibold text-gray-600 max-w-[80px] truncate hidden sm:inline-block">
                      Admin
                    </span>
                    <ChevronDown size={12} />
                  </div>
                </div>
              </div>
            </header>

            {/* 4. CONTENIDO DINÁMICO DE CADA PÁGINA */}
            {/* Aquí se inyectará app/ventas/page.tsx, app/caja/page.tsx, etc. */}
            <div className="flex-1 overflow-y-auto bg-white flex flex-col min-h-0 w-full">
              {children}
            </div>
            
          </main>
        </div>
      </body>
    </html>
  );
}