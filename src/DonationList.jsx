import React, { useState, useRef } from "react";
import "./DonationList.css";

const DonationList = ({ expenditure_data }) => {
    const [expanded, setExpanded] = useState(false);
    const listRef = useRef(null);

    const donationExpenditureData = expenditure_data.filter(
        (record) =>
            record.Category?.toLowerCase().includes("donation") ||
            record.Description?.toLowerCase().includes("donation") ||
            record.Category?.toLowerCase().includes("donate") ||
            record.Description?.toLowerCase().includes("donate")
    );

    const donationTotals = donationExpenditureData.reduce((acc, record) => {
        if (!record.Name) return acc;

        if (!acc[record.Name]) {
            acc[record.Name] = 0;
        }

        acc[record.Name] += Number(record.Amount) || 0;

        return acc;
    }, {});

    const sortedNames = Object.keys(donationTotals).sort(
        (a, b) => donationTotals[b] - donationTotals[a]
    );


    const displayedNames = expanded
        ? sortedNames
        : sortedNames.slice(0, 10);

    const toggleExpand = () => {
        if (expanded) {
            listRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

        setExpanded(!expanded);
    };

    return (
        <section
            className="donation-list"
            ref={listRef}
        >
            <h2 className="donation-list__title">
                Donation Expenditures
            </h2>

            {sortedNames.length > 0 ? (
                <>
                    <ul className="donation-list__items">
                        {displayedNames.map((name) => (
                            <li
                                key={name}
                                className="donation-list__item"
                            >
                                <span className="donation-list__name">
                                    {name}
                                </span>

                                <span className="donation-list__amount">
                                    ${donationTotals[name].toFixed(2)}
                                </span>
                            </li>
                        ))}
                    </ul>

                    {sortedNames.length > 10 && (
                        <button
                            type="button"
                            className="donation-list__toggle"
                            onClick={toggleExpand}
                        >
                            {expanded ? "Show Less" : "Show More"}
                        </button>
                    )}
                </>
            ) : (
                <p className="donation-list__empty">
                    No donation payments found.
                </p>
            )}
        </section>
    );
};

export default DonationList;