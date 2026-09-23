export const CNAME_TARGET = process.env.NEXT_PUBLIC_DOMAIN_CNAME_TARGET || "cname.vercel-dns.com";
export const APEX_A_RECORD = process.env.NEXT_PUBLIC_DOMAIN_A_RECORD || "76.76.21.21";

const DOMAIN_PATTERN = /^(?!:\/\/)([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

export function isValidDomain(value: string): boolean {
  const v = value.trim().toLowerCase();
  return DOMAIN_PATTERN.test(v) && !v.includes("crbio.app") && v.length <= 253;
}
export function normalizeDomain(value: string): string {
  return value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
}
