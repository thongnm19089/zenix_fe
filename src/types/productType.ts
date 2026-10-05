interface IProduct {
  key: React.Key;
  id: number;
  product_name: string;
  product_code: string | null;
  base_price: number;
  specifications: string;
  unit_of_measure: string;
  category_str: string;
  total_quantity: number;
  classify_list_list: { id: number }[];
  sku_list: {
    id: number;
    product_name: string;
    base_price: number;
    specifications: string;
    unit_of_measure: string;
    category_str: string;
    total_quantity: number;
  }[];
  image_list: { id: number; image: string; atl_text: string }[];
  supplier_info: {id: number, name: string}[];
  sku: {
    id: number;
    name: string;
    sku_code: string;
    product_name: string;
    base_price: number;
    specifications: string;
    unit_of_measure: string;
    category_str: string;
    total_quantity: number;
    classify1_str: string;
    classify2_str: string;
    price: number;
  };
}

export type { IProduct };
