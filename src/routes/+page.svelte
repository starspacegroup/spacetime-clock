<script lang="ts">
  import { browser } from "$app/environment"
  import { walk } from "svelte/compiler"

  let datetime = new Date()
  var dayOfYear =
    (Date.UTC(datetime.getFullYear(), datetime.getMonth(), datetime.getDate()) -
      Date.UTC(datetime.getFullYear(), 0, 0)) /
    86400000

  let date360 = (dayOfYear / 365.25) * 360
  let time360 = (datetime.getMinutes() / 24 / 60) * 360

  let refresher = setInterval(function () {
    datetime = new Date()
    date360 = 42
    time360 = 222
  }, 1000)

  let time100 = (time360 / 360) * 100

  if (browser && "geolocation" in navigator) {
    // Geolocation is supported
    navigator.geolocation.getCurrentPosition(
      function (position) {
        // Retrieve latitude from the position object
        var latitude = position.coords.latitude
        var dayOfYear =
          (Date.UTC(
            datetime.getFullYear(),
            datetime.getMonth(),
            datetime.getDate()
          ) -
            Date.UTC(datetime.getFullYear(), 0, 0)) /
          86400000
        var winterEquinoxDate = getWinterEquinoxDate(
          datetime.getFullYear(),
          latitude
        )
        var daysSinceWinterEquinox = dayOfYear - winterEquinoxDate.getDay()
        date360 = (daysSinceWinterEquinox / 365.25) * 360
        date360 = daysSinceWinterEquinox
        // Use the latitude value as needed
        console.log("Latitude: " + latitude)
      },
      function (error) {
        // Handle errors
        console.error("Error getting geolocation:", error)
      }
    )
  } else {
    // Geolocation is not supported
    console.log("Geolocation is not supported by this browser.")
  }
  let date100 = (date360 / 360) * 100

  function getWinterEquinoxDate(year: number, latitude: number) {
    // Convert latitude to radians
    var latRad = latitude * (Math.PI / 180)

    // Determine the day of the winter solstice for the given year
    var approxWinterSolstice = new Date(year, 11, 21) // December 21st approximation
    var solsticeJD =
      Math.floor(approxWinterSolstice.getTime() / 86400000 - 0.5) + 2440588

    // Calculate the solar longitude
    var T = (solsticeJD - 2451545) / 36525
    var W = 35999.373 * T - 2.47
    var deltaLambda = 1 + 0.0334 * Math.cos(W * (Math.PI / 180))

    // Corrected year
    var y = year + (solsticeJD - 2451545) / 365.2425

    // Calculate the declination of the sun
    var declination =
      0.409 *
      Math.sin((2 * Math.PI * (solsticeJD - 81)) / 368) *
      (Math.PI / 180)

    // Calculate the solar time at the meridian
    var solarTime =
      280.46646 +
      36000.76983 * T +
      0.0003032 * Math.pow(T, 2) +
      (1.914602 - 0.004817 * T - 0.000014 * Math.pow(T, 2)) *
        Math.sin(W * (Math.PI / 180)) +
      (0.019993 - 0.000101 * T) * Math.sin(2 * W * (Math.PI / 180))

    // Calculate the hour angle
    var hourAngle =
      solarTime -
      (Math.PI / 180) * 0.06571 * (year - 2000) -
      0.006993 * Math.sin(3.822 * (year - 2000)) * (Math.PI / 180)

    // Calculate the solar zenith angle
    var solarZenithAngle = Math.acos(
      Math.sin(latRad) * Math.sin(declination) +
        Math.cos(latRad) * Math.cos(declination) * Math.cos(hourAngle)
    )

    // Determine the day of the equinox
    var equinoxDay = Math.round(
      solsticeJD + (0.5 - solarZenithAngle / Math.PI) * deltaLambda - 2440588
    )

    // Convert the Julian day to a date
    var equinoxDate = new Date((equinoxDay - 1) * 86400000 + 0.5)

    return equinoxDate
  }
  time100 = 50
  let progresstime = time100
</script>

<div class="flex bg-black min-h-screen text-white">
  <div
    class="m-auto md:flex space-x-0 md:space-x-8 space-y-8 md:space-y-0 items-center justify-center text-center"
  >
    <div class="daydonut h-60 w-60 md:h-96 md:w-96 rounded-full">
      <svg class="circular-progress-date h-60 w-60 md:h-96 md:w-96">
        <circle class="bg"></circle>
        <circle class="fg"></circle>
      </svg>

      <div class="flex items-center justify-center h-full text-6xl">
        {date360.toFixed(0)}
      </div>
    </div>
    <div class="timedonut h-60 w-60 md:h-96 md:w-96 rounded-full">
      <svg class="circular-progress-time h-60 w-60 md:h-96 md:w-96">
        <circle class="bg"></circle>
        <circle class="fg"></circle>
      </svg>

      <div
        class="flex items-center h-full w-full justify-center text-6xl timeindicator"
      >
        <div>{time360.toFixed()}</div>
      </div>
    </div>
  </div>
</div>
<footer class="text-center bg-black text-white p-8">
  <a href="https://github.com/starspacegroup/spacetime-clock"
    >Open Source on GitHub</a
  >
</footer>

<div style="--time360: {time360.toString() + 'deg'}"></div>
<input type="hidden" bind:value={time100} />

<style>
  .daydonut {
    background: radial-gradient(black 40%, transparent 41%),
      conic-gradient(
        #2196f3 0% 1%,
        #2196f3 1% 20%,
        #ee6205 20% 70%,
        #2196f3 60% 100%
      );
    margin: 10px;
    display: inline-block;
    border-radius: 50%;
  }
  .circular-progress-date {
    position: absolute;
    --size: 100%;
    --half-size: calc(var(--size) / 2);
    --stroke-width: 20px;
    --radius: calc((var(--size) - var(--stroke-width)) / 2);
    --circumference: calc(var(--radius) * pi * 2);
    --dash: calc((var(--progress) * var(--circumference)) / 100);
    animation: progress-animation-date 0.23s linear 0s 1 forwards;
  }

  .circular-progress-date circle {
    cx: var(--half-size);
    cy: var(--half-size);
    r: var(--radius);
    stroke-width: var(--stroke-width);
    fill: none;
    stroke-linecap: round;
  }

  .circular-progress-date circle.bg {
    stroke: #000000;
  }

  .circular-progress-date circle.fg {
    transform: rotate(-90deg);
    transform-origin: var(--half-size) var(--half-size);
    stroke-dasharray: var(--dash) calc(var(--circumference) - var(--dash));
    transition: stroke-dasharray 0.3s linear 0s;
    stroke: #005a0b;
  }

  @property --progress {
    syntax: "<number>";
    inherits: false;
    initial-value: 0;
  }

  @keyframes progress-animation-date {
    from {
      --progress: 0;
    }
    to {
      --progress: 11.66;
    }
  }

  .timedonut {
    background: radial-gradient(black 40%, transparent 41%),
      conic-gradient(
        #cfc50d 0% 1%,
        orange 1% 20%,
        #20014c 20% 51%,
        #151301 51% 82%,
        #cfc50d 60% 100%
      );
    margin: 10px;
    display: inline-block;
    border-radius: 50%;
  }
  .circular-progress-time {
    position: absolute;
    --size: 100%;
    --half-size: calc(var(--size) / 2);
    --stroke-width: 33px;
    --radius: calc((var(--size) - var(--stroke-width)) / 2);
    /* --circumference: 0.5; */
    --circumference: calc(var(--radius) * pi * 2);
    --dash: calc((var(--progress) * var(--circumference)) / 100);
    animation: progress-animation-time 0.32s linear 0s 1 forwards;
  }

  .circular-progress-time circle {
    cx: var(--half-size);
    cy: var(--half-size);
    r: var(--radius);
    stroke-width: var(--stroke-width);
    fill: none;
    stroke-linecap: round;
  }

  .circular-progress-time circle.bg {
    stroke: #000000;
  }

  .circular-progress-time circle.fg {
    transform: rotate(var(--time360));
    transform-origin: var(--half-size) var(--half-size);
    stroke-dasharray: var(--dash) calc(var(--circumference) - var(--dash));
    transition: stroke-dasharray 0.3s linear 0s;
    stroke: #ff00d4;
  }

  @property --progress {
    syntax: "<number>";
    inherits: false;
    initial-value: 0;
  }

  @keyframes progress-animation-time {
    from {
      --progress: 0;
    }
    to {
      --progress: var(--time100);
    }
  }
</style>
