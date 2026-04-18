import Link from "next/link";

export default function Home() {
  return (
    // min-h-screen garante que a div ocupe 100% da altura da tela
    // flex, items-center e justify-center centralizam o conteúdo perfeitamente
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      
      {/* Container principal tipo "Cartão" */}
      <div className="bg-white p-10 rounded-2xl shadow-lg border border-gray-100 text-center max-w-lg w-full">
        
        <h1 className="text-4xl font-extrabold text-muttley-dark mb-3">
          Sistema de Gestão
        </h1>
        <p className="text-gray-500 mb-10">
          Selecione o módulo que deseja acessar para continuar.
        </p>

        {/* Container dos botões */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          
          <Link 
            href="/participantes"
            className="flex-1 bg-muttley-action text-white font-bold py-4 px-6 rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200"
          >
            Gerir Participantes
          </Link>
          
          <Link 
            href="/apresentadores"
            className="flex-1 bg-muttley-action text-white font-bold py-4 px-6 rounded-lg shadow-sm hover:bg-indigo-700 hover:shadow-md transition-all duration-200"
          >
            Gerir Apresentadores
          </Link>

        </div>
      </div>
      
    </main>
  );
}