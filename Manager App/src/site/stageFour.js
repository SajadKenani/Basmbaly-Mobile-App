import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import QRCode from 'qrcode.react';
import { Octokit } from '@octokit/rest';
import trueSign from "./images/trueSign.png"
import { setEmployeeGroupId } from '../actions/employeeActions'; 
import axios from 'axios';

function STAGEFOUR({ fileName }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(fileName);
  const qrCodeRef = useRef(null);
  const info = useSelector((state) => state.employee);

  const [filesent, setfilesent] = useState(false)

    

  useEffect(() => {
    setQrCodeData(fileName);
    dispatch(setEmployeeGroupId(localStorage.getItem("groupId")))
  }, [fileName]);

  const downloadQRCode = (event) => {
    event.preventDefault();
    const canvas = qrCodeRef.current.querySelector('canvas');

    if (!canvas) {
      console.error("Canvas element not found");
      return;
    }

    const url = canvas.toDataURL();
    const a = document.createElement("a");
    a.href = url;
    a.download = `${qrCodeData}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const sendInfo = async (e, infoObject) => {
    
    console.log(infoObject)
    e.preventDefault();
    sendData(infoObject);
  };

  const sendData = async (info) => {
    const infoObject = [info] 
    setLoading(true);
    setError(null);
    
    try {
      const octokit = new Octokit({
        auth: process.env.REACT_APP_GITHUB_AUTH_TOKEN,
        baseUrl: 'https://api.github.com', // Optional: Ensure base URL is correct
      });
  
      const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(infoObject))));
        
      const response = await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
        owner: "SajadKenani",
        repo: "meemdatabase",
        path: qrCodeData,
        message: "Add new file",
        content: contentBase64,
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
  
      console.log("File created:", response.data);
      setLoading(false);
      setfilesent(true)
    } catch (error) {
      console.error("Error creating file:", error);
      setError("Error creating file");
      setLoading(false);
    }
  };

  return (
    <form className="pl-10 pr-10 pt-10" style={{ width: "100%", height: "56vh", boxShadow: "0px -30px 10px 10px rgba(0, 0, 0, 0.04)", zIndex: "2", borderRadius: "35px" }}>
      <div>
        <div>
          <div className="flex justify-between" style={{ alignItems: "center" }}>
            <p style={{ fontWeight: "bold" }}>ID: {fileName}</p>
            <h3 style={{ fontSize: "24px", fontWeight: "bold", color: "#5F5F5F" }}> اضافة موظف </h3>
          </div>

          <p className='mt-12' style={{ textAlign: "start", fontSize: "16px", color: "#7F7F7F", direction: "rtl" }}> ال QR Code الخاص بالموظف </p>

          <div className="mt-4">
            <div className="flex items-center justify-center bg-white rounded border border-gray-300 p-4">
              <div ref={qrCodeRef}>
                <QRCode value={qrCodeData} />
              </div>
            </div>
            <button onClick={downloadQRCode} className=" text-white py-2 px-4 rounded mt-6" style={{backgroundColor: "#BD6939"}}> تحميل </button>
          </div>

        </div>
      </div>

      <div className="mt-20" style={{ width: "100%" }}>
        <button
          onClick={(e) => sendInfo(e, info)}
          style={{
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
          اتمام العملية
        </button>
      </div>

      { filesent &&

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
      
      <h1 style={{fontSize: "20px", fontWeight: "bold", color: "#5F5F5F"}}> تم اضافة الموظف بنجاح </h1>

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
           العودة الى الصفحة الرسيسية
          </button>
 

      </div>
      </div>

      </div> 

          }
    </form>
  );
}

export default STAGEFOUR;
