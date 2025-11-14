<script lang="ts">
  import { onMount, onDestroy } from "svelte"
  import Geolocation from "svelte-geolocation"
  import stardate from "stardate-converter"
  import suncalc from "suncalc"
  import getHemisphere from "$lib/getHemisphere"
  import gsap from "gsap"
  
  let datetime: Date = new Date()
  
  // SVG circle references for GSAP animations
  let dateProgressCircle: SVGCircleElement
  let sunMarker: SVGCircleElement
  let timeRingElement: HTMLDivElement
  let dateRingElement: HTMLDivElement
  let mainContainer: HTMLDivElement
  let utcTimeText: HTMLDivElement
  let stardateText: HTMLDivElement
  let locationWarning: HTMLDivElement
  let sunriseInfo: HTMLDivElement

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
  let hasLocation = false // Track if we have location data
  let hasAnimatedIn = false // Track if we've done the initial animation
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
  let time360 = 180 // Start at bottom (180 degrees)
  let time360deg = time360 + "deg"
  let sunrise360 = 90 // Default sunrise at 6am (90° from midnight at top)
  let sunrise360deg = sunrise360 + "deg"
  let sunset360 = 270 // Default sunset at 6pm (270° from midnight at top)
  let sunset360deg = sunset360 + "deg"
  
  // Reactive background style for time ring
  // Conic gradient needs to rotate by 90deg to align with our coordinate system where top = 0
  // In our system: top=0, right=90, bottom=180, left=270
  // In CSS conic: right=0, bottom=90, left=180, top=270
  // So we need to add 90 to our angles to convert to CSS conic coordinates
  $: sunriseVisual = sunrise360deg
  $: sunsetVisual = sunset360deg
  
  // Handle wrap-around case where sunset < sunrise (daylight wraps past midnight)
  $: timeRingBackground = sunset360 > sunrise360 
    ? `radial-gradient(hsl(264deg 100% 1%) 40%, transparent 41%), conic-gradient(from 90deg, hsl(51deg 91% 4%) 0deg ${sunriseVisual}, hsl(39deg 100% 50%) ${sunriseVisual} ${sunsetVisual}, hsl(51deg 91% 4%) ${sunsetVisual} 360deg)`
    : `radial-gradient(hsl(264deg 100% 1%) 40%, transparent 41%), conic-gradient(from 90deg, hsl(39deg 100% 50%) 0deg ${sunsetVisual}, hsl(51deg 91% 4%) ${sunsetVisual} ${sunriseVisual}, hsl(39deg 100% 50%) ${sunriseVisual} 360deg)`

  onMount(() => {
    // Quick entrance animations (max 0.2s)
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } })
    
    tl.from(mainContainer, {
      opacity: 0,
      duration: 0.2
    })
    .from([dateRingElement, timeRingElement], {
      opacity: 0,
      scale: 0.9,
      duration: 0.2,
      stagger: 0.05
    }, "-=0.1")
    .from([utcTimeText, stardateText], {
      opacity: 0,
      y: 10,
      stagger: 0.05,
      duration: 0.15
    }, "-=0.1")
    
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
      
      // Animate date progress circle with smooth easing
      const dateProgress = (dayOfYear / 365.25) * 100
      const dateDash = (dateProgress * dateCircumference) / 100
      gsap.to(dateProgressCircle, {
        attr: {
          "stroke-dasharray": `${dateDash} ${dateCircumference - dateDash}`
        },
        duration: 0.2,
        ease: "power2.out"
      })
      
      // Animate sun marker position
      const angle = (time360 - 90) * (Math.PI / 180) // Convert to radians, offset by -90 for top
      const markerRadius = timeRadius + (33 / 2) // Position on the middle of the stroke width
      const centerX = timeSize / 2
      const centerY = timeSize / 2
      const markerX = centerX + markerRadius * Math.cos(angle)
      const markerY = centerY + markerRadius * Math.sin(angle)
      
      // Set sun marker position directly without animation
      sunMarker.setAttribute("cx", markerX.toString())
      sunMarker.setAttribute("cy", markerY.toString())
    }
    
    // Wait for elements to be mounted and sized
    setTimeout(() => {
      updateCircleProgress()
    }, 100)
    
    refreshInterval = setInterval(function () {
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
      
      // Only calculate time360 if we have location
      if (hasLocation) {
        secondsSinceLastNoon = Math.abs(
          (datetime.getTime() - lastNoon.getTime()) / 1000
        )
        const targetTime360 = (secondsSinceLastNoon / 86400) * 359
        
        // Animate from bottom (180) to target on first acquisition, following circular path
        if (!hasAnimatedIn) {
          hasAnimatedIn = true
          gsap.to({ value: 180 }, {
            value: targetTime360,
            duration: 0.2,
            ease: "power2.out",
            onUpdate: function() {
              time360 = this.targets()[0].value
              updateCircleProgress()
            }
          })
          // Fade in sun marker
          gsap.to(sunMarker, {
            opacity: 1,
            duration: 0.2,
            ease: "power2.out"
          })
        } else {
          time360 = targetTime360
        }
      } else {
        time360 = 180 // Keep at bottom until we have location
      }

      time360deg = time360 - 90 + "deg"
      
      // Calculate sunrise/sunset positions relative to solar noon (same as time360)
      // Sunrise is before noon (negative offset from noon), sunset is after noon (positive offset)
      const secondsSinceSunriseNoon = (sunrise.getTime() - lastNoon.getTime()) / 1000
      const secondsSinceSunsetNoon = (sunset.getTime() - lastNoon.getTime()) / 1000
      
      // Convert to degrees (0-360 range) and apply -90 offset to match visual coordinate system
      let sunrise360Raw = ((secondsSinceSunriseNoon / 86400) * 360) - 90
      let sunset360Raw = ((secondsSinceSunsetNoon / 86400) * 360) - 90
      
      // Normalize to 0-360 range
      sunrise360 = ((sunrise360Raw % 360) + 360) % 360
      sunset360 = ((sunset360Raw % 360) + 360) % 360
      
      sunrise360deg = sunrise360.toFixed(0) + "deg"
      sunset360deg = sunset360.toFixed(0) + "deg"
      
      // Update GSAP animations
      updateCircleProgress()
    }, 9)
  })

  function toggleHelp() {
    // toggle visibility of .help-overlay with quick GSAP animation
    let overlay = document.getElementsByClassName(
      "help-overlay"
    ) as HTMLCollectionOf<HTMLElement>
    
    if (overlay[0].style.visibility == "visible") {
      gsap.to(overlay[0], {
        opacity: 0,
        duration: 0.2,
        ease: "power2.inOut",
        onComplete: () => {
          overlay[0].style.visibility = "hidden"
        }
      })
    } else {
      overlay[0].style.visibility = "visible"
      overlay[0].style.opacity = "0"
      gsap.to(overlay[0], {
        opacity: 1,
        duration: 0.2,
        ease: "power2.inOut"
      })
    }
  }
  
  function handleRingHover(ring: HTMLDivElement, isEntering: boolean) {
    if (!ring) return
    
    if (isEntering) {
      gsap.to(ring, {
        scale: 1.02,
        duration: 0.15,
        ease: "power2.out"
      })
    } else {
      gsap.to(ring, {
        scale: 1,
        duration: 0.15,
        ease: "power2.out"
      })
    }
  }
  
  let refreshInterval: number | null = null
  
  onDestroy(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval)
    }
  })
</script>

<Geolocation
  getPosition
  on:position={(e) => {
    geoEvents = [...geoEvents, e.detail]
    if (!e.detail) return;
    if (!e.detail.coords) return;
    
    // Quick fade in when location is obtained
    if (!hasLocation && timeRingElement) {
      gsap.to(timeRingElement, {
        opacity: 1,
        duration: 0.2,
        ease: "power2.out"
      })
      
      // Fade out the location warning
      if (locationWarning) {
        gsap.to(locationWarning, {
          opacity: 0,
          duration: 0.2,
          ease: "power2.in"
        })
      }
    }
    
    hasLocation = true // Mark that we have location
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
  class="flex-col relative overflow-hidden"
  style="--time360deg: {time360deg}; --date360deg: {date360deg}; --date100prog: {date100prog}; --sunrise360deg: {sunrise360deg}; --sunset360deg: {sunset360deg};"
>
  <!-- Animated background particles -->
  <div class="particles-bg"></div>
  
  <div class="flex min-h-screen relative" bind:this={mainContainer}>
    <div class="help-button flex absolute left-10 top-10 z-20 invisible">
      <button
        on:click={toggleHelp}
        class="text-2xl font-bold bg-slate-500 p-3 px-5 bg-opacity-20 rounded-md hover:bg-opacity-40 transition-all duration-300 hover:scale-110"
        >?</button
      >
    </div>
    <div
      class="help-overlay m-auto md:flex space-x-0 md:space-x-8 space-y-8 md:space-y-0 items-center justify-center text-center flex h-screen w-screen z-10 absolute invisible -ml-3 backdrop-blur-md"
    >
      <div class="daydonut-help h-60 w-60 md:h-96 md:w-96 rounded-full shadow-2xl">
        <div class="flex items-center justify-center h-full text-3xl font-thin">
          <div class="mt-24 text-red-600 animate-pulse">Date 360</div>
        </div>
      </div>
      <div class="timedonut-help h-60 w-60 md:h-96 md:w-96 rounded-full shadow-2xl">
        <div
          class="flex items-center h-full w-full justify-center text-3xl font-thin timeindicator"
        >
          <div class="mt-24 text-red-600 animate-pulse">Time 360</div>
        </div>
      </div>
    </div>
    <div
      class="m-auto md:flex space-x-0 md:space-x-8 space-y-8 md:space-y-0 items-center justify-center text-center perspective-container"
    >
      <div 
        class="daydonut h-60 w-60 md:h-96 md:w-96 rounded-full ring-glow hover-float" 
        bind:this={dateRingElement}
        on:mouseenter={() => handleRingHover(dateRingElement, true)}
        on:mouseleave={() => handleRingHover(dateRingElement, false)}
        role="img"
        aria-label="Date ring showing day of year progress"
      >
        <svg class="circular-progress-date h-60 w-60 md:h-96 md:w-96 drop-shadow-2xl">
          <defs>
            <filter id="glow-date">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <linearGradient id="yearGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:hsl(127deg, 100%, 28%);stop-opacity:1" />
              <stop offset="50%" style="stop-color:hsl(127deg, 100%, 18%);stop-opacity:1" />
              <stop offset="100%" style="stop-color:hsl(127deg, 100%, 38%);stop-opacity:1" />
            </linearGradient>
          </defs>
          <circle class="outer-bg"></circle>
          <circle class="bg"></circle>
          <circle class="fg" bind:this={dateProgressCircle}></circle>
        </svg>

        <div class="flex items-center justify-center h-full text-6xl">
          {date360.toFixed(0)}
        </div>
      </div>
      <div 
        class="timedonut h-60 w-60 md:h-96 md:w-96 rounded-full ring-glow hover-float" 
        bind:this={timeRingElement} 
        style="opacity: 1; background: {timeRingBackground};"
        on:mouseenter={() => handleRingHover(timeRingElement, true)}
        on:mouseleave={() => handleRingHover(timeRingElement, false)}
        role="img"
        aria-label="Time ring showing current time position"
      >
        <svg class="circular-progress-time h-60 w-60 md:h-96 md:w-96 drop-shadow-2xl" viewBox="0 0 384 384">
          <defs>
            <filter id="glow-sun">
              <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <radialGradient id="sunGradient">
              <stop offset="0%" style="stop-color:hsl(310deg, 100%, 70%);stop-opacity:1" />
              <stop offset="100%" style="stop-color:hsl(310deg, 100%, 50%);stop-opacity:1" />
            </radialGradient>
          </defs>
          <circle class="outer-bg"></circle>
          <circle class="bg"></circle>
          <circle class="sun-marker" bind:this={sunMarker} cx="192" cy="368" opacity="0"></circle>
        </svg>

        <div
          class="flex items-center h-full w-full justify-center text-3xl md:text-6xl timeindicator"
        >
          <div>{time360.toFixed(2)}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="flex items-center justify-center text-2xl md:text-4xl p-8 font-light tracking-wide info-text" bind:this={utcTimeText}>
    <div class="backdrop-blur-sm bg-background/30 px-6 py-3 rounded-2xl shadow-xl border border-foreground/10">
      {datetime.getUTCFullYear() +
        "/" +
        (datetime.getUTCMonth() + 1).toString().padStart(2, "0") +
        "/" +
        datetime.getUTCDate().toString().padStart(2, "0")}
      <span class="mx-2 text-accent">•</span>
      {datetime.getUTCHours().toString().padStart(2, "0")}:{datetime
        .getUTCMinutes()
        .toString()
        .padStart(2, "0")}:{datetime.getUTCSeconds().toString().padStart(2, "0")}
      <span class="text-primary ml-2 text-xl md:text-2xl">UTC/GMT</span>
    </div>
  </div>
  <div class="flex items-center justify-center text-2xl md:text-4xl font-light mb-8 info-text" bind:this={stardateText}>
    <div class="backdrop-blur-sm bg-background/30 px-6 py-3 rounded-2xl shadow-xl border border-foreground/10">
      <span class="text-accent">Stardate:</span> <span class="font-mono text-primary">{currentStardate}</span>
    </div>
  </div>
  {#if !hasLocation}
    <div class="flex items-center justify-center text-lg md:text-2xl text-yellow-400 mt-4 animate-pulse" bind:this={locationWarning}>
      <div class="backdrop-blur-sm bg-yellow-900/20 px-6 py-3 rounded-2xl shadow-xl border border-yellow-400/30">
        ⚠️ Waiting for location... Time ring at 0° (midnight)
      </div>
    </div>
  {/if}
  <div
    class="flex flex-col items-center justify-center text-sm md:text-lg max-w-screen-md mx-auto opacity-50 hover:opacity-100 transition-opacity duration-500 p-4" bind:this={sunriseInfo}
  >
    <div class="backdrop-blur-sm bg-background/20 px-4 py-2 rounded-xl space-y-1">
      <p><span class="text-secondary">Sunrise:</span> {sunrise360deg}</p>
      <p><span class="text-secondary">Sunset:</span> {sunset360deg}</p>
      <p class="text-xs opacity-70">Sunrise: {(sunrise.getTime() / 1000) % 86400}</p>
      <p class="text-xs opacity-70">Sunset: {(sunset.getTime() / 1000) % 86400}</p>
      <p class="text-xs opacity-50 text-wrap break-all">coords: {JSON.stringify(coords)}</p>
    </div>
  </div>
</div>
<footer class="text-center p-8 mt-12">
  <a 
    href="https://github.com/starspacegroup/spacetime-clock"
    class="inline-block px-6 py-3 rounded-xl backdrop-blur-sm bg-background/30 border border-foreground/10 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
  >
    <span class="text-lg">Open Source on GitHub</span>
  </a>
</footer>

<input type="hidden" bind:value={time360deg} />
<input type="hidden" bind:value={date360deg} />
<input type="hidden" bind:value={date100prog} />
<input type="hidden" bind:value={sunrise360deg} />
<input type="hidden" bind:value={sunset360deg} />

<style>
  .particles-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    background: 
      radial-gradient(circle at 20% 30%, rgba(265, 95%, 57%, 0.05) 0%, transparent 40%),
      radial-gradient(circle at 80% 70%, rgba(135, 73%, 49%, 0.05) 0%, transparent 40%),
      radial-gradient(circle at 50% 50%, rgba(310, 100%, 50%, 0.03) 0%, transparent 50%);
  }

  .perspective-container {
    perspective: 1500px;
  }

  .hover-float {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
  }

  .hover-float:hover {
    transform: translateY(-5px) scale(1.02);
  }

  .ring-glow {
    box-shadow: 
      0 0 20px rgba(265, 95%, 57%, 0.1),
      0 0 40px rgba(265, 95%, 57%, 0.05),
      0 10px 50px rgba(0, 0, 0, 0.3);
    transition: box-shadow 0.3s ease;
  }

  .ring-glow:hover {
    box-shadow: 
      0 0 30px rgba(265, 95%, 57%, 0.2),
      0 0 60px rgba(265, 95%, 57%, 0.1),
      0 15px 70px rgba(0, 0, 0, 0.4);
  }

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
    overflow: visible;
    position: relative;
  }

  .daydonut::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 50%;
    background: linear-gradient(45deg, 
      transparent 0%, 
      rgba(127, 100%, 18%, 0.2) 50%, 
      transparent 100%);
    opacity: 0;
    pointer-events: none;
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
    transition: stroke 0.3s ease;
  }

  .circular-progress-date circle.outer-bg {
    cx: 50%;
    cy: 50%;
    r: calc(50% - 10px);
    stroke-width: 20px;
    fill: none;
    stroke: theme("colors.background");
  }

  .circular-progress-date circle.bg {
    stroke: transparent;
  }

  .circular-progress-date circle.fg {
    transform: rotate(-90deg);
    transform-origin: 50% 50%;
    stroke: theme("colors.year-progress");
    filter: drop-shadow(0 0 4px theme("colors.year-progress"));
  }

  .timedonut {
    background: radial-gradient(theme("colors.background") 40%, transparent 41%),
      conic-gradient(
        from -90deg,
        theme("colors.nighttime") 0deg var(--sunrise360deg),
        theme("colors.daytime") var(--sunrise360deg) var(--sunset360deg),
        theme("colors.nighttime") var(--sunset360deg) 360deg
      );
    margin: 10px;
    display: inline-block;
    border-radius: 50%;
    overflow: visible;
    position: relative;
  }

  .timedonut::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 50%;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(39, 100%, 50%, 0.2) 50%, 
      transparent 100%);
    opacity: 0;
    pointer-events: none;
  }

  .circular-progress-time {
    position: absolute;
    overflow: visible;
  }

  .circular-progress-time circle.outer-bg {
    cx: 50%;
    cy: 50%;
    r: calc(50% - 16.5px);
    stroke-width: 33px;
    fill: none;
    stroke: theme("colors.background");
  }

  .circular-progress-time circle.bg {
    cx: 50%;
    cy: 50%;
    r: calc((100% - 33px) / 2);
    stroke-width: 33px;
    fill: none;
    stroke: transparent;
  }

  .circular-progress-time circle.sun-marker {
    r: 16px;
    fill: theme("colors.sun");
    stroke: none;
    filter: drop-shadow(0 0 6px theme("colors.sun"));
  }

  .info-text {
    animation: fadeInUp 1s ease-out;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Enhanced help overlay */
  .help-overlay {
    background: rgba(0, 0, 0, 0.7);
  }

  .daydonut-help {
    background: radial-gradient(theme("colors.background") 40%, transparent 41%),
      conic-gradient(
        theme("colors.summer") 0deg 90deg,
        theme("colors.winter") 90deg 270deg,
        theme("colors.summer") 270deg 360deg
      );
    border: 2px solid rgba(255, 255, 255, 0.1);
  }

  .timedonut-help {
    background: radial-gradient(theme("colors.background") 40%, transparent 41%),
      conic-gradient(
        from -90deg,
        theme("colors.nighttime") 0deg 90deg,
        theme("colors.daytime") 90deg 270deg,
        theme("colors.nighttime") 270deg 360deg
      );
    border: 2px solid rgba(255, 255, 255, 0.1);
  }
</style>
