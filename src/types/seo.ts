export interface SeoConfig {
  domain: string;
  global_title: string;
  global_description: string;
  canonical_url: string;
  robots: string;
  og_image_url?: string;
  twitter_card: string;
  favicon_url?: string;
  google_search_console_id?: string;
  google_analytics_id?: string;
  google_tag_manager_id?: string;
  robots_txt?: string;
  sitemap_url?: string;
}

export interface PageSeo {
  path: string;
  title: string;
  description: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  keywords?: string;
}
