import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar.jsx";
import Scene from "../../components/Scene.js/Scene.jsx";

const LandingPage = ({ user, handleLogout }) => {
  return (
    <>
      <Navbar user={user} handleLogout={handleLogout} />
      <Scene />
    </>
  );
};

export default LandingPage;
