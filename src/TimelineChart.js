import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';
import './TimelineChart.css';
import {
    GRASSROOTED_VIZ_PALETTE,
  } from "./grassrootedVizTheme";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale);

function aggregateCumulativeData(profile, data) {
    const aggregatedData = [];
    let cumulativeTotal = 0;

    const sortedData = data.map(record => ({
        date: new Date(record[profile.contribution_fields.Transaction_Date].split(' ')[0]),
        amount: record[profile.contribution_fields.Amount]
    })).sort((a, b) => a.date - b.date);

    sortedData.forEach(entry => {
        cumulativeTotal += entry.amount;
        aggregatedData.push({ x: entry.date, y: cumulativeTotal });
    });

    return aggregatedData;
}

function TimelineChart({ profile, contribution_data, expenditure_data }) {
    const cumulativeContributions = aggregateCumulativeData(profile, contribution_data);
    const cumulativeExpenditures = aggregateCumulativeData(profile, expenditure_data);

    const data = {
        datasets: [
            {
                label: 'Contributions ($)',
                data: cumulativeContributions,
                backgroundColor: GRASSROOTED_VIZ_PALETTE[0],
                borderColor: GRASSROOTED_VIZ_PALETTE[0],
                borderWidth: 1,
                pointStyle: false,
                fill: false
            },
            {
                label: 'Expenditures ($)',
                data: cumulativeExpenditures,
                backgroundColor: GRASSROOTED_VIZ_PALETTE[4],
                borderColor: GRASSROOTED_VIZ_PALETTE[4],
                borderWidth: 1,
                pointStyle: false,
                fill: false
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
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
                title: {
                    display: true,
                    text: 'Cumulative Amount ($)'
                }
            }
        },
        plugins: {
            legend: {
                display: true
            }
        }
    };

    return (
        <div className='section' id="timeline">
            <h2>Cumulative Contributions vs Cumulative Expenditures</h2>
            <h4><i>Tracking cumulative totals over time.</i></h4>
            <div className="timeline-chart-container">
                <Line data={data} options={options} />
            </div>
        </div>
    );
}

export default TimelineChart;
