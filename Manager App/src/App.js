import './App.css';
import './site/style.css';
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { v4 as uuidv4 } from "uuid";

import HOMEPAGE from './site/homePage.js';
import AddEmployee from './site/AddEmployee.js';
import STAGETWO from './site/stageTwo.js';
import STAGETHREE from './site/stageThree.js';
import STAGEFOUR from './site/stageFour.js';
import { EMPLOYEEINFO } from './site/employeeInfo.js';
import { TASKS } from './site/tasks.js';
import { ACCOUNT } from './site/account.js';
import UPPER from "./site/upper.js";
import ROUTERS from "./site/routers.js";
import store from './store.js';
import mainImage from "./site/images/mainImage.png";

import trueSign from "./site/images/trueSign.png"
import { Octokit } from '@octokit/rest';
import NOTIFICATION from './site/notification.js';
import axios from 'axios';

import {Discounts} from './site/discounts.js';

function App() {
  const [fileName, setFileName] = useState("0" + uuidv4().split("-")[0]);

  const [inputvalue, setinputvalue] = useState("")
  const [files, setFiles] = useState([]);



  useEffect(() => {
    const fetchData = async () => {
      try {
        const octokit = new Octokit({
          auth: process.env.REACT_APP_GITHUB_AUTH_TOKEN,
        });

        const response = await octokit.request("GET /repos/{owner}/{repo}/contents", {
          owner: "SajadKenani",
          repo: "meemdatabase",
        });

        const filesList = await Promise.all(
          response.data.map(async (file) => {
            const fileResponse = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
              owner: "SajadKenani",
              repo: "meemdatabase",
              path: file.path,
            });
            const content = fileResponse.data.content;
            const decodedContent = decodeBase64Unicode(content);
            return { name: file.name, content: JSON.parse(decodedContent) };
          })
        );

        setFiles(filesList);
      } catch (error) {
        console.error("Error fetching repository contents:", error);
        // Handle error fetching data
      }
    };

    fetchData();
  }, []); // Empty dependency array to run once on component mount

  useEffect(() => {
    
  
    if (files.length > 0 && files) {
      files.forEach((item, index) => {
      
        if (item && item.name === "admin") {
          const userId = Number(localStorage.getItem("userID"));
          if (item.content && item.content[userId] && item.content[userId].isAccepted !== undefined) {
            localStorage.setItem("isVerified", item.content[userId].isAccepted.toString());
          } else {
            console.error("User ID or isAccepted is undefined");
          }
        }
        
      });
    }
  }, [files]);
  
  const decodeBase64Unicode = (str) => {
    const decoded = atob(str.replace(/\s/g, ""));
    try {
      return decodeURIComponent(escape(decoded));
    } catch (error) {
      return decoded;
    }
  };

  const extractOrdersContent = (files) => {
    let ordersContent = [];
    files.forEach((file) => {
      if (file.name === "orders") {
        ordersContent = file.content;
      }
    });
    return ordersContent;
  };
  
  const extractAdminInfo = (files) => {
    let adminInfo = [];
    files.forEach((file) => {
      if (file.name === "admin" && file.content[0]?.groupId === localStorage.getItem("groupId")) {

        adminInfo.push(file.content[0]);
      }
    });
    return adminInfo;
  };
  
  const sendOrder = (event) => {
    event.preventDefault();
  
    const ordersContent = extractOrdersContent(files);
    const adminInfo = extractAdminInfo(files);
  
    if (ordersContent.length === 0) {
      console.error("No orders content found.");
    } else {
      console.log("Orders Content:", ordersContent);
    }
  
    if (adminInfo.length === 0) {
      console.error("Admin information not found or groupId mismatch.");
    } else {
      // Create a deep copy of the adminInfo object to avoid modifying the original array
      const updatedAdminInfo = { ...adminInfo[0], saveSub: Number(inputvalue) }; // Assuming inputValue is defined elsewhere
  
      console.log("Admin Information:", updatedAdminInfo);
  
      // Add the updated admin info to orders content
      ordersContent.push(updatedAdminInfo);
      console.log("Updated Orders Content:", ordersContent);
  
      // Send data
      sendData(ordersContent);
    }
  };
  
  
    // Sending data to orders file in the repository
    const sendData = async (info) => {
      const infoObject = info;
      const filePath = "orders";
      const owner = "SajadKenani";
      const repo = "meemdatabase";
      const message = "Update orders file";
      const committer = {
        name: "Your Name",
        email: "your-email@example.com"
      };
      const author = {
        name: "Your Name",
        email: "your-email@example.com"
      };
    
      try {
        const octokit = new Octokit({
          auth: process.env.REACT_APP_GITHUB_AUTH_TOKEN,
          baseUrl: 'https://api.github.com', // Optional: Ensure base URL is correct
        });
    
        // Encode content to Base64
        const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(infoObject))));
    
        // Check if file exists
        let fileExists = false;
        let fileSha = null;
    
        try {
          const { data } = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
            owner,
            repo,
            path: filePath,
          });
          fileExists = true;
          fileSha = data.sha;
        } catch (error) {
          if (error.status !== 404) {
            throw error;
          }
        }
    
        // Prepare the payload
        const payload = {
          owner,
          repo,
          path: filePath,
          message: fileExists ? "Update orders file" : "Create orders file",
          content: contentBase64,
          committer,
          author,
          headers: {
            "X-GitHub-Api-Version": "2022-11-28"
          }
        };
    
        // Include the sha if updating the file
        if (fileExists) {
          payload.sha = fileSha;
        }
    
        // Create or update the file
        const response = await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", payload);
    
        console.log("File created or updated:", response.data);
    
      } catch (error) {
        console.error("Error creating or updating file:", error);
      }
    };

    // useEffect(() => {
    //   const handleAppStateChange = (newState) => {
    //     if (newState === 'background') {
    //       console.log('App is in background');
    //       // Save necessary state or data
    //     } else if (newState === 'active') {
    //       console.log('App is in foreground');
    //       // Restore necessary state or data
    //     }
    //   };
  
    //   const saveAppState = () => {
    //     // Save state or data to AsyncStorage or other storage
    //     console.log('Saving app state');
    //   };
  
    //   const restoreAppState = () => {
    //     // Restore state or data from AsyncStorage or other storage
    //     console.log('Restoring app state');
    //   };
  
    //   // Add listener for app state changes
    //   const stateChangeListener = AppState.addListener('change', (state) => {
    //     if (state.isActive) {
    //       saveAppState();
    //     } else {
    //       restoreAppState();
    //     }
    //   });
  
    //   // Clean up listener on unmount
    //   return () => {
    //     stateChangeListener.remove();
    //   };
    // }, []);
    
    
 

  return (
    
    <Provider store={store}>

  
          <div className="App">
          <Router>
            <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
              <div style={{ height: "auto", alignItems: "flex-end", display: "flex" }}>
                <UPPER />
              </div>
              <div style={{ flexGrow: 1 }}>
                
              {localStorage.getItem("isVerified") === "1"? 
                <Routes>
                  <Route path='/' element={<HOMEPAGE />} />
                  <Route path="/add" element={<AddEmployee fileName={fileName}/>} />
                  <Route path="/add/stageTwo" element={<STAGETWO fileName={fileName} />} />
                  <Route path="/add/stageThree" element={<STAGETHREE fileName={fileName} />} />
                  <Route path="/add/stageFour" element={<STAGEFOUR fileName={fileName} />} />
                  <Route path="/employee" element={<EMPLOYEEINFO />} />
                  <Route path="/employee/tasks" element={<TASKS />} />
                  <Route path="/account" element={<ACCOUNT />} />
                  <Route path="/notification" element={<NOTIFICATION />} />
                  <Route path="/discounts" element={<Discounts />} />
               
                </Routes>
                 :<>
                 <div className="account-activation-container">
                   <p>يجب تفعيل الحساب</p>
                   <div className="activation-buttons">
                     <button className="refresh-button" onClick={() => window.location.reload()}>تحديث الصفحة</button>
                     <input style={{border: "2px solid black"}} onChange={(event) => setinputvalue(event.target.value)} />
                     <button className="request-activation-button" onClick={sendOrder}>ارسال طلب تفعيل</button>
                     <button className="logout-button" onClick={() => {localStorage.clear(); window.location.reload()}}>تسجيل خروج</button>
                   </div>
                 </div>
               </>
               }
              </div>
              {!localStorage.getItem("userName") && <WelcomeOverlay fileName={fileName}/>}
              <div style={{ height: "auto", alignItems: "flex-end", display: "flex" }}>
                <ROUTERS />
              </div>
            </div>
          </Router>
        </div>
    
 
    </Provider>
  );
}
function WelcomeOverlay() {
  const [mygroupid, setmygroupid] = useState(uuidv4().split("-")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagenum, setPagenum] = useState(0);
  const [selected, setSelected] = useState(0);

  const [ip, setIp] = useState(null);

  const getData = async () => {
    try {
      const res = await axios.get("https://api64.ipify.org/?format=json");
      setIp(res.data.ip);
    } catch (error) {
      console.error("Error fetching the IP address:", error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const [object, setObject] = useState({ 
    name: '', 
    phone: '', 
    password: '', 
    subscription: 0, 
    isAccepted: 0, 
    groupId: mygroupid, 
    myIp: ip 
  });

  useEffect(() => {
    setObject(prevObject => ({
      ...prevObject,
      myIp: ip
    }));
  }, [ip]);

  const [info, setInfo] = useState([]);

  const [usernameinput, setusernameinput] = useState()
  const [userpasswordinput, setuserpasswordinput] = useState()
  const [sendaccountinfo, usesendaccountinfo] = useState(false)

  useEffect(() => {
    fetchData();
    
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const octokit = new Octokit({
        auth: process.env.REACT_APP_GITHUB_AUTH_TOKEN
      });

      const response = await octokit.request("GET /repos/{owner}/{repo}/contents", {
        owner: "SajadKenani",
        repo: "meemdatabase"
      });

      const filesList = await Promise.all(
        response.data.map(async (file) => {
          const fileResponse = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
            owner: "SajadKenani",
            repo: "meemdatabase",
            path: file.path
          });
          const content = fileResponse.data.content;
          const decodedContent = decodeBase64Unicode(content);
          return { name: file.name, content: JSON.parse(decodedContent) };
        })
      );

      setInfo(filesList);
      
    } catch (error) {
      console.error("Error fetching repository contents:", error);
      setError("Error fetching repository contents");
    } finally {
      setLoading(false);
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


  const sendInfo = async (e) => {
    e.preventDefault();
    await fetchData();

    const finalObject = [...info.find(item => item.name === 'admin').content, object];

    sendData(finalObject);
  };

  const sendData = async (updatedContent) => {
    try {
      const octokit = new Octokit({
        auth: process.env.REACT_APP_GITHUB_AUTH_TOKEN,
        baseUrl: 'https://api.github.com'
      });

      const getFileResponse = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
        owner: "SajadKenani",
        repo: "meemdatabase",
        path: "admin"
      });

      const fileSha = getFileResponse.data.sha;

      const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(updatedContent))));

      const response = await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
        owner: "SajadKenani",
        repo: "meemdatabase",
        path: "admin",
        message: "Update admin file",
        content: contentBase64,
        sha: fileSha,
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

      console.log("File updated:", response.data);
      usesendaccountinfo(true)
    } catch (error) {
      console.error("Error updating file:", error);
      // Handle error updating file
    }
  };

  const handleSelectChange = (event) => {
    const subscriptionValue = Number(event.target.value);
    setSelected(subscriptionValue);
    setObject(prev => ({ ...prev, subscription: subscriptionValue }));
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setObject(prev => ({ ...prev, [name]: value }));
  };

  const signInProcess = () => {
    const finalObject = [...info.find(item => item.name === 'admin').content, object];

    for (let i = 0; i < finalObject.length; i++){
      
      if (finalObject[i] && finalObject[i].isAccepted === 1){
        if (usernameinput === finalObject[i].name && userpasswordinput === finalObject[i].password){
          localStorage.setItem("userName", finalObject[i].name);
          localStorage.setItem("userPassword", finalObject[i].password);
          localStorage.setItem("groupId", finalObject[i].groupId);
          localStorage.setItem("isVerified", finalObject[i].isAccepted);

          localStorage.setItem("userID", i);
          

          window.location.reload()

         
        }
 
    
    }else {console.log("Your Account Is not accepted yet")}

    }


  }

  return (
    <div style={{
      width: "100%",
      height: "100vh",
      backgroundColor: "#BD6939",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 9999,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}>
      {pagenum === 0 &&
        <div style={{ display: "flex", alignItems: "start", justifyContent: "center" }}>
          <div className='grid'>
            <img src={mainImage} style={{ width: "400px", height: "400px" }} alt="Main" />
            <h3 style={{ color: "white", fontWeight: "bold", padding: "20px", marginTop: "-15px", marginBottom: "70px" }}>
              اهلا بك في تطبيق قاف، لمساعدتك في أدارة الموظفين
            </h3>
            <div className=''>
              <div>
                <button
                  onClick={() => setPagenum(1)}
                  style={{
                    backgroundColor: "white",
                    width: "80%",
                    height: "60px",
                    borderRadius: "10px",
                    color: "#BD6939",
                    fontWeight: "bold"
                  }}>
                  انشاء حساب
                </button>
                <button onClick={() => setPagenum(6)} style={{ color: "white", fontWeight: "bold", marginTop: "15px" }}>
                  تسجيل الدخول
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      {pagenum === 1 &&

<div style={{ display: "grid", top: "0", width: "100%", alignItems: "start" }}>
<h1 style={{
  textAlign: "end",
  top: "0",
  marginTop: "170px",
  width: "90%",
  color: "white",
  fontWeight: "bold",
  fontSize: "20px"
}}>انشاء حساب جديد</h1>

<div className='flex justify-center form-container' style={{
  height: "700px",
  backgroundColor: "white",
  position: "relative",
  width: "100%",
  borderRadius: "35px",
  marginTop: "50px"
}}>
  <div style={{ width: "80%" }} className='mb-20'>
    <div className="mt-10 " style={{ width: "100%" }}>
      <p style={{ textAlign: "end", fontSize: "18px", color: "#BD6939", fontWeight: "bold" }}>الاسم الكامل</p>
      <input
        name="name"
        value={object.name}
        onChange={handleInputChange}
        style={{
          width: "100%",
          backgroundColor: "#F1F1F1",
          marginTop: "14px",
          height: "50px",
          borderRadius: "5px",
          paddingRight: "10px",
          textAlign: "end"
        }}
        required
      />
    </div>

    <div className="mt-10" style={{ width: "100%" }}>
      <p style={{ textAlign: "end", fontSize: "18px", color: "#BD6939", fontWeight: "bold" }}>رقم الهاتف</p>
      <input
        name="phone"
        value={object.phone}
        onChange={handleInputChange}
        style={{
          width: "100%",
          backgroundColor: "#F1F1F1",
          marginTop: "14px",
          height: "50px",
          borderRadius: "5px",
          paddingRight: "10px",
          textAlign: "end"
        }}
        required
      />
    </div>

    <div className="mt-10" style={{ width: "100%" }}>
      <p style={{ textAlign: "end", fontSize: "18px", color: "#BD6939", fontWeight: "bold" }}>كلمة المرور</p>
      <input
        name="password"
        value={object.password}
        onChange={handleInputChange}
        style={{
          width: "100%",
          backgroundColor: "#F1F1F1",
          marginTop: "14px",
          height: "50px",
          borderRadius: "5px",
          paddingRight: "10px",
          textAlign: "end"
        }}
        required
      />
    </div>

    <select
      style={{
        width: "100%",
        height: "60px",
        borderRadius: "10px",
        border: "1px solid gray",
        marginTop: "60px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer"
      }}
      value={selected}
      onChange={handleSelectChange}
    >
      <option value={0} style={{ color: "#BD6939", fontWeight: "bold" }}>اختر مدة الاشتراك</option>
      <option value={1} style={{ color: "#BD6939", fontWeight: "bold" }}>شهر واحد</option>
      <option value={2} style={{ color: "#BD6939", fontWeight: "bold" }}>شهرين</option>
      <option value={3} style={{ color: "#BD6939", fontWeight: "bold" }}>ثلاثة اشهر</option>
      <option value={4} style={{ color: "#BD6939", fontWeight: "bold" }}>اربعة اشهر</option>
      <option value={5} style={{ color: "#BD6939", fontWeight: "bold" }}>خمسة اشهر</option>
      <option value={6} style={{ color: "#BD6939", fontWeight: "bold" }}>ستة اشهر</option>
    </select>

    <p style={{fontFamily: "Tajawal", fontWeight: "bold", color: "#BD6939", textAlign: "end", marginTop: "10px"}}> تأكد بأنك متصل بشبكة انترنت الشركة عن ارسالك للطلب </p>

    <div className="mt-14 pb-40 mb-40" style={{ width: "100%" }}>
      <button
        onClick={sendInfo}
        className='mb-20'
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
        ارسال الطلب
      </button>
    </div>
  </div>
</div>
{sendaccountinfo && 
   <div style={{
    width: "100%",
    height: "100vh",  // Set height to viewport height
    backgroundColor: "#00000044",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 9999,  // Ensure it's on top
    display: "flex", 
    justifyContent: "center",
    alignItems: "center",

  }}
  >
    <div style={{backgroundColor: "white", width: "80%", height: "300px", borderRadius: "10px", display: "flex", justifyContent: "center", alignItems: "center"}} >


    <div>
    <div className='flex justify-center'> <img src={trueSign} style={{width: "70px", height: "70px"}} /> </div>
    
    <h1 style={{fontSize: "20px", fontWeight: "bold", color: "#5F5F5F"}}> تم ارسال الطلب بنجاح </h1>

    <button
          onClick={(e) => {e.preventDefault(); window.location.assign("/");}}
     
          style={{
            padding: "0 20px 0 20px",
            backgroundColor: "#BD6939",
            marginTop: "14px",
            height: "50px",
            borderRadius: "5px",
            textAlign: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "16px"
          }}>
         الذهاب الى الصفحة الرئيسية
        </button>


    </div>
    </div>

    </div> 
}
</div>
       
      }

{pagenum === 6 &&
        <div style={{ display: "grid", top: "0", width: "100%", alignItems: "start" }}>
          <h1 style={{
            textAlign: "end",
            top: "0",
            marginTop: "170px",
            width: "90%",
            color: "white",
            fontWeight: "bold",
            fontSize: "20px"
          }}>تسجيل الدخول</h1>

          <div className='flex justify-center' style={{
            height: "700px",
            backgroundColor: "white",
            position: "relative",
            width: "100%",
            borderRadius: "35px",
            marginTop: "50px"
          }}>
            <div style={{ width: "80%" }}>
              <div className="mt-10" style={{ width: "100%" }}>
                <p style={{ textAlign: "end", fontSize: "18px", color: "#BD6939", fontWeight: "bold" }}>الاسم الكامل</p>
                <input
                  name="name"
                  onChange={(event) => setusernameinput(event.target.value)}
    
                  style={{
                    width: "100%",
                    backgroundColor: "#F1F1F1",
                    marginTop: "14px",
                    height: "50px",
                    borderRadius: "5px",
                    paddingRight: "10px",
                    textAlign: "end"
                  }}
                  required
                />
              </div>

              <div className="mt-10" style={{ width: "100%" }}>
                <p style={{ textAlign: "end", fontSize: "18px", color: "#BD6939", fontWeight: "bold" }}>كلمة المرور</p>
                <input
                  name="password"
                  onChange={(event) => setuserpasswordinput(event.target.value)}
                  style={{
                    width: "100%",
                    backgroundColor: "#F1F1F1",
                    marginTop: "14px",
                    height: "50px",
                    borderRadius: "5px",
                    paddingRight: "10px",
                    textAlign: "end"
                  }}
                  required
                />
              </div>

              <div className="mt-20" style={{ width: "100%" }}>
                <button
                  onClick={signInProcess}
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
                  تسجيل الدخول
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  );

}




export default App;
