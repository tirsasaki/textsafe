import Link from "next/link";
import { ArrowRight, Check, CircleAlert, KeyRound, LockKeyhole, Send, ShieldCheck } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Messages } from "@/lib/i18n/messages";

export function Landing({ locale, messages }: { locale: Locale; messages: Messages }) {
  const h = messages.home;
  const icons = [LockKeyhole, KeyRound, Send, ShieldCheck];
  return (
    <>
      <section className="container-page grid min-h-[620px] items-center gap-10 py-20 lg:grid-cols-[1.15fr_.85fr]">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-sm font-bold text-cyan-700 dark:text-cyan-300"><ShieldCheck size={17} aria-hidden="true" /> AES-256-GCM</div>
          <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-[-.035em] sm:text-6xl">{h.heroTitle}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">{h.heroDescription}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={`/${locale}/create`} className="btn-primary">{h.createButton}<ArrowRight size={18} aria-hidden="true" /></Link>
            <Link href={`/${locale}/open`} className="btn-secondary">{h.openButton}</Link>
          </div>
        </div>
        <div className="card relative overflow-hidden p-8">
          <div className="absolute -right-16 -top-16 size-52 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="relative mx-auto grid aspect-square max-w-sm place-items-center rounded-[2.5rem] border border-[var(--border)] bg-gradient-to-br from-sky-950 to-cyan-900 text-white shadow-2xl">
            <div className="text-center"><ShieldCheck className="mx-auto text-cyan-300" size={92} strokeWidth={1.4} aria-hidden="true" /><p className="mt-5 text-xl font-extrabold">{messages.common.appName}</p><p className="mt-1 text-sm text-cyan-100/75">{messages.common.encryptionBrowser}</p></div>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="max-w-2xl"><h2 className="text-3xl font-black">{h.howTitle}</h2><p className="mt-3 text-[var(--muted)]">{h.howDescription}</p></div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {h.steps.map((step, index) => { const Icon = icons[index]; return <article key={step.title} className="card p-6"><div className="mb-5 grid size-11 place-items-center rounded-xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300"><Icon size={22} aria-hidden="true" /></div><p className="text-xs font-black text-cyan-700 dark:text-cyan-300">0{index + 1}</p><h3 className="mt-2 font-extrabold">{step.title}</h3><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{step.description}</p></article>; })}
        </div>
      </section>

      <section className="container-page grid gap-6 py-16 lg:grid-cols-2">
        <div className="card p-7 sm:p-9"><h2 className="text-2xl font-black">{h.featuresTitle}</h2><ul className="mt-6 grid gap-3 sm:grid-cols-2">{h.features.map((feature) => <li key={feature} className="flex items-center gap-3"><span className="grid size-6 place-items-center rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-300"><Check size={14} aria-hidden="true" /></span>{feature}</li>)}</ul></div>
        <div className="card p-7 sm:p-9"><h2 className="text-2xl font-black">{h.storageTitle}</h2><p className="mt-3 text-[var(--muted)]">{h.storageDescription}</p><ul className="mt-5 flex flex-wrap gap-2">{h.storageItems.map((item) => <li key={item} className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-1.5 text-sm">{item}</li>)}</ul></div>
      </section>

      <section className="container-page py-8"><div className="flex gap-4 rounded-2xl border border-amber-500/35 bg-amber-500/10 p-5 text-amber-950 dark:text-amber-100"><CircleAlert className="mt-0.5 shrink-0" aria-hidden="true" /><p className="font-bold">{h.warning}</p></div></section>
      <section className="container-page py-16"><div className="card bg-gradient-to-r from-sky-950 to-cyan-900 p-8 text-white sm:p-12"><h2 className="text-3xl font-black">{h.ctaTitle}</h2><p className="mt-3 text-cyan-100/80">{h.ctaDescription}</p><Link href={`/${locale}/create`} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-extrabold text-sky-950">{h.createButton}<ArrowRight size={18} aria-hidden="true" /></Link></div></section>
    </>
  );
}
