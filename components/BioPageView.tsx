"use client";
import Image from "next/image";
import type { Link as LinkRow, LinkCollection, Profile } from "@/lib/types";
import { detectPlatformIcon } from "@/lib/platform-icons";
import { FONT_PAIRS, cn, resolveTheme, getSurface, isColorLight, type ProfileTheme } from "@/lib/utils";
import { EmbedBlock } from "@/components/EmbedBlock";
import { LeadCaptureBlock } from "@/components/LeadCaptureBlock";
import { ProductBlock } from "@/components/ProductBlock";
import { BookingBlock } from "@/components/BookingBlock";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { HeaderBlock } from "@/components/HeaderBlock";
import { CollectionBlock } from "@/components/CollectionBlock";

type BioLink = Pick<LinkRow, "id" | "title" | "url" | "click_count" | "block_type" | "display_style" | "description" | "price_cents" | "currency" | "delivery_type" | "external_checkout_url" | "collection_id">;

function buttonShapeClass(theme: ProfileTheme) {
  return theme.buttonShape === "pill" ? "rounded-full" : theme.buttonShape === "square" ? "rounded-md" : "rounded-xl";
}
function buttonAnimClass(theme: ProfileTheme) {
  switch (theme.buttonAnimation) {
    case "lift": return "btn-anim-lift";
    case "grow": return "btn-anim-grow";
    case "pulse": return "btn-anim-pulse";
    case "shine": return "btn-anim-shine";
    default: return "";
  }
}

function LinkButton({
  block, shape, anim, theme, accent, hasMedia, isLight, surface, interactive, onLinkClick,
}: {
  block: BioLink; shape: string; anim: string; theme: ProfileTheme; accent: string; hasMedia: boolean; isLight: boolean;
  surface: { textOnBg: string }; interactive: boolean; onLinkClick?: (link: Pick<LinkRow, "id" | "url">) => void;
}) {
  const Icon = detectPlatformIcon(block.url);
  const content = (<><Icon className="h-4 w-4 shrink-0" /><span className="truncate">{block.title}</span></>);
  const sharedClassName = cn(shape, anim, theme.buttonStyle === "outline" && "border-2 bg-transparent", theme.buttonStyle === "glass" && "border backdrop-blur-md bg-white/10", theme.buttonStyle === "fill" && "border-0", "flex w-full items-center gap-3 px-5 py-3.5 text-sm font-medium");
  const sharedStyle = theme.buttonStyle === "fill" ? { background: accent, color: isColorLight(accent) ? "#0A0A12" : "#fff" } : { borderColor: accent, color: hasMedia ? "#fff" : isLight ? surface.textOnBg : "#fff" };

  if (!interactive) return <div className={sharedClassName} style={sharedStyle}>{content}</div>;
  return <a href={block.url} target="_blank" rel="noreferrer" onClick={() => onLinkClick?.(block)} className={sharedClassName} style={sharedStyle}>{content}</a>;
}

function renderBlock(block: BioLink, ctx: {
  shape: string; anim: string; theme: ProfileTheme; accent: string; hasMedia: boolean; isLight: boolean; contentIsLight: boolean;
  surface: { textOnBg: string }; interactive: boolean; profileId?: string; onLinkClick?: (link: Pick<LinkRow, "id" | "url">) => void;
}) {
  if (block.block_type === "embed") return <EmbedBlock key={block.id} url={block.url} title={block.title} isLight={ctx.contentIsLight} />;
  if (block.block_type === "lead_capture") {
    return <LeadCaptureBlock key={block.id} linkId={block.id} profileId={ctx.profileId || ""} title={block.title} description={block.description} accent={ctx.accent} isLight={ctx.contentIsLight} buttonShapeClass={ctx.shape} interactive={ctx.interactive} />;
  }
  if (block.block_type === "product") {
    return <ProductBlock key={block.id} linkId={block.id} title={block.title} description={block.description} priceCents={block.price_cents} currency={block.currency} deliveryType={block.delivery_type} externalCheckoutUrl={block.external_checkout_url} accent={ctx.accent} isLight={ctx.contentIsLight} buttonShapeClass={ctx.shape} interactive={ctx.interactive} />;
  }
  if (block.block_type === "booking") {
    return <BookingBlock key={block.id} linkId={block.id} profileId={ctx.profileId || ""} title={block.title} description={block.description} accent={ctx.accent} isLight={ctx.contentIsLight} buttonShapeClass={ctx.shape} interactive={ctx.interactive} />;
  }
  return (
    <LinkButton key={block.id} block={block} shape={ctx.shape} anim={ctx.anim} theme={ctx.theme} accent={ctx.accent} hasMedia={ctx.hasMedia} isLight={ctx.isLight} surface={ctx.surface} interactive={ctx.interactive} onLinkClick={ctx.onLinkClick} />
  );
}

export function BioPageView({ profile, profileId, links, collections = [], onLinkClick, interactive = true, chatbot, languageSwitcher }: {
  profile: Pick<Profile, "username" | "display_name" | "bio" | "avatar_url" | "theme">;
  profileId?: string;
  links: BioLink[];
  collections?: LinkCollection[];
  onLinkClick?: (link: Pick<LinkRow, "id" | "url">) => void;
  interactive?: boolean;
  chatbot?: { enabled: boolean; name: string; welcomeMessage: string; fallbackMessage: string } | null;
  languageSwitcher?: { availableLangs: string[]; currentLang: string; onChange: (lang: string) => void } | null;
}) {
  const theme = resolveTheme(profile.theme);
  const surface = getSurface(theme);
  const fontPair = FONT_PAIRS[theme.fontPair] || FONT_PAIRS.signature;
  const isLight = surface.isLight;
  const accent = theme.accent || "#7C6CF6";
  const hasMedia = theme.backgroundType === "image" || theme.backgroundType === "video";
  const textColor = hasMedia ? "#F7F7FB" : surface.textOnBg;
  const contentIsLight = isLight && !hasMedia;

  const iconLinks = links.filter((l) => l.block_type === "link" && l.display_style === "icon");
  const uncollected = links.filter((l) => !(l.block_type === "link" && l.display_style === "icon") && !l.collection_id);
  const byCollection = new Map<string, BioLink[]>();
  links.forEach((l) => {
    if (l.collection_id && !(l.block_type === "link" && l.display_style === "icon")) {
      if (!byCollection.has(l.collection_id)) byCollection.set(l.collection_id, []);
      byCollection.get(l.collection_id)!.push(l);
    }
  });

  const shape = buttonShapeClass(theme);
  const anim = buttonAnimClass(theme);
  const blockCtx = { shape, anim, theme, accent, hasMedia, isLight, contentIsLight, surface, interactive, profileId, onLinkClick };

  return (
    <div className="relative flex min-h-full flex-col items-center overflow-hidden px-6 py-12">
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={fontPair.googleFontsUrl} />

      <div className="absolute inset-0 -z-10" style={{ background: surface.background }}>
        {theme.backgroundType === "image" && theme.backgroundImageUrl && (
          <Image src={theme.backgroundImageUrl} alt="" fill priority sizes="100vw" className="object-cover" />
        )}
        {theme.backgroundType === "video" && theme.backgroundVideoUrl && (
          <video src={theme.backgroundVideoUrl} autoPlay muted loop playsInline className="h-full w-full object-cover" />
        )}
      </div>
      {hasMedia && <div className="absolute inset-0 -z-10 bg-black" style={{ opacity: theme.overlayOpacity }} />}

      {/* Stickers — decorative, absolutely positioned, never intercept clicks */}
      {theme.stickers?.map((s, i) => (
        <span
          key={i}
          className="pointer-events-none absolute select-none text-3xl"
          style={{ left: `${s.x}%`, top: `${s.y}%`, transform: `translate(-50%, -50%) rotate(${s.rotation}deg) scale(${s.scale})` }}
        >
          {s.emoji}
        </span>
      ))}

      <div className="relative flex w-full flex-col items-center" style={{ color: textColor, fontFamily: fontPair.body }}>
        {languageSwitcher && <LanguageSwitcher availableLangs={languageSwitcher.availableLangs} currentLang={languageSwitcher.currentLang} onChange={languageSwitcher.onChange} isLight={contentIsLight} />}

        <HeaderBlock
          layout={theme.headerLayout}
          displayName={profile.display_name || ""}
          username={profile.username}
          bio={profile.bio}
          avatarUrl={profile.avatar_url}
          accent={accent}
          hasMedia={hasMedia}
          isLight={isLight}
          fontDisplay={fontPair.display}
          fontDisplayStyle={fontPair.displayStyle}
        />

        {iconLinks.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            {iconLinks.map((link) => {
              const Icon = detectPlatformIcon(link.url);
              const iconEl = (
                <div className={cn(anim, "flex h-11 w-11 items-center justify-center rounded-full border transition-colors")} style={{ borderColor: hasMedia ? "rgba(255,255,255,0.25)" : `${accent}55`, color: textColor }}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              );
              return interactive ? (
                <a key={link.id} href={link.url} target="_blank" rel="noreferrer" onClick={() => onLinkClick?.(link)} aria-label={link.title}>{iconEl}</a>
              ) : <div key={link.id}>{iconEl}</div>;
            })}
          </div>
        )}

        <div className="mt-8 w-full max-w-sm space-y-3">
          {uncollected.length === 0 && iconLinks.length === 0 && collections.length === 0 ? (
            <p className={cn("text-center text-sm", hasMedia ? "text-white/60" : isLight ? "text-ink/50" : "text-white/50")}>No links yet.</p>
          ) : (
            <>
              {uncollected.map((block) => renderBlock(block, blockCtx))}
              {collections.map((col) => {
                const items = byCollection.get(col.id) || [];
                if (items.length === 0) return null;
                return (
                  <CollectionBlock key={col.id} title={col.title} isLight={contentIsLight} accent={accent}>
                    {items.map((block) => renderBlock(block, blockCtx))}
                  </CollectionBlock>
                );
              })}
            </>
          )}
        </div>

        {theme.footerVisible && (
          <div className={cn("mt-10 flex items-center gap-1.5 text-[11px] font-medium", hasMedia ? "text-white/50" : isLight ? "text-ink/40" : "text-white/40")}>
            <span>Made with</span><span style={{ fontFamily: fontPair.display, fontStyle: fontPair.displayStyle }}>CRbio</span>
          </div>
        )}
      </div>

      {interactive && chatbot?.enabled && profileId && (
        <ChatbotWidget profileId={profileId} botName={chatbot.name} welcomeMessage={chatbot.welcomeMessage} fallbackMessage={chatbot.fallbackMessage} accent={accent} />
      )}
    </div>
  );
}
