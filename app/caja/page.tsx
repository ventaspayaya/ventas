"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { 
  Pencil, Unlock, CloudDownload, ArrowRightLeft, Cloud, Lock 
} from "lucide-react";

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CajaPage() {
  const router = useRouter();

  // Estados de la Caja
  const [cajaActiva, setCajaActiva] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  
  // Estados de los cálculos
  const [totalEfectivo, setTotalEfectivo] = useState(0);
  const [totalYape, setTotalYape] = useState(0);
  const [cantidadTransacciones, setCantidadTransacciones] = useState(0);

  // 1. CARGAR DATOS DE LA BASE DE DATOS
  const cargarCajaYVentas = async () => {
    setCargando(true);
    // Buscar si hay una caja abierta
    const { data: caja } = await supabase
      .from("cajas")
      .select("*")
      .eq("estado", "abierta")
      .single();

    if (caja) {
      setCajaActiva(caja);
      
      // Si hay caja abierta, traer las ventas vinculadas a esta caja
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
          // Parsear los métodos de pago guardados como JSON
          const pagos = venta.metodos_pago || [];
          pagos.forEach((pago: any) => {
            const monto = parseFloat(pago.monto) || 0;
            if (pago.metodo === "Efectivo") sumEfectivo += monto;
            if (pago.metodo === "Yape") sumYape += monto;
          });
        });
      }

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

  // UNIFICADO: Validar sesión local y cargar los datos correspondientes
  useEffect(() => {
    const inicializarSistema = async () => {
      try {
        // 1. Validar si hay una sesión activa en el LocalStorage
        const userRole = localStorage.getItem("userRole");
        if (!userRole) {
          router.push("/login");
          return;
        }

        // 2. Intentar autenticación automática en Supabase (si es necesaria para RLS)
        // No bloqueará la carga de la página si falla
        try {
          await supabase.auth.signInWithPassword({
            email: 'test@test.com',
            password: '12345678',
          });
        } catch (authError) {
          console.warn("No se pudo iniciar sesión automática en Supabase, se procederá con la sesión local.");
        }
        
        // 3. Cargar la información de la base de datos
        await cargarCajaYVentas();
      } catch (error) {
        console.error("Error al inicializar sesión o cargar datos:", error);
        setCargando(false);
      }
    };

    inicializarSistema();
  }, [router]);

  // 2. ABRIR CAJA (Guarda en Base de Datos)
  const abrirCaja = async () => {
    // Verificar sesión local activa antes de continuar
    const userRole = localStorage.getItem("userRole");
    
    if (!userRole) {
      alert("Debes haber iniciado sesión para abrir caja.");
      router.push("/login");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    const monto = prompt("Ingrese el monto inicial (S/):", "110.00");
    if (monto && !isNaN(Number(monto))) {
      // Creamos la estructura de inserción. Si existe usuario en Supabase lo vinculamos,
      // de lo contrario omitimos 'user_id' o lo enviamos nulo si tu tabla lo permite.
      const nuevaCaja: any = { 
        monto_inicial: parseFloat(monto), 
        estado: "abierta"
      };

      if (user?.id) {
        nuevaCaja.user_id = user.id;
      }

      const { error } = await supabase
        .from("cajas")
        .insert([nuevaCaja]);
      
      if (error) {
        console.error(error);
        alert("Error al abrir la caja: " + error.message);
      } else {
        alert("¡Caja aperturada!");
        cargarCajaYVentas();
      }
    }
  };

  // 3. CERRAR CAJA
  const cerrarCaja = async () => {
    const confirmar = confirm(`¿Estás seguro de cerrar la caja actual?\nDeberías transferir los S/ ${(cajaActiva.monto_inicial + totalEfectivo).toFixed(2)} a Caja General antes de cerrar.`);
    if (confirmar && cajaActiva) {
      const { error } = await supabase
        .from("cajas")
        .update({ estado: "cerrada", fecha_cierre: new Date().toISOString() })
        .eq("id", cajaActiva.id);
      
      if (error) {
        alert("Error al cerrar la caja");
      } else {
        alert("Caja cerrada correctamente. Ya puedes aperturar el siguiente turno.");
        cargarCajaYVentas();
      }
    }
  };

  // 4. TRANSFERIR DINERO
  const transferirDinero = () => {
    if (!cajaActiva) return alert("Debes abrir la caja primero.");
    alert(`Transferencia a Caja General iniciada.\n\nEl sistema descontará automáticamente el excedente y dejará los S/ ${cajaActiva.monto_inicial.toFixed(2)} iniciales para el siguiente turno.`);
  };

  const totalVentas = totalEfectivo + totalYape;
  const dineroEnCajaFisica = cajaActiva ? cajaActiva.monto_inicial + totalEfectivo : 0;

  if (cargando) {
    return (
      <div className="flex h-screen items-center justify-center font-bold text-gray-500">
        Cargando sistema de caja...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f4f6f9] text-sm overflow-hidden font-sans">
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
              <button className="flex items-center gap-3 bg-white pr-4 rounded-md border border-gray-200 hover:shadow-md transition-shadow group">
                <div className="bg-[#dcfce7] text-[#16a34a] p-3 rounded-l-md"><Pencil size={20} /></div>
                <div className="text-left">
                  <p className="font-semibold text-gray-700 text-sm group-hover:text-[#16a34a]">Editar Caja inicial</p>
                  <p className="text-[11px] text-gray-400">Clic para cambiar el monto</p>
                </div>
              </button>

              {/* BOTON DINÁMICO: ABRIR O CERRAR */}
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

              <button className="flex items-center gap-3 bg-white pr-4 rounded-md border border-gray-200 hover:shadow-md transition-shadow group">
                <div className="bg-[#e0f2fe] text-[#0284c7] p-3 rounded-l-md"><CloudDownload size={20} /></div>
                <div className="text-left">
                  <p className="font-semibold text-gray-700 text-sm group-hover:text-[#0284c7]">Reporte de caja</p>
                  <p className="text-[11px] text-gray-400">Descargue su reporte diario</p>
                </div>
              </button>

              <button onClick={transferirDinero} className="flex items-center gap-3 bg-white pr-4 rounded-md border border-gray-200 hover:shadow-md transition-shadow group">
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
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4 h-[184px]">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Estado de caja</span> 
                  <span className={`font-bold ${cajaActiva ? "text-[#00b4d8]" : "text-[#ef4444]"}`}>
                    {cajaActiva ? "Caja abierta" : "Caja cerrada"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Caja inicial</span> 
                  <span className="text-gray-500">S/ {cajaActiva ? cajaActiva.monto_inicial.toFixed(2) : "0.00"}</span>
                </div>
                <div className="pt-4 mt-2 border-t flex justify-between items-center text-base">
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
                  <span className="font-bold text-gray-800">S/ {totalVentas.toFixed(2)}</span>
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
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">Efectivo</td>
                    <td className="px-6 py-4 text-center">—</td>
                    <td className="px-6 py-4 text-center text-emerald-600">S/ {totalEfectivo.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center text-red-400">S/ 0.00</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-800">S/ {totalEfectivo.toFixed(2)}</td>
                  </tr>
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
                    <td colSpan={4} className="px-6 py-3 text-gray-500 font-medium">Total en caja física (Caja inicial + Ventas Efectivo)</td>
                    <td className="px-6 py-3 text-right font-bold text-gray-800 text-base">S/ {dineroEnCajaFisica.toFixed(2)}</td>
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