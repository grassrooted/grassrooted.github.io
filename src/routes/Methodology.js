import '../About.css'
import { Helmet } from "react-helmet";

function Methodology() {
    return (
        <div className='about-detail'>

            <Helmet>
                <title>Methodology | Municipal Campaign Finance Data Processing | Grassrooted</title>

                <meta
                    name="description"
                    content="Learn how Grassrooted processes, verifies, and standardizes municipal campaign finance data across Dallas, Austin, and San Antonio. Transparent methodology for contribution limits, PAC detection, and donor aggregation."
                />

                <meta
                    name="keywords"
                    content="municipal campaign finance methodology, city council finance data processing, campaign contribution limits Texas, PAC detection method, campaign finance verification, donor aggregation logic"
                />

                <link rel="canonical" href="https://www.grassrootedtx.com/methodology" />

                <script type="application/ld+json">
                    {`
                    {
                      "@context": "https://schema.org",
                      "@type": "TechArticle",
                      "headline": "Municipal Campaign Finance Data Processing Methodology",
                      "description": "Documentation of how Grassrooted processes, validates, and publishes municipal campaign finance data.",
                      "author": {
                        "@type": "Organization",
                        "name": "Grassrooted"
                      },
                      "publisher": {
                        "@type": "Organization",
                        "name": "Grassrooted"
                      }
                    }
                    `}
                </script>
            </Helmet>

            <h1>Grassrooted Methodology</h1>
            <h2>Municipal Campaign Finance Transparency</h2>

            <div className='about-section'>
                <h3>1. Scope & Jurisdictions</h3>
                <p>
                    Grassrooted processes official campaign finance disclosures from Dallas, Austin, and San Antonio, Texas.
                    Each jurisdiction maintains distinct reporting formats, contribution limits, and election cycle structures.
                </p>
                <p>
                    Jurisdiction-specific configuration files define election day, cycle duration, and contribution limit thresholds.
                    Special municipal elections are currently excluded from analysis.
                </p>
            </div>

            <div className='about-section'>
                <h3>2. Data Sources</h3>
                <p>
                    All data originates from official municipal campaign finance filings published by the respective city governments.
                    Grassrooted does not collect private or non-public data.
                </p>
                <p>
                    Only publicly filed campaign finance reports are processed and standardized.
                </p>
            </div>

            <div className='about-section'>
                <h3>3. Data Ingestion & Processing Workflow</h3>
                <p>
                    Campaign finance PDFs are manually downloaded from official municipal websites and processed locally.
                </p>
                <p>
                    A local Python server parses text-readable PDF filings through a structured API that extracts:
                </p>
                <ul>
                    <li>Contribution totals</li>
                    <li>Itemized donor records</li>
                    <li>Vendor expenditure records</li>
                    <li>Reporting period metadata</li>
                </ul>
                <p>
                    Only text-readable PDFs are currently supported. OCR processing for scanned filings is planned for future implementation.
                </p>
                <p>
                    Before publication, parsed totals are reconciled against reported totals. Datasets are only eligible for release if reconciliation checks pass.
                    If mismatches occur, fields are manually reviewed and corrected prior to publication.
                </p>
            </div>

            <div className='about-section'>
                <h3>4. Data Normalization & Standardization</h3>
                <p>
                    To enable structured comparison across candidates and jurisdictions:
                </p>
                <ul>
                    <li>Dates are normalized to ISO format.</li>
                    <li>Currency values are converted to numeric format.</li>
                    <li>Donor names are standardized for aggregation.</li>
                    <li>Election cycles are determined using jurisdiction-specific configuration files.</li>
                </ul>
                <p>
                    Dallas and San Antonio operate on two-year election cycles.
                    Austin operates on four-year cycles.
                </p>
            </div>

            <div className='about-section'>
                <h3>5. Aggregation Logic</h3>
                <p>
                    Contributions are aggregated by donor per candidate within a defined election cycle.
                    Vendor expenditures are aggregated by vendor per candidate.
                </p>
                <p>
                    Aggregation enables structured comparisons including:
                </p>
                <ul>
                    <li>Contribution threshold exceedance detection</li>
                    <li>Vendor concentration analysis</li>
                    <li>Donor funding concentration patterns</li>
                    <li>Cumulative daily fundraising totals</li>
                </ul>
                <p>
                    All aggregation logic is deterministic and uniformly applied.
                </p>
            </div>

            <div className='about-section'>
                <h3>6. Contribution Limit Evaluation</h3>
                <p>
                    Contribution limits are stored per jurisdiction and candidate profile.
                    Total donor contributions within an election cycle are compared against applicable municipal limits.
                </p>
                <p>
                    Grassrooted identifies numerical exceedances based on published limits.
                    The platform does not make legal determinations.
                </p>
                <p>
                    Historical limit versioning is not yet fully implemented.
                    All financial totals are presented in nominal dollars and are not adjusted for inflation.
                </p>
            </div>

            <div className='about-section'>
                <h3>7. Classification System</h3>
                <p>
                    Contribution categories are determined using rule-based classification logic derived from donor name text,
                    contribution amount, and jurisdiction-specific limits.
                </p>
                <ul>
                    <li>Small-dollar contributions</li>
                    <li>Large-dollar contributions</li>
                    <li>PAC contributions (name-based detection)</li>
                    <li>Self-funding (normalized name matching)</li>
                    <li>Contributions from other candidates</li>
                    <li>Other / unclassified</li>
                </ul>
                <p>
                    PAC identification currently relies on name-based indicators.
                    Committee ID matching is not yet implemented.
                </p>
                <p>
                    Self-funding detection uses normalized full-name matching and is under ongoing refinement.
                </p>
            </div>

            <div className='about-section'>
                <h3>8. Geographic Data Handling</h3>
                <p>
                    Grassrooted processes geographic information contained within official public filings.
                </p>
                <ul>
                    <li>Full street addresses are not published.</li>
                    <li>Truncated latitude/longitude coordinates are used for visualization.</li>
                    <li>Geographic precision is intentionally reduced to limit privacy exposure.</li>
                </ul>
                <p>
                    No additional geolocation enrichment or private data is added.
                </p>
            </div>

            <div className='about-section'>
                <h3>9. Edit Logs & Human Review</h3>
                <p>
                    Structured edit logs document when parsed fields are manually corrected.
                </p>
                <ul>
                    <li>Original parsed value</li>
                    <li>Updated value</li>
                    <li>Timestamp of modification</li>
                </ul>
                <p>
                    Edit logs are currently maintained internally and may be published publicly in future updates.
                    Human review is used solely to correct parsing discrepancies.
                </p>
            </div>

            <div className='about-section'>
                <h3>10. Update Frequency</h3>
                <p>
                    Data is refreshed after each official municipal reporting period.
                </p>
                <p>
                    Processing scripts are currently executed locally.
                    Future funding would allow public deployment of processing tools and user-facing upload capabilities.
                </p>
            </div>

            <div className='about-section'>
                <h3>11. Limitations</h3>
                <ul>
                    <li>Only text-readable PDFs are currently supported.</li>
                    <li>OCR support for scanned filings is planned.</li>
                    <li>PAC detection relies on name matching.</li>
                    <li>Special elections are excluded.</li>
                    <li>Historical contribution limit versioning is limited.</li>
                    <li>Financial totals are not inflation-adjusted.</li>
                </ul>
            </div>

            <div className='about-section'>
                <h3>12. Governance & Neutrality</h3>
                <p>
                    Grassrooted does not endorse candidates, political parties, or policy positions.
                </p>
                <p>
                    All candidates are evaluated using identical metrics and analytical standards.
                    The platform is committed to neutrality, transparency, and methodological consistency.
                </p>
            </div>

        </div>
    );
}

export default Methodology;
