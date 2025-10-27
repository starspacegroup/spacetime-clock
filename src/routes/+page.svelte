<script lang="ts">
  import { onMount } from "svelte"
  import Geolocation from "svelte-geolocation"
  import stardate from "stardate-converter"
  import suncalc from "suncalc"
  import getHemisphere from "$lib/getHemisphere"
  import gsap from "gsap"
  
  let datetime: Date = new Date()
  
  // SVG circle references for GSAP animations
  let dateProgressCircle: SVGCircleElement
  let sunMarker: SVGCircleElement

  let juneSolstice = new Date(datetime.getFullYear(), 5, 21)
  let decemberSolstice = new Date(datetime.getFullYear(), 11, 21)
  if (datetime < juneSolstice) {
    juneSolstice = new Date(datetime.getFullYear() - 1, 5, 21)
  }
  if (datetime < decemberSolstice) {
    decemberSolstice = new Date(datetime.getFullYear() - 1, 11, 21)
  }
  let hemisphere = "North"
  let summerSolstice = juneSolstice
  // let decemberSolstice = seasons.dec_solstice

  let geoEvents: any = []
  let coords = { lat: 0, long: 0 }
  let lastNoon: Date = new Date(
    datetime.getFullYear(),
    datetime.getMonth(),
    datetime.getDate(),
    12,
    0,
    0
  )
  let sunrise: Date = new Date(
    datetime.getFullYear(),
    datetime.getMonth(),
    datetime.getDate(),
    6,
    0,
    0
  )
  let sunset: Date = new Date(
    datetime.getFullYear(),
    datetime.getMonth(),
    datetime.getDate(),
    18,
    0,
    0
  )

  let secondsSinceLastNoon: number =
    datetime.getTime() - lastNoon.getTime() / 1000
  let solarData: suncalc.GetTimesResult
  let currentStardate = stardate(datetime)

  var dayOfYear =
    (Date.UTC(datetime.getFullYear(), datetime.getMonth(), datetime.getDate()) -
      Date.UTC(datetime.getFullYear(), 0, 0)) /
    86400000
  dayOfYear = Math.floor(
    (datetime.getTime() - summerSolstice.getTime()) / (1000 * 60 * 60 * 24)
  )

  let date360 = (dayOfYear / 365.25) * 359
  let date360deg = date360 + "deg"
  let date100prog = (dayOfYear / 365.25) * 100
  let time360 = (datetime.getMinutes() / 24 / 60) * 359
  let time360deg = time360 + "deg"
  let sunrise360 = 250
  let sunrise360deg = sunrise360 + "deg"
  let sunset360 = 120
  let sunset360deg = sunset360 + "deg"

  onMount(() => {
    // Calculate SVG circle properties for GSAP animations
    const updateCircleProgress = () => {
      if (!dateProgressCircle || !sunMarker) return
      
      // Get the SVG parent elements to calculate actual sizes
      const dateSvg = dateProgressCircle.closest('svg')
      const timeSvg = sunMarker.closest('svg')
      
      if (!dateSvg || !timeSvg) return
      
      // Calculate circle properties based on SVG viewBox or clientWidth
      const dateSize = dateSvg.clientWidth || 384 // fallback to md size
      const timeSize = timeSvg.clientWidth || 384
      
      const dateRadius = (dateSize - 20) / 2 // stroke-width is 20px
      const timeRadius = (timeSize - 33) / 2 // stroke-width is 33px
      
      const dateCircumference = dateRadius * 2 * Math.PI
      
      // Animate date progress circle
      const dateProgress = (dayOfYear / 365.25) * 100
      const dateDash = (dateProgress * dateCircumference) / 100
      gsap.to(dateProgressCircle, {
        attr: {
          "stroke-dasharray": `${dateDash} ${dateCircumference - dateDash}`
        },
        duration: 0.3,
        ease: "linear"
      })
      
      // Animate sun marker position
      const angle = (time360 - 90) * (Math.PI / 180) // Convert to radians, offset by -90 for top
      const markerRadius = timeRadius + (33 / 2) // Position on the middle of the stroke width
      const centerX = timeSize / 2
      const centerY = timeSize / 2
      const markerX = centerX + markerRadius * Math.cos(angle)
      const markerY = centerY + markerRadius * Math.sin(angle)
      
      gsap.to(sunMarker, {
        attr: {
          "cx": markerX,
          "cy": markerY
        },
        duration: 0.3,
        ease: "linear"
      })
    }
    
    // Wait for elements to be mounted and sized
    setTimeout(() => {
      updateCircleProgress()
    }, 100)
    
    let refresher = setInterval(function () {
      datetime = new Date()
      date360 = (dayOfYear / 365.25) * 359
      if (geoEvents.length > 0) {
        solarData = suncalc.getTimes(new Date(), coords.lat, coords.long)
        if (new Date() < solarData.solarNoon) {
          solarData = suncalc.getTimes(
            new Date(Date.now() - 24 * 60 * 60 * 1000),
            coords.lat,
            coords.long
          )
        }
      }
      lastNoon = solarData.solarNoon
        ? solarData.solarNoon
        : new Date(
            datetime.getFullYear(),
            datetime.getMonth(),
            datetime.getDate(),
            12,
            0,
            0
          )
      if (new Date() < solarData.solarNoon) {
        solarData = suncalc.getTimes(
          new Date(Date.now() - 24 * 60 * 60 * 1000),
          coords.lat,
          coords.long
        )
      }
      sunrise = solarData.sunrise
        ? solarData.sunrise
        : new Date(
            datetime.getFullYear(),
            datetime.getMonth(),
            datetime.getDate(),
            6,
            0,
            0
          )
      sunset = solarData.sunset
        ? solarData.sunset
        : new Date(
            datetime.getFullYear(),
            datetime.getMonth(),
            datetime.getDate(),
            18,
            0,
            0
          )
      secondsSinceLastNoon = Math.abs(
        (datetime.getTime() - lastNoon.getTime()) / 1000
      )
      time360 = (secondsSinceLastNoon / 86400) * 359

      time360deg = time360 - 90 + "deg"
      sunrise360 =
        ((((sunrise.getTime() / 1000) % 86400) / 86400) * 359 + 45) % 360
      sunrise360deg = sunrise360.toFixed(0) + "deg"
      sunset360 =
        ((((sunset.getTime() / 1000) % 86400) / 86400) * 359 + 90) % 360
      sunset360deg = sunset360.toFixed(0) + "deg"
      
      // Update GSAP animations
      updateCircleProgress()
    }, 9)
  })

  function toggleHelp() {
    // toggle visibility of .help-overlay:
    let overlay = document.getElementsByClassName(
      "help-overlay"
    ) as HTMLCollectionOf<HTMLElement>
    if (overlay[0].style.visibility == "visible") {
      overlay[0].style.visibility = "hidden"
    } else {
      overlay[0].style.visibility = "visible"
    }
    // doc1ument.getElementsByClassName('help-overlay')
  }
</script>

<Geolocation
  getPosition
  on:position={(e) => {
    geoEvents = [...geoEvents, e.detail]
    if (!e.detail) return;
    if (!e.detail.coords) return;
    coords.lat = e.detail.coords.latitude
    coords.long = e.detail.coords.longitude
    solarData = suncalc.getTimes(
      new Date(),
      e.detail.coords.latitude,
      e.detail.coords.longitude
    )
    if (new Date() < solarData.solarNoon) {
      solarData = suncalc.getTimes(
        new Date(Date.now() - 24 * 60 * 60 * 1000),
        e.detail.coords.latitude,
        e.detail.coords.longitude
      )
    }
    hemisphere = getHemisphere(e.detail.coords.latitude)
    summerSolstice = hemisphere === "North" ? juneSolstice : decemberSolstice
  }}
  on:error={(e) => {
    geoEvents = [...geoEvents, e.detail]
    console.log(e.detail) // GeolocationError
  }}
/>

<div
  class="flex-col"
  style="--time360deg: {time360deg}; --date360deg: {date360deg}; --date100prog: {date100prog}; --sunrise360deg: {sunrise360deg}; --sunset360deg: {sunset360deg};"
>
  <div class="flex min-h-screen relative">
    <div class="help-button flex absolute left-10 top-10 z-20 invisible">
      <button
        on:click={toggleHelp}
        class="text-2xl font-bold bg-slate-500 p-3 px-5 bg-opacity-20 rounded-md"
        >?</button
      >
    </div>
    <div
      class="help-overlay m-auto md:flex space-x-0 md:space-x-8 space-y-8 md:space-y-0 items-center justify-center text-center flex h-screen w-screen z-10 absolute invisible -ml-3"
    >
      <div class="daydonut-help h-60 w-60 md:h-96 md:w-96 rounded-full">
        <div class="flex items-center justify-center h-full text-3xl font-thin">
          <div class="mt-24 text-red-600">Date 360</div>
        </div>
      </div>
      <div class="timedonut-help h-60 w-60 md:h-96 md:w-96 rounded-full">
        <div
          class="flex items-center h-full w-full justify-center text-3xl font-thin timeindicator"
        >
          <div class="mt-24 text-red-600">Time 360</div>
        </div>
      </div>
    </div>
    <div
      class="m-auto md:flex space-x-0 md:space-x-8 space-y-8 md:space-y-0 items-center justify-center text-center"
    >
      <div class="daydonut h-60 w-60 md:h-96 md:w-96 rounded-full">
        <svg class="circular-progress-date h-60 w-60 md:h-96 md:w-96">
          <circle class="bg"></circle>
          <circle class="fg" bind:this={dateProgressCircle}></circle>
        </svg>

        <div class="flex items-center justify-center h-full text-6xl">
          {date360.toFixed(0)}
        </div>
      </div>
      <div class="timedonut h-60 w-60 md:h-96 md:w-96 rounded-full">
        <svg class="circular-progress-time h-60 w-60 md:h-96 md:w-96">
          <circle class="bg"></circle>
          <circle class="sun-marker" bind:this={sunMarker}></circle>
        </svg>

        <div
          class="flex items-center h-full w-full justify-center text-3xl md:text-6xl timeindicator"
        >
          <div>{time360.toFixed(2)}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="flex items-center justify-center text-3xl p-8">
    {datetime.getUTCFullYear() +
      "/" +
      (datetime.getUTCMonth() + 1).toString().padStart(2, "0") +
      "/" +
      datetime.getUTCDate().toString().padStart(2, "0")}
    {datetime.getUTCHours().toString().padStart(2, "0")}:{datetime
      .getUTCMinutes()
      .toString()
      .padStart(2, "0")}:{datetime.getUTCSeconds().toString().padStart(2, "0")}
    UTC/GMT
  </div>
  <div class="flex items-center justify-center text-3xl">
    Stardate: {currentStardate}
  </div>
  <div
    class="items-center justify-center text-xl md:text-3xl max-w-screen-md overflow-hidden"
  >
    <p>Sunrise: {sunrise360deg}</p>
    <p>Sunset: {sunset360deg}</p>
    <p>Sunrise: {(sunrise.getTime() / 1000) % 86400}</p>
    <p>Sunset: {(sunset.getTime() / 1000) % 86400}</p>
    <p class="text-wrap">coords: {JSON.stringify(coords)}</p>
  </div>
</div>
<footer class="text-center p-8">
  <a href="https://github.com/starspacegroup/spacetime-clock"
    >Open Source on GitHub</a
  >
</footer>

<input type="hidden" bind:value={time360deg} />
<input type="hidden" bind:value={date360deg} />
<input type="hidden" bind:value={date100prog} />
<input type="hidden" bind:value={sunrise360deg} />
<input type="hidden" bind:value={sunset360deg} />

<style>
  .daydonut {
    background: radial-gradient(theme("colors.background") 40%, transparent 41%),
      conic-gradient(
        theme("colors.summer") 0deg 90deg,
        theme("colors.winter") 90deg 270deg,
        theme("colors.summer") 270deg 360deg
      );
    margin: 10px;
    display: inline-block;
    border-radius: 50%;
  }
  .circular-progress-date {
    position: absolute;
  }

  .circular-progress-date circle {
    cx: 50%;
    cy: 50%;
    r: calc((100% - 20px) / 2);
    stroke-width: 20px;
    fill: none;
    stroke-linecap: round;
  }

  .circular-progress-date circle.bg {
    stroke: theme("colors.background");
  }

  .circular-progress-date circle.fg {
    transform: rotate(-90deg);
    transform-origin: 50% 50%;
    stroke: theme("colors.year-progress");
  }

  .timedonut {
    background: radial-gradient(theme("colors.background") 40%, transparent 41%),
      conic-gradient(
        theme("colors.daytime") 0% var(--sunset360deg),
        theme("colors.nighttime") var(--sunset360deg) var(--sunrise360deg),
        theme("colors.daytime") var(--sunrise360deg) 100%
      );
    margin: 10px;
    display: inline-block;
    border-radius: 50%;
  }
  .circular-progress-time {
    position: absolute;
  }

  .circular-progress-time circle {
    cx: 50%;
    cy: 50%;
    r: calc((100% - 33px) / 2);
    stroke-width: 33px;
    fill: none;
  }

  .circular-progress-time circle.bg {
    stroke: theme("colors.background");
  }

  .circular-progress-time circle.sun-marker {
    r: 16px;
    fill: theme("colors.sun");
    stroke: none;
  }
</style>
