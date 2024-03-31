import { get } from "svelte/store"
import { json } from "@sveltejs/kit/http"
import { LocationInfo, sun } from "astral"

export async function get({ query }) {
  const { latitude, longitude } = query

  const location = new LocationInfo(
    "",
    "",
    "",
    Number(latitude),
    Number(longitude)
  )
  const now = new Date()
  const s = sun(location.observer, { date: now, tzinfo: location.timezone })
  const sunrise = s.sunrise.getTime()
  const sunset = s.sunset.getTime()

  let elapsedDaylight
  if (now < sunrise) {
    elapsedDaylight = 0
  } else if (now > sunset) {
    elapsedDaylight = sunset - sunrise
  } else {
    elapsedDaylight = now.getTime() - sunrise
  }

  const daylightDuration = sunset - sunrise
  const daylightPercentage = (elapsedDaylight / daylightDuration) * 100

  return json({ percentage: daylightPercentage })
}
