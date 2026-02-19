import '../About.css'

function About() {
    return (
        <div className='about-detail'>
            <h1>About Grassrooted</h1>

            <div className='about-section'>
                <h3>Our Mission</h3>
                <p>
                    Grassrooted is a city-level campaign finance transparency platform designed to transform municipal disclosure records into structured, accessible, and comparable civic data.
                </p>
                <p>
                    Our mission is to lower the barrier to understanding local campaign finance while enabling journalists, researchers, and residents to identify funding patterns, financial concentration trends, and policy threshold exceedances within municipal elections.
                </p>
                <p className="emphasis">
                    Grassrooted does not publish accusations. It publishes structured comparisons.
                </p>
            </div>

            <div className='about-section'>
                <h3>The Problem</h3>
                <p>
                    Campaign finance records for city elections are public. However, in practice, they are fragmented across filings, inconsistently formatted, difficult to aggregate, and rarely compared across candidates.
                </p>
                <p>
                    While national platforms such as OpenSecrets provide high-quality federal and state-level transparency infrastructure, comparable tools rarely exist at the municipal level.
                </p>
                <p>
                    City councils shape zoning, housing, infrastructure, development, and public safety policy. Yet systematic, structured, and continuously updated analysis of city-level campaign finance remains limited. Grassrooted exists to fill that gap.
                </p>
            </div>

            <div className='about-section'>
                <h3>What Makes Grassrooted Different</h3>
                <ul>
                    <li>PAC contribution comparisons</li>
                    <li>Vendor aggregation and top-vendor comparisons</li>
                    <li>Donor aggregation and average contribution analysis</li>
                    <li>Detection of contribution threshold exceedances</li>
                    <li>Geographic concentration mapping</li>
                    <li>External (non-district) funding flow analysis</li>
                    <li>Volunteer vs. donor expenditure comparisons</li>
                    <li>Self-reimbursement pattern visibility</li>
                </ul>
                <p>
                    Each candidate is evaluated using identical metrics and standardized methodology. Grassrooted does not rank candidates by ideology or endorsement.
                </p>
            </div>

            <div className='about-section'>
                <h3>Methodology & Data Integrity</h3>
                <p>
                    All data published on Grassrooted originates from official municipal campaign finance disclosures across Texas.
                </p>
                <p>
                    Our process includes structured data normalization, donor and vendor aggregation, calculation of policy threshold exceedances based on published limits, and standardized visual comparisons across candidates.
                </p>
                <p>
                    Our methodology is publicly documented. If errors are identified in data processing or interpretation, corrections are issued and revisions are documented.
                </p>
            </div>

            <div className='about-section'>
                <h3>On Threshold Exceedances & Financial Patterns</h3>
                <p>
                    Grassrooted highlights statistical outliers, funding concentration patterns, and contribution amounts that exceed stated policy thresholds.
                </p>
                <p>
                    Interpretation remains the responsibility of journalists, researchers, and readers. Legally compliant high-dollar campaigns are not penalized or labeled negatively. The platform distinguishes between lawful fundraising levels and measurable financial concentration patterns.
                </p>
            </div>

            <div className='about-section'>
                <h3>Financial Concentration & Representation</h3>
                <p>
                    Grassrooted documents measurable financial dynamics such as concentration of donor wealth, geographic clustering of contributions, and external funding inflows.
                </p>
                <p>
                    These metrics are presented to support informed evaluation of how campaign finance structures align with broad community participation.
                </p>
            </div>

            <div className='about-section'>
                <h3>Privacy & Data Use</h3>
                <p>
                    Grassrooted uses only information contained within official public campaign finance filings. No additional personal profiling is conducted.
                </p>
            </div>

            <div className='about-section'>
                <h3>Primary Audience</h3>
                <p>
                    Grassrooted is built primarily to support local journalists, investigative reporters, and policy researchers. Secondarily, it serves curious voters and civic observers seeking structured visibility into municipal elections.
                </p>
            </div>

            <div className='about-section'>
                <h3>Institutional Vision</h3>
                <p>
                    Grassrooted is being developed as sustainable civic infrastructure for municipal transparency. Long-term goals include expanding across additional Texas municipalities, supporting data-driven journalism, and maintaining open, reviewable analytical standards.
                </p>
            </div>

            <div className='about-section'>
                <h3>Commitment to Nonpartisanship</h3>
                <p>
                    Grassrooted does not endorse candidates, political parties, or policy positions. All candidates are evaluated using identical metrics. The platform is committed to neutrality, transparency, and methodological consistency.
                </p>
            </div>
        </div>
    );
}

export default About;
