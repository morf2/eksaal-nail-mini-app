export function formatPrice(price: number, isPriceFrom: boolean): string {
  return isPriceFrom ? `от ${price} ₽` : `${price} ₽`
}
