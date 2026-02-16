import React, { useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import './ContributionPieChart.css';
import {
  GRASSROOTED_VIZ_PALETTE,
} from "./grassrootedVizTheme";

function ContributionPieChart({ profile, contribution_data, profiles, selectedDateRange }) {
    const filteredData = useMemo(() => {
        if (selectedDateRange === 'all') {
            return contribution_data;
        }
        const { start, end } = selectedDateRange;
        return contribution_data.filter(record => {
            const transactionDate = new Date(record[profile.contribution_fields.Transaction_Date]);
            return transactionDate >= start && transactionDate <= end;
        });
    }, [contribution_data, profile, selectedDateRange]);

    const categories = useMemo(() => {
        const smallDollarLimit = 100;
        const bigDonorLimit = profile.individual_limit;
        const candidateName = profile.name.toLowerCase();
        const otherCandidateNames = profiles?.map(candidate => candidate.name.toLowerCase()) || [];

        let categoryTotals = {
            smallDollar: 0,
            bigDonor: 0,
            pac: 0,
            selfFunding: 0,
            otherCandidates: 0,
            other: 0,
        };

        filteredData.forEach((contribution) => {
            const amount = contribution[profile.contribution_fields.Amount];
            const donorName = contribution[profile.contribution_fields.Donor].toLowerCase();
            const donorNameParts = donorName.split(",");
            const donorLastName = donorNameParts[0]?.trim();
            const donorFirstName = donorNameParts[1]?.trim();
            const formattedDonorName = `${donorFirstName} ${donorLastName}`.toLowerCase();

            if (donorName === candidateName || formattedDonorName === candidateName) {
                categoryTotals.selfFunding += amount;
            } else if (otherCandidateNames.includes(donorName) || otherCandidateNames.includes(formattedDonorName)) {
                categoryTotals.otherCandidates += amount;
            } else if (donorName.includes("pac") || donorName.includes("committee")) {
                categoryTotals.pac += amount;
            } else if (donorName.toUpperCase().includes("TOTAL POLITICAL CONTRIBUTIONS OF $50 OR LESS") || donorName.toUpperCase().includes("TOTAL OFFICEHOLDER CONTRIBUTIONS OF $50 OR LESS")) {
                categoryTotals.smallDollar += amount;
            } else if (amount < smallDollarLimit) {
                categoryTotals.smallDollar += amount;
            } else if (amount >= bigDonorLimit) {
                categoryTotals.bigDonor += amount;
            } else {
                categoryTotals.other += amount;
            }
        });

        return categoryTotals;
    }, [filteredData, profile, profiles]);

    const legend = [
        'Small Dollar (Individual Donations <$100)',
        `Large Dollar (Individual Donations of $${profile.individual_limit}+)`,
        'PAC',
        'Self-Funding',
        'Other Candidates',
        'Other'
    ];

    const totalAmount = Object.values(categories).reduce((sum, value) => sum + value, 0);

    const pieChartData = legend.map((label, index) => ({
        name: label,
        y: categories[Object.keys(categories)[index]],
        color: GRASSROOTED_VIZ_PALETTE[index],
    }));

    const options = {
        chart: {
            type: "pie",
            backgroundColor: "transparent",
            spacing: [10, 10, 10, 10],
        },
      
        title: { text: null },
      
        tooltip: {
          backgroundColor: "#0f172a",
          borderColor: "rgba(0,255,163,0.3)",
          borderWidth: 1,
          style: { color: "#e6edf3" },
          formatter: function () {
            return `
              <b>${this.point.name}</b><br/>
              $${this.y.toLocaleString()} 
              (${((this.y / totalAmount) * 100).toFixed(2)}%)
            `;
          },
        },
      
        plotOptions: {
          pie: {
            innerSize: "45%", // 👈 converts to donut (much cleaner)
            borderColor: "#0b1220",
            borderWidth: 2,
            allowPointSelect: true,
            cursor: "pointer",
      
            dataLabels: {
              enabled: false, // 👈 remove tiny cluttered labels
            },
      
            states: {
              hover: {
                brightness: 0.08,
              },
            },
          },
        },
      
        legend: {
          align: "center",
          verticalAlign: "bottom",
          layout: "horizontal",
          itemStyle: {
            color: "#cbd5e1",
            fontSize: "12px",
            fontWeight: "500",
          },
          itemHoverStyle: {
            color: "#ffffff",
          },
        },
      
        series: [{
                name: "Contributions",
                data: pieChartData,
                dataLabels: { enabled: false },
                center: ['50%', '50%']
        }],
      
        responsive: {
          rules: [
            {
              condition: { maxWidth: 480 },
              chartOptions: {
                legend: { enabled: false },
              },
            },
          ],
        },
      };
      
    return (
        <div className="section" id="contribution-pie-chart-wrapper">
            <h2>Source of Contributions</h2>
            <div id="funding-summary-pie-chart">
                <HighchartsReact highcharts={Highcharts} options={options} />
            </div>
            <h4><i>Showing data from {selectedDateRange.start.toLocaleDateString()} to {selectedDateRange.end.toLocaleDateString()}</i></h4>
        </div>
    );
}

export default ContributionPieChart;
