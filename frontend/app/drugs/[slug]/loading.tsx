import { Loader2 } from "lucide-react";

export default function DrugDetailLoading() {
  return (
    <main className="container-medq py-6">
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium">Loading medicine details...</p>
      </div>
    </main>
  );
}
