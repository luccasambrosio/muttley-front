import { redirect } from "next/navigation";

export default function HomePage() {
  // A home do sistema agora é a vitrine de eventos!
  redirect("/eventos");
}