/**
 * The public bio page is served with ISR (see revalidate export on
 * app/[username]/page.tsx) so edge/CDN caches can serve it fast
 * without hitting Supabase on every visit. This helper tells Next.js
 * to drop that cached copy the moment a creator saves a change, so
 * their own edits always show up immediately — everyone else still
 * gets the cached, fast version until the next edit or the normal
 * revalidation window passes.
 */
export function triggerRevalidate(username: string) {
  if (!username) return;
  fetch("/api/revalidate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
    keepalive: true,
  }).catch(() => {});
}
