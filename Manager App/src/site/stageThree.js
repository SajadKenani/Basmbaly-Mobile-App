import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setEmployeePassword, setStartEmployee } from '../actions/employeeActions'; // Ensure the path is correct
import { useNavigate } from 'react-router-dom';

function STAGETHREE({ fileName }) {
  const dispatch = useDispatch();
  const start = useSelector((state) => state.employee.start);

  const [getPassword, setgetPassword] = useState("");
  const [verifyPassword, setverifyPassword] = useState("");
  const [startworkinput, setstartworkinput] = useState("");
  const [selectedTime, setSelectedTime] = useState(""); // Track selected time
  const navigate = useNavigate();

  const handlePasswordChange = (e) => {
    dispatch(setEmployeePassword(e.target.value));
    setgetPassword(e.target.value);
    handleMatchPassword();
  };

  const handleVerifyPasswordChange = (event) => {
    setverifyPassword(event.target.value);
    handleMatchPassword();
  };

  const handleMatchPassword = () => {
    if (getPassword === "" || verifyPassword !== getPassword) {
      console.log(false);
    } else {
      console.log(true);
    }
  };

  const performTimeSelected = (event) => {
    const selectedTimeValue = event.target.value;
    setSelectedTime(selectedTimeValue); // Update selected time state
    if (selectedTimeValue === "مساءا") {
      dispatch(setStartEmployee(Number(startworkinput) + 12));
    } else if (selectedTimeValue === "صباحا") {
      dispatch(setStartEmployee(Number(startworkinput)));
    } else {
      dispatch(setStartEmployee(Number(startworkinput))); // Handle default case
    }
  };

  const onSubmit = (event) => {
    event.preventDefault();
    if (getPassword === "" || verifyPassword !== getPassword || selectedTime === "اختر الوقت") {
      // Handle invalid form submission, possibly show an error message
      return;
    }
    navigate("/add/stageFour");
  };

  return (
    <form className="pl-10 pr-10 pt-10 pb-20" style={{ width: "100%", height: "56vh", boxShadow: "0px -30px 10px 10px rgba(0, 0, 0, 0.04)", zIndex: "2", borderRadius: "35px" }}>
      <div>
        <div>
          <div className="flex justify-between" style={{ alignItems: "center" }}>
            <p style={{ fontWeight: "bold" }}>ID: {fileName}</p>
            <h3 style={{ fontSize: "24px", fontWeight: "bold", color: "#5F5F5F" }}> اضافة موظف </h3>
          </div>

          <div className="mt-10" style={{ width: "100%" }}>
            <p style={{ textAlign: "end", fontSize: "16px", color: "#7F7F7F" }}> كلمة المرور الخاصة بالموظف </p>
            <input
              value={getPassword}
              onChange={handlePasswordChange}
              style={{ width: "100%", backgroundColor: "#F1F1F1", marginTop: "14px", height: "50px", borderRadius: "5px", paddingRight: "10px", textAlign: "end" }}
              required
            />
          </div>

          <div className="mt-10" style={{ width: "100%" }}>
            <p style={{ textAlign: "end", fontSize: "16px", color: "#7F7F7F" }}> تأكيد كلمة المرور </p>
            <input
              value={verifyPassword}
              onChange={handleVerifyPasswordChange}
              style={{ width: "100%", backgroundColor: "#F1F1F1", marginTop: "14px", height: "50px", borderRadius: "5px", paddingRight: "10px", textAlign: "end" }}
              required
            />
          </div>

          <div className="mt-10" style={{ width: "100%" }}>
            <p style={{ textAlign: "end", fontSize: "16px", color: "#7F7F7F" }}> وقت الحظور </p>
            <input
              value={startworkinput}
              onChange={(event) => setstartworkinput(event.target.value)}
              style={{ width: "100%", backgroundColor: "#F1F1F1", marginTop: "14px", height: "50px", borderRadius: "5px", paddingRight: "10px", textAlign: "end" }}
              required
            />
            <select onChange={performTimeSelected} style={{ marginTop: "14px", height: "50px", borderRadius: "5px", paddingRight: "10px", textAlign: "end" }}>
              <option> اختر الوقت </option>
              <option> صباحا </option>
              <option> مساءا </option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-20" style={{ width: "100%" }}>
        <button
          onClick={onSubmit}
          disabled={!selectedTime || selectedTime === "اختر الوقت"} // Disable button if no time selected or "اختر الوقت" selected
          style={{
            marginBottom: "100px",
            width: "100%",
            backgroundColor: "#BD6939",
            marginTop: "14px",
            height: "50px",
            borderRadius: "5px",
            textAlign: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "16px"
          }}>
          متابعة
        </button>
      </div>
    </form>
  );
}

export default STAGETHREE
