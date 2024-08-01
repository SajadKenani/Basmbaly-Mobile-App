import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ring from "./images/ring.png";

const UPPER = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center", padding: "45px 40px 25px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
        <img
          className="w-8"
          src={location.pathname === "/notification" ? ring : ring}
          alt="Notification"
          onClick={() => navigate("/notification")}
          style={{ cursor: "pointer" }}
        />
         <p style={{ fontWeight: "800", fontFamily: "Tajawal", fontSize: "24px", color: "#BD6939", margin: "0", display: "flex", alignItems: "center" }}> <p style={{fontSize: "16px", marginTop: "4px", marginRight: "6px", color: "black"}}> تطبيق المدير  </p> :بصملي</p>
      </div>
    </div>
  );
};

export default UPPER;
