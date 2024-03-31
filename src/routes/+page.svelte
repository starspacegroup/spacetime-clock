<script>
  const dayDeg = 90 * 3
  const nightDeg = 90
  const noonDeg = 0
</script>

<div class="flex bg-black min-h-screen p-8 text-white">
  <div class="m-auto md:flex md:space-x-8 space-y-8 md:space-y-0">
    <div
      class="daydonut bg-[conic-gradient(#9233ea,#db2777,#2564eb)] h-96 w-96 rounded-full"
    >
      <div class="flex items-center justify-center h-full text-6xl">35</div>
    </div>
    <div id="" class="timedonut h-96 w-96">
      <div class="flex items-center justify-center h-full text-6xl">270</div>
    </div>
  </div>
</div>

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
</style>
