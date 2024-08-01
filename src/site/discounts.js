import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import './style.css';
import { Octokit } from '@octokit/core';

export const Discounts = () => {
  const [data, setData] = useState('No result');
  const [scannerType, setScannerType] = useState(null); // 'zxing' or 'react-qr-scanner'
  const [error, setError] = useState(null);
  const [cameraAccess, setCameraAccess] = useState(false);
  const [scanning, setScanning] = useState(true);
  const [scanTime, setScanTime] = useState(null);
  const [lastClickTime, setLastClickTime] = useState(localStorage.getItem('lastClickTime'));

  const [info, setInfo] = useState([]);
  const [employeeInfo, setEmployeeInfo] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [remainingSalary, setRemainingSalary] = useState(0);
  const [togglePattern, setTogglePattern] = useState(true);

  const octokit = new Octokit({ auth: process.env.REACT_APP_GITHUB_AUTH_TOKEN });
  const owner = 'SajadKenani';
  const repo = 'meemdatabase';

  const eID = useSelector((state) => state.employee.selected);
  const name = useSelector((state) => state.employee.name);
  const [salary, setsalary] = useState() 
  const discount = useSelector((state) => state.employee.discount);
  const start = useSelector((state) => state.employee.start);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await octokit.request(`GET /repos/${owner}/${repo}/contents`);
        if (response.status !== 200) throw new Error(`Failed to fetch repository contents: ${response.statusText}`);

        const filesList = await Promise.all(response.data.map(async (file) => {
          try {
            const fileResponse = await octokit.request(`GET /repos/${owner}/${repo}/contents/${file.path}`);
            const content = fileResponse.data.content;
            const decodedContent = decodeBase64Unicode(content);
            return { name: file.name, content: JSON.parse(decodedContent) };
          } catch (fileError) {
            console.error(`Error fetching file ${file.path}:`, fileError);
            return null;
          }
        }));

        setInfo(filesList.filter(file => file !== null));
      } catch (error) {
        console.error("Error fetching repository contents:", error);
        setError("Error fetching repository contents");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (info.length > 0) {
      const filteredInfo = info.filter(item =>
        item.name !== "admin" &&
        item.name !== "orders" &&
        item.name !== "notification" &&
        item.name === localStorage.getItem("EID")
      );
      setSelectedEmployee(filteredInfo[0]?.content[0]);
      setEmployeeInfo(filteredInfo.map(item => item.content[0]));
    }
  }, [info]);


  const [myLoop, setmyLoop] = useState(true)
  const decodeBase64Unicode = (str) => {
    const decoded = atob(str.replace(/\s/g, ""));
    try {
      return decodeURIComponent(escape(decoded));
    } catch (error) {
      return decoded;
    }
  };

  const sendData = useCallback(async (info) => {
    const infoObject = [info];
    try {
      const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(infoObject))));
      const path = localStorage.getItem("EID");
      const sha = await getFileSha(owner, repo, path, process.env.REACT_APP_GITHUB_AUTH_TOKEN);

      await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
        owner,
        repo,
        path,
        message: "Update file",
        content: contentBase64,
        sha,
        committer: {
          name: "Your Name",
          email: "your-email@example.com"
        },
        author: {
          name: "Your Name",
          email: "your-email@example.com"
        },
        headers: {
          "X-GitHub-Api-Version": "2022-11-28"
        }
      });
      console.log("File updated successfully.");
      window.location.reload();
    } catch (error) {
      console.error("Error updating file:", error);
      setError("Error updating file");
    }
  }, []);

  const getFileSha = async (owner, repo, path, token) => {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    if (!response.ok) {
      throw new Error(`Error fetching file SHA: ${response.statusText}`);
    }
    const data = await response.json();
    return data.sha;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const formattedHours = String(hours).padStart(2, '0');

    return `${day}/${month}/${year} ${formattedHours}:${minutes} ${ampm}`;
  };

  const formatMyDate = (dateString) => {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const myTime = (timeString, delayHours, delayMinutes) => {
    const toMinutes = (time) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const delayTime = `${String(delayHours).padStart(2, '0')}:${String(delayMinutes).padStart(2, '0')}`;
    const timeInMinutes = toMinutes(timeString);
    const delayInMinutes = toMinutes(delayTime);

    return timeInMinutes > delayInMinutes;
  };

  const removeDiscount = async (salaryIndex, discountIndex) => {
    if (employeeInfo[0] && Array.isArray(employeeInfo[0].employeeDiscountedSalary)) {
      // Ensure the array exists and is not empty
      const updatedDiscounts = employeeInfo[0].employeeDiscountedSalary.map((discounts, index) =>
        Array.isArray(discounts) ? (index === salaryIndex ? discounts.filter((_, i) => i !== discountIndex) : discounts) : []
      );
  
      const updatedEmployeeInfo = {
        ...employeeInfo[0],
        employeeDiscountedSalary: updatedDiscounts
      };
  
      setEmployeeInfo([updatedEmployeeInfo]);
  
      try {
        await sendData(updatedEmployeeInfo);
      } catch (error) {
        console.error("Error updating file:", error);
        setError("Error updating file");
      }
    } else {
      console.error("Invalid data structure for discountedSalary");
      setError("Invalid data structure for discountedSalary");
    }
  };
  

    

  return (
    <div>
      <h1 style={{ textAlign: "end", marginRight: "40px", fontWeight: "bold", fontSize: "20px" }}>
        الراتب الكلي: {employeeInfo[0]?.employeeSalary}
        
      </h1>
      <h1 style={{ textAlign: "end", marginRight: "40px", fontWeight: "bold", fontSize: "14px", color: "#BD6939", marginBottom: "50px" }}>
        الراتب المتبقي: {Number(employeeInfo[0]?.employeeSalary) - Number(remainingSalary)}
      </h1>
      <button className='w-8 h-8 -mt-0 p-0' onClick={() => removeDiscount(0, 99)} style={{width: "130px", height: "40px", display: "flex", justifyContent: "center", alignItems: "center", position: "fixed", bottom: "0", margin: "100px", right: "0", marginRight: "70px"}}>  حذف الكل </button>
      {employeeInfo.length > 0 && Array.isArray(employeeInfo[0]?.employeeDiscountedSalary) && employeeInfo[0].employeeDiscountedSalary.length > 0 &&
        employeeInfo[0].employeeDiscountedSalary.map((salaryItem, salaryIndex) => {
          const start = employeeInfo[0].employeeStart || 0;

          return (
            <div key={salaryIndex}>
              {employeeInfo[0].employeeDiscount.map((discountItem, discountIndex) => {
                const hours = Number(discountItem?.hours || 0);
                const minutes = Number(discountItem?.minutes || 0);
                const adjustedHours = (hours + start);
                const adjustedHoursForDisplay = adjustedHours === 0 ? 12 : adjustedHours;
                const isTimeValid = myTime(formatMyDate(salaryItem.date), adjustedHoursForDisplay, minutes);

                const iterationIndex = salaryIndex * employeeInfo[0].employeeDiscount.length + discountIndex;
                const isVisible = (Math.floor(iterationIndex / 2) % 4 === 0) ? togglePattern : !togglePattern;

                if ( isTimeValid && isVisible) {
                  return (
                    <div className="flex justify-center p-10 pt-0 mt-0" style={{ cursor: "pointer" }} key={`${salaryIndex}-${discountIndex}`}>
                      <div className="w-full h-14 bg-white rounded-lg border border-gray-400 shadow-md flex p-4">
                        <div className="flex justify-between w-full" style={{ alignItems: "center" }}>
                          <p style={{ fontWeight: "500", fontSize: "16px", color: "#BD6939" }}>{formatDate(salaryItem.date)}</p>
                          <p style={{ fontWeight: "bold", fontSize: "16px", color: "#BD6939" }}>
                            {discountItem.price} : تم خصم
                          </p>
                          {myLoop && setRemainingSalary(prev => Number(discountItem.price) + prev)}
                          {myLoop && setmyLoop(false)}
                         
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          );
        })
      }
    </div>
  );
};

