import React, { useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import './ContributionPieChart.css';

import {
    GRASSROOTED_VIZ_PALETTE,
} from './grassrootedVizTheme';


/* =========================================================
   Normalization Utilities
   ========================================================= */

const normalizeName = (name = '') =>
    name
        .toUpperCase()
        .replace(/[^A-Z\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();


const isPAC = (name = '') =>
    name.includes('PAC') ||
    name.includes('POLITICAL ACTION') ||
    name.includes('COMMITTEE') ||
    name.includes('POLITICAL COMMITTEE') ||
    name.includes('CANDIDATE COMMITTEE');


const isAggregateSmallDollarRow = (name = '') =>
    name.includes('TOTAL') &&
    name.includes('LESS') &&
    name.includes('$50');


/* =========================================================
   Contribution Categorization
   ========================================================= */

const categorizeContribution = ({
    contribution,
    profile,
    candidateNameNormalized,
    otherCandidateSet,
}) => {
    const amount =
        Number(
            contribution[
                profile.contribution_fields.Amount
            ]
        ) || 0;

    const rawDonor =
        contribution[
            profile.contribution_fields.Donor
        ] || '';

    const donorName = normalizeName(rawDonor);

    if (!donorName || amount <= 0) {
        return null;
    }

    if (donorName === candidateNameNormalized) {
        return 'selfFunding';
    }

    if (otherCandidateSet.has(donorName)) {
        return 'otherCandidates';
    }

    if (isPAC(donorName)) {
        return 'pac';
    }

    if (isAggregateSmallDollarRow(donorName)) {
        return 'smallDollar';
    }

    if (amount < 100) {
        return 'smallDollar';
    }

    if (amount >= profile.individual_limit) {
        return 'bigDonor';
    }

    return 'other';
};


/* =========================================================
   Category Configuration
   ========================================================= */

const getCategoryDefinitions = (individualLimit) => [
    {
        key: 'smallDollar',
        label: 'Small Dollar',
        description: 'Individual donations under $100',
    },
    {
        key: 'bigDonor',
        label: 'Large Individual',
        description: `Individual donations of $${individualLimit}+`,
    },
    {
        key: 'pac',
        label: 'PAC / Committee',
        description: 'Political action committees and committees',
    },
    {
        key: 'selfFunding',
        label: 'Self-Funding',
        description: 'Contributions from the candidate',
    },
    {
        key: 'otherCandidates',
        label: 'Other Candidates',
        description: 'Contributions from other candidates',
    },
    {
        key: 'other',
        label: 'Other',
        description: 'Contributions not otherwise categorized',
    },
];


/* =========================================================
   Component
   ========================================================= */

function ContributionPieChart({
    profile,
    contribution_data = [],
    profiles = [],
    selectedDateRange,
}) {

    /* =====================================================
       Date Filtering
       ===================================================== */

    const filteredData = useMemo(() => {
        if (selectedDateRange === 'all') {
            return contribution_data;
        }

        if (
            !selectedDateRange?.start ||
            !selectedDateRange?.end
        ) {
            return contribution_data;
        }

        const { start, end } = selectedDateRange;

        return contribution_data.filter(record => {
            const transactionDate = new Date(
                record[
                    profile.contribution_fields
                        .Transaction_Date
                ]
            );

            if (Number.isNaN(transactionDate.getTime())) {
                return false;
            }

            return (
                transactionDate >= start &&
                transactionDate <= end
            );
        });
    }, [
        contribution_data,
        profile,
        selectedDateRange,
    ]);


    /* =====================================================
       Candidate Matching Set
       ===================================================== */

    const candidateNameNormalized = useMemo(
        () => normalizeName(profile.name),
        [profile.name]
    );

    const otherCandidateSet = useMemo(() => {
        return new Set(
            profiles
                .map(candidate =>
                    normalizeName(candidate.name)
                )
                .filter(
                    name =>
                        name &&
                        name !== candidateNameNormalized
                )
        );
    }, [
        profiles,
        candidateNameNormalized,
    ]);


    /* =====================================================
       Category Definitions
       ===================================================== */

    const categoryDefinitions = useMemo(
        () =>
            getCategoryDefinitions(
                profile.individual_limit
            ),
        [profile.individual_limit]
    );


    /* =====================================================
       Aggregate Contributions
       ===================================================== */

    const categoryTotals = useMemo(() => {
        const totals = {
            smallDollar: 0,
            bigDonor: 0,
            pac: 0,
            selfFunding: 0,
            otherCandidates: 0,
            other: 0,
        };

        filteredData.forEach(contribution => {
            const category =
                categorizeContribution({
                    contribution,
                    profile,
                    candidateNameNormalized,
                    otherCandidateSet,
                });

            if (!category) {
                return;
            }

            const amount =
                Number(
                    contribution[
                        profile.contribution_fields
                            .Amount
                    ]
                ) || 0;

            totals[category] += amount;
        });

        return totals;
    }, [
        filteredData,
        profile,
        candidateNameNormalized,
        otherCandidateSet,
    ]);


    /* =====================================================
       Chart Data
       ===================================================== */

    const totalAmount = useMemo(
        () =>
            Object.values(categoryTotals).reduce(
                (sum, value) => sum + value,
                0
            ),
        [categoryTotals]
    );


    const pieChartData = useMemo(() => {
        return categoryDefinitions
            .map((category, index) => ({
                name: category.label,
                key: category.key,
                description: category.description,
                y: categoryTotals[category.key],
                color:
                    GRASSROOTED_VIZ_PALETTE[
                        index
                    ],
            }))
            .filter(category => category.y > 0);
    }, [
        categoryDefinitions,
        categoryTotals,
    ]);


    /* =====================================================
       Highcharts Configuration
       ===================================================== */

    const chartOptions = useMemo(() => ({
        chart: {
            type: 'pie',
            backgroundColor: 'transparent',
            spacing: [10, 10, 10, 10],
        },

        title: {
            text: null,
        },

        credits: {
            enabled: false,
        },

        accessibility: {
            enabled: true,
            point: {
                valueSuffix: ' dollars',
            },
        },

        tooltip: {
            backgroundColor: '#0f172a',
            borderColor: 'rgba(0,255,163,0.3)',
            borderWidth: 1,

            style: {
                color: '#e6edf3',
            },

            useHTML: true,

            formatter: function () {
                const percentage =
                    totalAmount > 0
                        ? (
                            (this.y /
                                totalAmount) *
                            100
                        ).toFixed(2)
                        : '0.00';

                return `
                    <div class="contribution-pie-tooltip">
                        <strong>
                            ${this.point.name}
                        </strong>

                        <br />

                        $${this.y.toLocaleString(
                            'en-US',
                            {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                            }
                        )}

                        <span>
                            (${percentage}%)
                        </span>
                    </div>
                `;
            },
        },

        plotOptions: {
            pie: {
                innerSize: '45%',

                borderColor: '#0b1220',
                borderWidth: 2,

                allowPointSelect: true,
                cursor: 'pointer',

                dataLabels: {
                    enabled: false,
                },

                states: {
                    hover: {
                        brightness: 0.08,
                    },
                },
            },
        },

        legend: {
            align: 'center',
            verticalAlign: 'bottom',
            layout: 'horizontal',

            itemStyle: {
                color: '#cbd5e1',
                fontSize: '12px',
                fontWeight: '500',
            },

            itemHoverStyle: {
                color: '#ffffff',
            },
        },

        series: [
            {
                name: 'Contributions',
                data: pieChartData,
                dataLabels: {
                    enabled: false,
                },
                center: ['50%', '50%'],
            },
        ],

        responsive: {
            rules: [
                {
                    condition: {
                        maxWidth: 480,
                    },

                    chartOptions: {
                        legend: {
                            enabled: false,
                        },
                    },
                },
            ],
        },
    }), [
        pieChartData,
        totalAmount,
    ]);


    /* =====================================================
       Date Range Description
       ===================================================== */

    const dateRangeDescription = useMemo(() => {
        if (
            selectedDateRange === 'all' ||
            !selectedDateRange?.start ||
            !selectedDateRange?.end
        ) {
            return null;
        }

        return `Showing data from ${selectedDateRange.start.toLocaleDateString()} to ${selectedDateRange.end.toLocaleDateString()}`;
    }, [selectedDateRange]);


    /* =====================================================
       Render
       ===================================================== */

    return (
        <section
            className="contribution-pie-chart"
            aria-labelledby="contribution-pie-chart-title"
        >

            <header className="contribution-pie-chart-header">

                <div>
                    <span className="contribution-pie-chart-kicker">
                        Funding Composition
                    </span>

                    <h2
                        id="contribution-pie-chart-title"
                    >
                        Source of Contributions
                    </h2>

                    <p>
                        How reported contributions are
                        distributed across donor categories.
                    </p>
                </div>

                <div className="contribution-pie-chart-total">
                    <span>Total</span>

                    <strong>
                        $
                        {totalAmount.toLocaleString(
                            'en-US',
                            {
                                maximumFractionDigits: 0,
                            }
                        )}
                    </strong>
                </div>

            </header>


            <div
                className="contribution-pie-chart-body"
                id="funding-summary-pie-chart"
            >
                <HighchartsReact
                    highcharts={Highcharts}
                    options={chartOptions}
                />
            </div>


            {dateRangeDescription && (
                <footer className="contribution-pie-chart-meta">
                    {dateRangeDescription}
                </footer>
            )}

        </section>
    );
}

export default ContributionPieChart;