import React from "react";
import "./ProfileSnapshot.css";

function ProfileSnapshot({ profile }) {
    return (
        <article className="profileSnapshot">

            <h2 className="profile-snapshot-name">
                {profile.name}
            </h2>

            <img
                className="profile-headshot"
                src={`${process.env.PUBLIC_URL}${profile.path_to_headshot_photo}`}
                alt={`${profile.name} headshot`}
            />

            <div className="profile-district">
                Council District {profile.district}
            </div>

            <div className="profile-election-info">

                <div className="profile-election">
                    <span className="profile-election-label">
                        First Election
                    </span>

                    <strong>
                        {profile.first_election}
                    </strong>
                </div>

                <div className="profile-election profile-election-next">
                    <span className="profile-election-label">
                        Next Election
                    </span>

                    <strong>
                        {profile.next_election}
                    </strong>
                </div>

            </div>

        </article>
    );
}

export default ProfileSnapshot;