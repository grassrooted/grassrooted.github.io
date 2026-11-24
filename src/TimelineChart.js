
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
} from 'chart.js';

import 'chartjs-adapter-date-fns';
import './TimelineChart.css';

import {
    GRASSROOTED_VIZ_PALETTE,
} from "./grassrootedVizTheme";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
);


function aggregateCumulativeData(profile, data, transactionType) {
    const dailyTotals = {};

    data.forEach(record => {
        const type = (record.Transaction_Type || "").toLowerCase();

        if (!type.includes(transactionType)) return;

        const date = record[
            profile.contribution_fields.Transaction_Date
        ].split(' ')[0];

        const amount = Number(
            record[profile.contribution_fields.Amount]
        ) || 0;

        dailyTotals[date] = (dailyTotals[date] || 0) + amount;
    });

    let cumulativeTotal = 0;

    return Object.keys(dailyTotals)
        .sort((a, b) => new Date(a) - new Date(b))
        .map(date => {
            cumulativeTotal += dailyTotals[date];

            return {
                x: new Date(date),
                y: cumulativeTotal
            };
        });
}


function TimelineChart({
    profile,
    contribution_data,
    expenditure_data
}) {
    const campaignContributions = aggregateCumulativeData(
        profile,
        contribution_data,
        'campaign'
    );

    const officeholderContributions = aggregateCumulativeData(
        profile,
        contribution_data,
        'officeholder'
    );

    const campaignExpenditures = aggregateCumulativeData(
        profile,
        expenditure_data,
        'campaign'
    );

    const officeholderExpenditures = aggregateCumulativeData(
        profile,
        expenditure_data,
        'officeholder'
    );

    const data = {
        datasets: [
            {
                label: 'Campaign Contributions ($)',
                data: campaignContributions,
                backgroundColor: GRASSROOTED_VIZ_PALETTE[0],
                borderColor: GRASSROOTED_VIZ_PALETTE[0],
                borderWidth: 2,
                pointRadius: 0,
                fill: false
            },
            {
                label: 'Officeholder Contributions ($)',
                data: officeholderContributions,
                backgroundColor: GRASSROOTED_VIZ_PALETTE[1],
                borderColor: GRASSROOTED_VIZ_PALETTE[1],
                borderWidth: 2,
                pointRadius: 0,
                fill: false
            },
            {
                label: 'Campaign Expenditures ($)',
                data: campaignExpenditures,
                backgroundColor: GRASSROOTED_VIZ_PALETTE[4],
                borderColor: GRASSROOTED_VIZ_PALETTE[4],
                borderWidth: 2,
                pointRadius: 0,
                fill: false
            },
            {
                label: 'Officeholder Expenditures ($)',
                data: officeholderExpenditures,
                backgroundColor: GRASSROOTED_VIZ_PALETTE[5],
                borderColor: GRASSROOTED_VIZ_PALETTE[5],
                borderWidth: 2,
                pointRadius: 0,
                fill: false
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'month'
                },
                title: {
                    display: true,
                    text: 'Transaction Date'
                }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Cumulative Amount ($)'
                },
                ticks: {
                    callback: value =>
                        '$' + value.toLocaleString()
                }
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'top'
            },
            tooltip: {
                callbacks: {
                    label: context =>
                        `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`
                }
            }
        }
    };

    return (
        <div className='section' id="timeline">
            <h2>Cumulative Contributions vs Expenditures</h2>
            <h4>
                <i>
                    Tracking campaign and officeholder financial
                    activity over time.
                </i>
            </h4>

            <div className="timeline-chart-container">
                <Line data={data} options={options} />
            </div>
        </div>
    );
}

export default TimelineChart;
