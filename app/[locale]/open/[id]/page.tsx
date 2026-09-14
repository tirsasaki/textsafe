import type { Metadata } from "next"; import { notFound } from "next/navigation";
import { OpenSecretClient } from "@/components/open-secret/open-secret-client"; import { isLocale } from "@/lib/i18n/config"; import { getMessages } from "@/lib/i18n/messages"; import { pageMetadata } from "@/lib/seo/metadata";
export const dynamic="force-dynamic";
type Props={params:Promise<{locale:string;id:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{const{locale}=await params;if(!isLocale(locale))return{};const m=getMessages(locale).open;return pageMetadata(locale,"open",m.metaTitle,m.metaDescription,true);}
export default async function Page({params}:Props){const{locale,id}=await params;if(!isLocale(locale))notFound();const m=getMessages(locale).open;return <div className="container-page max-w-3xl py-14"><h1 className="text-4xl font-black">{m.title}</h1><div className="mt-8"><OpenSecretClient id={id} locale={locale} copy={m}/></div></div>;}
