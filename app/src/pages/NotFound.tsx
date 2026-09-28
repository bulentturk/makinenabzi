import { BrandMark } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-tint px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="flex max-w-md flex-col items-center"
      >
        <BrandMark className="size-12 rounded-2xl" iconClassName="size-6" />
        <p className="mt-6 font-display text-[0.72rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          404
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight">
          Bu sayfayı bulamadık
        </h1>
        <p className="mt-3 text-[0.88rem] leading-relaxed text-muted-foreground">
          Aradığınız haber kaldırılmış veya adres değişmiş olabilir. Akışa
          dönüp güncel sanayi gündemine göz atabilirsiniz.
        </p>
        <div className="mt-7 flex flex-col gap-2 sm:flex-row">
          <Button asChild className="h-10 rounded-xl px-5">
            <Link to="/dashboard">Haber akışına git</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-10 rounded-xl border-border/80 px-5"
          >
            <Link to="/">
              <ArrowLeft className="size-4" />
              Ana sayfa
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
