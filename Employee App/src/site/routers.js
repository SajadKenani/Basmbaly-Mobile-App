import { Link, useLocation } from "react-router-dom";
import home from "./images/Home.png";
import homeUnselected from "./images/homeUnselected.png"
import account from "./images/profile.png";
import accountUnselected from "./images/account.png"
import addEmployeeUnselected from "./images/addEmployeeUnselected.png"
import addEmployeeSelected from "./images/addEmployeeSelected.png"

export const ROUTERS = () => {
    const location = useLocation();
  
    // Define styles for active and inactive links
    const activeStyle = {
      color: "#BD6939", // Active link color
    };
  
    const inactiveStyle = {
      color: "#696969", // Inactive link color
    };
  
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          bottom: "0px",
          display: "flex",
          justifyContent: "space-around",
          zIndex: "10",
          backgroundColor: "white",
       
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            bottom: "0px",
            padding: "10px 0 10px 0",
            position: "fixed",
            backgroundColor: "white", 
            boxShadow: "10px 10px 10px 10px rgba(0, 0, 0, 0.356)"
          }}
        >
          <div style={{ cursor: "pointer" }}>
            <Link to={"/"} style={location.pathname === "/" || location.pathname === "/employee" || location.pathname === "/employee/tasks" ? activeStyle : inactiveStyle}>
            <div className="flex justify-center">
              <img className="w-6" src={location.pathname === "/" || location.pathname === "/employee" || location.pathname === "/employee/tasks" ? home : homeUnselected} alt="Home" />
            </div>
              <p style={{ fontFamily: "Tajawal", fontSize: "12px", color: "inherit" }}>الرئيسية</p>
            </Link>
          </div>
  
          <div style={{ cursor: "pointer" }}>
            <Link to={"/tasks"} style={location.pathname === "/tasks" ? activeStyle : inactiveStyle}>
            <div className="flex justify-center">
            <img className="w-6" src={location.pathname === "/tasks" || location.pathname === "/add/stageTwo" || location.pathname === "/add/stageThree" || location.pathname === "/add/stageFour" ? addEmployeeSelected : addEmployeeUnselected} alt="Account" />
            </div>
              <p style={{ fontFamily: "Tajawal", fontSize: "12px", color: "inherit" }}>المهام</p>
            </Link>
          </div>
  
          <div style={{ cursor: "pointer" }}>
            <Link to={"/account"} style={location.pathname === "/account" ? activeStyle : inactiveStyle}>
            <div className="flex justify-center">
            <img className="w-6" src={location.pathname === "/account" ? accountUnselected : account} alt="Account" />
            </div>
              <p style={{ fontFamily: "Tajawal", fontSize: "12px", color: "inherit" }}>الحساب</p>
            </Link>
          </div>
        </div>
      </div>
    );
  };