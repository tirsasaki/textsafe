import type { Metadata } from "next"; import { notFound } from "next/navigation";
import { LegalContent } from "@/components/pages/info-page"; import { isLocale } from "@/lib/i18n/config"; import { getMessages } from "@/lib/i18n/messages"; import { pageMetadata } from "@/lib/seo/metadata";
type Props={params:Promise<{locale:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{const{locale}=await params;if(!isLocale(locale))return{};const m=getMessages(locale).disclaimer;return pageMetadata(locale,"disclaimer",m.metaTitle,m.metaDescription);}
export default async function Page({params}:Props){const{locale}=await params;if(!isLocale(locale))notFound();const m=getMessages(locale).disclaimer;return <LegalContent title={m.title} intro={m.intro} items={m.items}/>;}
