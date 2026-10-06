import type { MediaLite } from "@/features/media/url";

/** Datos que necesitan los bloques dinámicos. Serializable (se envía al editor). */
export type BlockData = {
  media: Record<string, MediaLite>;
  news: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    published_at: string | null;
    is_featured: boolean;
    categoryName: string | null;
    mediaId: string | null;
  }[];
  events: {
    id: string;
    title: string;
    slug: string;
    summary: string;
    starts_at: string;
    ends_at: string;
    all_day: boolean;
    location: string | null;
    categoryName: string | null;
    categoryColor: string | null;
    has_detail_page: boolean;
    external_url: string | null;
  }[];
  services: { id: string; title: string; slug: string; summary: string; icon: string; mediaId: string | null }[];
  gallery: { id: string; caption: string; mediaId: string }[];
  testimonials: { id: string; quote: string; author_label: string }[];
  contact: {
    phone: string;
    email: string;
    address: string[];
    hours: { label: string; hours: string }[];
    mapUrl: string | null;
    formEnabled: boolean;
    privacyNote: string;
  };
  testimonialsEnabled: boolean;
};

export const EMPTY_BLOCK_DATA: BlockData = {
  media: {},
  news: [],
  events: [],
  services: [],
  gallery: [],
  testimonials: [],
  contact: { phone: "", email: "", address: [], hours: [], mapUrl: null, formEnabled: false, privacyNote: "" },
  testimonialsEnabled: false,
};
