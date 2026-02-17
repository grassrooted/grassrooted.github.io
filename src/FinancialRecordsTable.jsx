import React, { useEffect, useState } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator.min.css";
import "./FinancialRecordsTable.css";
import { CSVLink } from "react-csv";

function FinancialRecordsTable({
    profile,
    selectedDateRange,
    contribution_data,
    expenditure_data,
    }) {
    const [activeTab, setActiveTab] = useState("contributions");

    useEffect(() => {
        const tableElement = document.getElementById("financial-records-table");
        if (!tableElement) return;

        let table;

        const preprocessContributionData = (data) =>
        data.map((record) => ({
            ...record,
            [profile.contribution_fields.Transaction_Date]: new Date(
            record[profile.contribution_fields.Transaction_Date]
            ),
        }));

        const preprocessExpenditureData = (data) =>
        data.map((record) => ({
            ...record,
            Transaction_Date: new Date(record.Transaction_Date),
        }));

        const filterDataByDate = (data, field) => {
        if (selectedDateRange === "all") return data;
        const { start, end } = selectedDateRange;
        return data.filter((record) => {
            const date = record[field];
            return date >= start && date <= end;
        });
        };

        let tableData = [];
        let columns = [];

        if (activeTab === "contributions") {
        const processed = preprocessContributionData(contribution_data);
        tableData = filterDataByDate(
            processed,
            profile.contribution_fields.Transaction_Date
        );

        columns = [
            { 
                title: "Donor", 
                field: "Name", 
                headerFilter: true },
            {
                title: "Amount ($)",
                field: profile.contribution_fields.Amount,
                formatter: "money",
                headerFilter: true,
            },
            {
                title: "Candidate",
                field: profile.contribution_fields.Recipient,
            },
            {
                title: "Date",
                field: profile.contribution_fields.Transaction_Date,
                sorter: (a, b) => {
                    const dateA = a instanceof Date ? a : new Date(a);
                    const dateB = b instanceof Date ? b : new Date(b);
                    return dateA - dateB;
                  },
                formatter: (cell) =>
                    cell.getValue()?.toLocaleDateString("en-US"),
            },
        ];
        }

        if (activeTab === "expenditures") {
        const processed = preprocessExpenditureData(expenditure_data);
        tableData = filterDataByDate(processed, "Transaction_Date");

        columns = [
            { 
                title: "Vendor", 
                field: "Name", 
                headerFilter: true },
            {
                title: "Amount ($)",
                field: "Amount",
                formatter: "money",
                headerFilter: true,
            },
            { 
                title: "Category", 
                field: "Category", 
                headerFilter: true 
            },
            { 
                title: "Description", 
                field: "Description", 
                headerFilter: true },
            {
                title: "Date",
                field: "Transaction_Date",
                sorter: (a, b) => {
                    const dateA = a instanceof Date ? a : new Date(a);
                    const dateB = b instanceof Date ? b : new Date(b);
                    return dateA - dateB;
                  },
                formatter: (cell) =>
                    cell.getValue()?.toLocaleDateString("en-US"),
            },
            {
                title: "Transaction Type",
                field: "Transaction_Type",
                headerFilter: true
            },
            {
                title: "Candidate",
                field: "Recipient",
            },
        ];
        }

        table = new Tabulator(tableElement, {
        data: tableData,
        layout: "fitDataFill",
        columns,
        renderHorizontal: "virtual",
        autoResize: true,
        rowStyles: false,
        });

        return () => table.destroy();
    }, [
        activeTab,
        contribution_data,
        expenditure_data,
        selectedDateRange,
        profile,
    ]);

  const currentData =
    activeTab === "contributions"
      ? contribution_data
      : expenditure_data;

  return (
    <div className="section" id="financial-records-wrapper">
      <h2>Financial Records</h2>

      {/* Tabs */}
      <div id="financial-tabs">
        <button
          className={activeTab === "contributions" ? "active" : ""}
          onClick={() => setActiveTab("contributions")}
        >
          Contributions
        </button>

        <button
          className={activeTab === "expenditures" ? "active" : ""}
          onClick={() => setActiveTab("expenditures")}
        >
          Expenditures
        </button>
      </div>
      
      <div
        id="financial-records-table"
        style={{ height: "600px" }}
      />
    </div>
  );
}

export default FinancialRecordsTable;
