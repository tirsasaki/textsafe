"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Messages } from "@/lib/i18n/messages";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function OpenLookup({ locale, copy }: { locale: Locale; copy: Messages["openLookup"] }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    let id = value.trim();
    try {
      const url = new URL(id);
      const match = url.pathname.match(/\/open\/([0-9a-f-]+)$/i);
      if (match) id = match[1];
    } catch {}
    if (!uuid.test(id)) return setError(copy.invalid);
    router.push(`/${locale}/open/${id}`);
  }

  return <form onSubmit={submit} className="card p-6 sm:p-8"><label htmlFor="secret-reference" className="label">{copy.label}</label><div className="flex flex-col gap-3 sm:flex-row"><input id="secret-reference" value={value} onChange={(event) => setValue(event.target.value)} className="field" placeholder={copy.placeholder} autoComplete="off" /><button className="btn-primary shrink-0">{copy.button}<ArrowRight size={18} /></button></div>{error && <p role="alert" className="mt-3 text-sm font-semibold text-[var(--danger)]">{error}</p>}</form>;
}
