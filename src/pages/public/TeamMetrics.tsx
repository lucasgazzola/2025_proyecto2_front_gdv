import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// Datos basados en la información suministrada
const data = [
  {
    key: "Iniciar sesión",
    sp: 1,
    est: 4,
    actual: 2,
    cause: "Reutilización de componentes previos y lógica simple",
  },
  {
    key: "Registrarse",
    sp: 2,
    est: 8,
    actual: 6,
    cause: "Validaciones ya implementadas y flujo similar al login",
  },
  {
    key: "Recuperar contraseña",
    sp: 2,
    est: 6,
    actual: 0,
    cause: "Falta de tiempo",
  },
  {
    key: "Gestionar roles",
    sp: 2,
    est: 6,
    actual: 2,
    cause: "Pocos roles, sin lógica compleja",
  },
  {
    key: "Auditoría de operaciones",
    sp: 3,
    est: 12,
    actual: 4,
    cause: "Lógica simple sin complicaciones",
  },
  {
    key: "Dashboard estadísticas",
    sp: 3,
    est: 12,
    actual: 5,
    cause: "Uso de librerías gráficas preconfiguradas y reutilización",
  },
  {
    key: "Gestión de categorías",
    sp: 1,
    est: 4,
    actual: 5,
    cause: "Ajustes de validación y relaciones",
  },
  {
    key: "Gestión de marcas",
    sp: 2,
    est: 8,
    actual: 20,
    cause: "Manejo de imágenes y validaciones",
  },
  {
    key: "Gestión de productos",
    sp: 5,
    est: 20,
    actual: 28,
    cause: "Relaciones múltiples, validaciones y carga de imágenes",
  },
  {
    key: "Gestión de clientes",
    sp: 2,
    est: 8,
    actual: 6,
    cause: "CRUD estándar con validaciones simples",
  },
  {
    key: "Facturación",
    sp: 5,
    est: 20,
    actual: 30,
    cause: "Manejo de stock, auditoría y poca claridad sobre negocio",
  },
  {
    key: "Ver historial facturas",
    sp: 3,
    est: 12,
    actual: 10,
    cause: "Lógica y filtros poco complejos",
  },
];

const PIE_COLORS = [
  "#4f46e5",
  "#06b6d4",
  "#f59e0b",
  "#ef4444",
  "#10b981",
  "#8b5cf6",
];

// Deuda técnica proporcionada
const technicalDebt = [
  {
    id: "DT-01",
    descripcion: "Cobertura de testing frontend",
    causa: "Falta de tiempo de ejecución",
    impacto: "Alto",
    riesgo: "Bugs no detectados",
    plan: "Documentar la limitación en el informe",
  },
  {
    id: "DT-02",
    descripcion: "Validación de registro con email de confirmación",
    causa: "Falta de tiempo y complejidad",
    impacto: "Bajo",
    riesgo: "Se podrán ingresar correos falsos",
    plan: "Una vez registrado no se envía ningún correo, se valida directamente.",
  },
  {
    id: "DT-03",
    descripcion: "La historia de usuario Recuperar contraseña",
    causa: "Falta de tiempo",
    impacto: "Medio",
    riesgo:
      "Los usuarios no podrán recuperar el acceso a sus cuentas, afectando la usabilidad y soporte.",
    plan: "Documentar la limitación en el informe",
  },
  {
    id: "DT-04",
    descripcion: "La dirección, ciudad y provincia están hechos con string",
    causa: "Simplicidad",
    impacto: "Bajo",
    riesgo: "Posible redundancia",
    plan: "Documentar la limitación en el informe",
  },
  {
    id: "DT-05",
    descripcion: "La pasarela de pago no se implementa en factura",
    causa: "Simplicidad",
    impacto: "Bajo",
    riesgo: "Datos inconsistentes",
    plan: "Documentar la limitación en el informe",
  },
];

const TechnicalDebtTable: React.FC = () => (
  <Card>
    <CardContent>
      <CardTitle>Deuda técnica</CardTitle>
      <CardDescription className="mb-3">
        Listado de ítems de deuda técnica, su impacto y plan de resolución.
      </CardDescription>
      <div className="overflow-x-auto">
        <table className="w-full table-auto text-left text-sm">
          <thead>
            <tr className="text-gray-600 border-b">
              <th className="py-2 pr-4">ID</th>
              <th className="py-2 pr-4">Descripción</th>
              <th className="py-2 pr-4">Causa</th>
              <th className="py-2 pr-4">Impacto</th>
              <th className="py-2 pr-4">Riesgo</th>
              <th className="py-2">Plan de resolución</th>
            </tr>
          </thead>
          <tbody>
            {technicalDebt.map((d) => (
              <tr key={d.id} className="border-b hover:bg-gray-50">
                <td className="py-3 pr-4 font-medium">{d.id}</td>
                <td className="py-3 pr-4">{d.descripcion}</td>
                <td className="py-3 pr-4">{d.causa}</td>
                <td className="py-3 pr-4">{d.impacto}</td>
                <td className="py-3 pr-4">{d.riesgo}</td>
                <td className="py-3 text-sm text-gray-700">{d.plan}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
);

// Charts for technical debt: counts by impacto and by riesgo
const TechnicalDebtCharts: React.FC = () => {
  const byImpact: Record<string, number> = {};
  // Use raw counts for risks (no invented weights). Group long risk texts into short labels.
  const riskShortMap: Record<string, string> = {
    "Bugs no detectados": "Bugs",
    "Se podrán ingresar correos falsos": "Emails falsos",
    "Los usuarios no podrán recuperar el acceso a sus cuentas, afectando la usabilidad y soporte.":
      "Recuperación",
    "Posible redundancia": "Redundancia",
    "Datos inconsistentes": "Datos",
  };

  const riskCounts: Record<string, { full: string; count: number }> = {};
  technicalDebt.forEach((d) => {
    byImpact[d.impacto] = (byImpact[d.impacto] || 0) + 1;
    const short = riskShortMap[d.riesgo] || "Otro";
    if (!riskCounts[short]) riskCounts[short] = { full: d.riesgo, count: 0 };
    riskCounts[short].count += 1;
  });
  // Ensure a consistent order for impact (Alto, Medio, Bajo)
  const impactOrder = ["Alto", "Medio", "Bajo"];
  const impactData = impactOrder
    .map((k) => ({ name: k, value: byImpact[k] || 0 }))
    .filter((d) => d.value > 0);

  const riskData = Object.entries(riskCounts)
    .map(([name, obj]) => ({
      full: obj.full,
      name,
      value: obj.count,
      items: obj.count,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardContent>
          <CardTitle>Ítems por impacto</CardTitle>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <BarChart
                data={impactData}
                margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <CardDescription className="mt-2">
            Muestra cuántos ítems tienen impacto Alto/Medio/Bajo para priorizar
            esfuerzos.
          </CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <CardTitle>Riesgos (por ítem)</CardTitle>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div style={{ width: 220, height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  {/* Use short name in chart to avoid labels overlapping; remove label lines */}
                  <Pie
                    data={riskData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    labelLine={false}
                    label={({ percent }: any) =>
                      `${Math.round(percent * 100)}%`
                    }
                  >
                    {riskData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any, props: any) => {
                      // find full label
                      const entry = riskData[props.payload.index];
                      return [`${val} ítems`, entry?.full || name];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Compact legend with full descriptions below */}
            <div className="flex-1 max-h-44 overflow-y-auto pr-2">
              <div className="grid grid-cols-1 gap-2">
                {riskData.map((r, i) => (
                  <div key={r.full + i} className="flex items-start gap-3">
                    <span
                      style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                      className="w-3 h-3 rounded-full mt-1"
                    />
                    <div>
                      <div className="text-start text-sm font-medium">
                        {r.name}{" "}
                        <span className="text-start text-xs text-muted-foreground">
                          — {r.items} ítem(s) • peso {r.value}
                        </span>
                      </div>
                      <div className="text-start text-xs text-gray-600">
                        {r.full}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <CardDescription className="mt-2">
            Visualiza la distribución de riesgos asociados a la deuda técnica.
            Leyenda con la descripción completa.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
};

function formatHoursDiff(row: any) {
  return row.actual - row.est;
}

const TotalSummary: React.FC = () => {
  const totalEst = data.reduce((s, r) => s + r.est, 0);
  const totalActual = data.reduce((s, r) => s + r.actual, 0);
  const totalSP = data.reduce((s, r) => s + r.sp, 0);
  const totalDiff = totalActual - totalEst;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="p-4 bg-white rounded shadow">
        <div className="text-sm text-gray-500">Total Story Points</div>
        <div className="text-2xl font-semibold">{totalSP}</div>
      </div>
      <div className="p-4 bg-white rounded shadow">
        <div className="text-sm text-gray-500">Horas estimadas</div>
        <div className="text-2xl font-semibold">{totalEst} h</div>
      </div>
      <div className="p-4 bg-white rounded shadow">
        <div className="text-sm text-gray-500">Horas reales</div>
        <div className="text-2xl font-semibold">{totalActual} h</div>
        <div
          className={`text-sm ${
            totalDiff > 0 ? "text-red-600" : "text-green-600"
          }`}
        >
          Desvío:{" "}
          {totalDiff > 0
            ? `+${totalDiff} h (sobreestimado)`
            : `${totalDiff} h (ahorro)`}
        </div>
      </div>
    </div>
  );
};

const CausesBreakdown = () => {
  // Mapeo de palabras clave a categorías más generales para evitar demasiadas porciones
  const categorizeCause = (cause: string) => {
    const c = (cause || "").toLowerCase();
    if (
      c.includes("imagen") ||
      c.includes("imagenes") ||
      c.includes("manejo de imágenes")
    )
      return "Imágenes";
    if (c.includes("validaci") || c.includes("validaciones"))
      return "Validaciones";
    if (c.includes("depend") || c.includes("extern") || c.includes("servicio"))
      return "Dependencias externas";
    if (c.includes("tiempo") || c.includes("falta de tiempo"))
      return "Tiempo / planificación";
    if (
      c.includes("relacion") ||
      c.includes("relaciones") ||
      c.includes("complej")
    )
      return "Complejidad / relaciones";
    if (
      c.includes("reutiliz") ||
      c.includes("reutilización") ||
      c.includes("reuso")
    )
      return "Reutilización / conocimiento";
    if (c.includes("stock") || c.includes("factur") || c.includes("auditor"))
      return "Lógica de negocio";
    return "Otros";
  };

  const counts: Record<string, number> = {};
  data.forEach((d) => {
    const cat = categorizeCause(d.cause || "");
    counts[cat] = (counts[cat] || 0) + 1;
  });

  const pieData = Object.entries(counts).map(([name, value]) => ({
    name,
    value,
  }));
  const total = pieData.reduce((s, p) => s + p.value, 0);

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="font-semibold mb-3">Causas del desvío (agrupadas)</h3>
      <div style={{ width: "100%", height: 240 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={80}
              label={({ name, percent }: any) =>
                `${name} (${Math.round(percent * 100)}%)`
              }
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(val: any) => `${val} historias`} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-10 text-sm text-gray-600">
        Explicación: las causas han sido agrupadas en categorías para facilitar
        la interpretación. Se muestra el porcentaje de historias afectadas por
        cada categoría (sobre un total de {total} historias).
      </div>
    </div>
  );
};

const TeamMetricsPage: React.FC = () => {
  return (
    <div className="min-h-screen p-6 pt-24 bg-gray-50">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">
          Informe de estimaciones — Desvíos y análisis
        </h1>
        <p className="text-gray-600 mt-1">
          Resumen profesional y claro de las historias desarrolladas y sus
          desviaciones.
        </p>
      </header>

      {/* Índice / tabla de contenido (barra fija, minimalista) */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] max-w-5xl z-50 p-3 bg-white/90 backdrop-blur rounded-lg shadow-md border">
        <ul className="flex items-center justify-between gap-2 text-sm">
          <li className="text-sm font-medium">Índice</li>
          <li>
            <a
              className="px-3 py-1 rounded-full text-slate-700 hover:bg-slate-100"
              href="#summary"
            >
              Resumen
            </a>
          </li>
          <li>
            <a
              className="px-3 py-1 rounded-full text-slate-700 hover:bg-slate-100"
              href="#charts"
            >
              Gráficos
            </a>
          </li>
          <li>
            <a
              className="px-3 py-1 rounded-full text-slate-700 hover:bg-slate-100"
              href="#table"
            >
              Tabla
            </a>
          </li>
          <li>
            <a
              className="px-3 py-1 rounded-full text-slate-700 hover:bg-slate-100"
              href="#causes"
            >
              Causas
            </a>
          </li>
          <li>
            <a
              className="px-3 py-1 rounded-full text-slate-700 hover:bg-slate-100"
              href="#debt"
            >
              Deuda técnica
            </a>
          </li>
        </ul>
      </nav>

      <div id="summary">
        <TotalSummary />
      </div>

      <section
        id="charts"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"
      >
        <div className="p-4 bg-white rounded shadow">
          <h3 className="font-semibold mb-3">
            Horas estimadas vs reales (por historia)
          </h3>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <BarChart
                data={data}
                margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="key" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="est" name="Estimadas" fill="#60a5fa" />
                <Bar dataKey="actual" name="Reales" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            Notas: las barras permiten comparar rápidamente el cumplimiento por
            historia.
          </div>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <h3 className="font-semibold mb-3">
            Desvío (Horas reales - Estimadas)
          </h3>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <LineChart
                data={data}
                margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="key" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip formatter={(value: any) => `${value} h`} />
                <Line
                  type="monotone"
                  dataKey={(d: any) => formatHoursDiff(d)}
                  name="Desvío (h)"
                  stroke="#ef4444"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            Interpretación: valores positivos indican que tomó más tiempo del
            estimado; negativos indican ahorro.
          </div>
        </div>
      </section>

      <section
        id="table"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"
      >
        <div className="lg:col-span-2 p-4 bg-white rounded shadow">
          <h3 className="font-semibold mb-3">
            Tabla detallada de historias y desvíos
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-left text-sm">
              <thead>
                <tr className="text-gray-600 border-b">
                  <th className="py-2 pr-4">Historia</th>
                  <th className="py-2 pr-4">SP</th>
                  <th className="py-2 pr-4">Horas estim.</th>
                  <th className="py-2 pr-4">Horas reales</th>
                  <th className="py-2 pr-4">Desvío (h)</th>
                  <th className="py-2">Causa</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d, i) => {
                  const diff = d.actual - d.est;
                  return (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="py-3 pr-4 font-medium">{d.key}</td>
                      <td className="py-3 pr-4">{d.sp}</td>
                      <td className="py-3 pr-4">{d.est} h</td>
                      <td className="py-3 pr-4">
                        {d.actual === 0 ? "No aplicado" : `${d.actual} h`}
                      </td>
                      <td
                        className={`py-3 pr-4 ${
                          diff > 0 ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {diff > 0 ? `+${diff}` : diff} h
                      </td>
                      <td className="py-3 text-sm text-gray-700">{d.cause}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            Recomendación: priorizar mitigaciones para las causas más
            recurrentes (p.ej. manejo de imágenes y clarificar lógica de
            facturación).
          </div>
        </div>

        <div id="causes" className="p-4 bg-white rounded shadow">
          <CausesBreakdown />
        </div>
      </section>

      <section id="debt" className="mb-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Charts on top (full width), table below to avoid overlap */}
          <div>
            <TechnicalDebtCharts />
          </div>
          <div>
            <TechnicalDebtTable />
          </div>
        </div>
      </section>

      <footer className="text-xs text-gray-500 mt-6">
        Última actualización: datos suministrados por el equipo. Página diseñada
        para presentación educativa ante la profesora.
      </footer>
    </div>
  );
};

export default TeamMetricsPage;
