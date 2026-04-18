import { useEffect, useRef, useState } from "react";
import * as turf from "@turf/turf";
import L from "leaflet";
import "leaflet/dist/leaflet.css";


const defaultCenter = [20.5937, 78.9629];


export default function LandSelectionMap({ onSelectionChange, focusLocation }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const polygonLayerRef = useRef(null);
  const previewLayerRef = useRef(null);
  const markerLayerRef = useRef(null);
  const pointsRef = useRef([]);
  const isDrawingRef = useRef(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [pointCount, setPointCount] = useState(0);

  const clearPreview = () => {
    previewLayerRef.current?.clearLayers();
    markerLayerRef.current?.clearLayers();
    pointsRef.current = [];
    setPointCount(0);
  };

  const clearSelection = () => {
    polygonLayerRef.current?.clearLayers();
    clearPreview();
    onSelectionChange(null);
  };

  const renderPreview = () => {
    if (!previewLayerRef.current || !markerLayerRef.current) {
      return;
    }

    previewLayerRef.current.clearLayers();
    markerLayerRef.current.clearLayers();

    const latLngs = pointsRef.current.map(([lat, lon]) => L.latLng(lat, lon));

    latLngs.forEach((latLng) => {
      L.circleMarker(latLng, {
        radius: 5,
        color: "#4CAF50",
        fillColor: "#4CAF50",
        fillOpacity: 1,
        weight: 2,
      }).addTo(markerLayerRef.current);
    });

    if (latLngs.length >= 2) {
      L.polyline(latLngs, {
        color: "#4CAF50",
        weight: 2,
        dashArray: "6 6",
      }).addTo(previewLayerRef.current);
    }
  };

  const emitSelection = (latLngs) => {
    const coordinates = latLngs.map((latLng) => [latLng.lng, latLng.lat]);
    const polygonFeature = turf.polygon([[...coordinates, coordinates[0]]]);
    const areaSquareMeters = turf.area(polygonFeature);
    const areaAcres = areaSquareMeters * 0.000247105;
    const center = turf.centroid(polygonFeature);
    const [lon, lat] = center.geometry.coordinates;

    onSelectionChange({
      polygon: polygonFeature,
      center: { lat, lon },
      areaSquareMeters,
      areaAcres,
    });
  };

  const finishPolygon = () => {
    if (!isDrawingRef.current || pointsRef.current.length < 3 || !polygonLayerRef.current) {
      return;
    }

    const latLngs = pointsRef.current.map(([lat, lon]) => L.latLng(lat, lon));

    polygonLayerRef.current.clearLayers();
    L.polygon(latLngs, {
      color: "#4CAF50",
      fillOpacity: 0.2,
      weight: 2,
    }).addTo(polygonLayerRef.current);

    previewLayerRef.current?.clearLayers();
    markerLayerRef.current?.clearLayers();
    isDrawingRef.current = false;
    setIsDrawing(false);
    setPointCount(0);
    pointsRef.current = [];

    if (mapRef.current) {
      mapRef.current.fitBounds(L.latLngBounds(latLngs), { padding: [24, 24] });
    }

    emitSelection(latLngs);
  };

  const startDrawing = () => {
    polygonLayerRef.current?.clearLayers();
    clearPreview();
    isDrawingRef.current = true;
    setIsDrawing(true);
  };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return undefined;
    }

    const map = L.map(containerRef.current, {
      center: defaultCenter,
      zoom: 5,
      zoomControl: true,
      doubleClickZoom: false,
    });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    polygonLayerRef.current = L.featureGroup().addTo(map);
    previewLayerRef.current = L.featureGroup().addTo(map);
    markerLayerRef.current = L.featureGroup().addTo(map);

    const handleMapClick = (event) => {
      if (!isDrawingRef.current) {
        return;
      }

      pointsRef.current = [...pointsRef.current, [event.latlng.lat, event.latlng.lng]];
      setPointCount(pointsRef.current.length);
      renderPreview();
    };

    const handleMapDoubleClick = () => {
      if (isDrawingRef.current && pointsRef.current.length >= 3) {
        finishPolygon();
      }
    };

    map.on("click", handleMapClick);
    map.on("dblclick", handleMapDoubleClick);

    return () => {
      map.off("click", handleMapClick);
      map.off("dblclick", handleMapDoubleClick);
      map.remove();
      mapRef.current = null;
      polygonLayerRef.current = null;
      previewLayerRef.current = null;
      markerLayerRef.current = null;
    };
  }, [onSelectionChange]);

  useEffect(() => {
    if (
      focusLocation?.lat === null ||
      focusLocation?.lat === undefined ||
      focusLocation?.lon === null ||
      focusLocation?.lon === undefined ||
      !mapRef.current
    ) {
      return;
    }

    mapRef.current.setView([focusLocation.lat, focusLocation.lon], focusLocation.zoom || 13);
  }, [focusLocation]);

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#1f2937] shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
      <div className="relative">
        <div className="absolute right-3 top-3 z-[500] flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={startDrawing}
            className="rounded-xl bg-[#22c55e] px-3 py-2 text-sm font-semibold text-[#0f172a] transition hover:bg-green-400"
          >
            {isDrawing ? "Redraw Polygon" : "Start Polygon"}
          </button>
          <button
            type="button"
            onClick={finishPolygon}
            disabled={!isDrawing || pointCount < 3}
            className="rounded-xl bg-white/90 px-3 py-2 text-sm font-semibold text-[#111827] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Finish
          </button>
          <button
            type="button"
            onClick={clearSelection}
            className="rounded-xl bg-[#111827]/90 px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#0f172a]"
          >
            Clear
          </button>
        </div>

        <div ref={containerRef} className="h-[460px] w-full bg-[#111827]" />
      </div>
    </div>
  );
}
