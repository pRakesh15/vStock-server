
export const ERP_ITEM_FIELDS = [
  "item_code",
  "item_name",
  "description",
  "item_group",
  "image",
  "size",
  "colour",
  "quantity",
  "UOM",
  "warehouse",
  "floor",
  "rack_no",
  "MRP",
  "barcode",
  "comment",
];

export const getERPItemFieldNames = (): string[] => {
  return ERP_ITEM_FIELDS.map((field) => {
    const customFields = [
      "size",
      "colour",
      "quantity",
      "warehouse",
      "floor",
      "rack_no",
      "MRP",
      "barcode",
      "comment",
    ];

    if (customFields.includes(field)) {
      return `custom_${field.toLowerCase()}`;
    }

    if (field === "UOM") {
      return "stock_uom";
    }

    return field;
  });
};

export const mapERPItemToProduct = (item: Record<string, any>) => ({
  item_code: item.item_code,
  name: item.item_name,
  description: item.description === item.item_name ? '' : item.description, // TODO: Quick fix - change this later
  item_group: item.item_group,
  image: item.image,
  size: item.custom_size,
  colour: item.custom_colour,
  quantity: item.custom_quantity,
  UOM: item.stock_uom,
  warehouse: item.custom_warehouse,
  floor: item.custom_floor,
  rack_no: item.custom_rack_no,
  MRP: item.custom_mrp,
  barcode: item.custom_barcode,
  comment: item.custom_comment,
});

