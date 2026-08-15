import React, { useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import "./NearLimitFundingChart.css";

const INDIVIDUAL_LIMIT = 1000;
const PAC_LIMIT = 2500;

const INDIVIDUAL_THRESHOLD = INDIVIDUAL_LIMIT * 0.75; // $750
const PAC_THRESHOLD = PAC_LIMIT * 0.80; // $2,000

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

/*
 * Calculate near-limit funding for each campaign.
 */
function calculateCampaignFunding(contributions) {
    const campaigns = new Map();

    contributions.forEach(record => {
        const campaignId = record.campaign_id || record.campaign_id;

        if (!campaignId) return;

        const amount = Number(record.Amount) || 0;

        if (amount <= 0) return;

        const donorName = record.Name || "";

        /*
         * PACs and individuals have different thresholds.
         */
        const pac = isPAC(donorName);

        const threshold = pac
            ? PAC_THRESHOLD
            : INDIVIDUAL_THRESHOLD;

        /*
         * Ignore self-funding.
         *
         * campaign_id is the campaign identifier, while
         * Campaign / Recipient represents the candidate name
         * depending on how the city schedules were flattened.
         */
        const recipientName =
            record.Campaign ||
            "";

        if (
            donorName.trim() &&
            recipientName.trim() &&
            donorName.trim().toLowerCase() ===
                recipientName.trim().toLowerCase()
        ) {
            return;
        }

        if (!campaigns.has(campaignId)) {
            campaigns.set(campaignId, {
                id: campaignId,
                name:
                    record.Recipient ||
                    record.Campaign ||
                    campaignId,
                totalFunding: 0,
                nearLimitFunding: 0,
            });
        }

        const campaign = campaigns.get(campaignId);

        campaign.totalFunding += amount;

        if (amount >= threshold) {
            campaign.nearLimitFunding += amount;
        }
    });

    return Array.from(campaigns.values())
        .map(campaign => ({
            ...campaign,
            percentage:
                campaign.totalFunding > 0
                    ? (
                        campaign.nearLimitFunding /
                        campaign.totalFunding
                    ) * 100
                    : 0,
        }))
        .filter(campaign => campaign.totalFunding > 0)
        .sort((a, b) => b.percentage - a.percentage);
}

function NearLimitFundingChart({
    contributions = [],
    selectedDateRange,
}) {
    /*
     * Filter to the city-level election cycle.
     */
    const filteredContributions = useMemo(() => {
        if (!selectedDateRange) {
            return contributions;
        }

        const { start, end } = selectedDateRange;

        if (!start || !end) {
            return contributions;
        }

        const startTime = start.getTime();
        const endTime = end.getTime();

        return contributions.filter(record => {
            if (!record.Transaction_Date) {
                return false;
            }

            const date = new Date(record.Transaction_Date);

            if (Number.isNaN(date.getTime())) {
                return false;
            }

            const time = date.getTime();

            return time >= startTime && time <= endTime;
        });
    }, [contributions, selectedDateRange]);

    /*
     * Calculate campaign-level near-limit funding.
     */
    const campaignData = useMemo(
        () => calculateCampaignFunding(filteredContributions),
        [filteredContributions]
    );

    const chartOptions = useMemo(() => {
        return {
            chart: {
                type: "bar",
                backgroundColor: "transparent",
                spacing: [10, 10, 10, 10],
            },

            title: {
                text: null,
            },

            xAxis: {
                type: "category",
                lineColor: "rgba(148, 163, 184, 0.15)",
                tickColor: "rgba(148, 163, 184, 0.15)",

                labels: {
                    style: {
                        color: "#cbd5e1",
                        fontSize: "12px",
                    },
                },
            },

            yAxis: {
                min: 0,
                max: 100,

                title: {
                    text: "Percentage of contribution funding",
                    style: {
                        color: "#94a3b8",
                        fontSize: "12px",
                    },
                },

                gridLineColor: "rgba(148, 163, 184, 0.08)",

                labels: {
                    format: "{value}%",
                    style: {
                        color: "#94a3b8",
                        fontSize: "11px",
                    },
                },
            },

            tooltip: {
                backgroundColor: "#0f172a",
                borderColor: "rgba(0, 255, 163, 0.3)",
                borderWidth: 1,

                style: {
                    color: "#e6edf3",
                },

                formatter: function () {
                    const campaign = campaignData[this.point.index];

                    return `
                        <b>${campaign.name}</b><br/>
                        <span style="color:#94a3b8">
                            Near-limit funding
                        </span><br/>
                        <b>${this.y.toFixed(1)}%</b><br/><br/>
                        <span style="color:#94a3b8">
                            Near-limit:
                        </span>
                        $${campaign.nearLimitFunding.toLocaleString(
                            "en-US",
                            {
                                maximumFractionDigits: 0,
                            }
                        )}<br/>

                        <span style="color:#94a3b8">
                            Total contributions:
                        </span>
                        $${campaign.totalFunding.toLocaleString(
                            "en-US",
                            {
                                maximumFractionDigits: 0,
                            }
                        )}
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
                        format: "{point.y:.1f}%",
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
                    name: "Near-limit funding",

                    data: campaignData.map(campaign => ({
                        name: campaign.name,
                        y: campaign.percentage,
                    })),
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
    }, [campaignData]);

    if (!filteredContributions.length) {
        return null;
    }

    return (
        <section
            className="near-limit-funding"
            aria-labelledby="near-limit-funding-title"
        >
            <div className="near-limit-funding-header">
                <div>
                    <h2 id="near-limit-funding-title">
                        Near-Limit Funding
                    </h2>

                    <p>
                        Percentage of each campaign's contribution
                        funding coming from individual contributions
                        of <strong>$750+</strong> or PAC/committee
                        contributions of <strong>$2,000+</strong>.
                    </p>
                </div>
            </div>

            <div className="near-limit-funding-chart">
                <HighchartsReact
                    highcharts={Highcharts}
                    options={chartOptions}
                />
            </div>

            <div className="near-limit-funding-methodology">
                <span>
                    Individual threshold: $750 (75% of $1,000 limit)
                </span>

                <span>
                    PAC/committee threshold: $2,000 (80% of $2,500 limit)
                </span>
            </div>
        </section>
    );
}

export default NearLimitFundingChart;