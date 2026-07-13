"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Guardamos una sesión simulada en Local Storage
    localStorage.setItem("sesion_activa", "true");
    router.push("/ventas");
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado Izquierdo - Banner */}
      <div className="hidden md:flex flex-col justify-center w-1/2 bg-gradient-to-br from-teal-400 to-teal-600 p-12 text-white">
        <div className="max-w-md">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-white rounded-lg opacity-20"></div>
            <h1 className="text-4xl font-bold tracking-tight">miSistema</h1>
          </div>
          <h2 className="text-2xl font-semibold mb-4">¡Nos renovamos!</h2>
          <p className="mb-4 text-teal-50">
            Conoce nuestra nueva plataforma para PYMES del Perú donde podrás
            administrar tu empresa o negocio.
          </p>
          <p className="mb-8 text-teal-50">
            Actualmente nuestra plataforma está habilitada para nuestros clientes.
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
            <div>
              <input
                type="text"
                placeholder="Usuario"
                required
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="relative">
              <input
                type="password"
                placeholder="Contraseña"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button type="button" className="absolute right-3 top-3.5 text-gray-400">
                👁️
              </button>
            </div>
            <div className="text-right">
              <a href="#" className="text-sm text-teal-600 hover:underline">
                Recuperar contraseña
              </a>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-bold transition-colors shadow-md shadow-teal-200"
            >
              Ingresar
            </button>
            <div className="text-center text-sm text-gray-500 mt-4">
              ¿Todavía no tienes una cuenta?{" "}
              <a href="#" className="text-teal-600 font-bold hover:underline">
                ¡Regístrate!
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}