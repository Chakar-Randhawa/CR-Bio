export type DeviceCategory = "mobile" | "tablet" | "desktop";

export function parseUserAgent(ua: string | null | undefined): { device: DeviceCategory; browser: string } {
  const lower = (ua || "").toLowerCase();
  let device: DeviceCategory = "desktop";
  if (/ipad|tablet|kindle|playbook|silk/.test(lower) && !/mobile/.test(lower)) device = "tablet";
  else if (/mobi|iphone|ipod|android.*mobile|windows phone|blackberry/.test(lower)) device = "mobile";
  else if (/android/.test(lower)) device = /mobile/.test(lower) ? "mobile" : "tablet";

  let browser = "Other";
  if (/edg\//.test(lower)) browser = "Edge";
  else if (/opr\/|opera/.test(lower)) browser = "Opera";
  else if (/chrome|crios/.test(lower) && !/edg\//.test(lower)) browser = "Chrome";
  else if (/fxios|firefox/.test(lower)) browser = "Firefox";
  else if (/safari/.test(lower) && !/chrome|crios|android/.test(lower)) browser = "Safari";
  else if (/samsungbrowser/.test(lower)) browser = "Samsung Internet";

  return { device, browser };
}

export function countryFromHeaders(headers: Headers): string | null {
  return headers.get("x-vercel-ip-country") || headers.get("x-country") || headers.get("cf-ipcountry") || null;
}

const REGION_NAMES = new Intl.DisplayNames(["en"], { type: "region" });
export function countryCodeToName(code: string | null | undefined): string {
  if (!code) return "Unknown";
  try { return REGION_NAMES.of(code.toUpperCase()) || code; } catch { return code; }
}
