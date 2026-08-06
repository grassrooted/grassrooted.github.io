import { useEffect, useState } from "react";
import { GeoJSON } from "react-leaflet";

function CouncilDistrictLayer({
    geojson,
    highlightedDistrict = null,
}) {
    if (!geojson) return null;

    const style = (feature) => {
        // Replace DISTRICT with whatever property exists in your GeoJSON
        const district = Number(feature.properties.DISTRICT);

        const isSelected =
            highlightedDistrict !== null &&
            district === Number(highlightedDistrict);

        return {
            color: isSelected ? "#FFD700" : "#666666",
            weight: isSelected ? 4 : 1,
            opacity: 1,

            fillColor: isSelected ? "#FFD700" : "#FFFFFF",
            fillOpacity: isSelected ? 0.18 : 0,
        };
    };

    const onEachFeature = (feature, layer) => {
        const district = feature.properties.DISTRICT;

        layer.bindTooltip(
            `District ${district}`,
            {
                sticky: true,
                direction: "center",
            }
        );
    };

    return (
        <GeoJSON
            data={geojson}
            style={style}
            onEachFeature={onEachFeature}
            interactive={false}
        />
    );
}

export default CouncilDistrictLayer;