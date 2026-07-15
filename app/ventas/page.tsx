"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Maximize, ScanBarcode, ShoppingCart, X, Trash2, Plus 
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function VentasPage() {
// ... otros estados
const [cajaActiva, setCajaActiva] = useState<any>(null);

  // Estados de Base de Datos
  const [productosBD, setProductosBD] = useState<any[]>([]);
  const [categoriasBD, setCategoriasBD] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estados de UI y Carrito
  const [carrito, setCarrito] = useState<any[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState<number>(1); // 1 = Favoritos por defecto
  const [busqueda, setBusqueda] = useState("");
  const [pestañaActivaMovil, setPestañaActivaMovil] = useState<"productos" | "carrito">("productos");
  const [itemEditandoId, setItemEditandoId] = useState<string | null>(null);

  // Estados Modales
  const [modalVariantesAbierto, setModalVariantesAbierto] = useState(false);
  const [modalGranelAbierto, setModalGranelAbierto] = useState(false);
  const [modalCobroAbierto, setModalCobroAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<any>(null);

  // Estados Formulario Granel
  const [granelKg, setGranelKg] = useState<string>("");
  const [granelMonto, setGranelMonto] = useState<string>("");

  // Estado dinámico de pagos
  const [pagos, setPagos] = useState<any[]>([{ id: 1, metodo: "Efectivo", monto: "" }]);

  // Carga inicial 
  const fetchDatosIniciales = async () => {
  setCargando(true);
  
  // Agregamos la consulta de la caja
  const [resProd, resCat, resCaja] = await Promise.all([
    supabase.from("productos").select("*, variantes:productos_variantes(*)").order("id", { ascending: true }),
    supabase.from("categorias").select("*").order("orden", { ascending: true }),
    supabase.from("cajas").select("*").eq("estado", "abierta").maybeSingle() // <--- AGREGADO
  ]);

    if (resCat.data) setCategoriasBD(resCat.data);
    if (resCaja.data) setCajaActiva(resCaja.data); // <--- AGREGADO
    if (resProd.data) {
      setProductosBD(resProd.data.map(p => ({
        id: p.id,
        nombre: p.nombre,
        precioBase: p.precio_base,
        stock: p.stock_actual,
        img: p.img, // El icono
        imagenUrl: p.imagen_url, // URL de la imagen real (asegúrate de crear esta columna)
        esGranel: p.es_granel,
        categoria_id: p.categoria_id,
        variantes: p.variantes
      })));
    }
    setCargando(false);
  };

  useEffect(() => {
    fetchDatosIniciales();
  }, []);

  // Filtrado
  const productosFiltrados = productosBD.filter((prod) => {
    const coincideBusqueda = busqueda ? prod.nombre.toLowerCase().includes(busqueda.toLowerCase()) : true;
    const coincideCategoria = prod.categoria_id === categoriaActiva;
    return busqueda ? coincideBusqueda : coincideCategoria;
  });

  // Cálculos sin IGV
  const Total = carrito.reduce((acc, item) => acc + item.precio * item.cant, 0);
  const totalItems = carrito.reduce((acc, item) => acc + (item.esGranel ? 1 : item.cant), 0);
  const totalRecibido = pagos.reduce((acc, p) => acc + (parseFloat(p.monto) || 0), 0);

  const agregarAlCarrito = (producto: any, nombreVariante: string, precioAplicado: number, cantidad: number = 1, esPorMayor: boolean = false) => {
    const idUnico = `${producto.id}-${nombreVariante}`;
    const existe = carrito.find((item) => item.idUnico === idUnico);
    
    if (existe) {
      setCarrito(carrito.map((item) => item.idUnico === idUnico ? { ...item, cant: item.cant + cantidad } : item));
    } else {
      setCarrito([...carrito, { 
        ...producto, 
        idUnico,
        nombreParaTicket: `${producto.nombre} ${nombreVariante !== "Regular" ? `(${nombreVariante})` : ""}`,
        precio: precioAplicado, 
        cant: cantidad,
        esPorMayor: esPorMayor,
        variante_nombre: nombreVariante
      }]);
    }
    setModalVariantesAbierto(false);
  };

  // Granel
  const abrirModalGranel = (producto: any) => {
    setProductoSeleccionado(producto);
    setGranelKg("");
    setGranelMonto("");
    setModalGranelAbierto(true);
  };

  const manejarCambioKg = (val: string) => {
    setGranelKg(val);
    if (val && !isNaN(Number(val))) setGranelMonto((Number(val) * productoSeleccionado.precioBase).toFixed(2));
    else setGranelMonto("");
  };

  const manejarCambioMonto = (val: string) => {
    setGranelMonto(val);
    if (val && !isNaN(Number(val))) setGranelKg((Number(val) / productoSeleccionado.precioBase).toFixed(3));
    else setGranelKg("");
  };

  const confirmarGranel = () => {
    const kgCalculado = parseFloat(granelKg);
    if (!kgCalculado || kgCalculado <= 0) return;
    const idUnico = `${productoSeleccionado.id}-Granel-${Date.now()}`;
    setCarrito([...carrito, { 
      ...productoSeleccionado, 
      idUnico,
      nombreParaTicket: `${productoSeleccionado.nombre} (Granel)`,
      precio: productoSeleccionado.precioBase, 
      cant: kgCalculado,
      variante_nombre: 'Granel'
    }]);
    setModalGranelAbierto(false);
  };

  const actualizarPropiedadCarrito = (idUnico: string, propiedad: string, valor: any) => {
    setCarrito(carrito.map(item => item.idUnico === idUnico ? { ...item, [propiedad]: valor } : item));
  };
  
  const eliminarDelCarrito = (idUnico: string) => {
    setCarrito(carrito.filter((item) => item.idUnico !== idUnico));
    if (itemEditandoId === idUnico) setItemEditandoId(null);
  };

  // Lógica de Pagos
  const abrirModalCobro = () => {
    setPagos([{ id: Date.now(), metodo: "Efectivo", monto: Total.toFixed(2) }]);
    setModalCobroAbierto(true);
  };

  const agregarDivisionPago = () => {
    const sumaActual = pagos.reduce((acc, p) => acc + (parseFloat(p.monto) || 0), 0);
    const restante = Math.max(0, Total - sumaActual);
    const nuevoMetodo = pagos.some(p => p.metodo === "Efectivo") ? "Yape" : "Efectivo";
    setPagos([...pagos, { id: Date.now(), metodo: nuevoMetodo, monto: restante > 0 ? restante.toFixed(2) : "" }]);
  };

  const actualizarLineaPago = (id: number, propiedad: string, valor: string) => {
    setPagos(pagos.map(p => p.id === id ? { ...p, [propiedad]: valor } : p));
  };

  // Procesar Transacción y enlazar a la caja abierta
  const procesarPago = async () => {
  // 1. Verificación de seguridad
  if (!cajaActiva) {
    alert("¡ATENCIÓN! No hay ninguna caja abierta. Por favor, abre caja antes de empezar a vender.");
    return; // Detiene la ejecución si no hay caja
  }

  // 2. Guardar la venta principal
  const { data: ventaData, error: ventaError } = await supabase
    .from("ventas")
    .insert({
      total_venta: Total,
      metodos_pago: pagos,
      caja_id: cajaActiva.id 
    })
    .select()
    .single();

  if (ventaError || !ventaData) return alert("Error al procesar la venta");

  // 3. Guardar el detalle de la venta
  const detalles = carrito.map(item => ({
    venta_id: ventaData.id,
    producto_id: item.id,
    variante_nombre: item.variante_nombre,
    cantidad: item.cant,
    precio_unitario: item.precio
  }));
  
  await supabase.from("venta_detalle").insert(detalles);

  alert(`¡Comprobante emitido con éxito por S/ ${Total.toFixed(2)}!`);
  setCarrito([]);
  setModalCobroAbierto(false);
};

  return (
    <div className="flex h-screen bg-[#f4f6f9] text-sm overflow-hidden font-sans relative">
      <main className="flex-1 flex flex-col bg-white overflow-hidden">

        {/* AQUI VA EL AVISO VISUAL */}
      {!cajaActiva && (
        <div className="bg-red-100 border-b border-red-200 p-3 text-center text-red-700 font-bold text-sm">
          ⚠️ No hay caja abierta. No podrás procesar pagos.
        </div>
      )}
        
        {/* TABS SUPERIORES */}
        <div className="bg-white border-b border-gray-200 px-4 flex gap-8 text-gray-500 font-medium shrink-0 pt-4">
           <Link href="/historial"><button className="py-3 hover:text-[#00b4d8] transition-colors border-b-2 border-transparent">Ventas</button></Link>
           <button className="py-3 text-[#00b4d8] border-b-2 border-[#00b4d8] font-semibold">Punto de venta</button>
        </div>

        {/* SWITCHER MÓVIL */}
        <div className="lg:hidden flex bg-gray-100 p-1 border-b border-gray-200 shrink-0">
          <button className={`flex-1 py-2 text-center text-xs font-bold rounded-md transition-all ${pestañaActivaMovil === "productos" ? "bg-white shadow-sm text-[#00b4d8]" : "text-gray-600"}`} onClick={() => setPestañaActivaMovil("productos")}>📦 Productos ({productosBD.length})</button>
          <button className={`flex-1 py-2 text-center text-xs font-bold rounded-md transition-all ${pestañaActivaMovil === "carrito" ? "bg-white shadow-sm text-[#00b4d8]" : "text-gray-600"}`} onClick={() => setPestañaActivaMovil("carrito")}>🛒 Carrito ({totalItems})</button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          
          {/* CATALOGO IZQUIERDA */}
          <div className={`flex-1 flex flex-col bg-white border-r border-gray-200 ${pestañaActivaMovil === "carrito" ? "hidden lg:flex" : "flex"}`}>
            
            <div className="p-3 border-b border-gray-200 flex gap-2 items-center bg-white shrink-0">
              <button className="p-2 border border-[#00b4d8] bg-[#00b4d8] text-white rounded-md shadow-sm hidden md:block"><Maximize size={16} /></button>
              <button className="p-2 border border-gray-200 text-[#00b4d8] rounded-md hover:bg-gray-50"><ScanBarcode size={16} /></button>
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Ingresa nombre del producto (ej. agu ciel)" 
                  className="w-full border border-gray-300 p-2 pl-3 rounded-md focus:outline-none focus:border-[#00b4d8] text-gray-900 font-medium text-xs md:text-sm" 
                />
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              <div className="w-[100px] md:w-[140px] p-2 overflow-y-auto space-y-1.5 bg-[#fcfcfc] border-r border-gray-100 shrink-0">
                {categoriasBD.map((cat) => (
                  <button 
                    key={cat.id} 
                    onClick={() => {
                      setCategoriaActiva(cat.id);
                      setBusqueda(""); 
                    }} 
                    className={`w-full text-center p-2 md:p-3 border rounded-lg text-[11px] md:text-xs font-medium transition-all ${categoriaActiva === cat.id ? "border-[#00b4d8] text-[#00b4d8] bg-white shadow-sm" : "border-gray-200 text-gray-600 bg-white hover:border-[#00b4d8]"}`}
                  >
                    {cat.nombre}
                  </button>
                ))}
              </div>

              <div className="flex-1 flex flex-col overflow-hidden bg-white relative">
                {cargando && <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10"><span className="text-gray-500 font-bold">Cargando catálogo...</span></div>}

                <div className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-gray-200 bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <div className="col-span-8">Producto</div>
                  <div className="col-span-4 text-right">Precio Base</div>
                </div>
                
                <div className="flex-1 overflow-y-auto divide-y divide-gray-100 relative">
                  {productosFiltrados.map((prod) => (
                    <div 
                      key={prod.id} 
                      onClick={() => {
                        if (prod.esGranel) abrirModalGranel(prod);
                        else agregarAlCarrito(prod, "Regular", prod.precioBase);
                      }}
                      className="grid grid-cols-12 gap-2 px-4 py-3 hover:bg-blue-50 cursor-pointer items-center transition-colors relative"
                    >
                      <div className="col-span-8 flex items-center gap-3">
                        {/* ACTUALIZADO PARA SOPORTAR IMAGEN O ICONO */}
                        <div className="w-10 h-10 flex items-center justify-center text-xl bg-white rounded-lg border border-gray-200 shadow-sm shrink-0 overflow-hidden">
                          {prod.imagenUrl ? (
                            <img src={prod.imagenUrl} alt={prod.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <span>{prod.img || "📦"}</span>
                          )}
                        </div>
                        <div className="truncate">
                          <span className="text-sm font-bold text-gray-800 block truncate">{prod.nombre}</span>
                          {prod.esGranel && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold mt-0.5 inline-block">⚖️ Pesable</span>}
                        </div>
                      </div>
                      
                      <div className="col-span-4 flex flex-col gap-1 items-end justify-center">
                        <span className="text-sm font-black text-[#00b4d8]">S/ {prod.precioBase.toFixed(2)}</span>
                        
                        {prod.variantes && prod.variantes.length > 0 && (
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setProductoSeleccionado(prod); 
                              setModalVariantesAbierto(true); 
                            }} 
                            className="bg-white border-2 border-[#00b4d8] text-[#007ba7] px-3 py-1.5 rounded-md text-[11px] font-bold hover:bg-[#00b4d8] hover:text-white transition-colors w-full md:w-auto shadow-sm"
                          >
                            Opciones / Por Mayor
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CARRITO DERECHA */}
          <div className={`w-full lg:w-[380px] bg-[#f9fafb] flex flex-col shrink-0 ${pestañaActivaMovil === "productos" ? "hidden lg:flex" : "flex"}`}>
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white shrink-0 shadow-sm z-10">
              <span className="font-bold text-gray-800 text-sm flex items-center gap-2">
                Venta actual <span className="bg-[#00b4d8] text-white text-[11px] w-5 h-5 flex items-center justify-center rounded-full font-bold">{carrito.length}</span>
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {carrito.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs py-12">
                  <ShoppingCart size={40} className="mb-3 opacity-30" />
                  <p className="font-medium text-gray-500 text-sm">El carrito está vacío</p>
                  <p className="mt-1">Haz clic en un producto para agregarlo</p>
                </div>
              ) : (
                carrito.map((item) => {
                  const estaEditando = itemEditandoId === item.idUnico;
                  return (
                    <div key={item.idUnico} className={`border rounded-lg bg-white shadow-sm overflow-hidden transition-all duration-200 ${estaEditando ? "border-[#00b4d8] ring-1 ring-[#00b4d8]/30" : "border-gray-200"}`}>
                      
                      <div onClick={() => setItemEditandoId(estaEditando ? null : item.idUnico)} className="flex justify-between items-center p-3 cursor-pointer hover:bg-blue-50/50 transition-colors">
                        <div className="flex-1 min-w-0 pr-2 flex items-center gap-3">
                          <div className={`shrink-0 font-bold px-2 py-1 rounded text-xs border ${estaEditando ? 'bg-blue-600 text-white border-blue-700' : 'bg-blue-50 text-blue-800 border-blue-200'}`}>
                            {item.esGranel ? `${item.cant.toFixed(2)}kg` : item.cant}
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-gray-900 truncate">{item.nombreParaTicket}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">S/ {item.precio.toFixed(2)} c/u</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="font-black text-gray-900 text-xs block">S/ {(item.cant * item.precio).toFixed(2)}</span>
                          </div>
                          
                          <button onClick={(e) => { e.stopPropagation(); eliminarDelCarrito(item.idUnico); }} className="w-7 h-7 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors shrink-0">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {estaEditando && (
                        <div className="p-3 bg-slate-50 border-t border-gray-100 space-y-3 animate-in fade-in duration-150">
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{item.esGranel ? 'Peso (Kg)' : 'Cantidad'}</label>
                              <input 
                                type="number" 
                                step={item.esGranel ? "0.01" : "1"}
                                min={item.esPorMayor ? 6 : (item.esGranel ? 0.01 : 1)}
                                value={item.cant} 
                                onChange={(e) => {
                                  const minimoRequerido = item.esPorMayor ? 6 : (item.esGranel ? 0.01 : 1);
                                  const valorIngresado = parseFloat(e.target.value) || (item.esGranel ? 0.01 : 1);
                                  actualizarPropiedadCarrito(item.idUnico, 'cant', Math.max(minimoRequerido, valorIngresado));
                                }}
                                className="w-full border border-gray-300 rounded p-1.5 text-center font-bold text-gray-900 bg-white outline-none focus:border-[#00b4d8]" 
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Precio Unit.</label>
                              <input type="number" value={item.precio} disabled className="w-full border border-gray-200 rounded p-1.5 text-center text-gray-500 bg-gray-100 cursor-not-allowed font-medium" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Subtotal</label>
                              <div className="w-full p-1.5 text-center font-black text-[#00b4d8] bg-blue-50 border border-blue-100 rounded text-xs">
                                S/ {(item.cant * item.precio).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="bg-white border-t border-gray-200 flex flex-col mt-auto shrink-0 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)]">
              <div className="p-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600 font-medium">
                  <span>Total Items</span>
                  <span>{totalItems.toFixed(totalItems % 1 !== 0 ? 2 : 0)}</span>
                </div>
                {/* IGV ELIMINADO */}
                <div className="flex justify-between text-base text-gray-900 font-bold border-t border-gray-100 pt-2 mt-2">
                  <span>Total a Pagar</span>
                  <span className="text-[#00b4d8]">S/ {Total.toFixed(2)}</span>
                </div>
                
                <button onClick={abrirModalCobro} disabled={carrito.length === 0} className="w-full mt-3 bg-[#00b4d8] disabled:bg-gray-300 text-white p-3.5 rounded-lg font-black text-sm flex justify-between items-center hover:bg-[#0096b4] transition-colors shadow-md">
                  <div className="flex items-center gap-2"><ShoppingCart size={18} /><span>COBRAR</span></div>
                  <span className="text-lg">S/ {Total.toFixed(2)}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL 1: VARIANTES */}
      {modalVariantesAbierto && productoSeleccionado && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-lg">{productoSeleccionado.nombre}</h3>
              <button onClick={() => setModalVariantesAbierto(false)} className="text-gray-400 hover:text-gray-700 bg-white rounded-full p-1 shadow-sm"><X size={18} /></button>
            </div>
            <div className="p-4">
              <p className="text-sm font-medium text-gray-600 mb-4">Selecciona la presentación:</p>
              <div className="space-y-3">
                {productoSeleccionado.variantes.map((v: any, idx: number) => (
                  <button 
                    key={idx} 
                    onClick={() => {
                      const cantidadAEnviar = v.es_por_mayor ? 6 : 1;
                      agregarAlCarrito(productoSeleccionado, v.nombre, v.precio, cantidadAEnviar, v.es_por_mayor);
                    }} 
                    className="w-full flex justify-between items-center p-4 rounded-lg border-2 border-gray-200 hover:border-[#00b4d8] hover:bg-blue-50 transition-all group"
                  >
                    <span className="font-bold text-gray-800 group-hover:text-[#0096b4] text-left">
                      {v.nombre}
                      {v.es_por_mayor && <span className="block text-[10px] text-emerald-600 font-bold">Llevas 6 unidades</span>}
                    </span>
                    <span className="font-black text-gray-900 group-hover:text-[#0096b4] text-lg shrink-0">S/ {v.precio.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: GRANEL */}
      {modalGranelAbierto && productoSeleccionado && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
             <div className="p-4 border-b bg-emerald-50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-emerald-900 text-lg flex items-center gap-2">⚖️ Pesar {productoSeleccionado.nombre}</h3>
                <p className="text-xs font-semibold text-emerald-700 mt-0.5">Precio Base: S/ {productoSeleccionado.precioBase.toFixed(2)} por KG</p>
              </div>
              <button onClick={() => setModalGranelAbierto(false)} className="text-emerald-400 hover:text-emerald-700 bg-white rounded-full p-1 shadow-sm"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Ingresar Peso (KG)</label>
                <div className="relative">
                  <input type="number" step="0.01" value={granelKg} onChange={(e) => manejarCambioKg(e.target.value)} placeholder="0.000" className="w-full border-2 border-gray-300 rounded-lg p-3 text-right font-black text-gray-900 text-lg focus:border-emerald-500 outline-none pr-12" />
                  <span className="absolute right-4 top-3.5 text-gray-400 font-bold">KG</span>
                </div>
              </div>
              <div className="flex items-center justify-center relative">
                <div className="h-px bg-gray-200 w-full absolute"></div>
                <span className="bg-white px-3 text-gray-400 font-bold text-xs relative z-10">Ó</span>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Ingresar Monto (S/)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-400 font-bold">S/</span>
                  <input type="number" step="0.10" value={granelMonto} onChange={(e) => manejarCambioMonto(e.target.value)} placeholder="0.00" className="w-full border-2 border-gray-300 rounded-lg p-3 text-right font-black text-gray-900 text-lg focus:border-emerald-500 outline-none" />
                </div>
              </div>
              <button onClick={confirmarGranel} disabled={!granelKg || parseFloat(granelKg) <= 0} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold py-3.5 rounded-lg shadow-md transition-colors mt-2">
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: COBRO */}
      {modalCobroAbierto && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto pt-[5vh] p-4 backdrop-blur-sm">
           <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden mb-8">
            <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
              <h2 className="text-lg font-bold text-gray-900">Comprobante de pago</h2>
              <button onClick={agregarDivisionPago} className="bg-[#007ba7] hover:bg-[#006080] text-white px-3 py-1.5 rounded-md font-medium text-xs md:text-sm flex items-center gap-1 shadow-sm"><Plus size={14} /> Dividir cuenta</button>
            </div>
            <div className="p-4 md:p-6 bg-slate-50 space-y-4">
              <div className="space-y-3">
                {pagos.map((pago, index) => (
                  <div key={pago.id} className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm relative">
                    <div className="grid grid-cols-12 gap-4 items-end">
                      <div className="col-span-6">
                        <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Método {index + 1}</label>
                        <select 
                          value={pago.metodo} 
                          onChange={(e) => actualizarLineaPago(pago.id, 'metodo', e.target.value)} 
                          className="w-full border-2 border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 font-bold outline-none focus:border-[#00b4d8] text-sm"
                        >
                          <option value="Efectivo">💵 Efectivo</option>
                          <option value="Yape">📱 Yape / Plin</option>
                        </select>
                      </div>
                      <div className="col-span-6 relative">
                        <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Monto</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-sm">S/</span>
                          <input 
                            type="number" 
                            step="0.10" 
                            value={pago.monto} 
                            onChange={(e) => actualizarLineaPago(pago.id, 'monto', e.target.value)} 
                            className="w-full border-2 border-gray-300 rounded-lg p-2.5 pl-8 bg-white text-gray-900 font-black outline-none focus:border-[#00b4d8] text-sm" 
                          />
                        </div>
                        {pagos.length > 1 && (
                          <button onClick={() => setPagos(pagos.filter(p => p.id !== pago.id))} className="absolute -right-3 -top-7 text-red-400 hover:text-red-600 bg-white rounded-full p-1 shadow-sm border border-gray-100" title="Eliminar pago">
                            <X size={14} strokeWidth={3} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className={`rounded-xl p-4 flex justify-between items-center shadow-inner mt-4 border-2 ${totalRecibido >= Total - 0.01 ? 'bg-emerald-600 border-emerald-700 text-white' : 'bg-gray-800 border-gray-900 text-white'}`}>
                <div>
                  <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-80">Total Venta</p>
                  <p className="text-xl md:text-2xl font-black">S/ {Total.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-80">
                    {totalRecibido < Total - 0.01 ? 'Falta Ingresar' : (totalRecibido > Total + 0.01 ? 'Vuelto' : 'Pago Exacto')}
                  </p>
                  <p className="text-xl md:text-2xl font-black">
                    S/ {Math.abs(totalRecibido - Total).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t bg-white flex justify-end gap-3 sticky bottom-0">
              <button onClick={() => setModalCobroAbierto(false)} className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 font-bold hover:bg-gray-100 transition-colors">Cancelar</button>
              <button onClick={procesarPago} disabled={totalRecibido < Total - 0.01} className="px-6 py-2.5 bg-[#007ba7] hover:bg-[#006080] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-lg text-sm font-black shadow-md transition-colors">
                Cobrar S/ {Total.toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}