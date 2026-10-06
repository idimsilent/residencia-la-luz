
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "audit_log": {
                  Row: {
                    "action": string,"actor_id": string | null,"created_at": string,"entity_id": string | null,"entity_type": string,"id": number,"summary": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "action": string,"actor_id"?: string | null,"created_at"?: string,"entity_id"?: string | null,"entity_type": string,"id"?: never,"summary"?: string | null
                  }
                  Update: {
                    "action"?: string,"actor_id"?: string | null,"created_at"?: string,"entity_id"?: string | null,"entity_type"?: string,"id"?: never,"summary"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "audit_log_actor_id_fkey"
      columns: ["actor_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"contact_messages": {
                  Row: {
                    "created_at": string,"email": string,"id": string,"message": string,"name": string,"phone": string | null,"privacy_accepted": boolean,"privacy_version": string,"status": Database["public"]['Enums']["message_status"],"subject": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"email": string,"id"?: string,"message": string,"name": string,"phone"?: string | null,"privacy_accepted": boolean,"privacy_version": string,"status"?: Database["public"]['Enums']["message_status"],"subject"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"email"?: string,"id"?: string,"message"?: string,"name"?: string,"phone"?: string | null,"privacy_accepted"?: boolean,"privacy_version"?: string,"status"?: Database["public"]['Enums']["message_status"],"subject"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"event_categories": {
                  Row: {
                    "color": string,"created_at": string,"id": string,"name": string,"slug": string,"sort_order": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "color"?: string,"created_at"?: string,"id"?: string,"name": string,"slug": string,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "color"?: string,"created_at"?: string,"id"?: string,"name"?: string,"slug"?: string,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"events": {
                  Row: {
                    "all_day": boolean,"category_id": string | null,"created_at": string,"created_by": string | null,"description_html": string,"ends_at": string,"external_url": string | null,"has_detail_page": boolean,"id": string,"is_demo": boolean,"is_featured": boolean,"location": string | null,"media_id": string | null,"slug": string,"starts_at": string,"status": Database["public"]['Enums']["publish_status"],"summary": string,"title": string,"updated_at": string,"updated_by": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "all_day"?: boolean,"category_id"?: string | null,"created_at"?: string,"created_by"?: string | null,"description_html"?: string,"ends_at": string,"external_url"?: string | null,"has_detail_page"?: boolean,"id"?: string,"is_demo"?: boolean,"is_featured"?: boolean,"location"?: string | null,"media_id"?: string | null,"slug": string,"starts_at": string,"status"?: Database["public"]['Enums']["publish_status"],"summary"?: string,"title": string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Update: {
                    "all_day"?: boolean,"category_id"?: string | null,"created_at"?: string,"created_by"?: string | null,"description_html"?: string,"ends_at"?: string,"external_url"?: string | null,"has_detail_page"?: boolean,"id"?: string,"is_demo"?: boolean,"is_featured"?: boolean,"location"?: string | null,"media_id"?: string | null,"slug"?: string,"starts_at"?: string,"status"?: Database["public"]['Enums']["publish_status"],"summary"?: string,"title"?: string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "events_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "event_categories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "events_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "events_media_id_fkey"
      columns: ["media_id"]
isOneToOne: false
      referencedRelation: "media"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "events_updated_by_fkey"
      columns: ["updated_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"gallery_categories": {
                  Row: {
                    "created_at": string,"id": string,"name": string,"slug": string,"sort_order": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"name": string,"slug": string,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"name"?: string,"slug"?: string,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"gallery_items": {
                  Row: {
                    "caption": string,"category_id": string | null,"created_at": string,"id": string,"is_visible": boolean,"media_id": string,"sort_order": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "caption"?: string,"category_id"?: string | null,"created_at"?: string,"id"?: string,"is_visible"?: boolean,"media_id": string,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "caption"?: string,"category_id"?: string | null,"created_at"?: string,"id"?: string,"is_visible"?: boolean,"media_id"?: string,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "gallery_items_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "gallery_categories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "gallery_items_media_id_fkey"
      columns: ["media_id"]
isOneToOne: false
      referencedRelation: "media"
      referencedColumns: ["id"]
    }
                  ]
                },"media": {
                  Row: {
                    "alt_text": string,"created_at": string,"created_by": string | null,"description": string,"file_name": string,"height": number | null,"id": string,"is_demo": boolean,"mime_type": string,"size_bytes": number,"storage_path": string,"tags": (string)[],"title": string,"updated_at": string,"width": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "alt_text"?: string,"created_at"?: string,"created_by"?: string | null,"description"?: string,"file_name": string,"height"?: number | null,"id"?: string,"is_demo"?: boolean,"mime_type": string,"size_bytes": number,"storage_path": string,"tags"?: (string)[],"title"?: string,"updated_at"?: string,"width"?: number | null
                  }
                  Update: {
                    "alt_text"?: string,"created_at"?: string,"created_by"?: string | null,"description"?: string,"file_name"?: string,"height"?: number | null,"id"?: string,"is_demo"?: boolean,"mime_type"?: string,"size_bytes"?: number,"storage_path"?: string,"tags"?: (string)[],"title"?: string,"updated_at"?: string,"width"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "media_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"menu_items": {
                  Row: {
                    "created_at": string,"href": string,"id": string,"is_system": boolean,"is_visible": boolean,"label": string,"location": Database["public"]['Enums']["menu_location"],"open_in_new_tab": boolean,"page_id": string | null,"sort_order": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"href": string,"id"?: string,"is_system"?: boolean,"is_visible"?: boolean,"label": string,"location": Database["public"]['Enums']["menu_location"],"open_in_new_tab"?: boolean,"page_id"?: string | null,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"href"?: string,"id"?: string,"is_system"?: boolean,"is_visible"?: boolean,"label"?: string,"location"?: Database["public"]['Enums']["menu_location"],"open_in_new_tab"?: boolean,"page_id"?: string | null,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "menu_items_page_id_fkey"
      columns: ["page_id"]
isOneToOne: false
      referencedRelation: "pages"
      referencedColumns: ["id"]
    }
                  ]
                },"news_categories": {
                  Row: {
                    "created_at": string,"id": string,"name": string,"slug": string,"sort_order": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"name": string,"slug": string,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"name"?: string,"slug"?: string,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"news_post_media": {
                  Row: {
                    "media_id": string,"post_id": string,"sort_order": number
                  }
                  ComputedFields: never
                  Insert: {
                    "media_id": string,"post_id": string,"sort_order"?: number
                  }
                  Update: {
                    "media_id"?: string,"post_id"?: string,"sort_order"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "news_post_media_media_id_fkey"
      columns: ["media_id"]
isOneToOne: false
      referencedRelation: "media"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "news_post_media_post_id_fkey"
      columns: ["post_id"]
isOneToOne: false
      referencedRelation: "news_posts"
      referencedColumns: ["id"]
    }
                  ]
                },"news_posts": {
                  Row: {
                    "author_name": string | null,"category_id": string | null,"content_html": string,"created_at": string,"created_by": string | null,"excerpt": string,"featured_media_id": string | null,"id": string,"is_demo": boolean,"is_featured": boolean,"published_at": string | null,"search": unknown,"seo_description": string | null,"seo_title": string | null,"slug": string,"status": Database["public"]['Enums']["news_status"],"title": string,"updated_at": string,"updated_by": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "author_name"?: string | null,"category_id"?: string | null,"content_html"?: string,"created_at"?: string,"created_by"?: string | null,"excerpt"?: string,"featured_media_id"?: string | null,"id"?: string,"is_demo"?: boolean,"is_featured"?: boolean,"published_at"?: string | null,"search"?: never,"seo_description"?: string | null,"seo_title"?: string | null,"slug": string,"status"?: Database["public"]['Enums']["news_status"],"title": string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Update: {
                    "author_name"?: string | null,"category_id"?: string | null,"content_html"?: string,"created_at"?: string,"created_by"?: string | null,"excerpt"?: string,"featured_media_id"?: string | null,"id"?: string,"is_demo"?: boolean,"is_featured"?: boolean,"published_at"?: string | null,"search"?: never,"seo_description"?: string | null,"seo_title"?: string | null,"slug"?: string,"status"?: Database["public"]['Enums']["news_status"],"title"?: string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "news_posts_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "news_categories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "news_posts_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "news_posts_featured_media_id_fkey"
      columns: ["featured_media_id"]
isOneToOne: false
      referencedRelation: "media"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "news_posts_updated_by_fkey"
      columns: ["updated_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"page_blocks": {
                  Row: {
                    "created_at": string,"id": string,"is_hidden": boolean,"page_id": string,"position": number,"props": NonNullable<Json>,"revision_id": string | null,"schema_version": number,"type": string,"visibility": NonNullable<Json>
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"is_hidden"?: boolean,"page_id": string,"position": number,"props"?: NonNullable<Json>,"revision_id"?: string | null,"schema_version"?: number,"type": string,"visibility"?: NonNullable<Json>
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"is_hidden"?: boolean,"page_id"?: string,"position"?: number,"props"?: NonNullable<Json>,"revision_id"?: string | null,"schema_version"?: number,"type"?: string,"visibility"?: NonNullable<Json>
                  }
                  Relationships: [
                    {
      foreignKeyName: "page_blocks_page_id_fkey"
      columns: ["page_id"]
isOneToOne: false
      referencedRelation: "pages"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "page_blocks_revision_id_fkey"
      columns: ["revision_id"]
isOneToOne: false
      referencedRelation: "page_revisions"
      referencedColumns: ["id"]
    }
                  ]
                },"page_revisions": {
                  Row: {
                    "created_at": string,"created_by": string | null,"id": string,"note": string | null,"page_id": string,"schema_version": number,"version": number
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"id"?: string,"note"?: string | null,"page_id": string,"schema_version"?: number,"version": number
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"id"?: string,"note"?: string | null,"page_id"?: string,"schema_version"?: number,"version"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "page_revisions_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "page_revisions_page_id_fkey"
      columns: ["page_id"]
isOneToOne: false
      referencedRelation: "pages"
      referencedColumns: ["id"]
    }
                  ]
                },"pages": {
                  Row: {
                    "created_at": string,"draft_updated_at": string | null,"has_unpublished_changes": boolean,"id": string,"is_system": boolean,"kind": string,"og_media_id": string | null,"published_revision_id": string | null,"seo_description": string | null,"seo_title": string | null,"slug": string,"status": Database["public"]['Enums']["publish_status"],"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"draft_updated_at"?: string | null,"has_unpublished_changes"?: boolean,"id"?: string,"is_system"?: boolean,"kind"?: string,"og_media_id"?: string | null,"published_revision_id"?: string | null,"seo_description"?: string | null,"seo_title"?: string | null,"slug": string,"status"?: Database["public"]['Enums']["publish_status"],"title": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"draft_updated_at"?: string | null,"has_unpublished_changes"?: boolean,"id"?: string,"is_system"?: boolean,"kind"?: string,"og_media_id"?: string | null,"published_revision_id"?: string | null,"seo_description"?: string | null,"seo_title"?: string | null,"slug"?: string,"status"?: Database["public"]['Enums']["publish_status"],"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "pages_og_media_id_fkey"
      columns: ["og_media_id"]
isOneToOne: false
      referencedRelation: "media"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "pages_published_revision_fk"
      columns: ["published_revision_id"]
isOneToOne: false
      referencedRelation: "page_revisions"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "created_at": string,"email": string,"full_name": string | null,"id": string,"role": Database["public"]['Enums']["app_role"] | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"email": string,"full_name"?: string | null,"id": string,"role"?: Database["public"]['Enums']["app_role"] | null,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"email"?: string,"full_name"?: string | null,"id"?: string,"role"?: Database["public"]['Enums']["app_role"] | null,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"rate_limit_hits": {
                  Row: {
                    "bucket": string,"created_at": string,"id": number,"key_hash": string
                  }
                  ComputedFields: never
                  Insert: {
                    "bucket": string,"created_at"?: string,"id"?: never,"key_hash": string
                  }
                  Update: {
                    "bucket"?: string,"created_at"?: string,"id"?: never,"key_hash"?: string
                  }
                  Relationships: [
                    
                  ]
                },"services": {
                  Row: {
                    "content_html": string,"created_at": string,"icon": string,"id": string,"is_demo": boolean,"media_id": string | null,"slug": string,"sort_order": number,"status": Database["public"]['Enums']["publish_status"],"summary": string,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "content_html"?: string,"created_at"?: string,"icon"?: string,"id"?: string,"is_demo"?: boolean,"media_id"?: string | null,"slug": string,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"summary"?: string,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "content_html"?: string,"created_at"?: string,"icon"?: string,"id"?: string,"is_demo"?: boolean,"media_id"?: string | null,"slug"?: string,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"summary"?: string,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "services_media_id_fkey"
      columns: ["media_id"]
isOneToOne: false
      referencedRelation: "media"
      referencedColumns: ["id"]
    }
                  ]
                },"site_settings": {
                  Row: {
                    "address_line": string,"city": string,"contact_form_enabled": boolean,"contact_privacy_note": string,"email": string,"favicon_media_id": string | null,"id": number,"legal_owner_name": string,"legal_owner_tax_id": string,"logo_media_id": string | null,"map_url": string | null,"og_media_id": string | null,"opening_hours": NonNullable<Json>,"phone": string,"phone_secondary": string,"postal_code": string,"province": string,"seo_description": string,"seo_title": string,"show_demo_notice": boolean,"site_name": string,"social_links": NonNullable<Json>,"tagline": string,"testimonials_enabled": boolean,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "address_line"?: string,"city"?: string,"contact_form_enabled"?: boolean,"contact_privacy_note"?: string,"email"?: string,"favicon_media_id"?: string | null,"id"?: number,"legal_owner_name"?: string,"legal_owner_tax_id"?: string,"logo_media_id"?: string | null,"map_url"?: string | null,"og_media_id"?: string | null,"opening_hours"?: NonNullable<Json>,"phone"?: string,"phone_secondary"?: string,"postal_code"?: string,"province"?: string,"seo_description"?: string,"seo_title"?: string,"show_demo_notice"?: boolean,"site_name"?: string,"social_links"?: NonNullable<Json>,"tagline"?: string,"testimonials_enabled"?: boolean,"updated_at"?: string
                  }
                  Update: {
                    "address_line"?: string,"city"?: string,"contact_form_enabled"?: boolean,"contact_privacy_note"?: string,"email"?: string,"favicon_media_id"?: string | null,"id"?: number,"legal_owner_name"?: string,"legal_owner_tax_id"?: string,"logo_media_id"?: string | null,"map_url"?: string | null,"og_media_id"?: string | null,"opening_hours"?: NonNullable<Json>,"phone"?: string,"phone_secondary"?: string,"postal_code"?: string,"province"?: string,"seo_description"?: string,"seo_title"?: string,"show_demo_notice"?: boolean,"site_name"?: string,"social_links"?: NonNullable<Json>,"tagline"?: string,"testimonials_enabled"?: boolean,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "site_settings_favicon_media_id_fkey"
      columns: ["favicon_media_id"]
isOneToOne: false
      referencedRelation: "media"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "site_settings_logo_media_id_fkey"
      columns: ["logo_media_id"]
isOneToOne: false
      referencedRelation: "media"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "site_settings_og_media_id_fkey"
      columns: ["og_media_id"]
isOneToOne: false
      referencedRelation: "media"
      referencedColumns: ["id"]
    }
                  ]
                },"testimonials": {
                  Row: {
                    "author_label": string,"consent_confirmed": boolean,"consent_reference": string | null,"created_at": string,"id": string,"quote": string,"sort_order": number,"status": Database["public"]['Enums']["publish_status"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "author_label": string,"consent_confirmed"?: boolean,"consent_reference"?: string | null,"created_at"?: string,"id"?: string,"quote": string,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"updated_at"?: string
                  }
                  Update: {
                    "author_label"?: string,"consent_confirmed"?: boolean,"consent_reference"?: string | null,"created_at"?: string,"id"?: string,"quote"?: string,"sort_order"?: number,"status"?: Database["public"]['Enums']["publish_status"],"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"themes": {
                  Row: {
                    "created_at": string,"draft_tokens": Json | null,"id": string,"is_active": boolean,"is_preset": boolean,"name": string,"original_tokens": NonNullable<Json>,"tokens": NonNullable<Json>,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"draft_tokens"?: Json | null,"id"?: string,"is_active"?: boolean,"is_preset"?: boolean,"name": string,"original_tokens": NonNullable<Json>,"tokens": NonNullable<Json>,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"draft_tokens"?: Json | null,"id"?: string,"is_active"?: boolean,"is_preset"?: boolean,"name"?: string,"original_tokens"?: NonNullable<Json>,"tokens"?: NonNullable<Json>,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            "media_usage": {
                  Row: {
                    "kind": string | null,"media_id": string | null,"ref_id": string | null,"ref_title": string | null
                  }
                  ComputedFields: never
                  Relationships: [
                    
                  ]
                }
          }
          Functions: {
            "activate_theme":
{ Args: { "p_theme_id": string }; Returns: undefined
                           },
"check_rate_limit":
{ Args: { "p_bucket": string,"p_key_hash": string,"p_max": number,"p_window_seconds": number }; Returns: boolean
                           },
"clear_rate_limit":
{ Args: { "p_bucket": string,"p_key_hash": string }; Returns: undefined
                           },
"current_role_name":
{ Args: Record<PropertyKey, never>; Returns: Database["public"]['Enums']["app_role"]
                           },
"discard_page_draft":
{ Args: { "p_page_id": string }; Returns: undefined
                           },
"is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"is_staff":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"publish_page":
{ Args: { "p_note"?: string,"p_page_id": string }; Returns: string
                           },
"replace_media":
{ Args: { "p_from": string,"p_to": string }; Returns: undefined
                           },
"restore_page_revision":
{ Args: { "p_revision_id": string }; Returns: undefined
                           },
"save_page_draft":
{ Args: { "p_blocks": Json,"p_page_id": string }; Returns: undefined
                           },
"set_user_role":
{ Args: { "p_role": Database["public"]['Enums']["app_role"],"p_user_id": string }; Returns: undefined
                           },
"update_own_profile":
{ Args: { "p_full_name": string }; Returns: undefined
                           }
          }
          Enums: {
            "app_role": "admin"|"editor","menu_location": "header"|"footer"|"legal","message_status": "new"|"read"|"archived","news_status": "draft"|"published"|"archived","publish_status": "draft"|"published"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "app_role": ["admin", "editor"],"menu_location": ["header", "footer", "legal"],"message_status": ["new", "read", "archived"],"news_status": ["draft", "published", "archived"],"publish_status": ["draft", "published"]
          }
        }
} as const
