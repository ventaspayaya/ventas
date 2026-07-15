"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    // Simular tiempo de carga y validación
    setTimeout(() => {
      if (usuario === "payayon" && password === "132525oño") {
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("userName", "Administrador");
        router.push("/caja");
      } else if (usuario === "cajero" && password === "5678") {
        localStorage.setItem("userRole", "cajero");
        localStorage.setItem("userName", "Cajero");
        router.push("/caja");
      } else {
        setError("Usuario o contraseña incorrectos");
        setCargando(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex font-sans">
      
      {/* Lado Izquierdo - Banner */}
      <div className="hidden md:flex flex-col justify-center w-1/2 bg-gradient-to-br from-teal-400 to-teal-600 p-12 text-white">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-xl text-teal-600 flex items-center justify-center font-black text-xl shadow-lg">
              PY
            </div>
            <h1 className="text-4xl font-bold tracking-tight">PAYAYA</h1>
          </div>
          <h2 className="text-2xl font-semibold mb-4">¡Nos renovamos!</h2>
          <p className="mb-4 text-teal-50">
            Conoce nuestra nueva plataforma para PYMES del Perú donde podrás
            administrar tu empresa o negocio de forma eficiente.
          </p>
          <p className="mb-8 text-teal-50">
            Actualmente nuestra plataforma está habilitada exclusivamente para nuestros colaboradores.
          </p>
          <button className="px-6 py-2 border border-white rounded-full hover:bg-white hover:text-teal-600 transition font-medium">
            Conoce más
          </button>
        </div>
      </div>

      {/* Lado Derecho - Formulario */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          
          <h2 className="text-2xl font-bold text-center text-teal-600 mb-8">
            Iniciar sesión
          </h2>
          
          <form onSubmit={handleLogin} className="space-y-5">
  
  {/* Mensaje de error integrado */}
  {error && (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
      <AlertCircle size={18} className="shrink-0" />
      <span>{error}</span>
    </div>
  )}

  <div>
    <input
      type="text"
      placeholder="Usuario"
      required
      value={usuario}
      onChange={(e) => setUsuario(e.target.value)}
      // CORREGIDO: Se eliminó text-red-600 y se agregó text-gray-900 y placeholder-gray-400
      className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white transition-colors"
    />
  </div>
  
  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      placeholder="Contraseña"
      required
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      // CORREGIDO: Se agregó text-gray-900 y placeholder-gray-400
      className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white transition-colors"
    />
    <button 
      type="button" 
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-3.5 text-gray-400 hover:text-teal-600 transition-colors"
    >
      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  </div>
  
  <div className="text-right">
    <a href="#" className="text-sm text-teal-600 hover:underline">
      Recuperar contraseña
    </a>
  </div>
  
  <button
    type="submit"
    disabled={cargando}
    className="w-full py-3 flex justify-center items-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 disabled:shadow-none text-white rounded-lg font-bold transition-all shadow-md shadow-teal-200"
  >
    {cargando ? (
      <>
        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        Iniciando...
      </>
    ) : (
      "Ingresar"
    )}
  </button>
  
  <div className="text-center text-sm text-gray-500 mt-4">
    ¿Problemas de acceso?{" "}
    <a href="#" className="text-teal-600 font-bold hover:underline">
      Contactar soporte
    </a>
  </div>
</form>

        </div>
      </div>
    </div>
  );
}