import "server-only";
import type { Locale } from "./config";
import en from "@/messages/en.json";
import id from "@/messages/id.json";

export type Messages = typeof en;
const dictionaries: Record<Locale, Messages> = { en, id };

export function getMessages(locale: Locale): Messages {
  return dictionaries[locale];
}
