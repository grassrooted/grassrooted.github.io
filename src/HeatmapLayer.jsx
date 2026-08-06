// HeatmapLayer.js

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import HeatmapOverlay from "leaflet-heatmap";

const HEATMAP_CONFIG = {
    radius: 0.01,
    blur: 0.85,

    maxOpacity: 0.8,
    minOpacity: 0.15,

    scaleRadius: true,
    useLocalExtrema: true,

    latField: "latitude",
    lngField: "longitude",
    valueField: "totalAmount",

    gradient: {
        0.20: "#2c7bb6",
        0.40: "#00a6ca",
        0.60: "#00cc66",
        0.80: "#ffcc00",
        1.00: "#d7191c",
    },
};

function HeatmapLayer({ points = [] }) {
    const map = useMap();
    const heatmapRef = useRef(null);

    // Create heatmap layer once
    useEffect(() => {
        if (!map) return;

        const heatmap = new HeatmapOverlay(HEATMAP_CONFIG);
        heatmap.addTo(map);

        heatmapRef.current = heatmap;

        return () => {
            heatmap.remove();
            heatmapRef.current = null;
        };
    }, [map]);

    // Update heatmap data whenever points change
    useEffect(() => {
        if (!heatmapRef.current) return;

        const values = points
            .map(({ totalAmount }) => Number(totalAmount))
            .filter(Number.isFinite);

        const maxValue = values.length ? Math.max(...values) : 0;

        heatmapRef.current.setData({
            max: maxValue,
            data: points,
        });
    }, [points]);

    return null;
}

export default HeatmapLayer;