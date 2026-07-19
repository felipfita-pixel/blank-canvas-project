import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { Zap, TrendingUp, DollarSign, PieChart, RefreshCw } from "lucide-react";

const InvestorCalculator = () => {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState({
    price: parseFloat(searchParams.get("price") || "1000000"),
    condo: parseFloat(searchParams.get("condo") || "1000"),
    iptu: parseFloat(searchParams.get("iptu") || "300"),
    area: parseFloat(searchParams.get("area") || "100"),
    bairro: searchParams.get("bairro") || "Barra da Tijuca",
    downPayment: 200000,
    interestRate: 10,
    term: 30,
    rentEstimate: 6000,
    appreciation: 5,
    inflation: 4,
    investmentTerm: 10,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: parseFloat(e.target.value) });
  };

  const results = {
    grossYield: (data.rentEstimate * 12 / data.price) * 100,
    roi: ((data.rentEstimate * 12 * data.investmentTerm) / data.price) * 100,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-24 container-main px-4 sm:px-6 lg:px-8 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Calculadora do Investidor</h1>
          <p className="text-muted-foreground mb-8">Análise profissional de rentabilidade e projeção de investimentos.</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-secondary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Zap className="text-secondary" /> Parâmetros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(data).map(([key, value]) => (
                  <div key={key}>
                    <Label className="capitalize text-xs font-semibold">{key.replace(/([A-Z])/g, ' $1')}</Label>
                    <Input name={key} type="number" value={value} onChange={handleChange} className="mt-1" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-primary/5">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Yield Bruto (Ano)</p>
                  <p className="text-3xl font-bold text-primary">{results.grossYield.toFixed(2)}%</p>
                </CardContent>
              </Card>
              <Card className="bg-primary/5">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">ROI Estimado (10 anos)</p>
                  <p className="text-3xl font-bold text-primary">{results.roi.toFixed(1)}%</p>
                </CardContent>
              </Card>
              <Card className="bg-primary/5">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Fluxo Mensal Líquido</p>
                  <p className="text-3xl font-bold text-primary">R$ {(data.rentEstimate - data.condo - data.iptu).toLocaleString("pt-BR", { style: 'currency', currency: 'BRL' })}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="text-secondary" /> Projeção de Patrimônio</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={Array.from({ length: 11 }, (_, i) => ({ year: i, value: data.price * Math.pow(1 + data.appreciation / 100, i) }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#d4af37" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default InvestorCalculator;
