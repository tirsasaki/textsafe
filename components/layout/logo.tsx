import { ShieldCheck } from "lucide-react";

export function Logo({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-2 font-extrabold tracking-tight">
      <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-sky-800 to-cyan-400 text-white shadow-sm">
        <ShieldCheck aria-hidden="true" size={21} />
      </span>
      <span>{name}</span>
    </span>
  );
}
