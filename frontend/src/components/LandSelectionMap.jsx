import { useEffect, useRef } from "react";
import * as turf from "@turf/turf";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";


const defaultCenter = [20.5937, 78.9629];


export default function LandSelectionMap({ onSelectionChange }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return undefined;
    }

    const map = L.map(containerRef.current, {
      center: defaultCenter,
      zoom: 5,
      zoomControl: true,
    });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      position: "topright",
      draw: {
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false,
        polyline: false,
        polygon: {
          allowIntersection: false,
          showArea: true,
          shapeOptions: {
            color: "#84cc16",
            fillOpacity: 0.2,
            weight: 2,
          },
        },
      },
      edit: {
        featureGroup: drawnItems,
        remove: true,
      },
    });

    map.addControl(drawControl);

    const emitSelection = (layer) => {
      const feature = layer.toGeoJSON();
      const areaSquareMeters = turf.area(feature);
      const areaAcres = areaSquareMeters * 0.000247105;
      const center = turf.centerOfMass(feature);
      const [lon, lat] = center.geometry.coordinates;

      onSelectionChange({
        polygon: feature,
        center: { lat, lon },
        areaSquareMeters,
        areaAcres,
      });
    };

    const handleCreated = (event) => {
      drawnItems.clearLayers();
      drawnItems.addLayer(event.layer);
      emitSelection(event.layer);
    };

    const handleEdited = (event) => {
      event.layers.eachLayer((layer) => {
        emitSelection(layer);
      });
    };

    const handleDeleted = () => {
      onSelectionChange(null);
    };

    map.on(L.Draw.Event.CREATED, handleCreated);
    map.on(L.Draw.Event.EDITED, handleEdited);
    map.on(L.Draw.Event.DELETED, handleDeleted);

    return () => {
      map.off(L.Draw.Event.CREATED, handleCreated);
      map.off(L.Draw.Event.EDITED, handleEdited);
      map.off(L.Draw.Event.DELETED, handleDeleted);
      map.remove();
      mapRef.current = null;
    };
  }, [onSelectionChange]);

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-white/10">
      <div ref={containerRef} className="h-[420px] w-full bg-stone-900" />
    </div>
  );
}
