import '../About.css'

function About() {
    return (
        <div className='about-detail'>
            <h1>About Grassrooted</h1>
            <h2>Municipal Campaign Finance Transparency</h2>

            <div className='about-section'>
                <h3>Our Mission</h3>
                <p>
                    Grassrooted is a city-level campaign finance transparency platform focused on municipal elections in Dallas, Austin, and San Antonio, Texas.
                    We transform public city council campaign finance disclosures into structured, searchable, and comparable civic data.
                </p>
                <p>
                    Our mission is to lower the barrier to understanding local campaign finance reporting while enabling journalists, researchers, and residents to analyze fundraising patterns, PAC contributions, donor concentration, vendor spending, and contribution limit exceedances within Texas municipal elections.
                </p>
                <p className="emphasis">
                    Grassrooted does not publish accusations. It publishes structured campaign finance comparisons.
                </p>
            </div>

            <div className='about-section'>
                <h3>The Problem with Municipal Campaign Finance Data</h3>
                <p>
                    City council campaign finance records are public under Texas law. However, in practice, municipal campaign finance filings are fragmented across reports, inconsistently formatted, difficult to aggregate, and rarely compared across candidates in a standardized way.
                </p>
                <p>
                    National platforms provide transparency infrastructure at the federal and state level, but systematic analysis of municipal campaign finance data remains limited.
                </p>
                <p>
                    City councils shape zoning, housing, development, infrastructure, and public safety policy. Yet structured, continuously updated campaign finance analysis at the city level is uncommon. Grassrooted exists to build that civic infrastructure.
                </p>
            </div>

            <div className='about-section'>
                <h3>What Makes Grassrooted Different</h3>
                <ul>
                    <li>PAC contribution comparisons across city council candidates</li>
                    <li>Vendor aggregation and top-vendor spending analysis</li>
                    <li>Donor aggregation and average contribution metrics</li>
                    <li>Detection of campaign contribution limit threshold exceedances</li>
                    <li>Geographic donor concentration mapping</li>
                    <li>External (non-district and out-of-city) funding flow analysis</li>
                    <li>Volunteer vs. donor expenditure comparisons</li>
                    <li>Self-reimbursement visibility within campaign expenditures</li>
                </ul>
                <p>
                    Each candidate is evaluated using identical financial metrics and standardized methodology.
                    Grassrooted does not rank candidates by ideology, party affiliation, or endorsement.
                </p>
            </div>

            <div className='about-section'>
                <h3>Methodology & Data Integrity</h3>
                <p>
                    All campaign finance data published on Grassrooted originates from official municipal campaign finance disclosures filed with Texas cities including Dallas, Austin, and San Antonio.
                </p>
                <p>
                    Our process includes structured data normalization, donor and vendor aggregation, calculation of contribution limit exceedances based on published municipal limits, and standardized visual comparisons across candidates within each city.
                </p>
                <p>
                    Our methodology is publicly documented. If errors are identified in data processing, classification logic, or aggregation methods, corrections are issued and revisions are documented transparently.
                </p>

                <strong>Contribution Limits</strong>
                <ul>
                    <li>Contribution limits are stored per candidate profile.</li>
                    <li>Limits may change by city and election year.</li>
                    <li>Historical limit versioning is not yet fully implemented.</li>
                    <li>Special municipal elections are not separately modeled at this time.</li>
                </ul>

                <p>
                    All financial totals are presented in nominal dollars and are not adjusted for inflation.
                </p>

                <p>
                    Contribution categories are determined using rule-based classification logic derived from donor name text, contribution amount, and jurisdiction-specific contribution limits. Because donor names are reported as free-text entries in public filings, classification is deterministic and uniformly applied but may not capture every organizational structure perfectly.
                </p>
            </div>

            <div className='about-section'>
                <h3>Threshold Exceedances & Campaign Finance Patterns</h3>
                <p>
                    Grassrooted highlights statistical outliers, aggregated donor totals that exceed stated municipal contribution limits, and measurable funding concentration patterns.
                </p>
                <p>
                    The platform distinguishes between lawful high-dollar fundraising and measurable financial concentration. Legally compliant campaigns are not labeled negatively. Grassrooted presents data comparisons; interpretation remains the responsibility of journalists, researchers, and readers.
                </p>
            </div>

            <div className='about-section'>
                <h3>Financial Concentration & Representation</h3>
                <p>
                    Grassrooted documents measurable financial dynamics such as donor wealth concentration, geographic clustering of campaign contributions, PAC funding reliance, and external funding inflows into city council races.
                </p>
                <p>
                    These metrics are presented to support informed public evaluation of how municipal campaign finance structures align with broad community participation.
                </p>
            </div>

            <div className='about-section'>
                <h3>Privacy & Public Data Use</h3>
                <p>
                    Grassrooted uses only information contained within official public municipal campaign finance filings. No additional personal profiling, enrichment, or private data collection is conducted.
                </p>
            </div>

            <div className='about-section'>
                <h3>Primary Audience</h3>
                <p>
                    Grassrooted is built to support local journalists, investigative reporters, civic researchers, and policy analysts covering Texas municipal elections. It also serves voters seeking structured visibility into city council campaign finance activity.
                </p>
            </div>

            <div className='about-section'>
                <h3>Institutional Vision</h3>
                <p>
                    Grassrooted is being developed as long-term municipal campaign finance transparency infrastructure. Long-term goals include expanding into additional Texas cities, strengthening data normalization, enhancing donor aggregation methods, and maintaining open, reviewable analytical standards.
                </p>
            </div>

            <div className='about-section'>
                <h3>Commitment to Nonpartisanship</h3>
                <p>
                    Grassrooted does not endorse candidates, political parties, or policy positions. All city council candidates are evaluated using identical campaign finance metrics and analytical standards. The platform is committed to neutrality, transparency, and methodological consistency.
                </p>
            </div>
        </div>
    );
}

export default About;
