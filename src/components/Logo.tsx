import Link from "next/link";

interface LogoProps {
  // Tamanhos padronizados
  size?: "sm" | "md" | "lg" | "xl";
  // Prop opcional: se true (padrão), o logo é um link para "/"
  isLink?: boolean; 
  // Classes extras do Tailwind
  className?: string; 
}

export default function Logo({ size = "md", isLink = true, className = "" }: LogoProps) {
  // Mapeamento de tamanhos
  const textSizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  };

  // O conteúdo visual é o mesmo, independente de ser link ou não
  const content = (
    <span className={`${textSizes[size]} font-bold text-muttley-dark transition-colors hover:opacity-80`}>
      Muttley<span className="text-muttley-action">Admin</span>
    </span>
  );

  return (
    <div className={`shrink-0 flex items-center ${className}`}>
      {/* Se for um link, envolvemos o conteúdo com <Link> */}
      {isLink ? (
        <Link href="/">
          {content}
        </Link>
      ) : (
        // Se não for link, renderizamos apenas o conteúdo visual
        content
      )}
    </div>
  );
}