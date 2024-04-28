<script>
  const now = new Date()
  const hourStart = now.getHours() * 3600000 // milliseconds in an hour
  const elapsedMilliseconds = now.getTime() - hourStart
  const secondsElapsedInHour = Math.floor(elapsedMilliseconds / 1000)

  let secondsElapsedSinceLastMinute = 0
  let secondsElapsedSinceLastMinuteDeg = ""
  let secondsElapsedSinceLastMinutePx = ""
  setInterval(() => {
    secondsElapsedSinceLastMinute = new Date().getSeconds()
    secondsElapsedSinceLastMinuteDeg =
      (secondsElapsedSinceLastMinute / 60) * 359 + "deg"
    secondsElapsedSinceLastMinutePx =
      secondsElapsedSinceLastMinute * 1.61803398 + "px"
  }, 1000)
</script>

<input
  type="hidden"
  bind:value={secondsElapsedSinceLastMinuteDeg}
  style="height: 50px;"
/>
<input
  type="hidden"
  bind:value={secondsElapsedSinceLastMinutePx}
  style="height: 50px;"
/>

<div
  style="--secondsElapsedSinceLastMinuteDeg: {secondsElapsedSinceLastMinuteDeg}; --secondsElapsedSinceLastMinutePx: {secondsElapsedSinceLastMinutePx}"
  class=" text-center bg-black text-white min-h-screen flex"
>
  <div class="m-auto text-9xl duration-1000" id="seconds">
    {secondsElapsedSinceLastMinute}
  </div>
  <div class="fixed top-0 left-0 text-xl text-left">
    <p>secondsDegrees: {secondsElapsedSinceLastMinuteDeg}</p>
    <p>secondsPx: {secondsElapsedSinceLastMinutePx}</p>
  </div>
  <div id="conic-gradient" class="fixed bottom-0 right-0 w-44 h-44"></div>
</div>

<style>
  #seconds {
    transform: rotate(var(--secondsElapsedSinceLastMinuteDeg))
      translate3d(
        var(--secondsElapsedSinceLastMinutePx),
        var(--secondsElapsedSinceLastMinutePx),
        200px
      )
      perspective(500px);
  }
  #conic-gradient {
    background: conic-gradient(
      red 6deg,
      orange 6deg 18deg,
      yellow 18deg 45deg,
      green 45deg 110deg,
      blue 110deg 200deg,
      purple 200deg
    );
    /* conic-gradient(
        #cfc50d 0% 1%,
        orange 1% 20%,
        #20014c 20% 51%,
        #151301 51% 82%,
        #cfc50d 60% 100%
      ); */
  }
</style>
