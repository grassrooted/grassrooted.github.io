import React, { useMemo } from "react";
import "./ElectionCycleDropdown.css";

function ElectionCycleDropdown({
    electionCycles = [],
    selectedDateRange,
    setSelectedDateRange,
}) {
    const selectedIndex = useMemo(() => {
        if (!selectedDateRange || !electionCycles.length) {
            return -1;
        }

        return electionCycles.findIndex(
            cycle =>
                cycle.start.getTime() === selectedDateRange.start.getTime() &&
                cycle.end.getTime() === selectedDateRange.end.getTime()
        );
    }, [electionCycles, selectedDateRange]);

    const handleDateRangeChange = event => {
        const cycleIndex = Number(event.target.value);

        if (cycleIndex === -1) {
            if (!electionCycles.length) return;

            setSelectedDateRange({
                start: electionCycles[0].start,
                end: electionCycles[electionCycles.length - 1].end,
            });

            return;
        }

        const selectedCycle = electionCycles[cycleIndex];

        if (selectedCycle) {
            setSelectedDateRange(selectedCycle);
        }
    };

    const formatDate = date =>
        date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });

    return (
        <div className="election-cycle-filter">
            <label
                htmlFor="date-range"
                className="election-cycle-filter-label"
            >
                Election Cycle
            </label>

            <div className="election-cycle-select-wrapper">
                <select
                    id="date-range"
                    className="election-cycle-select"
                    value={selectedIndex === -1 ? -1 : selectedIndex}
                    onChange={handleDateRangeChange}
                    disabled={!electionCycles.length}
                >
                    <option value={-1}>
                        All Data
                    </option>

                    {electionCycles.map((cycle, index) => (
                        <option
                            key={`${cycle.start.getTime()}-${cycle.end.getTime()}`}
                            value={index}
                        >
                            {formatDate(cycle.start)}
                            {" — "}
                            {formatDate(cycle.end)}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

export default ElectionCycleDropdown;