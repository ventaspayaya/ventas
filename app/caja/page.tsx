"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { 
  Pencil, Unlock, CloudDownload, ArrowRightLeft, Cloud, Lock, X
} from "lucide-react";

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CajaPage() {
  const router = useRouter();

  // Estados de la Caja
  const [cajaActiva, setCajaActiva] = useState<any>(null);
  const [cajaAnterior, setCajaAnterior] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  
  // Estados de los cálculos
  const [totalEfectivo, setTotalEfectivo] = useState(0);
  const [totalYape, setTotalYape] = useState(0);
  const [cantidadTransacciones, setCantidadTransacciones] = useState(0);
  const [totalTransferido, setTotalTransferido] = useState(0);

  // Estados de Modales
  const [modalTransferir, setModalTransferir] = useState(false);
  const [montoATransferir, setMontoATransferir] = useState("");
  const [modalReporte, setModalReporte] = useState(false);
  const [modalEditarCaja, setModalEditarCaja] = useState(false);
  const [nuevoMontoCaja, setNuevoMontoCaja] = useState("");

  // 1. CARGAR DATOS DE LA BASE DE DATOS
  const cargarCajaYVentas = async (mostrarCargando = true) => {
    if (mostrarCargando) setCargando(true); // Solo activamos el spinner si es necesario
    
    const { data: caja, error: errorCaja } = await supabase
      .from("cajas")
      .select("*")
      .eq("estado", "abierta")
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (errorCaja) {
      console.error("Error al buscar caja abierta:", errorCaja);
    }

    const { data: cajaCerrada } = await supabase
      .from("cajas")
      .select("*")
      .eq("estado", "cerrada")
      .order("fecha_cierre", { ascending: false })
      .limit(1)
      .maybeSingle();
      
    if (cajaCerrada) {
      setCajaAnterior(cajaCerrada);
    }

    if (caja) {
      setCajaActiva(caja);
      setNuevoMontoCaja(caja.monto_inicial.toString());
      
      const { data: ventas } = await supabase
        .from("ventas")
        .select("metodos_pago")
        .eq("caja_id", caja.id);

      let sumEfectivo = 0;
      let sumYape = 0;
      let count = 0;

      if (ventas) {
        ventas.forEach((venta: any) => {
          count++;
          const pagos = venta.metodos_pago || [];
          pagos.forEach((pago: any) => {
            const monto = parseFloat(pago.monto) || 0;
            if (pago.metodo === "Efectivo") sumEfectivo += monto;
            if (pago.metodo === "Yape") sumYape += monto;
          });
        });
      }
      else {
      setCajaActiva(null);
      setTotalEfectivo(0);
      setTotalYape(0);
      setCantidadTransacciones(0);
    }
    
    if (mostrarCargando) setCargando(false);

      setTotalEfectivo(sumEfectivo);
      setTotalYape(sumYape);
      setCantidadTransacciones(count);
    } else {
      setCajaActiva(null);
      setTotalEfectivo(0);
      setTotalYape(0);
      setCantidadTransacciones(0);
    }
    setCargando(false);
  };

  useEffect(() => {
    const inicializarSistema = async () => {
      try {
        const userRole = localStorage.getItem("userRole");
        if (!userRole) {
          router.push("/login");
          return;
        }

        try {
          await supabase.auth.signInWithPassword({
            email: 'test@test.com',
            password: '12345678',
          });
        } catch (authError) {
          console.warn("No se pudo iniciar sesión automática en Supabase.");
        }
        
        await cargarCajaYVentas();
      } catch (error) {
        console.error("Error al inicializar sesión o cargar datos:", error);
        setCargando(false);
      }
      await cargarCajaYVentas(true); // Aquí sí queremos ver el cargando al entrar
    };

    inicializarSistema();
  }, [router]);

  // 2. ABRIR CAJA
  const abrirCaja = async () => {
    const userRole = localStorage.getItem("userRole");
    if (!userRole) {
      alert("Debes haber iniciado sesión para abrir caja.");
      router.push("/login");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const monto = prompt("Ingrese el monto inicial (S/):", "110.00");
    if (monto && !isNaN(Number(monto))) {
      const nuevaCaja: any = { 
        monto_inicial: parseFloat(monto), 
        estado: "abierta"
      };

      if (user?.id) nuevaCaja.user_id = user.id;

      const { error } = await supabase.from("cajas").insert([nuevaCaja]);
      
      if (error) {
        alert("Error al abrir la caja: " + error.message);
      } else {
        alert("¡Caja aperturada con éxito!");
        await cargarCajaYVentas(); 
      }
    }
  };

 // 3. CERRAR CAJA (CORREGIDO: Sin validaciones bloqueantes)
  const cerrarCaja = async () => {
    const confirmar = confirm("¿Estás seguro de que deseas cerrar la caja?");
    
    if (confirmar && cajaActiva) {
      const { error } = await supabase
        .from("cajas")
        .update({ estado: "cerrada", fecha_cierre: new Date().toISOString() })
        .eq("id", cajaActiva.id);
      
      if (error) {
        alert("Error al cerrar la caja: " + error.message);
      } else {
        alert("Caja cerrada correctamente.");
        
        // 1. Limpiamos manualmente el estado de la caja
        setCajaActiva(null); 
        
        // 2. Recargamos los datos SIN mostrar la pantalla de carga (false)
        await cargarCajaYVentas(false); 
      }
    }
};
  
  // 4. LÓGICA DE MODALES Y ACCIONES
  const handleAbrirTransferencia = () => {
    if (!cajaActiva) return alert("Debes abrir la caja primero.");
    setMontoATransferir(totalEfectivo.toString());
    setModalTransferir(true);
  };

  const confirmarTransferencia = () => {
    const monto = parseFloat(montoATransferir);
    if (isNaN(monto) || monto <= 0) return alert("Monto inválido");
    
    setTotalTransferido((prev) => prev + monto);
    setModalTransferir(false);
    alert("Transferencia a Caja General registrada exitosamente.");
  };

  const guardarEdicionCaja = async () => {
    const monto = parseFloat(nuevoMontoCaja);
    if (isNaN(monto) || monto < 0) return alert("Monto inválido");
    
    const { error } = await supabase
      .from("cajas")
      .update({ monto_inicial: monto })
      .eq("id", cajaActiva.id);
      
    if (error) {
      alert("Error al actualizar la caja inicial");
    } else {
      setCajaActiva({ ...cajaActiva, monto_inicial: monto });
      setModalEditarCaja(false);
      alert("Monto de caja inicial actualizado.");
    }
  };

  // Cálculos Finales
  const totalVentas = totalEfectivo + totalYape;
  const dineroEnCajaFisica = cajaActiva ? (cajaActiva.monto_inicial + totalEfectivo - totalTransferido) : 0;
  const totalEfectivoConInicial = (cajaActiva?.monto_inicial || 0) + totalEfectivo;

  if (cargando) {
    return (
      <div className="flex h-screen items-center justify-center font-bold text-gray-500">
        Cargando sistema de caja...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f4f6f9] text-sm overflow-hidden font-sans relative">
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
          
          {/* BARRA DE ACCIONES */}
          <div className="flex items-center justify-between">
            <h2 className="text-gray-800 text-lg font-medium">Caja del día {new Date().toLocaleDateString('es-PE')}</h2>
            
            <div className="flex gap-4">
              <button 
                onClick={() => cajaActiva ? setModalEditarCaja(true) : alert("Abre una caja primero")} 
                className="flex items-center gap-3 bg-white pr-4 rounded-md border border-gray-200 hover:shadow-md transition-shadow group"
              >
                <div className="bg-[#dcfce7] text-[#16a34a] p-3 rounded-l-md"><Pencil size={20} /></div>
                <div className="text-left">
                  <p className="font-semibold text-gray-700 text-sm group-hover:text-[#16a34a]">Editar Caja inicial</p>
                  <p className="text-[11px] text-gray-400">Clic para cambiar el monto</p>
                </div>
              </button>

              {cajaActiva ? (
                <button onClick={cerrarCaja} className="flex items-center gap-3 bg-white pr-4 rounded-md border border-gray-200 hover:shadow-md transition-shadow group">
                  <div className="bg-[#fee2e2] text-[#ef4444] p-3 rounded-l-md"><Lock size={20} /></div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-700 text-sm group-hover:text-[#ef4444]">Cerrar caja</p>
                    <p className="text-[11px] text-gray-400">Clic para cerrar turno</p>
                  </div>
                </button>
              ) : (
                <button onClick={abrirCaja} className="flex items-center gap-3 bg-white pr-4 rounded-md border border-gray-200 hover:shadow-md transition-shadow group">
                  <div className="bg-[#dcfce7] text-[#16a34a] p-3 rounded-l-md"><Unlock size={20} /></div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-700 text-sm group-hover:text-[#16a34a]">Abrir caja</p>
                    <p className="text-[11px] text-gray-400">Clic para abrir turno</p>
                  </div>
                </button>
              )}

              <button 
                onClick={() => setModalReporte(true)}
                className="flex items-center gap-3 bg-white pr-4 rounded-md border border-gray-200 hover:shadow-md transition-shadow group"
              >
                <div className="bg-[#e0f2fe] text-[#0284c7] p-3 rounded-l-md"><CloudDownload size={20} /></div>
                <div className="text-left">
                  <p className="font-semibold text-gray-700 text-sm group-hover:text-[#0284c7]">Reporte de caja</p>
                  <p className="text-[11px] text-gray-400">Descargue su reporte diario</p>
                </div>
              </button>

              <button 
                onClick={handleAbrirTransferencia} 
                className="flex items-center gap-3 bg-white pr-4 rounded-md border border-gray-200 hover:shadow-md transition-shadow group"
              >
                <div className="bg-[#fef3c7] text-[#d97706] p-3 rounded-l-md"><ArrowRightLeft size={20} /></div>
                <div className="text-left">
                  <p className="font-semibold text-gray-700 text-sm group-hover:text-[#d97706]">Transferir dinero</p>
                  <p className="text-[11px] text-gray-400">A la Caja General</p>
                </div>
              </button>
            </div>
          </div>

          {/* 3 TARJETAS SUPERIORES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Resumen de caja */}
            <div>
              <h3 className="text-gray-400 font-semibold text-xs mb-3">Resumen de caja</h3>
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-3 h-[184px]">
                
                {/* Estado Actual */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Estado de caja actual</span> 
                  <span className={`font-bold ${cajaActiva ? "text-[#00b4d8]" : "text-[#ef4444]"}`}>
                    {cajaActiva ? "Abierta" : "Cerrada"}
                  </span>
                </div>

                {/* Caja Anterior (Movida debajo del estado actual) */}
                <div className="flex justify-between items-center text-xs pb-2 border-b border-gray-100">
                  <span className="text-gray-500">Caja Anterior</span> 
                  <span className="text-gray-400 font-medium">
                    {cajaAnterior ? `Cerrada - S/ ${cajaAnterior.monto_inicial.toFixed(2)}` : "Sin registros previos"}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm pt-1">
                  <span className="text-gray-600">Caja inicial</span> 
                  <span className="text-gray-500">S/ {cajaActiva ? cajaActiva.monto_inicial.toFixed(2) : "0.00"}</span>
                </div>
                <div className="pt-2 mt-2 border-t flex justify-between items-center text-base">
                  <span className="text-gray-800 font-medium">Dinero en caja (Físico)</span> 
                  <span className="font-bold text-gray-800 text-lg">S/ {dineroEnCajaFisica.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* 2. Ventas por tipo de documentos */}
            <div>
              <h3 className="text-gray-400 font-semibold text-xs mb-3">Ventas por tipo de documentos</h3>
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm h-[184px]">
                <div className="flex justify-between text-sm text-gray-600 font-semibold border-b pb-2">
                  <span>Documento</span>
                  <span>Cant.</span>
                  <span>Total</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-3 font-medium">
                  <span>Ticket Interno</span>
                  <span>{cantidadTransacciones}</span>
                  <span title="Incluye el dinero de la caja incial" className="font-bold text-gray-800">S/ {totalVentas.toFixed(2)}</span>
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
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-gray-700 w-1/4">Formas de Pago</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 text-center w-1/4">Transacciones</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 text-center w-1/5">Ingreso</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 text-center w-1/5">Egreso</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  
                  {/* EFECTIVO */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">Efectivo</td>
                    <td className="px-6 py-4 text-center">—</td>
                    <td className="px-6 py-4 text-center text-emerald-600">S/ {totalEfectivo.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center text-red-400">S/ 0.00</td>
                    <td 
                      className="px-6 py-4 text-right font-bold text-gray-900 cursor-help transition-colors hover:text-[#00b4d8]"
                      title="Incluye el dinero de la caja inicial"
                    >
                      S/ {totalEfectivoConInicial.toFixed(2)}
                    </td>
                  </tr>

                  {/* DEPÓSITO */}
                  <tr className="hover:bg-gray-50 bg-red-50/20">
                    <td className="px-6 py-4 font-medium text-gray-800 flex items-center gap-2">
                      <ArrowRightLeft size={14} className="text-red-500"/> Depósito a caja general
                    </td>
                    <td className="px-6 py-4 text-center">—</td>
                    <td className="px-6 py-4 text-center text-emerald-600">S/ 0.00</td>
                    <td className="px-6 py-4 text-center text-red-500 font-medium">S/ {totalTransferido.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-medium text-red-600">-S/ {totalTransferido.toFixed(2)}</td>
                  </tr>

                  {/* YAPE / PLIN */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">Yape / Plin</td>
                    <td className="px-6 py-4 text-center">—</td>
                    <td className="px-6 py-4 text-center text-emerald-600">S/ {totalYape.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center text-red-400">S/ 0.00</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-800">S/ {totalYape.toFixed(2)}</td>
                  </tr>

                </tbody>
                <tfoot className="bg-gray-50 text-gray-700 border-t border-gray-200">
                  <tr>
                    <td colSpan={4} className="px-6 py-3 font-semibold">Total Ventas Neto</td>
                    <td className="px-6 py-3 text-right font-bold text-[#00b4d8]">S/ {totalVentas.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="px-6 py-3 text-gray-500 font-medium">Total en caja física (Caja inicial + Ventas - Depósitos)</td>
                    <td className="px-6 py-3 text-right font-bold text-gray-800 text-base">S/ {dineroEnCajaFisica.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* =========================================================================
          MODALES
      ========================================================================= */}

      {/* 1. Modal Editar Caja Inicial */}
      {modalEditarCaja && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-800">Editar monto de apertura</h3>
              <button onClick={() => setModalEditarCaja(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-5">
              <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg text-sm mb-5 font-medium border border-yellow-200">
                La modificación del monto de apertura de la caja sólo puede realizarse con usuarios que no han realizado ningún movimiento.
              </div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nuevo monto (S/)</label>
              <input 
                type="number" 
                value={nuevoMontoCaja}
                onChange={(e) => setNuevoMontoCaja(e.target.value)}
                placeholder="Ej. 110.00"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8] outline-none bg-white transition-colors"
              />
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setModalEditarCaja(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition">Cancelar</button>
              <button onClick={guardarEdicionCaja} className="px-4 py-2 bg-[#00b4d8] text-white rounded-lg font-medium hover:bg-[#0096b4] transition">Guardar cambios</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal Transferir Dinero */}
      {modalTransferir && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <ArrowRightLeft size={18} className="text-[#d97706]"/> Transferir a Caja General
              </h3>
              <button onClick={() => setModalTransferir(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-600 mb-4">
                El monto sugerido corresponde a las ventas en efectivo. Se mantendrán los S/ {cajaActiva?.monto_inicial.toFixed(2)} iniciales en caja chica.
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">Monto a depositar (S/)</label>
              <input 
                type="number" 
                value={montoATransferir}
                onChange={(e) => setMontoATransferir(e.target.value)}
                placeholder="Ej. 50.00"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#d97706] focus:border-[#d97706] outline-none bg-white transition-colors"
              />
              <p className="text-xs text-gray-400 mt-2 text-right">Disponible en efectivo: S/ {totalEfectivo.toFixed(2)}</p>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setModalTransferir(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition">Cancelar</button>
              <button onClick={confirmarTransferencia} className="px-4 py-2 bg-[#d97706] text-white rounded-lg font-medium hover:bg-[#b45309] transition">Transferir</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal Reporte de Caja */}
      {modalReporte && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-[#0284c7] text-white">
              <h3 className="font-semibold flex items-center gap-2">
                <CloudDownload size={18} /> Reporte de Caja Actual
              </h3>
              <button onClick={() => setModalReporte(false)} className="text-white/80 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between border-b border-dashed pb-2">
                <span className="text-gray-500">Fecha:</span>
                <span className="font-medium text-gray-800">{new Date().toLocaleDateString('es-PE')}</span>
              </div>
              <div className="flex justify-between border-b border-dashed pb-2">
                <span className="text-gray-500">Caja Inicial:</span>
                <span className="font-medium text-gray-800">S/ {cajaActiva?.monto_inicial.toFixed(2) || "0.00"}</span>
              </div>
              <div className="flex justify-between border-b border-dashed pb-2">
                <span className="text-gray-500">Ventas Totales:</span>
                <span className="font-medium text-[#00b4d8]">S/ {totalVentas.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b border-dashed pb-2">
                <span className="text-gray-500">Depositado a C. General:</span>
                <span className="font-medium text-red-500">-S/ {totalTransferido.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 bg-gray-50 p-3 rounded-lg">
                <span className="text-gray-700 font-bold">Total Físico Esperado:</span>
                <span className="font-black text-gray-900 text-lg">S/ {dineroEnCajaFisica.toFixed(2)}</span>
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setModalReporte(false)} className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition">Cerrar vista previa</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}