// HeatmapMap.jsx
import React, { useMemo } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

import HeatmapLayer from "./HeatmapLayer";
import { aggregateContributions } from "./aggregateRecords";
import CouncilDistrictLayer from "./CouncilDistrictLayer";

function ResizeFix() {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);

    return () => clearTimeout(timer);
  }, [map]);

  return null;
}


function HeatmapMap({ districtGeoJSON, points, highlightedDistrict }) {
  const aggregatedPoints = useMemo(() => {
    if (!points || points.length === 0) {
      return [];
    }

    return aggregateContributions(points, {
      cellSize: 0.005
    });

  }, [points]);


  return (
    <div
      style={{
        height: "100%",
        width: "100%"
      }}
    >

      <MapContainer
        center={[32.7767, -96.7970]}
        zoom={11}
        style={{
          height: "100%",
          width: "100%"
        }}
      >

        <ResizeFix />


        <TileLayer
          attribution="&copy; OpenStreetMap &copy; Carto"
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />


        <HeatmapLayer
          points={aggregatedPoints}
          valueField="totalAmount"
        />

        <CouncilDistrictLayer 
          geojson={districtGeoJSON}
          highlightedDistrict={highlightedDistrict}
        />


      </MapContainer>

    </div>
  );
}


export default HeatmapMap;