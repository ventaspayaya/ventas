"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Menu, Bell, Calendar, HeadphonesIcon, ChevronDown, 
  HelpCircle, ShoppingCart, CircleDollarSign, 
  Pencil, Unlock, CloudDownload, ArrowRightLeft, Cloud
} from "lucide-react";

export default function CajaPage() {
  const [cajaInicial, setCajaInicial] = useState<number | null>(110.00); // Simulando el valor de la captura
  const [cajaAbierta, setCajaAbierta] = useState(false);

  // Funciones simuladas para la interactividad
  const abrirCaja = () => {
    const monto = prompt("Ingrese el monto inicial para abrir la caja (S/):", "110.00");
    if (monto && !isNaN(Number(monto))) {
      setCajaInicial(parseFloat(monto));
      setCajaAbierta(true);
    }
  };

  return (
    <div className="flex h-screen bg-[#f4f6f9] text-sm overflow-hidden font-sans">
      


      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col bg-[#f4f6f9] overflow-y-auto">
        


        {/* TABS */}
        <div className="bg-white border-b border-gray-200 px-6 flex gap-8 text-gray-500 font-medium shrink-0">
          <button className="py-3 text-[#00b4d8] border-b-2 border-[#00b4d8] font-semibold">Apertura de caja</button>
          <button className="py-3 hover:text-[#00b4d8] transition-colors border-b-2 border-transparent">Cobros</button>
          <button className="py-3 hover:text-[#00b4d8] transition-colors border-b-2 border-transparent">Ingresos</button>
          <button className="py-3 hover:text-[#00b4d8] transition-colors border-b-2 border-transparent">Gastos</button>
        </div>

        {/* CONTENIDO CAJA */}
        <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
          
          {/* BARRA DE ACCIONES (FECHA Y 4 BOTONES) */}
          <div className="flex items-center justify-between">
            <h2 className="text-gray-800 text-lg">Caja del día 10 Jul. 2026 4:13 pm</h2>
            
            <div className="flex gap-4">
              <button className="flex items-center gap-3 bg-white pr-4 rounded-md border border-gray-200 hover:shadow-md transition-shadow group">
                <div className="bg-[#dcfce7] text-[#16a34a] p-3 rounded-l-md"><Pencil size={20} /></div>
                <div className="text-left">
                  <p className="font-semibold text-gray-700 text-sm group-hover:text-[#16a34a]">Editar Caja inicial</p>
                  <p className="text-[11px] text-gray-400">Clic para cambiar el monto</p>
                </div>
              </button>

              <button onClick={abrirCaja} className="flex items-center gap-3 bg-white pr-4 rounded-md border border-gray-200 hover:shadow-md transition-shadow group">
                <div className="bg-[#dcfce7] text-[#16a34a] p-3 rounded-l-md"><Unlock size={20} /></div>
                <div className="text-left">
                  <p className="font-semibold text-gray-700 text-sm group-hover:text-[#16a34a]">Abrir caja</p>
                  <p className="text-[11px] text-gray-400">Clic para abrir caja del día</p>
                </div>
              </button>

              <button className="flex items-center gap-3 bg-white pr-4 rounded-md border border-gray-200 hover:shadow-md transition-shadow group">
                <div className="bg-[#e0f2fe] text-[#0284c7] p-3 rounded-l-md"><CloudDownload size={20} /></div>
                <div className="text-left">
                  <p className="font-semibold text-gray-700 text-sm group-hover:text-[#0284c7]">Reporte de caja</p>
                  <p className="text-[11px] text-gray-400">Descargue su reporte diario de caja</p>
                </div>
              </button>

              <button className="flex items-center gap-3 bg-white pr-4 rounded-md border border-gray-200 hover:shadow-md transition-shadow group">
                <div className="bg-[#fef3c7] text-[#d97706] p-3 rounded-l-md"><ArrowRightLeft size={20} /></div>
                <div className="text-left">
                  <p className="font-semibold text-gray-700 text-sm group-hover:text-[#d97706]">Transferir dinero</p>
                  <p className="text-[11px] text-gray-400">Transfiera el dinero de caja chica</p>
                </div>
              </button>
            </div>
          </div>

          {/* 3 TARJETAS SUPERIORES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Resumen de caja */}
            <div>
              <h3 className="text-gray-400 font-semibold text-xs mb-3">Resumen de caja</h3>
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Estado de caja</span> 
                  <span className={`font-medium ${cajaAbierta ? "text-emerald-500" : "text-[#ef4444]"}`}>
                    {cajaAbierta ? "Caja abierta" : "Caja cerrada"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Caja anterior</span> 
                  <span className="text-gray-500">S/110.00</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Caja inicial</span> 
                  <span className="text-gray-500">S/{cajaInicial?.toFixed(2)}</span>
                </div>
                <div className="pt-2 flex justify-between items-center text-base">
                  <span className="text-gray-800 font-medium">Dinero en caja</span> 
                  <span className="font-bold text-gray-800 text-lg">S/{cajaInicial?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* 2. Ventas por tipo de documentos */}
            <div>
              <h3 className="text-gray-400 font-semibold text-xs mb-3">Ventas por tipo de documentos</h3>
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm h-[184px]">
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Ticket Interno</span>
                  <span>76</span>
                  <span>S/ 331.20</span>
                </div>
              </div>
            </div>

            {/* 3. Gastos de dinero */}
            <div>
              <h3 className="text-gray-400 font-semibold text-xs mb-3">Gastos de dinero</h3>
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-[184px] flex flex-col items-center justify-center text-gray-400">
                <Cloud size={40} className="mb-2 text-gray-300" />
                <p className="text-sm">Aún no hay gastos</p>
              </div>
            </div>
          </div>

          {/* TABLA DE RESUMEN DE INGRESOS */}
          <div>
            <h3 className="text-gray-400 font-semibold text-xs mb-3">Resumen de ingresos por formas de pagos</h3>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-[13px] text-gray-600">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-gray-700 w-1/4">Formas de Pago</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 text-center w-1/4">Transacciones</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 text-center w-1/5">Ingreso(83)</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 text-center w-1/5">Egreso(1)</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4">Efectivo</td>
                    <td className="px-6 py-4 text-center">49</td>
                    <td className="px-6 py-4 text-center">S/140.20</td>
                    <td className="px-6 py-4 text-center">S/140.20</td>
                    <td className="px-6 py-4 text-right">S/110.00</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4">Visa</td>
                    <td className="px-6 py-4 text-center">0</td>
                    <td className="px-6 py-4 text-center">S/0.00</td>
                    <td className="px-6 py-4 text-center">S/0.00</td>
                    <td className="px-6 py-4 text-right">S/0.00</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4">Cheque</td>
                    <td className="px-6 py-4 text-center">0</td>
                    <td className="px-6 py-4 text-center">S/0.00</td>
                    <td className="px-6 py-4 text-center">S/0.00</td>
                    <td className="px-6 py-4 text-right">S/0.00</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4">Deposito a cuenta</td>
                    <td className="px-6 py-4 text-center">1</td>
                    <td className="px-6 py-4 text-center">S/140.20</td>
                    <td className="px-6 py-4 text-center">S/0.00</td>
                    <td className="px-6 py-4 text-right">S/140.20</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4">Yape</td>
                    <td className="px-6 py-4 text-center">34</td>
                    <td className="px-6 py-4 text-center">S/191.00</td>
                    <td className="px-6 py-4 text-center">S/0.00</td>
                    <td className="px-6 py-4 text-right">S/191.00</td>
                  </tr>
                </tbody>
                <tfoot className="bg-gray-50 text-gray-700 border-t border-gray-200">
                  <tr>
                    <td colSpan={4} className="px-6 py-3">Total Neto</td>
                    <td className="px-6 py-3 text-right font-medium">S/441.20</td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="px-6 py-3 text-gray-500">Total en caja (solo transacciones en efectivo)</td>
                    <td className="px-6 py-3 text-right text-gray-500">S/110.00</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}