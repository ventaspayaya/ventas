"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Menu, Bell, Calendar, HeadphonesIcon, ChevronDown, 
  Maximize, ScanBarcode, ShoppingCart, ChevronUp, X, Trash2, Plus, AlertTriangle
} from "lucide-react";

// Mock de productos (La Coca Cola Retornable es el ID 8)
const PRODUCTOS_MOCK = [
  { id: 1, nombre: "AGUA CIELO 1 L.", stock: 2.00, precioBase: 2.20, img: "💧", variantes: [{ nombre: "Al tiempo", precio: 2.20 }, { nombre: "Helada", precio: 2.50 }], retornable: false },
  { id: 4, nombre: "BIG COLA 350 ML.", stock: 10.00, precioBase: 1.20, img: "🥤", variantes: [{ nombre: "Unidad", precio: 1.20 }, { nombre: "Helada", precio: 1.50 }, { nombre: "Por Mayor (Desde 6)", precio: 1.00, esPorMayor: true }], retornable: false },
  { id: 8, nombre: "COCA COLA RETORNABLE 2.5 L.", stock: 1.50, precioBase: 7.50, img: "🥤", retornable: true },
  { id: 10, nombre: "ARROZ EXTRA SUPERIOR", stock: 50.00, precioBase: 5.00, img: "🍚", retornable: false, esGranel: true },
];

const CATEGORIAS = [
  "Favoritos", "Abarrotes", "Aguas", "Aseo", "Caramelos", 
  "Cervezas", "Chocolates", "Cítricos", "Dulces"
];

export default function VentasPage() {
  const [carrito, setCarrito] = useState<any[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState("Favoritos");
  const [busqueda, setBusqueda] = useState("");

  // Estados Responsivos
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [pestañaActivaMovil, setPestañaActivaMovil] = useState<"productos" | "carrito">("productos");

  // Control de edición inline en el carrito
  const [itemEditandoId, setItemEditandoId] = useState<string | null>(null);

  // Estados Modales
  const [modalVariantesAbierto, setModalVariantesAbierto] = useState(false);
  const [modalGranelAbierto, setModalGranelAbierto] = useState(false);
  const [modalCobroAbierto, setModalCobroAbierto] = useState(false);
  const [modalReporteAbierto, setModalReporteAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<any>(null);

  // Estados Formulario Granel
  const [granelKg, setGranelKg] = useState<string>("");
  const [granelMonto, setGranelMonto] = useState<string>("");

  // Estado Formulario Reporte Stock
  const [formReporte, setFormReporte] = useState({ tipo: "Faltante", motivo: "Dañado", cantidad: "1", notas: "" });

  // Estado dinámico de pagos
  const [pagos, setPagos] = useState<any[]>([{ id: 1, metodo: "Efectivo", monto: "" }]);

  useEffect(() => {
    const carritoGuardado = localStorage.getItem("pos_carrito_v6");
    if (carritoGuardado) setCarrito(JSON.parse(carritoGuardado));
  }, []);

  useEffect(() => {
    localStorage.setItem("pos_carrito_v6", JSON.stringify(carrito));
  }, [carrito]);

  const productosFiltrados = PRODUCTOS_MOCK.filter((prod) => {
    if (!busqueda) return true;
    const terminos = busqueda.toLowerCase().trim().split(/\s+/);
    const nombreProd = prod.nombre.toLowerCase();
    return terminos.every(term => nombreProd.includes(term));
  });

  const calcularSubtotal = () => carrito.reduce((acc, item) => acc + item.precio * item.cant, 0);
  const calcularTotalEnvases = () => carrito.reduce((acc, item) => item.envase?.activo ? acc + (Number(item.envase.montoGarantia) * Number(item.envase.cantidad)) : acc, 0);
  const IGV = calcularSubtotal() * 0.18; 
  const Total = calcularSubtotal() + IGV + calcularTotalEnvases();
  const totalItems = carrito.reduce((acc, item) => acc + (item.esGranel ? 1 : item.cant), 0);
  const totalRecibido = pagos.reduce((acc, p) => acc + (parseFloat(p.monto) || 0), 0);

  const agregarAlCarrito = (producto: any, nombreVariante: string, precioAplicado: number, cantidad: number = 1) => {
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
        envase: { activo: false, cliente: "", montoGarantia: 2.00, cantidad: 1, metodoPago: "Efectivo" }
      }]);
    }
    setModalVariantesAbierto(false);
  };

  // Lógica Granel
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
      envase: null
    }]);
    setModalGranelAbierto(false);
  };

  // Edición Carrito
  const actualizarPropiedadCarrito = (idUnico: string, propiedad: string, valor: any) => {
    setCarrito(carrito.map(item => item.idUnico === idUnico ? { ...item, [propiedad]: valor } : item));
  };
  const actualizarEnvaseItem = (idUnico: string, propiedad: string, valor: any) => {
    setCarrito(carrito.map(item => item.idUnico === idUnico ? { ...item, envase: { ...item.envase, [propiedad]: valor } } : item));
  };
  const eliminarDelCarrito = (idUnico: string) => {
    setCarrito(carrito.filter((item) => item.idUnico !== idUnico));
    if (itemEditandoId === idUnico) setItemEditandoId(null);
  };

  // Pagos
  const abrirModalCobro = () => {
    setPagos([{ id: Date.now(), metodo: "Efectivo", monto: Total.toFixed(2) }]);
    setModalCobroAbierto(true);
  };

  const agregarDivisionPago = () => {
    const sumaActual = pagos.reduce((acc, p) => acc + (parseFloat(p.monto) || 0), 0);
    const restante = Math.max(0, Total - sumaActual);
    const metodosUsados = pagos.map(p => p.metodo);
    let nuevoMetodo = "Yape";
    if (metodosUsados.includes("Yape") && !metodosUsados.includes("Efectivo")) nuevoMetodo = "Efectivo";
    else if (metodosUsados.includes("Yape") && metodosUsados.includes("Efectivo")) nuevoMetodo = "Tarjeta Visa/MC";
    setPagos([...pagos, { id: Date.now(), metodo: nuevoMetodo, monto: restante > 0 ? restante.toFixed(2) : "" }]);
  };

  const actualizarLineaPago = (id: number, propiedad: string, valor: string) => {
    setPagos(pagos.map(p => p.id === id ? { ...p, [propiedad]: valor } : p));
  };

  const procesarPago = () => {
    alert(`¡Comprobante emitido con éxito por S/ ${Total.toFixed(2)}!`);
    setCarrito([]);
    setModalCobroAbierto(false);
  };

  // Envío de Reporte de Stock
  const enviarReporteStock = () => {
    alert(`Reporte enviado: ${formReporte.tipo} de ${formReporte.cantidad} unidades. Motivo: ${formReporte.motivo}`);
    setModalReporteAbierto(false);
    setFormReporte({ tipo: "Faltante", motivo: "Dañado", cantidad: "1", notas: "" });
  };

  return (
    <div className="flex h-screen bg-[#f4f6f9] text-sm overflow-hidden font-sans relative">
      <main className="flex-1 flex flex-col bg-white overflow-hidden">
        
        {/* TABS SUPERIORES */}
        <div className="bg-white border-b border-gray-200 px-4 flex gap-8 text-gray-500 font-medium shrink-0 pt-4">
           <Link href="/historial"><button className="py-3 hover:text-[#00b4d8] transition-colors border-b-2 border-transparent">Ventas</button></Link>
           <button className="py-3 hover:text-[#00b4d8] transition-colors border-b-2 border-transparent">Envases</button>
           <button className="py-3 text-[#00b4d8] border-b-2 border-[#00b4d8] font-semibold">Punto de venta</button>
        </div>

        {/* SWITCHER MÓVIL */}
        <div className="lg:hidden flex bg-gray-100 p-1 border-b border-gray-200 shrink-0">
          <button className={`flex-1 py-2 text-center text-xs font-bold rounded-md transition-all ${pestañaActivaMovil === "productos" ? "bg-white shadow-sm text-[#00b4d8]" : "text-gray-600"}`} onClick={() => setPestañaActivaMovil("productos")}>📦 Productos ({PRODUCTOS_MOCK.length})</button>
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
                {CATEGORIAS.map((cat) => (
                  <button key={cat} onClick={() => setCategoriaActiva(cat)} className={`w-full text-center p-2 md:p-3 border rounded-lg text-[11px] md:text-xs font-medium transition-all ${categoriaActiva === cat ? "border-[#00b4d8] text-[#00b4d8] bg-white shadow-sm" : "border-gray-200 text-gray-600 bg-white hover:border-[#00b4d8]"}`}>{cat}</button>
                ))}
              </div>

              <div className="flex-1 flex flex-col overflow-hidden bg-white">
                <div className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-gray-200 bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <div className="col-span-6 sm:col-span-6">Producto</div>
                  <div className="col-span-2 sm:col-span-2 text-center">Stock</div>
                  <div className="col-span-4 sm:col-span-4 text-right">Precio Base</div>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                  {productosFiltrados.map((prod) => (
                    
                    // FILA CLICKABLE PARA AGREGAR AL CARRITO DIRECTAMENTE
                    <div 
                      key={prod.id} 
                        onClick={() => {
                        if (prod.esGranel) abrirModalGranel(prod);
                        else agregarAlCarrito(prod, "Regular", prod.precioBase);
                      }}
                      className="grid grid-cols-12 gap-2 px-4 py-3 hover:bg-blue-50 cursor-pointer items-center transition-colors relative"
                    >
                      <div className="col-span-6 sm:col-span-6 flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center text-xl bg-white rounded-lg border border-gray-200 shadow-sm shrink-0">{prod.img}</div>
                        <div className="truncate">
                          <span className="text-sm font-bold text-gray-800 block truncate">{prod.nombre}</span>
                          <div className="flex gap-1 mt-0.5 flex-wrap">
                            {prod.esGranel && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">⚖️ Pesable</span>}
                            {prod.retornable && <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">♻️ Retornable</span>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-span-2 sm:col-span-2 text-center">
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded font-bold text-xs">{prod.stock.toFixed(2)}</span>
                      </div>
                      
                      <div className="col-span-4 sm:col-span-4 flex flex-col gap-1 items-end justify-center">
                        <span className="text-sm font-black text-[#00b4d8]">S/ {prod.precioBase.toFixed(2)}</span>
                        
                        {/* BOTÓN DE VARIANTES DESTACADO Y CON DETENCIÓN DE PROPAGACIÓN */}
                        {prod.variantes && prod.variantes.length > 0 && (
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); // Evita que se dispare el click de la fila
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
            
            {/* HEADER DEL CARRITO (Con nuevo botón de Reportar Stock) */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white shrink-0 shadow-sm z-10">
              <span className="font-bold text-gray-800 text-sm flex items-center gap-2">
                Venta actual <span className="bg-[#00b4d8] text-white text-[11px] w-5 h-5 flex items-center justify-center rounded-full font-bold">{carrito.length}</span>
              </span>
              
              <button 
                onClick={() => setModalReporteAbierto(true)}
                className="text-xs text-orange-700 bg-orange-50 border border-orange-200 hover:bg-orange-100 px-2.5 py-1.5 rounded-md font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <AlertTriangle size={14} /> Reportar Stock
              </button>
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
                            {item.envase?.activo && <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.5 rounded font-bold inline-block mt-0.5">+ Envase</span>}
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
                                min={item.esGranel ? "0.01" : "1"}
                                value={item.cant} 
                                onChange={(e) => actualizarPropiedadCarrito(item.idUnico, 'cant', Math.max(item.esGranel ? 0.01 : 1, parseFloat(e.target.value) || (item.esGranel ? 0.01 : 1)))}
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

                          {/* FORMULARIO DE ENVASE (Demo visual) */}
                          {item.retornable && (
                            <div className="pt-3 border-t border-gray-200 mt-2">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-amber-700 flex items-center gap-1">♻️ Registrar Garantía de Envase</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" checked={item.envase.activo} onChange={(e) => actualizarEnvaseItem(item.idUnico, 'activo', e.target.checked)} className="sr-only peer" />
                                  <div className="w-9 h-5 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                                </label>
                              </div>
                              {item.envase.activo && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-3 animate-in fade-in slide-in-from-top-2">
                                  <div>
                                    <label className="block text-[10px] font-bold text-amber-900 uppercase tracking-wide mb-1">Nombre del Cliente</label>
                                    <input type="text" placeholder="Ej. Juan Pérez" value={item.envase.cliente} onChange={(e) => actualizarEnvaseItem(item.idUnico, 'cliente', e.target.value)} className="w-full border border-amber-200 rounded p-1.5 bg-white outline-none text-gray-900 focus:border-amber-500 text-xs font-medium" />
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-[10px] font-bold text-amber-900 uppercase tracking-wide mb-1">Cant. Envases</label>
                                      <input type="number" min="1" value={item.envase.cantidad} onChange={(e) => actualizarEnvaseItem(item.idUnico, 'cantidad', Math.max(1, parseInt(e.target.value) || 1))} className="w-full border border-amber-200 rounded p-1.5 text-gray-900 bg-white text-xs text-center font-bold" />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-bold text-amber-900 uppercase tracking-wide mb-1">Total Garantía (S/)</label>
                                      <input type="number" step="0.10" value={item.envase.montoGarantia} onChange={(e) => actualizarEnvaseItem(item.idUnico, 'montoGarantia', parseFloat(e.target.value) || 0)} className="w-full border border-amber-200 rounded p-1.5 text-gray-900 bg-white text-xs text-center font-bold" />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-amber-900 uppercase tracking-wide mb-1">Método de Pago (Garantía)</label>
                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                      <button type="button" onClick={() => actualizarEnvaseItem(item.idUnico, 'metodoPago', 'Efectivo')} className={`py-1.5 text-center rounded-md border text-xs transition-colors shadow-sm ${item.envase.metodoPago === 'Efectivo' ? 'bg-amber-600 text-white border-amber-700 font-bold' : 'bg-white text-gray-700 border-gray-300'}`}>💵 Efectivo</button>
                                      <button type="button" onClick={() => actualizarEnvaseItem(item.idUnico, 'metodoPago', 'Yape')} className={`py-1.5 text-center rounded-md border text-xs transition-colors shadow-sm ${item.envase.metodoPago === 'Yape' ? 'bg-[#742284] text-white border-[#742284] font-bold' : 'bg-white text-gray-700 border-gray-300'}`}>📱 Yape / Plin</button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="bg-white border-t border-gray-200 flex flex-col mt-auto shrink-0 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)]">
              <div className="p-4 space-y-2">
                <div className="flex justify-between text-xs text-gray-600 font-medium"><span>SubTotal ({totalItems.toFixed(totalItems % 1 !== 0 ? 2 : 0)} items)</span><span>S/ {calcularSubtotal().toFixed(2)}</span></div>
                <div className="flex justify-between text-xs text-gray-600 font-medium"><span>IGV (18%)</span><span>S/ {IGV.toFixed(2)}</span></div>
                
                {calcularTotalEnvases() > 0 && (
                  <div className="flex justify-between text-xs text-amber-700 font-bold bg-amber-50 p-1.5 rounded border border-amber-200">
                    <span>Depósito por Envases</span><span>+ S/ {calcularTotalEnvases().toFixed(2)}</span>
                  </div>
                )}

                <button onClick={abrirModalCobro} disabled={carrito.length === 0} className="w-full mt-3 bg-[#00b4d8] disabled:bg-gray-300 text-white p-3.5 rounded-lg font-black text-sm flex justify-between items-center hover:bg-[#0096b4] transition-colors shadow-md">
                  <div className="flex items-center gap-2"><ShoppingCart size={18} /><span>COBRAR</span></div>
                  <span className="text-lg">S/ {Total.toFixed(2)}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* =========================================
          MODAL 1: VARIANTES
          ========================================= */}
      {modalVariantesAbierto && productoSeleccionado && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-lg">{productoSeleccionado.nombre}</h3>
              <button onClick={() => setModalVariantesAbierto(false)} className="text-gray-400 hover:text-gray-700 bg-white rounded-full p-1 shadow-sm"><X size={18} /></button>
            </div>
            <div className="p-4">
              <p className="text-sm font-medium text-gray-600 mb-4">Selecciona el tipo de venta o presentación:</p>
              <div className="space-y-3">
  {productoSeleccionado.variantes.map((v: any, idx: number) => (
    <button 
      key={idx} 
      onClick={() => {
        // Si es por mayor (v.esPorMayor), enviamos 6, si no, 1
        const cantidadAEnviar = v.esPorMayor ? 6 : 1;
        agregarAlCarrito(productoSeleccionado, v.nombre, v.precio, cantidadAEnviar);
      }} 
      className="w-full flex justify-between items-center p-4 rounded-lg border-2 border-gray-200 hover:border-[#00b4d8] hover:bg-blue-50 transition-all group"
    >
      <span className="font-bold text-gray-800 group-hover:text-[#0096b4]">
        {v.nombre}
        {v.esPorMayor && <span className="block text-[10px] text-emerald-600 font-bold">Llevas 6 unidades</span>}
      </span>
      <span className="font-black text-gray-900 group-hover:text-[#0096b4] text-lg">S/ {v.precio.toFixed(2)}</span>
    </button>
  ))}
</div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL 2: GRANEL
          ========================================= */}
      {modalGranelAbierto && productoSeleccionado && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
             {/* Contenido del modal Granel se mantiene igual que en la versión anterior */}
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

      {/* =========================================
          MODAL 3: REPORTE DE STOCK (NUEVO)
          ========================================= */}
      {modalReporteAbierto && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b bg-orange-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-orange-900 flex items-center gap-2"><AlertTriangle size={20} /> Notificar Novedad de Stock</h2>
              <button onClick={() => setModalReporteAbierto(false)} className="text-orange-400 hover:text-orange-700 bg-white rounded-full p-1"><X size={18} /></button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-gray-600 mb-2">Utiliza este formulario si encuentras productos dañados, vencidos, o si hay descuadres físicos en la estantería.</p>
              
              <div className="grid grid-cols-2 gap-3">
                <label className={`border-2 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer transition-all ${formReporte.tipo === 'Faltante' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name="tipoReporte" className="sr-only" checked={formReporte.tipo === 'Faltante'} onChange={() => setFormReporte({...formReporte, tipo: 'Faltante', motivo: 'Dañado'})} />
                  <span className={`font-bold ${formReporte.tipo === 'Faltante' ? 'text-red-700' : 'text-gray-600'}`}>📉 Faltante</span>
                  <span className="text-[10px] text-center mt-1 text-gray-500">Se perdió, dañó o venció</span>
                </label>

                <label className={`border-2 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer transition-all ${formReporte.tipo === 'Sobrante' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name="tipoReporte" className="sr-only" checked={formReporte.tipo === 'Sobrante'} onChange={() => setFormReporte({...formReporte, tipo: 'Sobrante', motivo: 'No Registrado'})} />
                  <span className={`font-bold ${formReporte.tipo === 'Sobrante' ? 'text-emerald-700' : 'text-gray-600'}`}>📈 Sobrante</span>
                  <span className="text-[10px] text-center mt-1 text-gray-500">Apareció de más</span>
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1 uppercase">Motivo</label>
                <select 
                  value={formReporte.motivo} 
                  onChange={(e) => setFormReporte({...formReporte, motivo: e.target.value})}
                  className="w-full border border-gray-300 rounded-md p-2.5 text-sm outline-none focus:border-orange-500 bg-white"
                >
                  {formReporte.tipo === 'Faltante' ? (
                    <>
                      <option value="Dañado">Rotura / Dañado en tienda</option>
                      <option value="Vencido">Producto Caducado (Vencido)</option>
                      <option value="Perdido">Pérdida / Robo / Extravío</option>
                      <option value="Error">Error de ingreso anterior</option>
                    </>
                  ) : (
                    <>
                      <option value="No Registrado">No se ingresó al sistema</option>
                      <option value="Devolucion">Devolución sin registrar</option>
                      <option value="Otro">Otro motivo</option>
                    </>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-gray-700 mb-1 uppercase">Producto Afectado</label>
                  <select className="w-full border border-gray-300 rounded-md p-2.5 text-sm outline-none focus:border-orange-500 bg-white">
                    <option value="">Seleccione un producto...</option>
                    {PRODUCTOS_MOCK.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1 uppercase">Cantidad</label>
                  <input type="number" min="1" value={formReporte.cantidad} onChange={(e) => setFormReporte({...formReporte, cantidad: e.target.value})} className="w-full border border-gray-300 rounded-md p-2.5 text-sm outline-none focus:border-orange-500 font-bold" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1 uppercase">Observaciones (Opcional)</label>
                <textarea 
                  rows={2} 
                  value={formReporte.notas}
                  onChange={(e) => setFormReporte({...formReporte, notas: e.target.value})}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm outline-none focus:border-orange-500" 
                  placeholder="Ej. Se cayó la botella limpiando la zona..."
                ></textarea>
              </div>

              <button onClick={enviarReporteStock} className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-lg shadow-md transition-colors mt-2">
                Registrar Novedad
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL 4: COBRO
          ========================================= */}
      {modalCobroAbierto && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto pt-[5vh] p-4 backdrop-blur-sm">
           {/* El modal de cobro se mantiene exactamente igual, no se quitó código */}
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
                        <select value={pago.metodo} onChange={(e) => actualizarLineaPago(pago.id, 'metodo', e.target.value)} className="w-full border-2 border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 font-bold outline-none focus:border-[#00b4d8] text-sm">
                          <option value="Efectivo">💵 Efectivo</option>
                          <option value="Yape">📱 Yape / Plin</option>
                          <option value="Tarjeta Visa/MC">💳 Tarjeta Visa/MC</option>
                        </select>
                      </div>
                      <div className="col-span-6 relative">
                        <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Monto</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-sm">S/</span>
                          <input type="number" step="0.10" value={pago.monto} onChange={(e) => actualizarLineaPago(pago.id, 'monto', e.target.value)} className="w-full border-2 border-gray-300 rounded-lg p-2.5 pl-8 bg-white text-gray-900 font-black outline-none focus:border-[#00b4d8] text-sm" />
                        </div>
                        {pagos.length > 1 && (
                          <button onClick={() => setPagos(pagos.filter(p => p.id !== pago.id))} className="absolute -right-3 -top-7 text-red-400 hover:text-red-600 bg-white rounded-full p-1 shadow-sm border border-gray-100" title="Eliminar pago"><X size={14} strokeWidth={3} /></button>
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