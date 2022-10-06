import React, { useState } from "react";
import userService from "../../utils/userService";
import "./SignupPage.css";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";

export default function SignUpPage(props) {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [state, setState] = useState({
    username: "",
    email: "",
    password: "",
    passwordConf: "",
  });

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await userService.signup(state);
      props.handleSignUpOrLogin(); // <- this will decode the token from local storage

      navigate("/");
    } catch (err) {
      console.log(err.message);
      setError(err.message);
    }
  }

  function handleChange(e) {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  }

  return (
    <>
      <Navbar user={props.user} />
      <div className="login-wrapper">
        <form autoComplete="off" className="form" onSubmit={handleSubmit}>
          <img src="https://i.imgur.com/ic7njgq.png" alt="" />
          <h2>Sign Up</h2>
          <div className="input-group">
            <input
              name="username"
              placeholder="username"
              value={state.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="email"
              value={state.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <input
              name="password"
              type="password"
              placeholder="password"
              value={state.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <input
              name="passwordConf"
              type="password"
              placeholder="Confirm Password"
              value={state.passwordConf}
              onChange={handleChange}
              required
            />
          </div>

          <input type="submit" value="Sign Up" className="submit-btn"></input>
        </form>
      </div>
    </>
  );
}
