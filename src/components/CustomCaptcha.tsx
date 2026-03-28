import { useState, forwardRef, useImperativeHandle, useCallback } from "react";
import { ShieldCheck, Check } from "lucide-react";

export interface CustomCaptchaRef {
  reset: () => void;
}

interface CustomCaptchaProps {
  onChange: (verified: boolean) => void;
}

const CustomCaptcha = forwardRef<CustomCaptchaRef, CustomCaptchaProps>(({ onChange }, ref) => {
  const [verified, setVerified] = useState(false);
  const [animating, setAnimating] = useState(false);

  const reset = useCallback(() => {
    setVerified(false);
    setAnimating(false);
    onChange(false);
  }, [onChange]);

  useImperativeHandle(ref, () => ({ reset }), [reset]);

  const handleClick = () => {
    if (verified || animating) return;
    setAnimating(true);
    setTimeout(() => {
      setVerified(true);
      setAnimating(false);
      onChange(true);
    }, 600);
  };

  return (
    <div className={`rounded-xl border-2 p-4 transition-colors ${
      verified ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-border bg-muted/30"
    }`}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleClick}
          disabled={verified}
          className={`w-7 h-7 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
            verified
              ? "bg-green-500 border-green-500 text-white"
              : animating
              ? "border-secondary bg-secondary/10 animate-pulse"
              : "border-border bg-background hover:border-secondary cursor-pointer"
          }`}
        >
          {verified && <Check className="w-4 h-4" />}
          {animating && <div className="w-3 h-3 rounded-full border-2 border-secondary border-t-transparent animate-spin" />}
        </button>

        <span className={`text-sm font-medium select-none ${verified ? "text-green-700 dark:text-green-400" : "text-foreground"}`}>
          {verified ? "Verificação concluída" : "Não sou um robô"}
        </span>

        <div className="ml-auto shrink-0">
          <ShieldCheck className={`w-5 h-5 ${verified ? "text-green-500" : "text-muted-foreground/40"}`} />
        </div>
      </div>
    </div>
  );
});

CustomCaptcha.displayName = "CustomCaptcha";

export default CustomCaptcha;
