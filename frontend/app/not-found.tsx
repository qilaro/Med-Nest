import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-md text-center">
        <h1 className="text-6xl font-black text-navy mb-2">404</h1>
        <p className="text-muted-foreground mb-6">
          The page you are looking for does not exist.
        </p>
        <Link href="/">
          <Button className="font-bold">Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
