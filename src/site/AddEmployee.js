import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setEmployeeName, setEmployeePhone, setEmployeeTitle } from '../actions/employeeActions'; // Ensure the path is correct
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { v4 as uuidv4 } from "uuid";


function AddEmployee({ fileName }) {
  const dispatch = useDispatch();
  const name = useSelector((state) => state.employee.employeeName);
  const phone = useSelector((state) => state.employee.employeePhone);
  const title = useSelector((state) => state.employee.employeeTitle);

  

  const handleNameChange = (e) => {
    dispatch(setEmployeeName(e.target.value));
  };

  const handlePhoneChange = (e) => {
    dispatch(setEmployeePhone(e.target.value));
  };

  
  const handleTitleChange = (e) => {
    dispatch(setEmployeeTitle(e.target.value));
  };


  return (
    <div className="pl-10 pr-10 pt-10" style={{ width: "100%", height: "100&", boxShadow: "0px -30px 10px 1px rgba(0, 0, 0, 0.03)", zIndex: "2", borderRadius: "35px", display: 'flex', flexDirection: 'column' }}>
    <div style={{ flex: '1', overflowY: 'auto', paddingRight: '10px', paddingLeft: '10px' }}>
      <div className="flex justify-between" style={{ alignItems: "center" }}>
        <p style={{ fontWeight: "bold" }}>ID: {fileName}</p>
        <h3 style={{ fontSize: "24px", fontWeight: "bold", color: "#5F5F5F" }}> اضافة موظف </h3>
      </div>

      <div className="mt-10" style={{ width: "100%" }}>
        <p style={{ textAlign: "end", fontSize: "16px", color: "#7F7F7F" }}> اسم الموظف </p>
        <input
          value={name}
          onChange={handleNameChange}
          style={{ width: "100%", backgroundColor: "#F1F1F1", marginTop: "14px", height: "50px", borderRadius: "5px", paddingRight: "10px", textAlign: "end" }}
        />
      </div>

      <div className="mt-10" style={{ width: "100%" }}>
        <p style={{ textAlign: "end", fontSize: "16px", color: "#7F7F7F" }}> رقم هاتف الموظف </p>
        <input
          value={phone}
          onChange={handlePhoneChange}
          style={{ width: "100%", backgroundColor: "#F1F1F1", marginTop: "14px", height: "50px", borderRadius: "5px", paddingRight: "10px", textAlign: "end" }}
        />
      </div>

      <div className="mt-10" style={{ width: "100%" }}>
        <p style={{ textAlign: "end", fontSize: "16px", color: "#7F7F7F" }}> العنوان الوظيفي </p>
        <input
          value={title}
          onChange={handleTitleChange}
          style={{ width: "100%", backgroundColor: "#F1F1F1", marginTop: "14px", height: "50px", borderRadius: "5px", paddingRight: "10px", textAlign: "end" }}
        />
      </div>
      <div className="mt-10" style={{ width: "100%" }}>
      <Link to={"/add/stageTwo"}>
        <button
          style={{
            width: "100%",
            backgroundColor: "#BD6939",
            height: "50px",
            borderRadius: "5px",
            textAlign: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "16px"
          }}>
          متابعة
        </button>
      </Link>
    </div>
    </div>


  </div>

  )
}

export default AddEmployee;
