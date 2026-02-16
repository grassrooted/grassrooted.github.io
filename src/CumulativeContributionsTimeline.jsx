import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import './CumulativeContributionsTimeline.css';

function CumulativeContributionsTimeline({ cityProfileData, selectedDateRange }) {
    const civicColorPalette = [
        "#00FFA3", // primary accent green
        "#3B82F6", // civic blue
        "#F59E0B", // muted amber
        "#A78BFA", // institutional violet
        "#F43F5E", // restrained red
        "#22D3EE", // cool cyan
        "#84CC16", // analytical lime
        "#FB7185", // soft rose
      ];

    const chartData = useMemo(() => {
        const datasets = cityProfileData.map((profile, index) => {
            const contributions = profile.contributions || [];
            const filteredContributions = selectedDateRange === 'all'
                ? contributions
                : contributions.filter(contribution => {
                    const contributionDate = new Date(contribution[profile.contribution_fields.Transaction_Date]);
                    return contributionDate >= selectedDateRange.start && contributionDate <= selectedDateRange.end;
                });

            const cumulativeData = [];
            let cumulativeSum = 0;

            filteredContributions
                .sort((a, b) => new Date(a[profile.contribution_fields.Transaction_Date]) - new Date(b[profile.contribution_fields.Transaction_Date]))
                .forEach(contribution => {
                    cumulativeSum += contribution[profile.contribution_fields.Amount];
                    cumulativeData.push({
                        x: new Date(contribution[profile.contribution_fields.Transaction_Date]),
                        y: cumulativeSum,
                    });
                });

            return {
                label: profile.name,
                data: cumulativeData,
                borderColor: civicColorPalette[index % civicColorPalette.length],
                backgroundColor: civicColorPalette[index % civicColorPalette.length] + "22", 
                borderWidth: 3,
                tension: 0.35,
                fill: false,
                pointRadius: 0,
                pointHoverRadius: 4,
            };
        });

        return {
            datasets,
        };
    }, [cityProfileData, selectedDateRange]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
      
        interaction: {
          mode: "index",
          intersect: false,
        },
      
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#cbd5e1",
              usePointStyle: true,
              pointStyle: "circle",
              padding: 20,
            },
          },
          tooltip: {
            backgroundColor: "#0f172a",
            borderColor: "rgba(0,255,163,0.3)",
            borderWidth: 1,
            titleColor: "#ffffff",
            bodyColor: "#e6edf3",
            callbacks: {
              label: context =>
                `${context.dataset.label}: $${context.raw.y.toLocaleString()}`,
            },
          },
        },
      
        scales: {
          x: {
            type: "time",
            time: {
              unit: "month",
              tooltipFormat: "MMM dd, yyyy",
            },
            ticks: {
              color: "#94a3b8",
            },
            grid: {
              color: "rgba(255,255,255,0.05)",
            },
            title: {
              display: true,
              text: "Date",
              color: "#cbd5e1",
            },
          },
      
          y: {
            ticks: {
              color: "#94a3b8",
              callback: value => "$" + value.toLocaleString(),
            },
            grid: {
              color: "rgba(255,255,255,0.05)",
            },
            title: {
              display: true,
              text: "Cumulative Contributions ($)",
              color: "#cbd5e1",
            },
          },
        },
      };
      

    return (
        <div id="timeline-graph-container">
            <h2 id="timeline-graph-title">Cumulative Contribution Timeline</h2>
            <p id="timeline-graph-description">
                This graph shows the cumulative contributions received by each candidate over time.
            </p>
            <div id="cumulative-contributions-line-chart-wrapper">
                <Line data={chartData} options={options} width="100%"/>
            </div>
            <div className="scrollable-legend">
                <div className="chartjs-legend">
                </div>
            </div>
        </div>
    );
}

export default CumulativeContributionsTimeline;
