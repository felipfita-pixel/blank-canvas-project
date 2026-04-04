import logoFf from "@/assets/logo-ff.jpeg";

interface WatermarkImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}

const WatermarkImage = ({ src, alt, className = "", loading }: WatermarkImageProps) => {
  return (
    <div className="relative w-full h-full">
      <img src={src} alt={alt} className={className} loading={loading} />
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-md px-2 py-1 pointer-events-none select-none">
        <img
          src={logoFf}
          alt="FF Imobiliária"
          className="w-5 h-5 rounded-sm object-cover"
        />
        <span className="text-white/80 text-[10px] font-medium tracking-wide leading-none">
          FF Imobiliária
        </span>
      </div>
    </div>
  );
};

export default WatermarkImage;
