
import React, { useMemo, useState } from 'react';
import './CrossCampaignDonors.css';

function normalizeName(name) {
    if (!name) return '';

    return name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');
}

function formatDate(dateString) {
    if (!dateString) return '—';

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
    });
}

function formatAmount(amount) {
    if (amount === null || amount === undefined || amount === '') {
        return '—';
    }

    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount)) {
        return amount;
    }

    return numericAmount.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
    });
}

function CrossCampaignDonors({
    contributions = [],
    selectedDateRange,
}) {
    const [selectedPair, setSelectedPair] = useState(null);
    const [selectedDonor, setSelectedDonor] = useState(null);

    /*
     * Filter contributions to the election cycle selected
     * on the city page.
     */
    const filteredContributions = useMemo(() => {
        if (!selectedDateRange) return [];

        const start = selectedDateRange.start.getTime();
        const end = selectedDateRange.end.getTime();

        return contributions.filter(record => {
            if (!record.Transaction_Date) return false;

            const date = new Date(record.Transaction_Date);

            if (Number.isNaN(date.getTime())) return false;

            const time = date.getTime();

            return time >= start && time <= end;
        });
    }, [contributions, selectedDateRange]);

    /*
     * Map normalized donor names to their ORIGINAL records,
     * grouped by candidate.
     */
    const donorRecords = useMemo(() => {
        const map = new Map();

        filteredContributions.forEach(record => {
            const donorName = normalizeName(record.Name);
            const recipientId = record.recipient_id;

            if (!donorName || !recipientId) return;

            if (!map.has(donorName)) {
                map.set(donorName, new Map());
            }

            const recordsByCandidate = map.get(donorName);

            if (!recordsByCandidate.has(recipientId)) {
                recordsByCandidate.set(recipientId, []);
            }

            recordsByCandidate
                .get(recipientId)
                .push(record);
        });

        return map;
    }, [filteredContributions]);

    /*
     * Candidates represented in the selected period.
     */
    const candidates = useMemo(() => {
        const candidateMap = new Map();

        filteredContributions.forEach(record => {
            if (!record.recipient_id) return;

            if (!candidateMap.has(record.recipient_id)) {
                candidateMap.set(record.recipient_id, {
                    id: record.recipient_id,
                    name: record.Recipient || record.recipient_id,
                });
            }
        });

        return Array.from(candidateMap.values())
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [filteredContributions]);

    /*
     * Build candidate overlap matrix.
     */
    const overlapMatrix = useMemo(() => {
        const matrix = new Map();

        candidates.forEach(candidateA => {
            candidates.forEach(candidateB => {
                const key = `${candidateA.id}|${candidateB.id}`;

                matrix.set(
                    key,
                    candidateA.id === candidateB.id ? null : 0
                );
            });
        });

        donorRecords.forEach(recordsByCandidate => {
            const ids = Array.from(recordsByCandidate.keys());

            for (let i = 0; i < ids.length; i++) {
                for (let j = i + 1; j < ids.length; j++) {
                    const candidateA = ids[i];
                    const candidateB = ids[j];

                    const keyAB = `${candidateA}|${candidateB}`;
                    const keyBA = `${candidateB}|${candidateA}`;

                    matrix.set(
                        keyAB,
                        (matrix.get(keyAB) ?? 0) + 1
                    );

                    matrix.set(
                        keyBA,
                        (matrix.get(keyBA) ?? 0) + 1
                    );
                }
            }
        });

        return matrix;
    }, [candidates, donorRecords]);

    /*
     * Total number of donor names appearing across
     * multiple campaigns.
     */
    const multiCampaignDonorCount = useMemo(() => {
        return Array.from(donorRecords.values())
            .filter(recordsByCandidate => recordsByCandidate.size > 1)
            .length;
    }, [donorRecords]);

    /*
     * Maximum overlap value used for heatmap intensity.
     */
    const maxOverlap = useMemo(() => {
        let max = 0;

        overlapMatrix.forEach(value => {
            if (value !== null && value > max) {
                max = value;
            }
        });

        return max;
    }, [overlapMatrix]);

    /*
     * Retrieve shared donors and preserve their original
     * records for both candidates.
     */
    const getSharedDonors = (candidateA, candidateB) => {
        const sharedDonors = [];

        donorRecords.forEach((recordsByCandidate, normalizedName) => {
            if (
                recordsByCandidate.has(candidateA.id) &&
                recordsByCandidate.has(candidateB.id)
            ) {
                sharedDonors.push({
                    normalizedName,

                    recordsByCandidate: {
                        [candidateA.id]:
                            recordsByCandidate.get(candidateA.id),

                        [candidateB.id]:
                            recordsByCandidate.get(candidateB.id),
                    },
                });
            }
        });

        return sharedDonors.sort((a, b) =>
            a.normalizedName.localeCompare(b.normalizedName)
        );
    };

    /*
     * Select a campaign pair.
     */
    const handleCellClick = (candidateA, candidateB) => {
        if (candidateA.id === candidateB.id) return;

        const sharedDonors = getSharedDonors(
            candidateA,
            candidateB
        );

        setSelectedPair({
            candidateA,
            candidateB,
            sharedDonors,
        });
    };

    /*
     * Open the evidence modal for a specific donor.
     */
    const handleDonorClick = donor => {
        setSelectedDonor(donor);
    };

    /*
     * Close the evidence modal.
     */
    const closeDonorModal = () => {
        setSelectedDonor(null);
    };

    /*
     * Close modal when clicking the backdrop.
     */
    const handleModalBackdropClick = event => {
        if (event.target === event.currentTarget) {
            closeDonorModal();
        }
    };

    /*
     * Escape key support.
     */
    React.useEffect(() => {
        if (!selectedDonor) return;

        const handleKeyDown = event => {
            if (event.key === 'Escape') {
                closeDonorModal();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener(
                'keydown',
                handleKeyDown
            );
        };
    }, [selectedDonor]);

    const getCellIntensity = value => {
        if (!value || !maxOverlap) return 0;

        return value / maxOverlap;
    };

    if (!filteredContributions.length) {
        return (
            <section className="cross-campaign-donors">
                <h2>Donors Across Campaigns</h2>

                <p>
                    No contribution records are available for
                    the selected period.
                </p>
            </section>
        );
    }

    if (!candidates.length) {
        return (
            <section className="cross-campaign-donors">
                <h2>Donors Across Campaigns</h2>

                <p>
                    No councilmember contribution records were found.
                </p>
            </section>
        );
    }

    return (
        <>
            <section className="cross-campaign-donors">

                <div className="cross-campaign-donors-header">
                    <h2>Donors Across Campaigns</h2>

                    <p>
                        <strong>
                            {multiCampaignDonorCount.toLocaleString()}
                        </strong>{' '}
                        identified donor names appear across multiple
                        council campaigns during the selected election cycle.
                    </p>

                    <p className="cross-campaign-donors-methodology">
                        Donors are currently matched using normalized names.
                        Different names reported for the same individual may
                        not be matched.
                    </p>
                </div>

                <div className="donor-overlap-container">

                    <div className="donor-overlap-legend">
                        <span>Fewer shared names</span>

                        <div className="donor-overlap-legend-scale">
                            {[0.15, 0.35, 0.55, 0.75, 1].map(
                                opacity => (
                                    <span
                                        key={opacity}
                                        className="donor-overlap-legend-cell"
                                        style={{ opacity }}
                                    />
                                )
                            )}
                        </div>

                        <span>More shared names</span>
                    </div>

                    <div className="donor-overlap-table-wrapper">
                        <table className="donor-overlap-table">
                            <thead>
                                <tr>
                                    <th scope="col"></th>

                                    {candidates.map(candidate => (
                                        <th
                                            key={candidate.id}
                                            scope="col"
                                            title={candidate.name}
                                        >
                                            {candidate.name}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {candidates.map(rowCandidate => (
                                    <tr key={rowCandidate.id}>
                                        <th
                                            scope="row"
                                            title={rowCandidate.name}
                                        >
                                            {rowCandidate.name}
                                        </th>

                                        {candidates.map(columnCandidate => {
                                            const overlap =
                                                overlapMatrix.get(
                                                    `${rowCandidate.id}|${columnCandidate.id}`
                                                );

                                            if (overlap === null) {
                                                return (
                                                    <td
                                                        key={columnCandidate.id}
                                                        className="donor-overlap-diagonal"
                                                    >
                                                        —
                                                    </td>
                                                );
                                            }

                                            const intensity =
                                                getCellIntensity(overlap);

                                            return (
                                                <td
                                                    key={columnCandidate.id}
                                                    className="donor-overlap-cell"
                                                    style={{
                                                        '--overlap-opacity':
                                                            0.12 +
                                                            intensity * 0.88,
                                                    }}
                                                    title={`${overlap.toLocaleString()} shared donor names`}
                                                >
                                                    <button
                                                        type="button"
                                                        className="donor-overlap-button"
                                                        onClick={() =>
                                                            handleCellClick(
                                                                rowCandidate,
                                                                columnCandidate
                                                            )
                                                        }
                                                    >
                                                        {overlap.toLocaleString()}
                                                    </button>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {selectedPair && (
                    <div className="shared-donor-results">

                        <div className="shared-donor-results-header">
                            <h3>
                                {selectedPair.candidateA.name}
                                {' ↔ '}
                                {selectedPair.candidateB.name}
                            </h3>

                            <p>
                                <strong>
                                    {selectedPair.sharedDonors.length.toLocaleString()}
                                </strong>{' '}
                                shared donor names
                            </p>
                        </div>

                        <div className="shared-donor-list">

                            {selectedPair.sharedDonors.map(donor => {
                                /*
                                 * Use the original reported name rather
                                 * than displaying the normalized matching key.
                                 */
                                const firstRecord =
                                    donor.recordsByCandidate[
                                        selectedPair.candidateA.id
                                    ]?.[0];

                                const displayName =
                                    firstRecord?.Name ||
                                    donor.normalizedName;

                                return (
                                    <button
                                        key={donor.normalizedName}
                                        type="button"
                                        className="shared-donor-name shared-donor-button"
                                        onClick={() =>
                                            handleDonorClick(donor)
                                        }
                                    >
                                        {displayName}
                                    </button>
                                );
                            })}

                        </div>
                    </div>
                )}

            </section>

            {/*
             * =====================================================
             * Evidence Modal
             * =====================================================
             */}

            {selectedDonor && selectedPair && (
                <div
                    className="donor-evidence-modal-backdrop"
                    onMouseDown={handleModalBackdropClick}
                    role="presentation"
                >
                    <div
                        className="donor-evidence-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="donor-evidence-title"
                    >

                        <div className="donor-evidence-modal-header">

                            <div>
                                <span className="donor-evidence-kicker">
                                    Contribution Evidence
                                </span>

                                <h2 id="donor-evidence-title">
                                    {selectedDonor.recordsByCandidate[
                                        selectedPair.candidateA.id
                                    ]?.[0]?.Name ||
                                        selectedDonor.recordsByCandidate[
                                            selectedPair.candidateB.id
                                        ]?.[0]?.Name ||
                                        selectedDonor.normalizedName}
                                </h2>

                                <p>
                                    Shared donor name between{' '}
                                    <strong>
                                        {selectedPair.candidateA.name}
                                    </strong>{' '}
                                    and{' '}
                                    <strong>
                                        {selectedPair.candidateB.name}
                                    </strong>
                                </p>
                            </div>

                            <button
                                type="button"
                                className="donor-evidence-close"
                                onClick={closeDonorModal}
                                aria-label="Close evidence"
                            >
                                ×
                            </button>

                        </div>

                        <div className="donor-evidence-modal-body">

                            {[
                                selectedPair.candidateA,
                                selectedPair.candidateB,
                            ].map(candidate => {
                                const records =
                                    selectedDonor.recordsByCandidate[
                                        candidate.id
                                    ] || [];

                                return (
                                    <section
                                        key={candidate.id}
                                        className="donor-evidence-candidate"
                                    >

                                        <div className="donor-evidence-candidate-header">
                                            <h3>
                                                {candidate.name}
                                            </h3>

                                            <span>
                                                {records.length}{' '}
                                                {records.length === 1
                                                    ? 'record'
                                                    : 'records'}
                                            </span>
                                        </div>

                                        {records.map((record, index) => (
                                            <article
                                                key={
                                                    record.record_id ||
                                                    `${candidate.id}-${index}`
                                                }
                                                className="donor-evidence-record"
                                            >

                                                <div className="donor-evidence-record-grid">

                                                    <div>
                                                        <span>
                                                            Date
                                                        </span>
                                                        <strong>
                                                            {formatDate(
                                                                record.Transaction_Date
                                                            )}
                                                        </strong>
                                                    </div>

                                                    <div>
                                                        <span>
                                                            Amount
                                                        </span>
                                                        <strong className="donor-evidence-amount">
                                                            {formatAmount(
                                                                record.Amount
                                                            )}
                                                        </strong>
                                                    </div>

                                                    <div>
                                                        <span>
                                                            Employer
                                                        </span>
                                                        <strong>
                                                            {record.Employer?.trim() ||
                                                                '—'}
                                                        </strong>
                                                    </div>

                                                    <div>
                                                        <span>
                                                            Occupation
                                                        </span>
                                                        <strong>
                                                            {record.Occupation?.trim() ||
                                                                '—'}
                                                        </strong>
                                                    </div>

                                                </div>

                                                <div className="donor-evidence-record-meta">

                                                    <span>
                                                        Schedule:{' '}
                                                        {record.Schedule ||
                                                            '—'}
                                                    </span>

                                                    <span>
                                                        Page:{' '}
                                                        {record.Page ??
                                                            '—'}
                                                    </span>

                                                    <span>
                                                        Record ID:{' '}
                                                        {record.record_id ||
                                                            '—'}
                                                    </span>

                                                </div>

                                                <div className="donor-evidence-source">
                                                    <span>
                                                        Source
                                                    </span>

                                                    <strong>
                                                        {record.Source ||
                                                            '—'}
                                                    </strong>
                                                </div>

                                            </article>
                                        ))}

                                    </section>
                                );
                            })}

                        </div>

                    </div>
                </div>
            )}
        </>
    );
}

export default CrossCampaignDonors;
