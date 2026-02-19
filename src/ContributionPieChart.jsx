import React, { useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import './ContributionPieChart.css';
import {
  GRASSROOTED_VIZ_PALETTE,
} from "./grassrootedVizTheme";

/* ================================
   Normalization Utilities
================================ */

const normalizeName = (name = "") =>
  name
    .toUpperCase()
    .replace(/[^A-Z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const isPAC = (name) => {
  return (
    name.includes("PAC") ||
    name.includes("POLITICAL ACTION") ||
    name.includes("COMMITTEE") ||
    name.includes("POLITICAL COMMITTEE") ||
    name.includes("CANDIDATE COMMITTEE")
  );
};

const isAggregateSmallDollarRow = (name) => {
  return (
    name.includes("TOTAL") &&
    name.includes("LESS") &&
    name.includes("$50")
  );
};

/* ================================
   🎯 Reusable Categorization Logic
================================ */

const categorizeContribution = ({
  contribution,
  profile,
  candidateNameNormalized,
  otherCandidateSet,
}) => {
  const amount = Number(
    contribution[profile.contribution_fields.Amount]
  ) || 0;

  const rawDonor =
    contribution[profile.contribution_fields.Donor] || "";

  const donorName = normalizeName(rawDonor);

  if (!donorName || amount <= 0) return null;

  // Self Funding
  if (donorName === candidateNameNormalized) {
    return "selfFunding";
  }

  // Other Candidates
  if (otherCandidateSet.has(donorName)) {
    return "otherCandidates";
  }

  // PAC / Committee
  if (isPAC(donorName)) {
    return "pac";
  }

  // Aggregate small-dollar rows
  if (isAggregateSmallDollarRow(donorName)) {
    return "smallDollar";
  }

  // Individual Small Dollar
  if (amount < 100) {
    return "smallDollar";
  }

  // Individual Large Donor
  if (amount >= profile.individual_limit) {
    return "bigDonor";
  }

  // Everything else
  return "other";
};

/* ================================
 Component
================================ */

function ContributionPieChart({
  profile,
  contribution_data,
  profiles,
  selectedDateRange,
}) {

  /* --------------------------------
     Filter by date range
  -------------------------------- */

  const filteredData = useMemo(() => {
    if (selectedDateRange === 'all') {
      return contribution_data;
    }

    const { start, end } = selectedDateRange;

    return contribution_data.filter((record) => {
      const transactionDate = new Date(
        record[profile.contribution_fields.Transaction_Date]
      );
      return transactionDate >= start && transactionDate <= end;
    });
  }, [contribution_data, profile, selectedDateRange]);

  /* --------------------------------
     Categorization Totals
  -------------------------------- */

  const categories = useMemo(() => {
    const candidateNameNormalized = normalizeName(profile.name);

    const otherCandidateSet = new Set(
      profiles
        ?.map((candidate) => normalizeName(candidate.name))
        .filter((name) => name !== candidateNameNormalized)
    );

    const categoryTotals = {
      smallDollar: 0,
      bigDonor: 0,
      pac: 0,
      selfFunding: 0,
      otherCandidates: 0,
      other: 0,
    };

    filteredData.forEach((contribution) => {
      const category = categorizeContribution({
        contribution,
        profile,
        candidateNameNormalized,
        otherCandidateSet,
      });

      if (!category) return;

      const amount =
        Number(contribution[profile.contribution_fields.Amount]) || 0;

      categoryTotals[category] += amount;
    });

    return categoryTotals;
  }, [filteredData, profile, profiles]);

  /* --------------------------------
     Chart Construction
  -------------------------------- */

  const legend = [
    'Small Dollar (Individual Donations <$100)',
    `Large Dollar (Individual Donations of $${profile.individual_limit}+)`,
    'PAC',
    'Self-Funding',
    'Other Candidates',
    'Other',
  ];

  const totalAmount = Object.values(categories).reduce(
    (sum, value) => sum + value,
    0
  );

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
        innerSize: "45%",
        borderColor: "#0b1220",
        borderWidth: 2,
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: { enabled: false },
        states: {
          hover: { brightness: 0.08 },
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

    series: [
      {
        name: "Contributions",
        data: pieChartData,
        dataLabels: { enabled: false },
        center: ['50%', '50%'],
      },
    ],

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

      {selectedDateRange !== 'all' && (
        <h4>
          <i>
            Showing data from{" "}
            {selectedDateRange.start.toLocaleDateString()} to{" "}
            {selectedDateRange.end.toLocaleDateString()}
          </i>
        </h4>
      )}
    </div>
  );
}

export default ContributionPieChart;
