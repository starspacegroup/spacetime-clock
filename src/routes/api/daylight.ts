import { json } from "@sveltejs/kit/http"
import SunCalc from "suncalc"

export async function get({ query }) {
  const { latitude, longitude } = query

  const { sunrise, sunset } = SunCalc.getTimes(new Date(), latitude, longitude)

  const now = new Date()
  const sunriseTime = sunrise.getTime()
  const sunsetTime = sunset.getTime()

  let elapsedDaylight
  if (now < sunriseTime) {
    elapsedDaylight = 0
  } else if (now > sunsetTime) {
    elapsedDaylight = sunsetTime - sunriseTime
  } else {
    elapsedDaylight = now.getTime() - sunriseTime
  }

  const daylightDuration = sunsetTime - sunriseTime
  const daylightPercentage = (elapsedDaylight / daylightDuration) * 100

  return json({ percentage: daylightPercentage })
}
