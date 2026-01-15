-- Create RPC function for efficient homepage data fetching
CREATE OR REPLACE FUNCTION get_homepage_data()
RETURNS TABLE (
  new_arrivals JSONB,
  best_sellers JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- New Arrivals (last 7 days)
    (
      SELECT COALESCE(json_agg(
        json_build_object(
          'id', p.id,
          'name', p.name,
          'price', p.price,
          'rating', p.rating,
          'reviews_count', p.reviews_count,
          'is_new', TRUE
        ) ORDER BY p.created_at DESC
      ), '[]'::json)
      FROM products p
      WHERE p.created_at >= NOW() - INTERVAL '7 days'
      LIMIT 8
    )::JSONB AS new_arrivals,
    
    -- Best Sellers (highest order count)
    (
      SELECT COALESCE(json_agg(
        json_build_object(
          'id', p.id,
          'name', p.name,
          'price', p.price,
          'rating', p.rating,
          'reviews_count', p.reviews_count,
          'sales_count', COALESCE(oi.total_sales, 0),
          'rank', ROW_NUMBER() OVER (ORDER BY COALESCE(oi.total_sales, 0) DESC)
        ) ORDER BY COALESCE(oi.total_sales, 0) DESC
      ), '[]'::json)
      FROM products p
      LEFT JOIN (
        SELECT product_id, COUNT(*) as total_sales
        FROM order_items
        GROUP BY product_id
      ) oi ON p.id = oi.product_id
      LIMIT 8
    )::JSONB AS best_sellers;
END;
$$ LANGUAGE plpgsql;
