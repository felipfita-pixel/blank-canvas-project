import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const InvestorCalculator = () => {
  const [data, setData] = useState({
    price: 1000000,
    downPayment: 200000,
    interestRate: 10,
    term: 30,
    monthlyPayment: 5000,
    condo: 1000,
    iptu: 300,
    otherExpenses: 200,
    rentEstimate: 6000,
    occupancyRate: 90,
    appreciation: 5,
    inflation: 4,
    maintenance: 1,
    brokerage: 5,
    investmentTerm: 10,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: parseFloat(e.target.value) });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-24 container-main px-4 sm:px-6 lg:px-8 pb-16">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-8 text-center">Calculadora do Investidor</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Dados do Imóvel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(data).map(([key, value]) => (
                <div key={key}>
                  <Label htmlFor={key} className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                  <Input id={key} name={key} type="number" value={value} onChange={handleChange} />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">Lucro Líquido Anual</p>
                  <p className="text-xl font-bold text-foreground">R$ {(data.rentEstimate * 12 * (data.occupancyRate / 100) - (data.condo + data.iptu + data.otherExpenses) * 12).toLocaleString("pt-BR", { style: 'currency', currency: 'BRL' })}</p>
                </div>
                {/* Add more metrics here */}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default InvestorCalculator;
