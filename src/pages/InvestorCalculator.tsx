import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, CartesianGrid, Legend, AreaChart, Area, Cell, PieChart as RePieChart, Pie
} from "recharts";
import { 
  Zap, TrendingUp, DollarSign, PieChart, RefreshCw, Info, 
  Target, ShieldCheck, Activity, BrainCircuit, Share2, FileText, 
  ArrowRight, Landmark, Wallet
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Financial formulas and logic
const calculateInvestment = (data: any) => {
  const { price, downPayment, interestRate, term, rentEstimate, condo, iptu, occupancyRate, appreciation, inflation, investmentTerm, maintenance, insurance, adminFee } = data;
  
  const financedAmount = price - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = term * 12;
  
  // PMT formula (Price system)
  const monthlyPayment = monthlyRate > 0 
    ? (financedAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -numPayments))
    : financedAmount / numPayments;

  const annualRent = rentEstimate * 12 * (occupancyRate / 100);
  const annualExpenses = (condo + iptu + (price * maintenance / 100) + (price * insurance / 100) + (annualRent * adminFee / 100)) * 12;
  
  const netMonthlyCashFlow = rentEstimate * (occupancyRate / 100) - monthlyPayment - (condo + iptu);
  const grossYield = (rentEstimate * 12 / price) * 100;
  const capRate = ((annualRent - (condo + iptu) * 12) / price) * 100;
  
  const finalPrice = price * Math.pow(1 + (appreciation / 100), investmentTerm);
  const totalPaidFinancing = monthlyPayment * numPayments;
  const totalRentReceived = annualRent * investmentTerm; // Simplified, not adjusted for inflation for now
  
  const roi = ((finalPrice + totalRentReceived - totalPaidFinancing - downPayment) / (downPayment)) * 100;
  
  return {
    monthlyPayment,
    financedAmount,
    netMonthlyCashFlow,
    grossYield,
    capRate,
    finalPrice,
    totalRentReceived,
    totalPaidFinancing,
    roi,
    payback: downPayment / (netMonthlyCashFlow * 12),
    cashOnCash: (netMonthlyCashFlow * 12 / downPayment) * 100
  };
};

const InvestorCalculator = () => {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState({
    price: parseFloat(searchParams.get("price") || "1000000"),
    downPayment: parseFloat(searchParams.get("price") || "1000000") * 0.2,
    interestRate: 9.5,
    term: 30,
    rentEstimate: parseFloat(searchParams.get("rent") || "5500"),
    occupancyRate: 92,
    condo: parseFloat(searchParams.get("condo") || "1200"),
    iptu: parseFloat(searchParams.get("iptu") || "400"),
    maintenance: 0.5,
    insurance: 0.1,
    adminFee: 6,
    appreciation: 6,
    inflation: 4.5,
    investmentTerm: 10,
    area: parseFloat(searchParams.get("area") || "100"),
    bairro: searchParams.get("bairro") || "Barra da Tijuca",
  });

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const results = useMemo(() => calculateInvestment(data), [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value;
    setData({ ...data, [e.target.name]: value });
  };

  const runAiAnalysis = async () => {
    setIsAiLoading(true);
    try {
      const prompt = `Analise este investimento imobiliário:
        Imóvel: R$ ${data.price.toLocaleString('pt-BR')} em ${data.bairro}.
        Aluguel: R$ ${data.rentEstimate.toLocaleString('pt-BR')}/mês.
        Yield: ${results.grossYield.toFixed(2)}%.
        Cap Rate: ${results.capRate.toFixed(2)}%.
        Retorno sobre o capital (10 anos): ${results.roi.toFixed(1)}%.
        Por favor, forneça uma nota de 0-100, grau de risco e uma recomendação profissional detalhada.`;

      const { data: res, error } = await supabase.functions.invoke("corretores-ia-chat", {
        body: { messages: [{ role: "user", content: prompt }] },
      });
      
      if (error) throw error;
      setAiAnalysis(res.reply);
      toast.success("Análise IA concluída!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao processar análise inteligente.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const chartData = useMemo(() => {
    const arr = [];
    for (let i = 0; i <= data.investmentTerm; i++) {
      arr.push({
        year: i,
        patrimony: data.price * Math.pow(1 + data.appreciation / 100, i),
        debt: Math.max(0, results.financedAmount * (1 - (i / data.term))), // Simplified linear debt reduction for chart
        cumulativeRent: results.rentEstimate * 12 * i
      });
    }
    return arr;
  }, [data, results]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-20 container-main px-4 sm:px-6 lg:px-8">
        <header className="mb-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center border border-secondary/20">
                <Target className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h1 className="text-4xl font-heading font-bold text-foreground">Calculadora do Investidor</h1>
                <p className="text-muted-foreground">Elo27 Wealth Management • Análise Avançada de Ativos</p>
              </div>
            </div>
          </motion.div>
        </header>

        <div className="grid lg:grid-cols-[400px_1fr] gap-8">
          {/* Inputs Sidebar */}
          <aside className="space-y-6">
            <Card className="border-secondary/20 shadow-xl bg-card/50 backdrop-blur-sm sticky top-24">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-4 h-4 text-secondary" />
                  Configurações do Ativo
                </CardTitle>
                <CardDescription>Ajuste os valores para ver o impacto em tempo real</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="base" className="w-full">
                  <TabsList className="grid grid-cols-2 mb-6 bg-primary/5">
                    <TabsTrigger value="base">Imóvel</TabsTrigger>
                    <TabsTrigger value="finance">Finanças</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="base" className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Valor do Imóvel</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input name="price" type="number" value={data.price} onChange={handleChange} className="pl-9 h-12 font-bold text-lg" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Aluguel Estimado</Label>
                        <Input name="rentEstimate" type="number" value={data.rentEstimate} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Ocupação (%)</Label>
                        <Input name="occupancyRate" type="number" value={data.occupancyRate} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Condomínio</Label>
                        <Input name="condo" type="number" value={data.condo} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">IPTU (Mensal)</Label>
                        <Input name="iptu" type="number" value={data.iptu} onChange={handleChange} />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="finance" className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Entrada (R$)</Label>
                      <Input name="downPayment" type="number" value={data.downPayment} onChange={handleChange} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Juros Anuais (%)</Label>
                        <Input name="interestRate" type="number" value={data.interestRate} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Prazo (Anos)</Label>
                        <Input name="term" type="number" value={data.term} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Valorização Anual (%)</Label>
                      <Input name="appreciation" type="number" value={data.appreciation} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Período de Análise (Anos)</Label>
                      <Input name="investmentTerm" type="number" value={data.investmentTerm} onChange={handleChange} />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <div className="px-6 pb-6 pt-2">
                <Button variant="outline" className="w-full gap-2 border-secondary/30 text-secondary" onClick={() => toast.info("Link compartilhado!")}>
                  <Share2 className="w-4 h-4" /> Gerar Link da Simulação
                </Button>
              </div>
            </Card>
          </aside>

          {/* Main Dashboard */}
          <section className="space-y-8">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Yield Bruto", value: `${results.grossYield.toFixed(2)}%`, icon: Zap, color: "text-amber-500" },
                { label: "Cap Rate", value: `${results.capRate.toFixed(2)}%`, icon: Target, color: "text-blue-500" },
                { label: "Cash on Cash", value: `${results.cashOnCash.toFixed(2)}%`, icon: DollarSign, color: "text-emerald-500" },
                { label: "ROI (Total)", value: `${results.roi.toFixed(1)}%`, icon: TrendingUp, color: "text-secondary" },
              ].map((m, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-card/50 border-border/50 hover:border-secondary/30 transition-all group">
                    <CardContent className="pt-6">
                      <m.icon className={`w-5 h-5 mb-2 ${m.color} group-hover:scale-110 transition-transform`} />
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{m.label}</p>
                      <p className="text-2xl font-bold text-foreground">{m.value}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* AI Analysis Panel */}
            <Card className="bg-primary border-secondary/30 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <BrainCircuit className="w-32 h-32 text-secondary" />
              </div>
              <CardContent className="p-8 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-2 text-center md:text-left">
                    <h3 className="text-2xl font-heading font-bold text-primary-foreground flex items-center gap-2 justify-center md:justify-start">
                      <BrainCircuit className="text-secondary" />
                      Análise Inteligente IA27
                    </h3>
                    <p className="text-primary-foreground/70 text-sm">Otimize sua decisão com insights gerados por nossa rede neural especializada.</p>
                  </div>
                  <Button 
                    size="lg" 
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg px-8 h-14 font-bold"
                    onClick={runAiAnalysis}
                    disabled={isAiLoading}
                  >
                    {isAiLoading ? (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Processando...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" /> Gerar Avaliação IA
                      </>
                    )}
                  </Button>
                </div>

                <AnimatePresence>
                  {aiAnalysis && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-8 pt-8 border-t border-primary-foreground/10"
                    >
                      <div className="prose prose-invert max-w-none text-primary-foreground/90 whitespace-pre-line leading-relaxed italic">
                        "{aiAnalysis}"
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Cash Flow */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-emerald-500" />
                    Fluxo de Caixa Mensal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Receita Bruta</span>
                    <span className="font-semibold text-emerald-500">+ R$ {data.rentEstimate.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Prestação (SAC/Price)</span>
                    <span className="font-semibold text-rose-500">- R$ {results.monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Taxas (Cond/IPTU)</span>
                    <span className="font-semibold text-rose-500">- R$ {(data.condo + data.iptu).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <span className="font-bold text-foreground">Fluxo Líquido</span>
                    <div className={`text-xl font-bold ${results.netMonthlyCashFlow >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                      R$ {results.netMonthlyCashFlow.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Projections Chart */}
              <Card className="border-border/50 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-secondary" />
                    Projeção de 10 Anos
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[250px] p-0 pr-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorPat" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                      <XAxis dataKey="year" stroke="#666" fontSize={12} />
                      <YAxis stroke="#666" fontSize={10} tickFormatter={(v) => `R$${(v/1000000).toFixed(1)}M`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                        formatter={(v: number) => `R$ ${v.toLocaleString()}`}
                      />
                      <Area type="monotone" dataKey="patrimony" stroke="#d4af37" fillOpacity={1} fill="url(#colorPat)" name="Patrimônio" />
                      <Line type="monotone" dataKey="debt" stroke="#ef4444" strokeDasharray="5 5" name="Dívida" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Comparison with Financial Assets */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Comparativo de Rentabilidade</CardTitle>
                <CardDescription>Performance estimada vs. Aplicações Financeiras (CDI: 11.25%, IFIX: 9%)</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Imóvel (Elo27)', value: results.roi / 10 },
                    { name: 'CDI Liquido', value: 9.5 },
                    { name: 'IFIX (FIIs)', value: 10.2 },
                    { name: 'Poupança', value: 6.17 },
                  ]}>
                    <XAxis dataKey="name" stroke="#666" fontSize={11} />
                    <YAxis stroke="#666" fontSize={10} tickFormatter={(v) => `${v}%`} />
                    <Tooltip />
                    <Bar dataKey="value" name="Retorno Anual Médio (%)">
                      { [0, 1, 2, 3].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#d4af37' : '#333'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Scenario Summary */}
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: "Conservador", roi: results.roi * 0.7, color: "border-rose-500/30" },
                { label: "Realista", roi: results.roi, color: "border-secondary/30 bg-secondary/5" },
                { label: "Otimista", roi: results.roi * 1.4, color: "border-emerald-500/30" }
              ].map((s, i) => (
                <Card key={i} className={`${s.color} border shadow-sm`}>
                  <CardContent className="pt-6 text-center">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">{s.label}</p>
                    <p className="text-2xl font-bold text-foreground">{s.roi.toFixed(1)}%</p>
                    <p className="text-[10px] text-muted-foreground mt-1">ROI Total Projetado</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <Button className="flex-1 h-14 bg-secondary text-secondary-foreground font-bold text-sm uppercase tracking-widest" onClick={() => window.print()}>
                <FileText className="w-4 h-4 mr-2" /> Exportar Relatório PDF
              </Button>
              <Button variant="outline" className="flex-1 h-14 border-secondary/30 text-secondary font-bold text-sm uppercase tracking-widest" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Veja minha simulação de investimento no Elo27: ROI de ${results.roi.toFixed(1)}% para o imóvel em ${data.bairro}!`)}`)}>
                <Share2 className="w-4 h-4 mr-2" /> Compartilhar Simulação
              </Button>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default InvestorCalculator;
