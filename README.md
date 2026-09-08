# Nibirman infrastructure frontend

Interactive Bangladesh infrastructure prototype. Run `npm install` and `npm run dev`. Build with `npm run build`.

- CSS perspective map with extruded geographic layers, rotation, zoom, 2D view, filtering and asset inspection.
- Historical BPDB (November 2025) and BTRC (January 2026) public reference snapshots. All operational states, incidents, project progress, generation charts, hub examples and relationships are seed scenarios.
- Geographic boundary shapes simplified from https://github.com/ifahimreza/bangladesh-geojson (geoBoundaries / BBS / OCHA, CC BY 4.0). Simplification is for visualization; not a survey or operational network map.
- Coordinates are approximate. Connection lines do not represent surveyed grid/fiber routes.
- No backend, live telemetry, measured QoS, real license registry or AI forecasting is connected. Unavailable data is shown explicitly.
- Acknowledgments are session-only. Theme and saved filters use device-local storage.
- CSV export follows region, sector and enabled map layers.
- Optional WebMCP configure_infrastructure_view uses the same filter state. Feature-detected; no supported validation context was available during implementation.

Frontend scope: overview, electricity/telecom summaries, map, incidents, regulatory data availability, demo projects, analytics, exports, data catalog, search and contextual details. The supplied long-term brief includes additional backend/domain modules beyond this frontend-first release.
