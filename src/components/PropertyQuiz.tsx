import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Check, Home, TrendingUp, MapPin, Bed, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QuizProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = [
  {
    id: "goal",
    question: "Qual o seu objetivo principal?",
    options: [
      { id: "morar", label: "Morar", icon: Home },
      { id: "investir", label: "Investir", icon: TrendingUp },
    ],
  },
  {
    id: "region",
    question: "Em qual região você tem preferência?",
    placeholder: "Ex: Barra da Tijuca, Recreio, Zona Sul...",
    icon: MapPin,
  },
  {
    id: "bedrooms",
    question: "Quantos quartos você precisa?",
    options: [
      { id: "1", label: "1 Quarto" },
      { id: "2", label: "2 Quartos" },
      { id: "3", label: "3 Quartos" },
      { id: "4+", label: "4 ou mais" },
    ],
    icon: Bed,
  },
  {
    id: "budget",
    question: "Qual o valor máximo disponível?",
    placeholder: "Ex: 1.500.000",
    type: "number",
    icon: DollarSign,
  },
  {
    id: "timeframe",
    question: "Qual o seu prazo para fechamento?",
    options: [
      { id: "imediato", label: "Imediato" },
      { id: "3meses", label: "Em até 3 meses" },
      { id: "6meses", label: "Em até 6 meses" },
      { id: "planejamento", label: "Apenas planejando" },
    ],
    icon: Calendar,
  },
  {
    id: "contact",
    question: "Para receber as melhores opções, como podemos te contatar?",
    fields: [
      { id: "name", label: "Nome completo", type: "text" },
      { id: "whatsapp", label: "WhatsApp", type: "tel" },
    ],
  },
];

const PropertyQuiz = ({ open, onOpenChange }: QuizProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleOptionSelect = (optionId: string) => {
    setAnswers({ ...answers, [steps[currentStep].id]: optionId });
    setTimeout(() => handleNext(), 300);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // In a real scenario, we'd send this to ELO27 API or a Supabase table
      const leadData = {
        ...answers,
        source: "Quiz Meu Imóvel Ideal",
        created_at: new Date().toISOString(),
      };

      // Use 'contact_messages' for lead capture as a standard fallback in this schema
      const { error } = await supabase.from("contact_messages" as any).insert([
        {
          full_name: answers.name,
          phone: answers.whatsapp,
          message: `[QUIZ MEU IMÓVEL IDEAL]
Objetivo: ${answers.goal}
Região: ${answers.region}
Quartos: ${answers.bedrooms}
Orçamento: R$ ${answers.budget}
Prazo: ${answers.timeframe}`,
          property_id: null
        }
      ]);

      if (error) throw error;

      toast.success("Perfil criado com sucesso! Em breve um especialista entrará em contato.");
      onOpenChange(false);
      setCurrentStep(0);
      setAnswers({});
    } catch (error: any) {
      console.error("Error submitting quiz:", error);
      toast.error("Ocorreu um erro ao enviar suas preferências.");
    } finally {
      setLoading(false);
    }
  };

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const canContinue = step.options 
    ? answers[step.id] !== undefined
    : step.fields
      ? answers.name && answers.whatsapp
      : answers[step.id] !== undefined && answers[step.id] !== "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-primary border-secondary/20 rounded-3xl">
        <div className="relative p-8 pt-12">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="mb-8">
            <div className="flex gap-2 mb-4">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                    i <= currentStep ? "bg-secondary" : "bg-white/10"
                  }`}
                />
              ))}
            </div>
            <p className="text-secondary text-[10px] uppercase tracking-[0.3em] font-bold mb-2">
              Passo {currentStep + 1} de {steps.length}
            </p>
            <h2 className="text-2xl font-display font-bold text-white leading-tight">
              {step.question}
            </h2>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {step.options ? (
                <div className="grid grid-cols-1 gap-3">
                  {step.options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleOptionSelect(opt.id)}
                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 group ${
                        answers[step.id] === opt.id
                          ? "bg-secondary border-secondary text-secondary-foreground"
                          : "bg-white/5 border-white/10 text-white hover:border-secondary/50 hover:bg-white/10"
                      }`}
                    >
                      {opt.icon && <opt.icon className={`w-6 h-6 ${answers[step.id] === opt.id ? "text-secondary-foreground" : "text-secondary"}`} />}
                      <span className="font-medium">{opt.label}</span>
                      {answers[step.id] === opt.id && <Check className="ml-auto w-5 h-5" />}
                    </button>
                  ))}
                </div>
              ) : step.fields ? (
                <div className="space-y-4">
                  {step.fields.map((f) => (
                    <div key={f.id}>
                      <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5 block">
                        {f.label}
                      </label>
                      <Input
                        type={f.type}
                        value={answers[f.id] || ""}
                        onChange={(e) => setAnswers({ ...answers, [f.id]: e.target.value })}
                        className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-secondary/50 focus:border-secondary"
                        placeholder={f.id === "whatsapp" ? "(21) 99999-9999" : ""}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <div className="relative">
                    {step.icon && <step.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />}
                    <Input
                      type={step.type || "text"}
                      value={answers[step.id] || ""}
                      onChange={(e) => setAnswers({ ...answers, [step.id]: e.target.value })}
                      className={`bg-white/5 border-white/10 text-white h-14 rounded-xl focus:ring-secondary/50 focus:border-secondary ${step.icon ? "pl-12" : "px-4"}`}
                      placeholder={step.placeholder}
                      autoFocus
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-12 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="text-white/50 hover:text-white disabled:opacity-0 transition-all"
            >
              <ChevronLeft className="w-5 h-5 mr-1" /> Voltar
            </Button>

            {!step.options && (
              <Button
                onClick={handleNext}
                disabled={!canContinue || loading}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full px-8 py-6 font-bold uppercase tracking-widest text-xs shadow-xl shadow-secondary/20"
              >
                {loading ? "Enviando..." : isLastStep ? "Finalizar Perfil" : "Próximo"}
                {!loading && !isLastStep && <ChevronRight className="w-4 h-4 ml-2" />}
                {isLastStep && !loading && <Check className="w-4 h-4 ml-2" />}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyQuiz;