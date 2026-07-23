// HeatmapLayer.js
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import HeatmapOverlay from 'leaflet-heatmap';

function HeatmapLayer({ points }) {
  const map = useMap();
  const heatmapRef = useRef();

  useEffect(() => {
    if (!map) return;
    console.log(points[0])
    const config = {
        radius: 0.01,
        blur: 0.85,

        maxOpacity: 0.8,
        minOpacity: 0.15,

        scaleRadius: true,
        useLocalExtrema: false,

        latField: "latitude",
        lngField: "longitude",
        valueField: "totalAmount",

        gradient: {
            0.20: "#2c7bb6",
            0.40: "#00a6ca",
            0.60: "#00cc66",
            0.80: "#ffcc00",
            1.00: "#d7191c"
        }
    };

    heatmapRef.current = new HeatmapOverlay(config);
    heatmapRef.current.addTo(map);

    const max = Math.max(
    ...points
        .map(p => Number(p.totalAmount))
        .filter(Number.isFinite)
    );
    console.log(max)
    heatmapRef.current.setData({
      max: max,
      data: points,
    });

    return () => {
      if (heatmapRef.current) {
        heatmapRef.current.remove();
      }
    };
  }, [map, points]);

  return null; // This component adds layers to the map, not UI
}

export default HeatmapLayer;
