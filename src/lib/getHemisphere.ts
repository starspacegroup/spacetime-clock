export default function getHemisphere(lat: number) {
  if (lat >= 0) {
    return "North"
  } else {
    return "South"
  }
}
