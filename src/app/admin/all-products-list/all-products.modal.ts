export type TAdminProductList = {
  message: string;
  response: {
    products: TProduct[];
  };
};

export type TProduct = {
  "product": string,
  "price": string,
  "taxpercent": string,
  "hsn_code": string,
  "sku": string,
  "is_active": boolean,
  "overall_count": string,
  "total_count": string,
  'id': string,
  uom: string,
  description: string,
  central_inventory_count: string
};


export type TOldTProduct = {
  "id": string,
  "product_name": string,
  "description": string,
  "price": string,
  "stock_count": number,
  "sku": string,
  "tax_percent": string,
  "is_active": boolean,
  "tenant_id": string,
  "updated_by": string,
  "created_at": string,
  "updated_at": string,
  "hsn_code": string,
  "uom": string,
  "product_variant_id": null
}
