// aggregateContributions.js

export function aggregateContributions(points, options = {}) {

    const cellSize = options.cellSize || 0.005;

    const grid = {};
    
    points.forEach(point => {

        const lat = Number(point.latitude);
        const lng = Number(point.longitude);
        const amount = Number(point.Amount);


        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng) ||
            !Number.isFinite(amount)
        ) {
            return;
        }


        const latCell = Math.floor(lat / cellSize);
        const lngCell = Math.floor(lng / cellSize);


        const key = `${latCell}_${lngCell}`;


        if (!grid[key]) {
            grid[key] = {
                latitude: 0,
                longitude: 0,
                totalAmount: 0,
                donorCount: 0,
                count: 0
            };
        }


        grid[key].latitude += lat;
        grid[key].longitude += lng;
        grid[key].totalAmount += amount;
        grid[key].donorCount += 1;
        grid[key].count += 1;

    });


    return Object.values(grid).map(cell => ({
        latitude: cell.latitude / cell.count,
        longitude: cell.longitude / cell.count,
        totalAmount: cell.totalAmount,
        donorCount: cell.donorCount
    }));
}