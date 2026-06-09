---
name: Property Views Counter
description: Per-property unique-by-session view tracker with public badges and admin top list
type: feature
---
- Table `property_views (property_id text, session_id text, UNIQUE)` records 1 view per browser session per property.
- RPC `track_property_view(p_property_id, p_session_id)` upserts and returns total count. Public/anon callable.
- Views: `property_view_counts (property_id, views)` and `property_views_total (total)`.
- Frontend: `src/lib/propertyViews.ts` keeps session id + tracked set in localStorage (keys `ff_view_session_id`, `ff_view_tracked`) and dedupes client-side before calling RPC.
- Tracking is fired from `PropertyDetail` on mount.
- `<PropertyViewBadge />` overlay shown on listing cards (FeaturedProperties, Properties listing) and inline on detail page.
- `<TotalPropertyViewsBadge />` shown in Footer (public total).
- Admin Dashboard has `AdminPropertyViews` panel with grand total and top 10 viewed.
