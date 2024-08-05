import React, { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import QrScanner from 'react-qr-scanner';
import { useSelector } from 'react-redux';
import './style.css';
import { Octokit } from 'octokit';

export const HOME = () => {
  const [data, setData] = useState('No result');
  const [scannerType, setScannerType] = useState(null); // 'zxing' or 'react-qr-scanner'
  const [error, setError] = useState(null);
  const [cumulativeTimes, setCumulativeTimes] = useState([]);
  const [cameraAccess, setCameraAccess] = useState(false);
  const [scanning, setScanning] = useState(true);
  const [scanTime, setScanTime] = useState(null);
  const [lastClickTime, setLastClickTime] = useState(localStorage.getItem('lastClickTime'));



  const scannerStartedRef = useRef(false);
  const videoRef = useRef(null);

  const eID = useSelector((state) => state.employee.selected);
  const name = useSelector((state) => state.employee.name);
  const salary = useSelector((state) => state.employee.salary);
  const discount = useSelector((state) => state.employee.discount);
  const start = useSelector((state) => state.employee.start);

  const [info, setInfo] = useState([]);
  const [employeeInfo, setEmployeeInfo] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const octokit = new Octokit({ auth: process.env.REACT_APP_GITHUB_AUTH_TOKEN });
  const owner = 'SajadKenani';
  const repo = 'meemdatabase';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await octokit.request(`GET /repos/${owner}/${repo}/contents`);

        if (response.status !== 200) {
          throw new Error(`Failed to fetch repository contents: ${response.statusText}`);
        }

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
        item.name === localStorage.getItem("EEID")
      );
      setSelectedEmployee(filteredInfo[0]?.content[0]);
      setEmployeeInfo(filteredInfo.map(item => item.content[0]));
    }
  }, [info]);

  useEffect(() => {
    if (cameraAccess && scanning) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error('Error accessing camera:', err);
          setError('Error accessing camera');
        });
    }
  }, [cameraAccess, scanning]);

  useEffect(() => {
    if (scannerType === 'zxing' && cameraAccess && scanning && !scannerStartedRef.current) {
      startZXingScanner();
      scannerStartedRef.current = true;
    }
  }, [scannerType, cameraAccess, scanning]);

  const decodeBase64Unicode = (str) => {
    const decoded = atob(str.replace(/\s/g, ""));
    try {
      return decodeURIComponent(escape(decoded));
    } catch (error) {
      return decoded;
    }
  };

  const sendData = async (info) => {
    const infoObject = [info];
    try {
      // Base64 encode the content
      const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(infoObject))));
      const path = localStorage.getItem("EEID");
      const sha = await getFileSha(owner, repo, path, process.env.REACT_APP_GITHUB_AUTH_TOKEN);
  
      // Update the file with new content
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
      window.location.reload()
    } catch (error) {
      console.error("Error updating file:", error);
      setError("Error updating file");
    }
  };

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

  const startZXingScanner = () => {
    const codeReader = new BrowserMultiFormatReader();
    codeReader.decodeFromVideoDevice(null, videoRef.current, async (result, error) => {
      if (result) {
        const newTime = `${start}:00`;
        console.log(newTime);

        setCumulativeTimes(prevTimes => {
          const toMinutes = (time) => {
            const [hours, minutes] = time.split(':').map(Number);
            return hours * 60 + minutes;
          };

          const toTimeString = (minutes) => {
            const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
            const mins = (minutes % 60).toString().padStart(2, '0');
            return `${hours}:${mins}`;
          };

          const addTimes = (time1, time2) => {
            const totalMinutes = toMinutes(time1) + toMinutes(time2);
            return toTimeString(totalMinutes);
          };

          const newEntries = discount.map(item => {
            const discountTime = `${item.hours}:${item.minutes}`;
            return addTimes(newTime, discountTime);
          });

          const updatedTimes = [...prevTimes.flat(), newTime, ...newEntries];

          const resultArray = updatedTimes.reduce((acc, time, index) => {
            const cumulativeArray = [...(acc[acc.length - 1] || []), time];
            acc.push(cumulativeArray);
            return acc;
          }, []);

          const lastArray = resultArray[resultArray.length - 1];
          const result = lastArray.splice(1, lastArray.length);

          if (selectedEmployee) {
            // Fetch old discountedSalary if available
            const oldDiscountedSalary = selectedEmployee.employeeDiscountedSalary || [];

            // Combine old and new discountedSalary data
            selectedEmployee.employeeDiscountedSalary = [
              ...oldDiscountedSalary,
              ...result.map((item, index) => ({
                time: item,
                price: discount[index]?.price || null,
                date: new Date()
              }))
            ];
            
            // Update the repository with new data
            sendData(selectedEmployee);
          }

          console.log('Updated Cumulative Times:', updatedTimes);
          return updatedTimes;
        });

        if (eID === result.text) {
          // checking for the ip 
          console.log("it's working ");
          setScanTime(new Date());
          
        setData(result.text);
        stopScanning();
        codeReader.reset();
        } else {
          console.log("error qr code is not matching ");
          stopScanning(); 
          window.location.reload()
        }

      }


    });
  };

  const handleScan = (result) => {
    if (result) {
      setScanTime(new Date());
      setData(result.text);
      stopScanning();
    }
  };

  const handleError = (err) => {
    console.error('Scanner error:', err);
    setError(err.message);
  };

  const stopScanning = () => {
    handleClick();
    setScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const previewStyle = {
    height: 240,
    width: 320,
  };

  const checkScanTime = () => {
    if (!scanTime) return '';

    const myArray = [];
    const resultArray = [];

    cumulativeTimes.forEach(time => {
      const [specifiedHour, specifiedMinute] = time.split(':').map(Number);
      const specifiedDate = new Date();
      specifiedDate.setHours(specifiedHour, specifiedMinute, 0, 0);

      if (scanTime < specifiedDate) {
        return `Scan was before the specified time: ${time}`;
      } else {
        myArray.push(time);
        resultArray.length = 0;

        myArray.slice(1).forEach((item, index) => {
          resultArray.push({
            time: item,
            price: discount[index]?.price || null,
            date: new Date()
          });
        });

        console.log('Result Array:', resultArray);
        if (selectedEmployee) {
          selectedEmployee.discountedSalary = resultArray;
          sendData(selectedEmployee);
        }

        return `Scan was after the specified time: ${time}`;
      }
    });

    return myArray.join(', ');
  };

  const isButtonEnabled = () => {
    if (!lastClickTime) return true;
    const now = new Date();
    const lastClick = new Date(lastClickTime);
    return now - lastClick >= 17 * 60 * 60 * 1000;
  };

  const handleClick = () => {
    const now = new Date();
    const lastClick = new Date(lastClickTime);

    // Check if 17 hours have passed since the last click
    if (!lastClickTime || now - lastClick >= 17 * 60 * 60 * 1000) {
      // Update last click time
      localStorage.setItem('lastClickTime', now.toISOString());
      setLastClickTime(now);

      // Perform button action here
      console.log('Button clicked!');
    } 
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert '0' hour to '12'
    const formattedHours = String(hours).padStart(2, '0');
    
    return `${day}/${month}/${year} ${formattedHours}:${minutes} ${ampm}`;
  };
  
  const formatMyDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    
    // Convert to 24-hour format
    let hours = date.getHours();
    console.log(hours)
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    // No need for AM/PM as we are converting to 24-hour format
    // Simply format the hours and minutes
    const formattedHours = String(hours).padStart(2, '0');
    
    return `${formattedHours}:${minutes}`;
};


const myTime = (timeString, delayHours, delayMinutes) => {
  // Helper function to convert time string to minutes since midnight
  const toMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);

    return hours * 60 + minutes;
  };

  // Convert delay time to a string in hh:mm format
  const delayTime = `${String(delayHours).padStart(2, '0')}:${String(delayMinutes).padStart(2, '0')}`;


  // Parse the times
  const timeInMinutes = toMinutes(timeString);
  const delayInMinutes = toMinutes(delayTime);


  return timeInMinutes > delayInMinutes;
};


const parseTimeString = (timeString) => {
  // Parse "HH:MM" time string into hours and minutes
  const [hours, minutes] = timeString.split(':').map(Number);
  return { hours, minutes };
};

const formatTime = (hours, minutes) => {
  // Format time into "HH:MM" with leading zeroes
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};





  const [value, setValue] = useState(0);
  const [remainingSalary, setRemainingSalary] = useState(0);
  const [togglePattern, setTogglePattern] = useState(true); // Manage this state based on your logic
  const [myLoop, setmyLoop] = useState(true)
  // Function to handle salary update




  // Effect to update `value` and `remainingSalary` based on discounted salaries
  useEffect(() => {
 

    if (employeeInfo && employeeInfo[0] && Array.isArray(employeeInfo[0].employeeDiscountedSalary)) {
      employeeInfo[0].employeeDiscountedSalary.forEach((salaryItem, salaryIndex) => {
        const start = employeeInfo[0].start || 0; // Default to 0 if start is not defined

        employeeInfo[0].employeeDiscount.forEach((discountItem, discountIndex) => {
          const hours = Number(discountItem?.hours || 0);
          const minutes = Number(discountItem?.minutes || 0);

          // Calculate adjusted hours for 12-hour format
          const adjustedHours = (hours + start) % 12; // Ensure hours are within 12-hour format
          const adjustedHoursForDisplay = adjustedHours === 0 ? 12 : adjustedHours; // Convert 0 to 12 for display
  

          // Call your time comparison function
          const isTimeValid = myTime(formatMyDate(salaryItem.date), adjustedHoursForDisplay, minutes);
        
          // Determine toggle state based on the index
          const iterationIndex = salaryIndex * employeeInfo[0].employeeDiscount.length + discountIndex;
          const isVisible = (Math.floor(iterationIndex / 2) % 2 === 0) ? togglePattern : !togglePattern;

          
          const handleSalaryUpdate = (price) => {
            if (myLoop === true){
            setRemainingSalary(Number(salary) );

          
            }
          
          };

          if (isVisible && isTimeValid && myLoop) {
   
            handleSalaryUpdate(discountItem.price);
          
          }
        
        });
      });
    }

  
  }, [employeeInfo, togglePattern]); // Dependencies of useEffect

  

  return (
    <div className="relative min-h-screen flex flex-col">
    <div>
      <h1 style={{ textAlign: "end", marginRight: "40px", fontWeight: "bold", fontSize: "20px" }}>الراتب الكلي: {salary}</h1>
      <h1 style={{ textAlign: "end", marginRight: "40px", fontWeight: "bold", fontSize: "14px", color: "#BD6939" }}>الراتب المتبقي: {salary - remainingSalary}</h1>

      {scannerType === 'zxing' && cameraAccess && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.591)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '80%',
            textAlign: 'center'
          }}>
            <video ref={videoRef} style={{
              width: '100%',
              height: 'auto',
              border: '7px solid white',
              borderRadius: '10px'
            }} autoPlay />
            <p style={{
              marginTop: '20px',
              color: 'white',
              fontWeight: 'bold'
            }}>
              يجب أن تكون متصلاً بشبكة الشركة لتسجيل الحضور
            </p>
            <button
              className="text-white w-full h-14 rounded-lg"
              style={{ backgroundColor: "#BD6939", marginTop: "80px", width: "60%" }}
              onClick={() => window.location.reload()}
            >
              رجوع
            </button>
          </div>
        </div>
      )}

      {scannerType === 'react-qr-scanner' && (
        <div>
          <h2>react-qr-scanner</h2>
          <QrScanner
            delay={300}
            style={previewStyle}
            onError={handleError}
            onScan={handleScan}
          />
          <p>Scanned QR Code (react-qr-scanner): {data}</p>
        </div>
      )}

      <h1 style={{ textAlign: "end", marginRight: "40px", fontWeight: "bold", color: "#BD6939", fontSize: "20px", marginTop: "24px", marginBottom: "30px" }}> الخصومات </h1>
      


      { employeeInfo && employeeInfo[0] && Array.isArray(employeeInfo[0].employeeDiscountedSalary) && employeeInfo[0].employeeDiscountedSalary.length > 0 &&
        employeeInfo[0].employeeDiscountedSalary.map((salaryItem, salaryIndex) => {
          const start = employeeInfo[0].employeeStart || 0; // Default to 0 if start is not defined

          return (
            <div key={salaryIndex}>
              {employeeInfo[0].employeeDiscount.map((discountItem, discountIndex) => {
                const hours = Number(discountItem?.hours || 0);
                const minutes = Number(discountItem?.minutes || 0);

                // Calculate adjusted hours for 12-hour format
                const adjustedHours = (Number(hours) + Number(start)) ; // Ensure hours are within 12-hour format
   
                const adjustedHoursForDisplay = adjustedHours === 0 ? 12 : adjustedHours; // Convert 0 to 12 for display

                // Call your time comparison function
                console.log(formatMyDate(salaryItem.date), adjustedHoursForDisplay)
                const isTimeValid = myTime(formatMyDate(salaryItem.date), adjustedHoursForDisplay, minutes);
  
              

                // Determine toggle state based on the index
                const iterationIndex = salaryIndex * employeeInfo[0].employeeDiscount.length + discountIndex;
                const isVisible = (Math.floor(iterationIndex / 2) % 4 === 0) ? togglePattern : !togglePattern;
              

                return (
                  isTimeValid && isVisible &&  (
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
                  )
                );
              })}
            </div>
          );
        })
      }




      <div className='flex justify-center mt-24 mb-24'>
        <p className="text-black">{checkScanTime()}</p>
      </div>
    </div>

    <div className="fixed bottom-0 left-0 w-full bg-white p-4 flex justify-center p-10">
    <button
  className={`w-full h-14 rounded-lg ${!isButtonEnabled() ? 'bg-gray-400 text-gray-600 cursor-not-allowed' : 'bg-[#BD6939] text-white'}`}
  style={{ 
    backgroundColor: !isButtonEnabled() ? '#D1D5DB' : '#BD6939', 
    marginBottom: "80px" 
  }}
  onClick={() => {
    if (isButtonEnabled()) {
      setScannerType('zxing');
      setCameraAccess(true);
      setScanning(true);
      scannerStartedRef.current = false;
    }
  }}
  disabled={!isButtonEnabled()} // Disable the button if it's not enabled
>
  {isButtonEnabled() ? 'تسجيل الحظور' : 'غير متاح'}
</button>



    
    </div>
  </div>

  );
};
