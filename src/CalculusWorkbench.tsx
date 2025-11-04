import { useMemo, useState } from "react";


import * as math from "mathjs";
import nerdamer from "nerdamer/all";
import { Button } from "./components/button";
import { Label } from "@radix-ui/react-label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { Card, CardContent, CardHeader, CardTitle } from "./components/card";
import { Input } from "./components/input";
import { Textarea } from "./components/textarea";
import Plot from "react-plotly.js";

/* ---------------------- utilidades ----------------------- */
const toNumber = (v: string, def = 0) => {
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : def;
};

function evalNumeric(expr: string, x: number): number | null {
  try {
    const compiled = math.compile(expr);
    const val = compiled.evaluate({ x, e: Math.E, pi: Math.PI });
    return typeof val === "number" && Number.isFinite(val) ? val : null;
  } catch {
    return null;
  }
}

function derivative(expr: string) {
  try {
    return nerdamer.diff(expr, "x").toString();
  } catch {
    return "<erro>";
  }
}

function secondDerivative(expr: string) {
  try {
    return nerdamer.diff(nerdamer.diff(expr, "x"), "x").toString();
  } catch {
    return "<erro>";
  }
}

function integral(expr: string) {
  try {
    return nerdamer.integrate(expr, "x").toString();
  } catch {
    return "<erro>";
  }
}

function defIntegral(expr: string, a: number, b: number, steps = 4000) {
  const n = Math.max(2, steps);
  const h = (b - a) / n;
  let sum = 0;
  for (let i = 0; i <= n; i++) {
    const x = a + i * h;
    const fx = evalNumeric(expr, x) ?? 0;
    sum += fx * (i === 0 || i === n ? 0.5 : 1);
  }
  return sum * h;
}

/* ---------------------- componente ----------------------- */
export default function CalculusWorkbench() {
  const [expr, setExpr] = useState("3*x^2 + 1");
  const [xMin, setXMin] = useState("-10");
  const [xMax, setXMax] = useState("10");
  const [point, setPoint] = useState("3");
  const [a, setA] = useState("0");
  const [b, setB] = useState("5");
  const [samples, setSamples] = useState("400");

  const xmin = toNumber(xMin, -10);
  const xmax = toNumber(xMax, 10);
  const t1 = toNumber(point, 0);
  const A = toNumber(a, 0);
  const B = toNumber(b, 1);
  const n = Math.max(50, Math.min(4000, Math.floor(toNumber(samples, 400))));

  const data = useMemo(() => {
    const xs: number[] = [];
    const ys: number[] = [];
    const step = (xmax - xmin) / n;
    for (let i = 0; i <= n; i++) {
      const x = xmin + i * step;
      const y = evalNumeric(expr, x);
      xs.push(x);
      ys.push(y ?? NaN);
    }
    return { xs, ys };
  }, [expr, xmin, xmax, n]);

  const fVal = evalNumeric(expr, t1);
  const dExpr = derivative(expr);
  const d2Expr = secondDerivative(expr);
  const vVal = evalNumeric(dExpr, t1);
  const aVal = evalNumeric(d2Expr, t1);
  const iExpr = integral(expr);
  const intVal = defIntegral(expr, A, B);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <Card className="shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">
            Calculus Workbench — Limites, Derivadas, Integrais e Gráficos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Expressão f(x)</Label>
              <Input
                value={expr}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setExpr(e.target.value)
                }
                placeholder="ex: sin(x)/x"
              />
              <p className="text-xs text-muted-foreground">
                Use ^ para potência, sin, cos, tan, ln, exp, sqrt...
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>x mín</Label>
                <Input
                  value={xMin}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setXMin(e.target.value)
                  }
                />
              </div>
              <div>
                <Label>x máx</Label>
                <Input
                  value={xMax}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setXMax(e.target.value)
                  }
                />
              </div>
              <div>
                <Label>Ponto (t₁)</Label>
                <Input
                  value={point}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPoint(e.target.value)
                  }
                />
              </div>
              <div>
                <Label>Amostras</Label>
                <Input
                  value={samples}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSamples(e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          <Tabs defaultValue="grafico" className="w-full">
            <TabsList>
              <TabsTrigger value="grafico">Gráfico</TabsTrigger>
              <TabsTrigger value="analise">Análise</TabsTrigger>
              <TabsTrigger value="tabela">Tabela</TabsTrigger>
            </TabsList>

            {/* gráfico */}
            <TabsContent value="grafico" className="pt-4">
              <Plot
                data={[
                  {
                    x: data.xs,
                    y: data.ys,
                    type: "scatter",
                    mode: "lines",
                    name: "f(x)",
                  },
                  {
                    x: [t1],
                    y: [fVal ?? null],
                    type: "scatter",
                    mode: "markers",
                    name: "f(t₁)",
                  },
                ]}
                layout={{
                  autosize: true,
                  title: `f(x) = ${expr}`,
                  xaxis: { title: "x" },
                  yaxis: { title: "f(x)" },
                  margin: { l: 50, r: 30, t: 50, b: 40 },
                }}
                useResizeHandler
                style={{ width: "100%", height: "480px" }}
              />
            </TabsContent>

            {/* análise */}
            <TabsContent value="analise" className="pt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Valores no ponto t₁ = {t1}</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium">f(t₁)</p>
                    <p>{fVal ?? "—"}</p>
                  </div>
                  <div>
                    <p className="font-medium">v(t₁) = f′(t₁)</p>
                    <p>{vVal ?? "—"}</p>
                  </div>
                  <div>
                    <p className="font-medium">a(t₁) = f″(t₁)</p>
                    <p>{aVal ?? "—"}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Derivadas e Integral simbólicas</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>f′(x)</Label>
                    <Textarea readOnly value={dExpr} className="font-mono h-24" />
                  </div>
                  <div>
                    <Label>f″(x)</Label>
                    <Textarea readOnly value={d2Expr} className="font-mono h-24" />
                  </div>
                  <div>
                    <Label>∫ f(x) dx</Label>
                    <Textarea readOnly value={iExpr} className="font-mono h-24" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Integral definida</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>a</Label>
                    <Input
                      value={a}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setA(e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label>b</Label>
                    <Input
                      value={b}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setB(e.target.value)
                      }
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="button">
                      ∫ f(x) dx ≈ {intVal.toFixed(5)}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* tabela */}
            <TabsContent value="tabela" className="pt-4">
              <div className="overflow-auto rounded-xl border">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="text-left p-2">x</th>
                      <th className="text-left p-2">f(x)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.xs.map((x, i) =>
                      i % Math.floor(n / 20) === 0 ? (
                        <tr key={i} className="odd:bg-background even:bg-muted/40">
                          <td className="p-2 font-mono">{x.toFixed(3)}</td>
                          <td className="p-2 font-mono">
                            {Number.isFinite(data.ys[i])
                              ? data.ys[i].toFixed(5)
                              : "—"}
                          </td>
                        </tr>
                      ) : null
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
