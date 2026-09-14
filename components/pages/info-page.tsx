import { CheckCircle2, CircleX, ShieldAlert } from "lucide-react";
import type { Messages } from "@/lib/i18n/messages";

export function SecurityContent({ messages }: { messages: Messages }) {
  const s = messages.security;
  return <div className="container-page max-w-4xl py-14"><h1 className="text-4xl font-black">{s.title}</h1><p className="mt-4 text-lg text-[var(--muted)]">{s.intro}</p><div className="prose-safe mt-10">{s.sections.map((section) => <section key={section.title}><h2>{section.title}</h2><p>{section.body}</p></section>)}</div><div className="card mt-10 p-7"><h2 className="text-xl font-black">{s.separateTitle}</h2><p className="mt-3 text-[var(--muted)]">{s.separateBody}</p></div><h2 className="mt-12 text-2xl font-black">{s.threatTitle}</h2><div className="mt-6 grid gap-5 md:grid-cols-2"><div className="card p-6"><h3 className="flex items-center gap-2 font-extrabold"><CheckCircle2 className="text-emerald-500" aria-hidden="true" />{s.protectsTitle}</h3><ul className="mt-4 grid gap-3 text-sm text-[var(--muted)]">{s.protects.map((item) => <li key={item}>{item}</li>)}</ul></div><div className="card p-6"><h3 className="flex items-center gap-2 font-extrabold"><CircleX className="text-rose-500" aria-hidden="true" />{s.notProtectsTitle}</h3><ul className="mt-4 grid gap-3 text-sm text-[var(--muted)]">{s.notProtects.map((item) => <li key={item}>{item}</li>)}</ul></div></div><div className="mt-8 flex gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5"><ShieldAlert className="shrink-0 text-rose-500" aria-hidden="true" /><p className="font-semibold">{s.critical}</p></div></div>;
}

export function FaqContent({ messages }: { messages: Messages }) {
  const f = messages.faq;
  return <div className="container-page max-w-4xl py-14"><h1 className="text-4xl font-black">{f.title}</h1><p className="mt-4 text-lg text-[var(--muted)]">{f.intro}</p><div className="mt-9 grid gap-3">{f.items.map((item) => <details key={item.q} className="card group p-5"><summary className="cursor-pointer list-none pr-7 font-extrabold">{item.q}</summary><p className="mt-3 leading-7 text-[var(--muted)]">{item.a}</p></details>)}</div></div>;
}

export function LegalContent({ title, intro, sections, items }: { title: string; intro: string; sections?: { title: string; body: string }[]; items?: string[] }) {
  return <div className="container-page max-w-4xl py-14"><h1 className="text-4xl font-black">{title}</h1><p className="mt-4 text-lg text-[var(--muted)]">{intro}</p>{sections && <div className="prose-safe mt-10">{sections.map((section) => <section key={section.title}><h2>{section.title}</h2><p>{section.body}</p></section>)}</div>}{items && <ul className="card mt-9 grid gap-4 p-7">{items.map((item) => <li key={item} className="flex gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-cyan-600" size={19} aria-hidden="true" /><span>{item}</span></li>)}</ul>}</div>;
}
