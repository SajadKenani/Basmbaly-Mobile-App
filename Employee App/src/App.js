import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Octokit } from '@octokit/rest';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './store';
import { setEmployeeName, setEmployeePhone, setEmployeeTitle, setEmployeeSalary, setEmployeeDiscount, setStartEmployee, setSelectedEmployee, setEmployeeTasks } from "./site/action/employeeActions";
import { ROUTERS } from "./site/routers";
import { HOME } from './site/home';
import { TASKS } from './site/tasks';
import { ACCOUNT } from './site/account';
import UPPER from './site/upper';
import './App.css';

// Main App Component
const App = () => {
  const [loading, setLoading] = useState(true);

  return (
    <Provider store={store}>
      <div className="App">
        <Router>
          <UPPER />
          <WindowOverlay setLoading={setLoading} />
          {loading ? (
            <div style={{
              width: "100%",
              height: "100vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background: "#BD6939",
              color: "white",
              fontSize: "24px",
              zIndex: 9999,
              position: "fixed"
            }}>
              Loading...
            </div>
          ) : (
            <>
              <Routes>
                <Route path='/' element={<HOME />} />
                <Route path='/tasks' element={<TASKS />} />
                <Route path='/account' element={<ACCOUNT />} />
              </Routes>
              <ROUTERS />
            </>
          )}
        </Router>
      </div>
    </Provider>
  );
};

// WindowOverlay Component
const WindowOverlay = ({ setLoading }) => {
  const [info, setInfo] = useState([]);
  const [employeeInfo, setEmployeeInfo] = useState([]);
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [employeePassword, setEmployeePassword] = useState("");
  const dispatch = useDispatch();

  const fetchData = async () => {
    try {
      const octokit = new Octokit({
        auth: process.env.REACT_APP_GITHUB_AUTH_TOKEN
      });

      const owner = "SajadKenani";
      const repo = "meemdatabase";

      console.log(`Fetching contents from: https://api.github.com/repos/${owner}/${repo}/contents`);

      const response = await octokit.request(`GET /repos/${owner}/${repo}/contents`);

      if (response.status !== 200) {
        throw new Error(`Failed to fetch repository contents: ${response.statusText}`);
      }

      const filesList = await Promise.all(
        response.data.map(async (file) => {
          try {
            const fileResponse = await octokit.request(`GET /repos/${owner}/${repo}/contents/${file.path}`);
            const content = fileResponse.data.content;
            const decodedContent = decodeBase64Unicode(content);
            return { name: file.name, content: JSON.parse(decodedContent) };
          } catch (fileError) {
            console.error(`Error fetching file ${file.path}:`, fileError);
            return null;
          }
        })
      );

      setInfo(filesList.filter(file => file !== null));
      setLoading(false); // Set loading to false after fetching data

    } catch (error) {
      console.error("Error fetching repository contents:", error);
      setLoading(false); // Set loading to false even if there's an error
    }
  };

  const decodeBase64Unicode = (str) => {
    const decoded = atob(str.replace(/\s/g, ""));
    try {
      return decodeURIComponent(escape(decoded));
    } catch (error) {
      return decoded;
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // Run fetchData only once when the component mounts

  useEffect(() => {
    if (info.length > 0) {
      const filteredInfo = info.filter(item => item.name !== "admin" && item.name !== "orders" && item.name !== "notification");
      const myArray = filteredInfo.map(item => item.content[0]);
      setEmployeeInfo(myArray);
    }
  }, [info]); // Run this effect when `info` is updated

  const accountVerification = () => {
    console.log(employeeInfo)
    employeeInfo.forEach((item, index) => {
      if (employeeNumber === item.employeePhone && employeePassword === item.employeePassword && item.name !== "admin" && item.name !== "orders" && item.name !== "notification") {
        const selectedEmployee = info[index];

        localStorage.setItem("EEID", selectedEmployee.name);

        dispatch(setSelectedEmployee(selectedEmployee.name));
        dispatch(setEmployeeName(selectedEmployee.content[0].employeeName));
        dispatch(setEmployeePhone(selectedEmployee.content[0].employeePhone));
        dispatch(setEmployeeTitle(selectedEmployee.content[0].employeeTitle));
        dispatch(setEmployeeSalary(selectedEmployee.content[0].employeeSalary));
        dispatch(setStartEmployee(selectedEmployee.content[0].employeeStart));
        dispatch(setEmployeeDiscount(selectedEmployee.content[0].employeeDiscount));
        dispatch(setEmployeeTasks(selectedEmployee.content[0].employeeTasks));
        
        window.location.reload()

        return;
      }
    });
  };

  useEffect(() => {
    if (localStorage.getItem("EEID") && info.length > 0) {
      const filteredInfo = info.filter(item =>
        item.name === localStorage.getItem("EEID") &&
        item.name !== "admin" &&
        item.name !== "orders" &&
        item.name !== "notification"
      );

      if (filteredInfo.length > 0) {
     
        const selectedEmployee = filteredInfo[0];
        dispatch(setSelectedEmployee(selectedEmployee.name));
        dispatch(setEmployeeName(selectedEmployee.content[0].employeeName));
        dispatch(setEmployeePhone(selectedEmployee.content[0].employeePhone));
        dispatch(setEmployeeTitle(selectedEmployee.content[0].employeeTitle));
        dispatch(setEmployeeSalary(selectedEmployee.content[0].employeeSalary));
        dispatch(setStartEmployee(selectedEmployee.content[0].employeeStart));
        dispatch(setEmployeeDiscount(selectedEmployee.content[0].employeeDiscount));
        dispatch(setEmployeeTasks(selectedEmployee.content[0].employeeTasks));
      }
    }
  }, [info, dispatch]);

  return (
    <>
      {!localStorage.getItem("EEID") && 
        <div style={{
          width: "100%",
          height: "100vh",
          background: "linear-gradient(to bottom, #FFAF82 0%, #BD6939 90%, #BD6939 100%)",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 9999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          padding: "20px",
          boxSizing: "border-box",
        }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginBottom: "20px"
          }}>
            <input type="text" placeholder="رقم هاتف الموظف"
              onChange={(event) => setEmployeeNumber(event.target.value)}
              style={{
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                textAlign: "end",
                fontSize: "16px",
                width: "300px"
              }} />
            <input type="password" placeholder="كلمة مرور الموظف"
              onChange={(event) => setEmployeePassword(event.target.value)}
              style={{
                padding: "10px",
                textAlign: "end",
                borderRadius: "5px",
                border: "1px solid #ccc",
                fontSize: "16px",
                width: "300px"
              }} />
          </div>
          <button style={{
            color: "white",
            backgroundColor: "#BD6939",
            border: "none",
            borderRadius: "5px",
            fontSize: "16px",
            padding: "10px 20px",
            cursor: "pointer",
            transition: "background-color 0.3s",
          }} onClick={accountVerification}>
            تسجيل دخول
          </button>
        </div>
      }
    </>
  );
};

export default App;
