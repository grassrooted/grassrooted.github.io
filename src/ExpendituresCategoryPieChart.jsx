import React from "react";
import Highcharts from "highcharts";
import HighchartsSunburst from "highcharts/modules/sunburst";
import HighchartsReact from "highcharts-react-official";
import './ExpenditureCategoryPieChart.css';
import {
    GRASSROOTED_VIZ_PALETTE,
    GRASSROOTED_STATES
  } from "./grassrootedVizTheme";
  

// Properly initialize the module
if (typeof HighchartsSunburst === "function") {
    HighchartsSunburst(Highcharts);
}

const ExpendituresCategorySunburstChart = ({ records, profile }) => {
    // Aggregate amounts by category
    const categoryTotals = records.reduce((acc, record) => {
        acc[record.Category] = (acc[record.Category] || 0) + Math.round(record.Amount);
        return acc;
    }, {});

    const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const topCategories = sortedCategories.slice(0, 5);

    // Prepare Sunburst chart data
    let sunburstData = [
        { id: "root", name: "Expenditures", color: "#0f172a" },
    ];

    topCategories.forEach(([category, amount], index) => {
        const categoryId = `category-${index}`;
        sunburstData.push({
            id: categoryId,
            parent: "root",
            name: category,
            value: amount,
            color: GRASSROOTED_VIZ_PALETTE[index % GRASSROOTED_VIZ_PALETTE.length],
        });

        // Aggregate records by Name within each category
        const nameTotals = records
            .filter(record => record.Category === category)
            .reduce((acc, record) => {
                acc[record.Name] = (acc[record.Name] || 0) + Math.round(record.Amount);
                return acc;
            }, {});

        const sortedNames = Object.entries(nameTotals).sort((a, b) => b[1] - a[1]);
        const topNames = sortedNames.slice(0, 5);
        const otherTotal = sortedNames.slice(5).reduce((sum, [, value]) => sum + value, 0);

        topNames.forEach(([name, total]) => {
            sunburstData.push({
                id: `record-${category}-${name}`,
                parent: categoryId,
                name: name,
                value: total,
            });
        });

        if (otherTotal > 0) {
            sunburstData.push({
                id: `record-${category}-other`,
                parent: categoryId,
                name: "Other",
                value: otherTotal,
            });
        }
    });

    const options = {
    chart: {
        backgroundColor: "transparent",
        spacing: [10, 10, 10, 10],
    },
    plotOptions: {
        sunburst: {
          allowDrillToNode: true,
          cursor: "pointer",
          borderWidth: 2,
          borderColor: "#0b1220",
          states: {
            hover: {
              brightness: GRASSROOTED_STATES.hoverBrightness
            },
            inactive: {
              opacity: GRASSROOTED_STATES.inactiveOpacity
            }
          }
        },
      },
    title: {text: null},
    tooltip: {
        backgroundColor: "#0f172a",
        borderColor: "rgba(0,255,163,0.3)",
        borderWidth: 1,
        style: { color: "#e6edf3" },
        formatter: function () {
          return `
            <b>${this.point.name}</b><br/>
            $${this.value.toLocaleString()}
          `;
        }
      },
    series: [{
        type: "sunburst",
        name: 'Data',
        data: sunburstData,
        allowDrillToNode: true,
        levels: [
            {
              level: 1,
              levelIsConstant: false,
              dataLabels: {
                color: "#ffffff",
                style: {
                  fontSize: "13px",
                  fontWeight: "500",
                  textOutline: "none",
                },
              },
            },
            {
              level: 2,
              colorVariation: { key: "brightness", to: -0.2 },
              dataLabels: {
                color: "#cbd5e1",
                style: {
                  fontSize: "11px",
                  textOutline: "none",
                },
              },
            },
        ],          
    }],
    responsive: {
        rules: [{
            condition: { maxWidth: 480 },
            chartOptions: {
                title: { style: { fontSize: "14px" } },
                tooltip: { enabled: false }, // Hide tooltips on mobile
                series: [{
                    levels: [
                        {
                            level: 1,
                            dataLabels: { enabled: false } // Hide labels for cleaner mobile UI
                        },
                        {
                            level: 2,
                            dataLabels: { enabled: false }
                        }
                    ]
                }]
            }
        }]
    }
};


    return (
        <div className="section" id="expenditure-category-wrapper">
            <h2>Top 5 Expense Categories & Vendors</h2>
            <div className="section" id="expenditure-category-pie-chart">
                <HighchartsReact highcharts={Highcharts} options={options} />
            </div>
        </div>
    );
};

export default ExpendituresCategorySunburstChart;