import React, { useState, useRef } from "react";
import "./MembershipList.css";

const MembershipList = ({ expenditure_data }) => {
    const [expanded, setExpanded] = useState(false);
    const listRef = useRef(null);

    const membershipRecords = expenditure_data.filter(
        (record) =>
            record.Category?.toLowerCase().includes("membership") ||
            record.Description?.toLowerCase().includes("membership")
    );

    const uniqueNames = [
        ...new Set(
            membershipRecords
                .map((record) => record.Name)
                .filter(Boolean)
        )
    ].sort((a, b) => b.localeCompare(a));

    const displayedNames = expanded
        ? uniqueNames
        : uniqueNames.slice(0, 10);

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
        <section className="membership-list" ref={listRef}>

            <h2 className="membership-list__title">
                Membership Expenditures
            </h2>

            {uniqueNames.length > 0 ? (
                <>
                    <ul className="membership-list__items">
                        {displayedNames.map((name) => (
                            <li
                                className="membership-list__item"
                                key={name}
                            >
                                {name}
                            </li>
                        ))}
                    </ul>

                    {uniqueNames.length > 10 && (
                        <button
                            className="membership-list__toggle"
                            onClick={toggleExpand}
                            type="button"
                        >
                            {expanded ? "Show Less" : "Show More"}
                        </button>
                    )}
                </>
            ) : (
                <p className="membership-list__empty">
                    No membership payments found.
                </p>
            )}

        </section>
    );
};

export default MembershipList;
