/**
 * Shape returned by the Makeup API (https://makeup-api.herokuapp.com/).
 * Only the fields the UI actually uses are declared here.
 */
export interface Product {
  id: number;
  brand: string | null;
  name: string;
  price: string;
  price_sign: string | null;
  currency: string | null;
  image_link: string | null;
  product_link: string | null;
  website_link: string | null;
  description: string | null;
  rating: number | null;
  category: string | null;
  product_type: string | null;
  tag_list: string[];
  product_colors: { hex_value: string; colour_name: string }[];
}

/** Local, UI-friendly representation used across the app + cart. */
export interface CartItem {
  product: Product;
  quantity: number;
}
