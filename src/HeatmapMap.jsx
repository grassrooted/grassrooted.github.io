// HeatmapMap.js
import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import HeatmapLayer from './HeatmapLayer';
import { useEffect } from "react";
import { useMap } from "react-leaflet";

function ResizeFix() {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 300);
  });

  return null;
}

function HeatmapMap({ points }) {
  return (
    <div style={{ height: '100%'}}>
      <MapContainer
        center={[32.7767, -96.7970]} // Dallas, TX
        zoom={11}
        style={{ height: '100%'}}
      >
        <ResizeFix />

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <HeatmapLayer points={points} />
      </MapContainer>
    </div>
  );
}

export default HeatmapMap;
