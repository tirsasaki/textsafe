"use client";

import { Check, Clipboard, Eye, EyeOff, LoaderCircle, LockKeyhole, RotateCcw, ShieldAlert, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { EncryptedPayload } from "@/lib/crypto/types";
import { decryptMessage } from "@/lib/crypto/decrypt";
import type { Locale } from "@/lib/i18n/config";
import type { Messages } from "@/lib/i18n/messages";

type Stage = "loading" | "ready" | "retrieving" | "password" | "success" | "expired" | "destroyed" | "not-found" | "network" | "cleared";
type Metadata = { expiresAt: string; burnAfterReading: boolean };
type Retrieved = Metadata & { payload: EncryptedPayload };

export function OpenSecretClient({ id, locale, copy }: { id: string; locale: Locale; copy: Messages["open"] }) {
  const [stage, setStage] = useState<Stage>("loading");
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [retrieved, setRetrieved] = useState<Retrieved | null>(null);
  const [password, setPassword] = useState("");
  const [plaintext, setPlaintext] = useState("");
  const [visible, setVisible] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [decryptError, setDecryptError] = useState("");
  const [copied, setCopied] = useState(false);
  const uuidValid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

  const check = useCallback(async () => {
    if (!uuidValid) return setStage("not-found");
    setStage("loading");
    try {
      const response = await fetch(`/api/secrets/${id}?metadata=1`, { cache: "no-store", credentials: "same-origin" });
      if (response.status === 404) return setStage("not-found");
      if (response.status === 410) {
        const body = await response.json().catch(() => ({})) as { status?: string };
        return setStage(body.status === "consumed" ? "destroyed" : "expired");
      }
      if (!response.ok) return setStage("network");
      const data = await response.json() as Metadata;
      setMetadata(data);
      setStage("ready");
    } catch {
      setStage("network");
    }
  }, [id, uuidValid]);

  useEffect(() => { void check(); }, [check]);

  async function retrieve() {
    setStage("retrieving");
    try {
      const response = await fetch(`/api/secrets/${id}`, { cache: "no-store", credentials: "same-origin" });
      if (response.status === 404) return setStage("not-found");
      if (response.status === 410) {
        const body = await response.json().catch(() => ({})) as { status?: string };
        return setStage(body.status === "consumed" ? "destroyed" : "expired");
      }
      if (!response.ok) return setStage("network");
      const data = await response.json() as Retrieved;
      setRetrieved(data);
      setMetadata(data);
      setStage("password");
    } catch {
      setStage("network");
    }
  }

  async function decrypt(event: React.FormEvent) {
    event.preventDefault();
    if (!retrieved || !password) return;
    setDecryptError("");
    try {
      const message = await decryptMessage(retrieved.payload, password);
      setPlaintext(message);
      setPassword("");
      setVisible(true);
      setStage("success");
    } catch {
      setPassword("");
      setDecryptError(copy.unable);
    }
  }

  async function copyMessage() {
    await navigator.clipboard.writeText(plaintext);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function clearMessage() {
    setPlaintext("");
    setPassword("");
    setRetrieved(null);
    setStage("cleared");
  }

  const expiration = metadata ? new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(metadata.expiresAt)) : "";

  return (
    <section className="card p-6 sm:p-8" aria-live="polite">
      {stage === "loading" && <Status icon={<LoaderCircle className="animate-spin" />} title={copy.loading} />}
      {stage === "retrieving" && <Status icon={<LoaderCircle className="animate-spin" />} title={copy.retrieving} />}
      {stage === "ready" && metadata && <div><Status icon={<LockKeyhole />} title={copy.readyTitle} body={copy.readyDescription} /><p className="mt-5 text-sm font-bold text-[var(--muted)]">{copy.expires.replace("{date}", expiration)}</p><div className={`mt-5 flex gap-3 rounded-xl border p-4 ${metadata.burnAfterReading ? "border-rose-500/30 bg-rose-500/10" : "border-cyan-500/30 bg-cyan-500/10"}`}><ShieldAlert className="shrink-0" /><p className="text-sm font-semibold">{metadata.burnAfterReading ? copy.burnWarning : copy.normalWarning}</p></div><button type="button" onClick={retrieve} className="btn-primary mt-6">{metadata.burnAfterReading ? <Trash2 size={18} /> : <LockKeyhole size={18} />}{metadata.burnAfterReading ? copy.retrieveBurn : copy.retrieveNormal}</button></div>}
      {stage === "password" && retrieved && <form onSubmit={decrypt}><Status icon={<LockKeyhole />} title={copy.passwordTitle} body={copy.passwordDescription} /><label htmlFor="decrypt-password" className="label mt-6">{copy.passwordLabel}</label><div className="relative"><input id="decrypt-password" value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? "text" : "password"} className="field pr-12" placeholder={copy.passwordPlaceholder} autoComplete="current-password" autoFocus /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2" aria-label={showPassword ? copy.hidePassword : copy.showPassword}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>{decryptError && <div role="alert" className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-semibold"><p>{decryptError}</p>{retrieved.burnAfterReading && <p className="mt-2">{copy.burnedFailure}</p>}</div>}<button className="btn-primary mt-5" disabled={!password}>{copy.decrypt}</button></form>}
      {stage === "success" && <div><Status icon={<Check />} title={copy.successTitle} /><p className="label mt-6">{copy.messageLabel}</p><pre className="min-h-28 whitespace-pre-wrap break-words rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] p-5 font-sans leading-7">{visible ? plaintext : "••••••••"}</pre><div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={copyMessage} className="btn-primary">{copied ? <Check size={18} /> : <Clipboard size={18} />}{copied ? copy.copied : copy.copy}</button><button type="button" onClick={() => setVisible((value) => !value)} className="btn-secondary">{visible ? <EyeOff size={18} /> : <Eye size={18} />}{visible ? copy.hide : copy.show}</button><button type="button" onClick={clearMessage} className="btn-secondary"><Trash2 size={18} />{copy.clear}</button></div></div>}
      {stage === "expired" && <Status icon={<ShieldAlert />} title={copy.expiredTitle} body={copy.expired} />}
      {stage === "destroyed" && <Status icon={<Trash2 />} title={copy.destroyedTitle} body={copy.destroyed} />}
      {stage === "not-found" && <Status icon={<ShieldAlert />} title={copy.notFoundTitle} body={uuidValid ? copy.notFound : copy.invalid} />}
      {stage === "network" && <div><Status icon={<ShieldAlert />} title={copy.networkTitle} body={copy.network} /><button type="button" onClick={check} className="btn-secondary mt-5"><RotateCcw size={18} />{copy.retry}</button></div>}
      {stage === "cleared" && <Status icon={<Trash2 />} title={copy.cleared} />}
    </section>
  );
}

function Status({ icon, title, body }: { icon: React.ReactNode; title: string; body?: string }) {
  return <div><div className="grid size-12 place-items-center rounded-2xl bg-cyan-500/15 text-cyan-700 dark:text-cyan-300" aria-hidden="true">{icon}</div><h2 className="mt-5 text-2xl font-black">{title}</h2>{body && <p className="mt-2 leading-7 text-[var(--muted)]">{body}</p>}</div>;
}
