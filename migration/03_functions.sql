-- Manaf Mart Business Logic Functions

-- Function to update behavior logs
CREATE OR REPLACE FUNCTION log_product_view(p_user_id UUID, p_product_id UUID, p_scroll_depth DECIMAL)
RETURNS void AS $$
BEGIN
  INSERT INTO behavior_logs (user_id, product_id, view_count, scroll_depth, action_type)
  VALUES (p_user_id, p_product_id, 1, p_scroll_depth, 'view')
  ON CONFLICT (user_id, product_id) DO UPDATE
  SET view_count = behavior_logs.view_count + 1,
      scroll_depth = GREATEST(behavior_logs.scroll_depth, p_scroll_depth);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate order risk score
CREATE OR REPLACE FUNCTION calculate_risk_score(p_order_id UUID)
RETURNS INTEGER AS $$
DECLARE
  risk_score INTEGER := 0;
  order_total DECIMAL;
  user_trust_score INTEGER;
  order_items_count INTEGER;
BEGIN
  SELECT o.total, p.trust_score, COUNT(oi.id)
  INTO order_total, user_trust_score, order_items_count
  FROM orders o
  JOIN profiles p ON o.user_id = p.id
  LEFT JOIN order_items oi ON o.id = oi.order_id
  WHERE o.id = p_order_id
  GROUP BY o.id, p.id;

  -- Risk assessment logic
  IF order_total > 5000 THEN risk_score := risk_score + 20; END IF;
  IF user_trust_score < 40 THEN risk_score := risk_score + 30; END IF;
  IF order_items_count > 5 THEN risk_score := risk_score + 15; END IF;

  UPDATE orders SET risk_score = risk_score WHERE id = p_order_id;
  RETURN risk_score;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-expire squad buys
CREATE OR REPLACE FUNCTION expire_squad_buys()
RETURNS void AS $$
BEGIN
  UPDATE squad_buys
  SET status = 'expired'
  WHERE status = 'active' AND expiry_time < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update product timestamps
CREATE OR REPLACE FUNCTION update_product_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS update_products_timestamp ON public.products;

CREATE TRIGGER update_products_timestamp
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_product_timestamp();

-- Trigger to calculate order due amount
CREATE OR REPLACE FUNCTION calculate_order_due_amount()
RETURNS TRIGGER AS $$
BEGIN
  NEW.due_amount = NEW.total - NEW.paid_amount;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS calculate_order_due ON public.orders;

CREATE TRIGGER calculate_order_due
BEFORE INSERT OR UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION calculate_order_due_amount();
