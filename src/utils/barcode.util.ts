export const generateBarcode = (prefix: string = "PRD"): string => {
  const timestamp = Date.now(); // milliseconds
  const random = Math.floor(1000 + Math.random() * 9000);

  return `${prefix}-${timestamp}-${random}`;
};