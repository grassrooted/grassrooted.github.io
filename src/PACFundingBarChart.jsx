import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import "./PACFundingBarChart.css";

const PACFundingBarChart = ({ allContributions }) => {
  // Filter contributions that come from donors with "PAC" in their name
  const pacContributions = useMemo(() => {
    return allContributions.filter((contribution) =>
      contribution.Name.toLowerCase().includes("pac") || contribution.Name.toLowerCase().includes("committee")
    );
  }, [allContributions]);

  // Aggregate PAC contributions per recipient
  const recipientPACTotals = useMemo(() => {
    return pacContributions.reduce((acc, contribution) => {
      if (!acc[contribution.profileName]) {
        acc[contribution.profileName] = 0;
      }
      acc[contribution.profileName] += contribution.Amount;
      return acc;
    }, {});
  }, [pacContributions]);

  // Identify recipients with no PAC funding
  const recipientsWithoutPACFunding = useMemo(() => {
    const allRecipients = [...new Set(allContributions.map(c => c.profileName))];
    return allRecipients.filter(name => !recipientPACTotals[name]);
  }, [allContributions, recipientPACTotals]);

  // Prepare chart data sorted by PAC contribution amount
  const sortedRecipients = Object.entries(recipientPACTotals).sort((a, b) => b[1] - a[1]);
  const chartData = {
    labels: sortedRecipients.map(([recipient]) => recipient),
    datasets: [
      {
        label: "Total PAC Contributions ($)",
        data: sortedRecipients.map(([_, amount]) => amount),
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
                  display: false, // cleaner look
                },
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      return `$${context.raw.toLocaleString()}`;
                  },},
                },
              },
              scales: {
                x: {
                  ticks: {
                    color: "#e6edf3",
                    callback: function (value) {
                      return "$" + value.toLocaleString();
                    },
                  },
                  grid: {
                    color: "rgba(255,255,255,0.05)",
                  },
                },
                y: {
                  ticks: {
                    color: "#e6edf3",
                    autoSkip: false, // 👈 important for long lists
                  },
                  grid: {
                    display: false,
                  },
                },
              },}} width="100%" />
        </div>
      ) : (
        <p>No PAC contributions found.</p>
      )}
      {recipientsWithoutPACFunding.length > 0 && (
        <div className="p-2 bg-gray-800 rounded">
          <h3 className="text-lg font-semibold">Recipients Without PAC Contributions:</h3>
          <ul className="list-disc pl-5">
            {recipientsWithoutPACFunding.map((name, index) => (
              <li key={index}>{name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PACFundingBarChart;
