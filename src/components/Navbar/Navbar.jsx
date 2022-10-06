import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar({ user, handleLogout }) {
  return (
    <div className="nav">
      {/* <Link to="/">
        <img
          className="nav__logo"
          src="https://i.imgur.com/ic7njgq.png"
          alt="landscape terrain logo"
        />
      </Link> */}
      <Link to="/">
        <h1 className="title">Event Wave</h1>
      </Link>

      <div className="nav__nav">
        {!user ? (
          ""
        ) : (
          <Link to="/locations">
            <div className="nav__option">
              <span className="nav__optionLineTwo"> MyEvents</span>
            </div>
          </Link>
        )}
        <Link to={!user && "/login"}>
          <div onClick={handleLogout} className="nav__optionOne">
            <span className="nav__optionLineThree">
              {!user ? "Guest" : user.username}
            </span>
            <span className="nav__optionLineTwo">
              {user ? "SignOut" : "SignIn"}
            </span>
          </div>
        </Link>

        {user ? (
          ""
        ) : (
          <Link to="/signup">
            <div className="nav__option">
              <span className="nav__optionLineOne"></span>
              <span className="nav__optionLineTwo"> Sign Up</span>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}

export default Navbar;
