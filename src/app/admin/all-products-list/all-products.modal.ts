export type TAdminProductList = {
  message: string;
  response:{
    products: TProduct[];
  }
};

export type TProduct = {
  id: number;
  product_name: string;
  price: number;
  stock_count: number;
  description: string;
  tax_percent: number;
  hsn_code: string;
  image: string;
  is_active: 0 | 1;
};
