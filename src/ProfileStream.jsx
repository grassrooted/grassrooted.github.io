import React from "react";
import { NavLink } from "react-router-dom";
import ProfileSnapshot from "./ProfileSnapshot";
import "./ProfileStream.css";

const ProfileStream = ({ cityId, cityProfileData = [] }) => {
    if (!cityProfileData.length) {
        return (
            <section className="profile-stream">
                <div className="profile-stream-empty">
                    <span>No councilmember profiles available.</span>
                </div>
            </section>
        );
    }

    return (
        <section className="profile-stream" aria-label="Councilmember profiles">
            <div className="profile-stream-grid">
                {cityProfileData.map(profile => (
                    <NavLink
                        key={profile.id}
                        to={`/cities/${cityId}/profiles/${profile.id}`}
                        className={({ isActive }) =>
                            `profile-stream-link ${
                                isActive
                                    ? "profile-stream-link-active"
                                    : ""
                            }`
                        }
                    >
                        <ProfileSnapshot profile={profile} />
                    </NavLink>
                ))}
            </div>
        </section>
    );
};

export default ProfileStream;