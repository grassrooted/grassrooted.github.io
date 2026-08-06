import React, { useEffect, useState } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator.min.css";
import "./FinancialRecordsTable.css";

function parseLocalDate(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
}
function FinancialRecordsTable({
    profile,
    selectedDateRange,
    schedules,
}) {
    const scheduleNames = Object.keys(schedules).filter(
    (schedule) =>
        Array.isArray(schedules[schedule]) &&
        schedules[schedule].length > 0
    );

    const [activeTab, setActiveTab] = useState(
        scheduleNames[0] ?? ""
    );

    const buildColumns = (data) => {
        if (!data.length) return [];

    const hiddenFields = new Set([
        "latitude",
        "longitude",
        "record_id",
        "Schedule",
        "recipient_id"
    ]);

    const fields = new Set();

    data.forEach((record) => {
        Object.keys(record).forEach((field) => {
            if (!hiddenFields.has(field)) {
                fields.add(field);
            }
        });
    });

        const columns = [];

        const preferredOrder = [
            "Name",
            "Amount",
            "Transaction_Date",
            "Category",
            "Description",
            "Recipient",
            "Address",
            "City_State_Zip",
            "Transaction_Type",
            "Source",
        ];

        const orderedFields = [
            ...preferredOrder.filter(field => fields.has(field)),
            ...[...fields].filter(field => !preferredOrder.includes(field)),
        ];

        for (const field of orderedFields) {

            const column = {
                title: field
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, c => c.toUpperCase()),
                field,
                headerFilter: true,
            };

            if (field === "Amount") {
                column.formatter = "money";
            }

            if (field === "Transaction_Date") {
                column.sorter = (a, b) => a - b;
                column.formatter = (cell) =>
                    cell.getValue()?.toLocaleDateString("en-US");
            }

            columns.push(column);
        }

        return columns;
    };

    useEffect(() => {
        const tableElement = document.getElementById("financial-records-table");
        if (!tableElement) return;

        let table;

        const preprocessData = (data) =>
            data.map((record) => {
                const processed = { ...record };

                if (processed.Transaction_Date) {
                    processed.Transaction_Date = parseLocalDate(
                        processed.Transaction_Date
                    );
                }

                return processed;
            });

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

        const rawData = schedules[activeTab] ?? [];

        const processed = preprocessData(rawData);

        tableData = filterDataByDate(
            processed,
            "Transaction_Date"
        );

        columns = buildColumns(tableData);
        
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
        schedules,
        selectedDateRange,
    ]);

  return (
    <div className="section" id="financial-records-wrapper">
      <h2>Financial Records</h2>

      {/* Tabs */}
      <div id="financial-tabs">
        {scheduleNames.map((schedule) => (
            <button
                key={schedule}
                className={
                    activeTab === schedule
                        ? "active"
                        : ""
                }
                onClick={() => setActiveTab(schedule)}
            >
                {schedule
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
        ))}
      </div>

      <div
        id="financial-records-table"
        style={{ height: "600px" }}
      />
    </div>
  );
}

export default FinancialRecordsTable;
