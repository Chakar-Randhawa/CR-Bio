import type { ProfileTheme } from "@/lib/utils";

export interface Translation { display_name?: string; bio?: string; }
export interface LinkTranslation { title?: string; description?: string; }

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  theme: ProfileTheme;
  is_published: boolean;
  custom_domain: string | null;
  custom_domain_verified: boolean;
  chatbot_enabled: boolean;
  chatbot_name: string;
  chatbot_welcome_message: string;
  chatbot_fallback_message: string;
  booking_timezone: string;
  booking_duration_minutes: number;
  auto_order_links: boolean;
  translations: Record<string, Translation>;
  is_platform_admin: boolean;
  has_seen_tour: boolean;
  is_password_protected: boolean;
  created_at: string;
  updated_at: string;
}

export type BlockType = "link" | "lead_capture" | "embed" | "product" | "booking";
export type EmbedProvider = "youtube" | "spotify" | "tiktok";
export type DisplayStyle = "button" | "icon";
export type DeliveryType = "file" | "external";

export interface LinkCollection {
  id: string;
  profile_id: string;
  title: string;
  position: number;
  created_at: string;
}

export interface Link {
  id: string;
  profile_id: string;
  title: string;
  url: string;
  icon: string;
  description: string | null;
  block_type: BlockType;
  embed_provider: EmbedProvider | null;
  display_style: DisplayStyle;
  position: number;
  is_active: boolean;
  click_count: number;
  collection_id: string | null;
  starts_at: string | null;
  ends_at: string | null;
  price_cents: number | null;
  currency: string;
  delivery_type: DeliveryType | null;
  file_url: string | null;
  external_checkout_url: string | null;
  translations: Record<string, LinkTranslation>;
  created_at: string;
  updated_at: string;
}

export interface Lead { id: string; link_id: string; profile_id: string; email: string; name: string | null; captured_at: string; }
export interface ChatbotQA { id: string; profile_id: string; question: string; answer: string; position: number; created_at: string; }
export interface ProductOrder { id: string; link_id: string; profile_id: string; email: string; name: string | null; amount_cents: number; created_at: string; }
export interface BookingAvailability { id: string; profile_id: string; day_of_week: number; start_time: string; end_time: string; created_at: string; }
export interface Booking { id: string; link_id: string; profile_id: string; name: string; email: string; notes: string | null; starts_at: string; duration_minutes: number; status: "confirmed" | "cancelled"; created_at: string; }
export interface TeamMember { id: string; profile_id: string; user_id: string | null; invited_email: string | null; role: "editor"; status: "pending" | "accepted"; invite_token: string; created_at: string; }
