import React, { useState, useEffect } from 'react';

// Integrantes de la familia
const FAMILIA = ["Robustiano", "Laura", "Mario", "Renata", "Solana", "Vito"];

// Partidos con sus códigos para banderas HD reales
const PARTIDOS_INICIALES = [
  { id: 1, local: "Francia", visitante: "Senegal", codeLocal: "fr", codeVisitante: "sn" },
  { id: 2, local: "Irak", visitante: "Noruega", codeLocal: "iq", codeVisitante: "no" },
  { id: 3, local: "Argentina", visitante: "Argelia", codeLocal: "ar", codeVisitante: "dz" }
];

export default function App() {
  // Estado para los resultados REALES (arrancan todos en limpio y sin jugar)
  const [resultadosReales, setResultadosReales] = useState(() => {
    const guardados = localStorage.getItem('prode_resultados_reales');
    return guardados ? JSON.parse(guardados) : {
      1: { local: "", visitante: "", jugado: false },
      2: { local: "", visitante: "", jugado: false },
      3: { local: "", visitante: "", jugado: false },
    };
  });

  // Estado para los pronósticos (Prode) de la familia
  const [prode, setProde] = useState(() => {
    const guardados = localStorage.getItem('prode_familia_votos');
    if (guardados) return JSON.parse(guardados);

    const inicial = {};
    FAMILIA.forEach(miembro => {
      inicial[miembro] = {
        1: { local: "", visitante: "" },
        2: { local: "", visitante: "" },
        3: { local: "", visitante: "" },
      };
    });
    return inicial;
  });

  const [tablaPosiciones, setTablaPosiciones] = useState([]);

  // Guardar datos automáticamente cuando cambien
  useEffect(() => {
    localStorage.setItem('prode_resultados_reales', JSON.stringify(resultadosReales));
  }, [resultadosReales]);

  useEffect(() => {
    localStorage.setItem('prode_familia_votos', JSON.stringify(prode));
  }, [prode]);

  // Manejar cambios en las predicciones
  const handleProdeChange = (miembro, partidoId, campo, valor) => {
    setProde(prev => ({
      ...prev,
      [miembro]: {
        ...prev[miembro],
        [partidoId]: {
          ...prev[miembro][partidoId],
          [campo]: valor === "" ? "" : parseInt(valor, 10)
        }
      }
    }));
  };

  // Manejar cambios del administrador (Resultados reales de los partidos)
  const handleRealChange = (partidoId, campo, valor) => {
    setResultadosReales(prev => ({
      ...prev,
      [partidoId]: {
        ...prev[partidoId],
        [campo]: valor === "" ? "" : parseInt(valor, 10),
        jugado: true
      }
    }));
  };

  // Borrar el estado de un partido si se cargó mal
  const resetPartidoReal = (partidoId) => {
    setResultadosReales(prev => ({
      ...prev,
      [partidoId]: { local: "", visitante: "", jugado: false }
    }));
  };

  // Recalcular la tabla de posiciones con el sistema de 6, 3 y 0 puntos
  useEffect(() => {
    const calcularPuntos = () => {
      const puntajes = FAMILIA.map(miembro => {
        let puntosTotales = 0;

        PARTIDOS_INICIALES.forEach(partido => {
          const real = resultadosReales[partido.id];
          const pronostico = prode[miembro][partido.id];

          // Solo calcula si el partido se marcó como jugado y ambos cargaron datos
          if (real.jugado && real.local !== "" && real.visitante !== "" && pronostico.local !== "" && pronostico.visitante !== "") {
            const gReal = real.local;
            const pReal = real.visitante;
            const gProde = pronostico.local;
            const pProde = pronostico.visitante;

            // Exacto (6 puntos)
            if (gReal === gProde && pReal === pProde) {
              puntosTotales += 6;
            } 
            // Aproximado / Ganador (3 puntos)
            else if (
              (gReal > pReal && gProde > pProde) || 
              (gReal < pReal && gProde < pProde) || 
              (gReal === pReal && gProde === pProde)
            ) {
              puntosTotales += 3;
            }
          }
        });

        return { nombre: miembro, puntos: puntosTotales };
      });

      puntajes.sort((a, b) => b.puntos - a.puntos);
      setTablaPosiciones(puntajes);
    };

    calcularPuntos();
  }, [prode, resultadosReales]);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 selection:bg-cyan-500 selection:text-slate-900">
      
      {/* Header */}
      <header className="text-center my-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
          PRODE FAMILIAR MUNDIAL
        </h1>
        <p className="text-slate-400 mt-2 text-sm sm:text-base">
          ¡Banderas HD activadas! Completá los pronósticos y mirá la tabla en tiempo real.
        </p>
      </header>

      {/* ESTADO REAL DE LOS PARTIDOS */}
      <section className="max-w-7xl mx-auto mb-8 bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
        <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3 text-center sm:text-left">
          📢 Marcador Real del Torneo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PARTIDOS_INICIALES.map(partido => {
            const real = resultadosReales[partido.id];
            const haJugado = real.jugado && real.local !== "" && real.visitante !== "";
            return (
              <div key={partido.id} className="bg-slate-900/80 p-3 rounded-lg border border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm w-5/12">
                  <img src={`https://flagcdn.com/w40/${partido.codeLocal}.png`} alt={partido.local} className="w-6 h-4 object-cover rounded shadow-sm" />
                  <span className="truncate">{partido.local}</span>
                </div>
                <div className={`w-2/12 text-center font-mono font-bold px-2 py-1 rounded text-lg ${haJugado ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-500'}`}>
                  {haJugado ? `${real.local} - ${real.visitante}` : "vs"}
                </div>
                <div className="flex items-center justify-end gap-2 text-sm w-5/12 text-right">
                  <span className="truncate">{partido.visitante}</span>
                  <img src={`https://flagcdn.com/w40/${partido.codeVisitante}.png`} alt={partido.visitante} className="w-6 h-4 object-cover rounded shadow-sm" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Pronósticos */}
        <section className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold border-b border-slate-700 pb-2 text-cyan-400">📊 Pronósticos de la Familia</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FAMILIA.map(miembro => (
              <div key={miembro} className="bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-700/50 hover:border-cyan-500/30 transition-all">
                <h3 className="text-lg font-bold text-slate-200 mb-3 flex items-center justify-between">
                  <span>👤 {miembro}</span>
                  <span className="text-xs text-slate-400">Puntaje: {tablaPosiciones.find(t => t.nombre === miembro)?.puntos || 0} pts</span>
                </h3>
                
                <div className="space-y-3">
                  {PARTIDOS_INICIALES.map(partido => (
                    <div key={partido.id} className="flex items-center justify-between bg-slate-900/60 p-2 rounded-lg text-sm">
                      <div className="w-2/5 flex items-center gap-2">
                        <img src={`https://flagcdn.com/w40/${partido.codeLocal}.png`} alt={partido.local} className="w-5 h-3.5 object-cover rounded" />
                        <span className="truncate">{partido.local}</span>
                      </div>
                      
                      <div className="w-1/5 flex items-center justify-center gap-1">
                        <input
                          type="number"
                          min="0"
                          placeholder="-"
                          value={prode[miembro][partido.id].local}
                          onChange={(e) => handleProdeChange(miembro, partido.id, 'local', e.target.value)}
                          className="w-10 h-8 bg-slate-700 text-center rounded font-bold text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-slate-500 font-bold">:</span>
                        <input
                          type="number"
                          min="0"
                          placeholder="-"
                          value={prode[miembro][partido.id].visitante}
                          onChange={(e) => handleProdeChange(miembro, partido.id, 'visitante', e.target.value)}
                          className="w-10 h-8 bg-slate-700 text-center rounded font-bold text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>

                      <div className="w-2/5 flex items-center justify-end gap-2 text-right">
                        <span className="truncate">{partido.visitante}</span>
                        <img src={`https://flagcdn.com/w40/${partido.codeVisitante}.png`} alt={partido.visitante} className="w-5 h-3.5 object-cover rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tabla de Posiciones */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold border-b border-slate-700 pb-2 text-emerald-400">🏆 Tabla de Posiciones</h2>
          
          <div className="bg-slate-800 rounded-xl p-4 shadow-xl border border-slate-700 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-sm">
                  <th className="py-2 px-3 text-center">Pos</th>
                  <th className="py-2 px-3">Nombre</th>
                  <th className="py-2 px-3 text-right">Puntos</th>
                </tr>
              </thead>
              <tbody>
                {tablaPosiciones.map((fila, index) => {
                  let medalla = "";
                  if (index === 0) medalla = "🥇";
                  else if (index === 1) medalla = "🥈";
                  else if (index === 2) medalla = "🥉";

                  return (
                    <tr key={fila.nombre} className={`border-b border-slate-700/40 last:border-0 hover:bg-slate-700/20 transition-colors ${index === 0 ? 'bg-emerald-500/10 font-semibold' : ''}`}>
                      <td className="py-3 px-3 text-center font-bold">
                        {medalla ? medalla : `${index + 1}°`}
                      </td>
                      <td className="py-3 px-3 text-slate-200">{fila.nombre}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400 text-lg">
                        {fila.puntos}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* PANEL DE CONTROL MANUAL (ADMIN) */}
      <footer className="max-w-3xl mx-auto mt-16 mb-8 bg-slate-800/80 border border-amber-500/30 rounded-xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2 mb-1">
          ⚙️ Panel del Administrador (Cargar Goles Reales)
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Poné acá los goles a medida que terminen o vayan avanzando los partidos reales. ¡La app calculará todo al toque!
        </p>

        <div className="space-y-3">
          {PARTIDOS_INICIALES.map(partido => (
            <div key={partido.id} className="flex flex-col sm:flex-row items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-700 gap-3">
              <div className="flex items-center gap-2 font-medium text-sm">
                <img src={`https://flagcdn.com/w40/${partido.codeLocal}.png`} alt="" className="w-5 h-3.5 object-cover rounded" />
                <span>{partido.local}</span>
                <span className="text-slate-500">vs</span>
                <span>{partido.visitante}</span>
                <img src={`https://flagcdn.com/w40/${partido.codeVisitante}.png`} alt="" className="w-5 h-3.5 object-cover rounded" />
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    placeholder="L"
                    value={resultadosReales[partido.id].local}
                    onChange={(e) => handleRealChange(partido.id, 'local', e.target.value)}
                    className="w-12 h-8 bg-slate-700 text-center rounded font-bold text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-slate-500 font-bold">-</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="V"
                    value={resultadosReales[partido.id].visitante}
                    onChange={(e) => handleRealChange(partido.id, 'visitante', e.target.value)}
                    className="w-12 h-8 bg-slate-700 text-center rounded font-bold text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                
                <button
                  onClick={() => resetPartidoReal(partido.id)}
                  className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs rounded border border-rose-500/20 transition-all"
                >
                  Reiniciar
                </button>
              </div>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}