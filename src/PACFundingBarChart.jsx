import React, { useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import "./PACFundingBarChart.css";


/*
 * Determine whether a contributor is a PAC / committee.
 */
function isPAC(name = "") {
    const normalized = name.toUpperCase();

    return (
        normalized.includes("PAC") ||
        normalized.includes("POLITICAL ACTION") ||
        normalized.includes("COMMITTEE") ||
        normalized.includes("POLITICAL COMMITTEE") ||
        normalized.includes("CANDIDATE COMMITTEE")
    );
}


const PACFundingBarChart = ({
    allContributions = [],
}) => {

    /*
     * Filter contributions from PACs / committees.
     */
    const pacContributions = useMemo(() => {
        return allContributions.filter(contribution =>
            isPAC(contribution.Name || "")
        );
    }, [allContributions]);


    /*
     * Aggregate PAC contributions by campaign.
     */
    const recipientPACTotals = useMemo(() => {
        return pacContributions.reduce((acc, contribution) => {

            const recipient =
                contribution.Campaign ||
                contribution.Recipient ||
                "Unknown";

            const amount =
                Number(contribution.Amount) || 0;

            if (amount <= 0) {
                return acc;
            }

            acc[recipient] =
                (acc[recipient] || 0) + amount;

            return acc;

        }, {});
    }, [pacContributions]);


    /*
     * Determine which recipients received no PAC funding.
     */
    const recipientsWithoutPACFunding = useMemo(() => {

        const allRecipients = [
            ...new Set(
                allContributions.map(
                    contribution =>
                        contribution.Campaign ||
                        contribution.Recipient ||
                        "Unknown"
                )
            ),
        ];

        return allRecipients.filter(
            recipient =>
                !recipientPACTotals[recipient]
        );

    }, [
        allContributions,
        recipientPACTotals,
    ]);


    /*
     * Sort recipients from highest to lowest PAC funding.
     */
    const sortedRecipients = useMemo(() => {

        return Object.entries(recipientPACTotals)
            .sort((a, b) => b[1] - a[1]);

    }, [recipientPACTotals]);


    /*
     * Highcharts configuration.
     */
    const chartOptions = useMemo(() => {

        return {

            chart: {
                type: "bar",
                backgroundColor: "transparent",

                spacing: [
                    10,
                    10,
                    10,
                    10,
                ],
            },


            title: {
                text: null,
            },


            xAxis: {
                type: "category",

                lineColor:
                    "rgba(148, 163, 184, 0.15)",

                tickColor:
                    "rgba(148, 163, 184, 0.15)",

                labels: {
                    style: {
                        color: "#cbd5e1",
                        fontSize: "12px",
                    },
                },
            },


            yAxis: {
                min: 0,

                title: {
                    text: "PAC contributions",

                    style: {
                        color: "#94a3b8",
                        fontSize: "12px",
                    },
                },

                gridLineColor:
                    "rgba(148, 163, 184, 0.08)",

                labels: {
                    style: {
                        color: "#94a3b8",
                        fontSize: "11px",
                    },

                    formatter: function () {
                        return "$" +
                            Number(this.value)
                                .toLocaleString("en-US");
                    },
                },
            },


            tooltip: {
                backgroundColor: "#0f172a",

                borderColor:
                    "rgba(0, 255, 163, 0.3)",

                borderWidth: 1,

                style: {
                    color: "#e6edf3",
                },

                formatter: function () {

                    return `
                        <b>${this.point.name}</b><br/>
                        <span style="color:#94a3b8">
                            PAC contributions
                        </span><br/>
                        <b>
                            $${Number(this.y).toLocaleString(
                                "en-US",
                                {
                                    maximumFractionDigits: 0,
                                }
                            )}
                        </b>
                    `;
                },
            },


            plotOptions: {
                series: {

                    borderWidth: 0,

                    pointPadding: 0.12,
                    groupPadding: 0.08,

                    cursor: "default",

                    dataLabels: {
                        enabled: true,

                        formatter: function () {
                            return "$" +
                                Number(this.y)
                                    .toLocaleString("en-US", {
                                        maximumFractionDigits: 0,
                                    });
                        },

                        align: "right",

                        style: {
                            color: "#e5e7eb",
                            fontSize: "11px",
                            fontWeight: "600",
                            textOutline: "none",
                        },
                    },

                    states: {
                        hover: {
                            brightness: 0.08,
                        },
                    },
                },
            },


            legend: {
                enabled: false,
            },


            credits: {
                enabled: false,
            },


            series: [
                {
                    name: "PAC contributions",

                    color:
                        "rgba(0, 255, 163, 0.8)",

                    data: sortedRecipients.map(
                        ([recipient, amount]) => ({
                            name: recipient,
                            y: amount,
                        })
                    ),
                },
            ],


            responsive: {
                rules: [
                    {
                        condition: {
                            maxWidth: 600,
                        },

                        chartOptions: {

                            yAxis: {
                                title: {
                                    text: null,
                                },
                            },

                            plotOptions: {
                                series: {
                                    dataLabels: {
                                        enabled: false,
                                    },
                                },
                            },
                        },
                    },
                ],
            },
        };

    }, [sortedRecipients]);


    /*
     * Nothing to display if there are no contributions.
     */
    if (!allContributions.length) {
        return null;
    }


    return (
        <section
            className="pac-funding"
            aria-labelledby="pac-funding-title"
        >

            {/* =========================================
                Header
            ========================================= */}

            <div className="pac-funding-header">

                <div>

                    <h2 id="pac-funding-title">
                        PAC Contributions
                    </h2>

                    <p>
                        Total contributions from PACs and
                        political committees received by each
                        council campaign during the selected
                        period.
                    </p>

                </div>

            </div>


            {/* =========================================
                Chart
            ========================================= */}

            {sortedRecipients.length > 0 ? (

                <div className="pac-funding-chart">

                    <HighchartsReact
                        highcharts={Highcharts}
                        options={chartOptions}
                    />

                </div>

            ) : (

                <div className="pac-funding-empty">
                    No PAC contributions found.
                </div>

            )}


            {/* =========================================
                Recipients Without PAC Funding
            ========================================= */}

            {recipientsWithoutPACFunding.length > 0 && (

                <div className="pac-funding-no-pac">

                    <h3>
                        Campaigns Without PAC Contributions
                    </h3>

                    <ul>

                        {recipientsWithoutPACFunding.map(
                            recipient => (
                                <li key={recipient}>
                                    {recipient}
                                </li>
                            )
                        )}

                    </ul>

                </div>

            )}

        </section>
    );
};


export default PACFundingBarChart;