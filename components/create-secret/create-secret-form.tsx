"use client";

import { Check, Clipboard, Copy, Eye, EyeOff, KeyRound, LoaderCircle, RefreshCw, Share2, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Messages } from "@/lib/i18n/messages";
import { encryptMessage } from "@/lib/crypto/encrypt";
import { generatePassword } from "@/lib/crypto/random";
import { MAX_MESSAGE_CHARACTERS } from "@/lib/validation/secrets";

type Props = { locale: Locale; copy: Messages["create"] };
type ApiSuccess = { id: string; url: string; expiresAt: string };

function passwordScore(value: string): number {
  let score = 0;
  if (value.length >= 10) score += 1;
  if (value.length >= 14) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value) || value.length >= 20) score += 1;
  return Math.min(4, score);
}

export function CreateSecretForm({ locale, copy }: Props) {
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [expiresIn, setExpiresIn] = useState(86400);
  const [burnAfterReading, setBurnAfterReading] = useState(true);
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ApiSuccess | null>(null);
  const [copied, setCopied] = useState(false);
  const strength = useMemo(() => passwordScore(password), [password]);

  function validate(): string | null {
    if (!message) return copy.errors.required;
    if (message.length > MAX_MESSAGE_CHARACTERS) return copy.errors.tooLong;
    if (password.length < 10) return copy.errors.passwordLength;
    if (password !== confirmation) return copy.errors.passwordMismatch;
    if (!globalThis.crypto?.subtle || !globalThis.crypto?.getRandomValues) return copy.errors.unsupported;
    return null;
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const validationError = validate();
    if (validationError) return setError(validationError);
    if (strength < 3 && !window.confirm(copy.weakConfirm)) return;
    if (website) return;

    setBusy(true);
    try {
      const payload = await encryptMessage(message, password);
      const response = await fetch("/api/secrets", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload, expiresIn, burnAfterReading, locale, website: "" }),
      });
      if (!response.ok) {
        setError(response.status === 429 ? copy.errors.rateLimit : copy.errors.request);
        return;
      }
      const data = (await response.json()) as ApiSuccess;
      setResult({ ...data, url: new URL(data.url, window.location.origin).toString() });
      setMessage("");
      setPassword("");
      setConfirmation("");
    } catch {
      setError(copy.errors.request);
    } finally {
      setBusy(false);
    }
  }

  function makePassword() {
    const generated = generatePassword();
    setPassword(generated);
    setConfirmation(generated);
    setShowPassword(true);
    setError("");
  }

  async function copyLink() {
    if (!result) return;
    await navigator.clipboard.writeText(result.url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function shareLink() {
    if (!result) return;
    if (navigator.share) {
      await navigator.share({ title: copy.shareTitle, text: copy.shareText, url: result.url });
    } else {
      await copyLink();
    }
  }

  if (result) {
    return (
      <section className="card p-6 sm:p-8" aria-live="polite">
        <div className="grid size-12 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-600"><ShieldCheck aria-hidden="true" /></div>
        <h2 className="mt-5 text-2xl font-black">{copy.successTitle}</h2>
        <p className="mt-2 text-[var(--muted)]">{copy.successDescription}</p>
        <label className="label mt-7" htmlFor="secret-link">{copy.linkLabel}</label>
        <div className="flex gap-2">
          <input id="secret-link" className="field min-w-0" readOnly value={result.url} />
          <button type="button" onClick={copyLink} className="btn-secondary shrink-0" aria-label={copy.copyLink}>{copied ? <Check size={18} /> : <Copy size={18} />}</button>
        </div>
        <p className="mt-4 rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-4 text-sm font-semibold">{copy.passwordSeparate}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={copyLink} className="btn-primary">{copied ? <Check size={18} /> : <Clipboard size={18} />}{copied ? copy.copied : copy.copyLink}</button>
          <button type="button" onClick={shareLink} className="btn-secondary"><Share2 size={18} />{copy.share}</button>
          <button type="button" onClick={() => setResult(null)} className="btn-secondary"><RefreshCw size={18} />{copy.createAnother}</button>
        </div>
      </section>
    );
  }

  return (
    <form onSubmit={submit} className="card p-6 sm:p-8" noValidate>
      <div>
        <label className="label" htmlFor="secret-message">{copy.messageLabel}</label>
        <textarea id="secret-message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={MAX_MESSAGE_CHARACTERS} rows={9} className="field resize-y" placeholder={copy.messagePlaceholder} autoComplete="off" spellCheck="false" />
        <p className="mt-2 text-right text-xs text-[var(--muted)]">{copy.characterCount.replace("{current}", String(message.length)).replace("{maximum}", String(MAX_MESSAGE_CHARACTERS))}</p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div>
          <label className="label" htmlFor="create-password">{copy.passwordLabel}</label>
          <div className="relative"><input id="create-password" value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? "text" : "password"} minLength={10} className="field pr-12" placeholder={copy.passwordPlaceholder} autoComplete="new-password" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[var(--muted)]" aria-label={showPassword ? copy.hidePassword : copy.showPassword}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
        </div>
        <div>
          <label className="label" htmlFor="confirm-password">{copy.confirmLabel}</label>
          <input id="confirm-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} type={showPassword ? "text" : "password"} minLength={10} className="field" placeholder={copy.confirmPlaceholder} autoComplete="new-password" />
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between gap-3 text-xs"><span className="font-bold">{copy.strengthLabel}: {copy.strengths[strength]}</span><button type="button" onClick={makePassword} className="inline-flex items-center gap-1.5 font-bold text-cyan-700 dark:text-cyan-300"><KeyRound size={15} />{copy.generatePassword}</button></div>
        <div className="mt-2 grid grid-cols-5 gap-1" aria-hidden="true">{[0,1,2,3,4].map((value) => <span key={value} className={`h-1.5 rounded-full ${value <= strength && password ? "bg-cyan-500" : "bg-slate-300/50"}`} />)}</div>
        <p className="mt-2 text-xs text-[var(--muted)]">{copy.passwordAdvice}</p>
      </div>

      <div className="mt-7 grid gap-5 md:grid-cols-2">
        <div><label className="label" htmlFor="expiry">{copy.expiryLabel}</label><select id="expiry" className="field" value={expiresIn} onChange={(event) => setExpiresIn(Number(event.target.value))}>{copy.expirations.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] p-4"><input type="checkbox" checked={burnAfterReading} onChange={(event) => setBurnAfterReading(event.target.checked)} className="mt-1 size-4 accent-cyan-600" /><span><span className="block font-extrabold">{copy.burnLabel}</span><span className="mt-1 block text-sm text-[var(--muted)]">{copy.burnDescription}</span></span></label>
      </div>

      <div className="absolute -left-[10000px] top-auto size-px overflow-hidden" aria-hidden="true"><label htmlFor="website">{copy.honeypotLabel}</label><input id="website" name="website" value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" /></div>
      {error && <p role="alert" className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-semibold text-[var(--danger)]">{error}</p>}
      <button type="submit" disabled={busy} className="btn-primary mt-7 w-full sm:w-auto">{busy ? <LoaderCircle className="animate-spin" size={18} /> : <ShieldCheck size={18} />}{busy ? copy.encrypting : copy.submit}</button>
    </form>
  );
}
