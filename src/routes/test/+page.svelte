<script lang="ts">
  export const ssr = false;

  import { onMount } from 'svelte';

  onMount(async () => {
    const L = await import('leaflet');

    // @ts-ignore
    let map;
    // @ts-ignore
    let userMarker;

    map = L.map('map').setView([0, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // @ts-ignore
          map.setView([latitude, longitude], 13);
          
          // @ts-ignore
          if (userMarker) {
            userMarker.setLatLng([latitude, longitude]);
          } else {
            // @ts-ignore
            userMarker = L.marker([latitude, longitude]).addTo(map)
              .bindPopup("You are here").openPopup();
          }
        },
        (error) => {
          console.error("Error getting location", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  });
</script>

<style lang="">
  #map {
    @apply min-h-screen min-w-fit;
  }
</style>

<svelte:head>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
crossorigin=""/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
  integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
  crossorigin=""></script>
</svelte:head>

<div id="map"></div>
