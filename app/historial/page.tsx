"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Menu, Bell, Calendar, HeadphonesIcon, ChevronDown, 
  ShoppingCart, CircleDollarSign, HelpCircle, Search, 
  Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from "lucide-react";

// Mock data basado en tu captura de pantalla
const VENTAS_HISTORIAL = [
  { id: "TK01-00043408", fecha: "11-07-2026 03:18 PM", cliente: "CLIENTE", total: 2.00, extra: 0.00, estado: "Pagado" },
  { id: "TK01-00043407", fecha: "11-07-2026 03:07 PM", cliente: "CLIENTE", total: 1.00, extra: 0.00, estado: "Pagado" },
  { id: "TK01-00043406", fecha: "11-07-2026 03:06 PM", cliente: "CLIENTE", total: 11.40, extra: 0.00, estado: "Pagado" },
  { id: "1783800460880214", fecha: "11-07-2026 03:05 PM", cliente: "CLIENTE", total: 2.20, extra: 2.20, estado: "Borrador" },
  { id: "TK01-00043405", fecha: "11-07-2026 02:50 PM", cliente: "CLIENTE", total: 7.50, extra: 0.00, estado: "Pagado" },
  { id: "TK01-00043404", fecha: "11-07-2026 02:32 PM", cliente: "CLIENTE", total: 3.00, extra: 0.00, estado: "Pagado" },
  { id: "TK01-00043403", fecha: "11-07-2026 02:27 PM", cliente: "CLIENTE", total: 3.80, extra: 0.00, estado: "Pagado" },
  { id: "TK01-00043402", fecha: "11-07-2026 02:15 PM", cliente: "CLIENTE", total: 1.00, extra: 0.00, estado: "Pagado" },
  { id: "TK01-00043401", fecha: "11-07-2026 02:10 PM", cliente: "CLIENTE", total: 9.20, extra: 0.00, estado: "Pagado" },
  { id: "TK01-00043400", fecha: "11-07-2026 02:00 PM", cliente: "CLIENTE", total: 1.00, extra: 0.00, estado: "Pagado" },
  { id: "TK01-00043399", fecha: "11-07-2026 01:44 PM", cliente: "CLIENTE", total: 22.00, extra: 0.00, estado: "Pagado" },
  { id: "TK01-00043398", fecha: "11-07-2026 01:41 PM", cliente: "CLIENTE", total: 2.40, extra: 0.00, estado: "Pagado" },
  { id: "TK01-00043397", fecha: "11-07-2026 01:38 PM", cliente: "CLIENTE", total: 2.50, extra: 0.00, estado: "Pagado" },
  { id: "TK01-00043396", fecha: "11-07-2026 01:38 PM", cliente: "CLIENTE", total: 4.50, extra: 0.00, estado: "Pagado" },
];

export default function HistorialVentasPage() {
  const [seleccionados, setSeleccionados] = useState<string[]>(["TK01-00043408"]); // Pre-seleccionamos uno como en la imagen

  const toggleSeleccion = (id: string) => {
    if (seleccionados.includes(id)) {
      setSeleccionados(seleccionados.filter(item => item !== id));
    } else {
      setSeleccionados([...seleccionados, id]);
    }
  };

  const seleccionarTodos = () => {
    if (seleccionados.length === VENTAS_HISTORIAL.length) {
      setSeleccionados([]);
    } else {
      setSeleccionados(VENTAS_HISTORIAL.map(v => v.id));
    }
  };

  return (
    <div className="flex h-screen bg-[#f4f6f9] text-sm overflow-hidden font-sans">

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col bg-[#f4f6f9] overflow-hidden">

        {/* TABS */}
        <div className="bg-white border-b border-gray-200 px-6 flex gap-8 text-gray-500 font-medium shrink-0">
          <button className="py-3 text-[#00b4d8] border-b-2 border-[#00b4d8] font-semibold">Historial</button>
          <button className="py-3 hover:text-[#00b4d8] transition-colors border-b-2 border-transparent">Envases</button>
          <Link href="/ventas">
                    <button className="py-3 hover:text-[#00b4d8] transition-colors border-b-2 border-transparent">Punto de venta</button>

          </Link>
        </div>

        {/* CONTENIDO HISTORIAL */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-[1400px] mx-auto space-y-4">
            
            {/* Buscador y Filtros */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-3xl">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Empieza a escribir para buscar ventas" 
                  className="w-full bg-white border border-gray-200 rounded-md py-2 pl-10 pr-4 outline-none focus:border-[#00b4d8] transition-colors shadow-sm"
                />
              </div>
              <div className="flex items-center gap-3">
                <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-50 shadow-sm transition-colors">
                  <Filter size={16} />
                  Filtrar
                </button>
                <Link href="/ventas">
                  <button className="bg-[#007ba7] hover:bg-[#006080] text-white px-4 py-2 rounded-md font-medium shadow-sm transition-colors">
                    Nueva venta
                  </button>
                </Link>
              </div>
            </div>

            {/* Tabla Contenedor */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
              
              {/* Cabecera de acciones (cuando hay seleccionados) */}
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-4 h-14">
                <input 
                  type="checkbox" 
                  checked={seleccionados.length > 0}
                  onChange={seleccionarTodos}
                  className="w-4 h-4 rounded border-gray-300 text-[#007ba7] focus:ring-[#007ba7] cursor-pointer"
                />
                {seleccionados.length > 0 ? (
                  <div className="flex items-center gap-4 animate-in fade-in duration-200">
                    <span className="text-sm font-medium text-gray-700">{seleccionados.length} seleccionado(s)</span>
                    <button className="bg-[#007ba7] text-white px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1 hover:bg-[#006080] transition-colors">
                      Acciones <ChevronDown size={14} />
                    </button>
                  </div>
                ) : (
                  <span className="text-sm font-medium text-gray-500">Seleccionar todos</span>
                )}
              </div>

              {/* Lista de Ventas */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px] text-gray-600">
                  <tbody className="divide-y divide-gray-100">
                    {VENTAS_HISTORIAL.map((venta) => (
                      <tr 
                        key={venta.id} 
                        className={`hover:bg-blue-50/50 transition-colors group ${seleccionados.includes(venta.id) ? 'bg-blue-50/30' : ''}`}
                      >
                        <td className="px-4 py-3.5 w-12 text-center">
                          <input 
                            type="checkbox" 
                            checked={seleccionados.includes(venta.id)}
                            onChange={() => toggleSeleccion(venta.id)}
                            className="w-4 h-4 rounded border-gray-300 text-[#007ba7] focus:ring-[#007ba7] cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3.5 font-medium text-[#007ba7] hover:underline cursor-pointer">{venta.id}</td>
                        <td className="px-4 py-3.5 text-gray-500">{venta.fecha}</td>
                        <td className="px-4 py-3.5 text-gray-500">{venta.cliente}</td>
                        <td className="px-4 py-3.5 text-right font-medium text-gray-700">S/ {venta.total.toFixed(2)}</td>
                        <td className="px-4 py-3.5 text-right text-gray-500">S/ {venta.extra.toFixed(2)}</td>
                        <td className="px-4 py-3.5 text-right">
                          <span className={`inline-block px-2.5 py-1 rounded text-xs font-medium min-w-[70px] text-center ${
                            venta.estado === 'Pagado' 
                              ? 'bg-[#007ba7] text-white' 
                              : 'bg-gray-400 text-white'
                          }`}>
                            {venta.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              <div className="px-4 py-3 border-t border-gray-200 flex items-center bg-white">
                <div className="flex border border-gray-200 rounded-md overflow-hidden">
                  <button className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-500 border-r border-gray-200"><ChevronsLeft size={14} /></button>
                  <button className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-500 border-r border-gray-200"><ChevronLeft size={14} /></button>
                  <button className="px-3 py-1.5 bg-[#2563eb] text-white font-medium border-r border-gray-200">1</button>
                  <button className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-600 font-medium border-r border-gray-200">2</button>
                  <button className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-600 font-medium border-r border-gray-200">3</button>
                  <span className="px-3 py-1.5 bg-white text-gray-400 border-r border-gray-200">...</span>
                  <button className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-600 font-medium border-r border-gray-200">868</button>
                  <button className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-500 border-r border-gray-200"><ChevronRight size={14} /></button>
                  <button className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-500"><ChevronsRight size={14} /></button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}