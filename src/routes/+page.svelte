<script>
  const dayDeg = 90 * 3
  const nightDeg = 90
  const noonDeg = 0
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

      <div class="flex items-center justify-center h-full text-6xl">42</div>
    </div>
    <div class="timedonut h-60 w-60 md:h-96 md:w-96 rounded-full">
      <svg class="circular-progress-time h-60 w-60 md:h-96 md:w-96">
        <circle class="bg"></circle>
        <circle class="fg"></circle>
      </svg>

      <div
        class="flex items-center h-full w-full justify-center text-6xl timeindicator"
      >
        <div>222</div>
      </div>
    </div>
  </div>
</div>
<footer class="text-center bg-black text-white p-8">
  <a href="https://github.com/starspacegroup/spacetime-clock"
    >Open Source on GitHub</a
  >
</footer>

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
      --progress: 18;
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
    --stroke-width: 20px;
    --radius: calc((var(--size) - var(--stroke-width)) / 2);
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
    transform: rotate(-90deg);
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
      --progress: 77;
    }
  }
</style>
