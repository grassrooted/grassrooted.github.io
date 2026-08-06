import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import "./PACFundingBarChart.css";

const PACFundingBarChart = ({ allContributions }) => {
    // Filter contributions from PACs / committees
    const pacContributions = useMemo(() => {
        console.log(allContributions)
        return allContributions.filter((contribution) => {
            const donor = (contribution.Name || "").toLowerCase();

            return (
                donor.includes("pac") ||
                donor.includes("committee")
            );
        });
    }, [allContributions]);

    // Aggregate PAC contributions by recipient
    const recipientPACTotals = useMemo(() => {
        return pacContributions.reduce((acc, contribution) => {
            const recipient = contribution.Recipient || "Unknown";

            acc[recipient] = (acc[recipient] || 0) + (contribution.Amount || 0);

            return acc;
        }, {});
    }, [pacContributions]);

    // Determine which recipients received no PAC funding
    const recipientsWithoutPACFunding = useMemo(() => {
        const allRecipients = [
            ...new Set(
                allContributions.map(
                    (contribution) => contribution.Recipient || "Unknown"
                )
            ),
        ];

        return allRecipients.filter(
            (recipient) => !recipientPACTotals[recipient]
        );
    }, [allContributions, recipientPACTotals]);

    // Sort recipients by PAC funding
    const sortedRecipients = Object.entries(recipientPACTotals).sort(
        (a, b) => b[1] - a[1]
    );

    const chartData = {
        labels: sortedRecipients.map(([recipient]) => recipient),
        datasets: [
            {
                label: "Total PAC Contributions ($)",
                data: sortedRecipients.map(([, amount]) => amount),
                backgroundColor: "rgba(0, 255, 163, 0.8)",
                borderRadius: 6,
                barThickness: 18,
            },
        ],
    };

    return (
        <div id="PACFundingBarChartWrapper">
            <h2>PAC Contributions by Recipient</h2>

            {sortedRecipients.length > 0 ? (
                <div className="chart-container">
                    <Bar
                        data={chartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            indexAxis: "y",
                            plugins: {
                                legend: {
                                    display: false,
                                },
                                tooltip: {
                                    callbacks: {
                                        label: (context) =>
                                            `$${context.raw.toLocaleString()}`,
                                    },
                                },
                            },
                            scales: {
                                x: {
                                    ticks: {
                                        color: "#e6edf3",
                                        callback: (value) =>
                                            "$" + value.toLocaleString(),
                                    },
                                    grid: {
                                        color: "rgba(255,255,255,0.05)",
                                    },
                                },
                                y: {
                                    ticks: {
                                        color: "#e6edf3",
                                        autoSkip: false,
                                    },
                                    grid: {
                                        display: false,
                                    },
                                },
                            },
                        }}
                    />
                </div>
            ) : (
                <p>No PAC contributions found.</p>
            )}

            {recipientsWithoutPACFunding.length > 0 && (
                <div className="p-2 bg-gray-800 rounded">
                    <h3 className="text-lg font-semibold">
                        Recipients Without PAC Contributions:
                    </h3>
                    <ul className="list-disc pl-5">
                        {recipientsWithoutPACFunding.map((recipient) => (
                            <li key={recipient}>{recipient}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default PACFundingBarChart;