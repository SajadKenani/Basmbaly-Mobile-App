import React, { useState, useEffect } from "react";
import { Octokit } from "@octokit/core";
import { v4 as uuidv4 } from "uuid";
import phone from "./images/phone.png";
import maleImage from "./images/maleImage.png";
import { setSelectedEmployee } from "../actions/employeeActions";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const HOMEPAGE = () => {
  const dispatch = useDispatch();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Poll every 60 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
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
                try {
                    const fileResponse = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
                        owner: "SajadKenani",
                        repo: "meemdatabase",
                        path: file.path,
                    });

                    const content = fileResponse.data.content;
                    const decodedContent = decodeBase64Unicode(content);
                    return { name: file.name, content: JSON.parse(decodedContent) };
                } catch (error) {
                    if (error.status === 404) {
                        console.warn(`File not found (${file.path}):`, error);
                        return null; // Ignore this file
                    } else {
                        console.error(`Error fetching file ${file.path}:`, error);
                        throw error; // Throw other errors to be handled globally
                    }
                }
            })
        );

        // Filter out null values (failed requests)
        const filteredFilesList = filesList.filter((file) => file !== null);
        setFiles(filteredFilesList);
    } catch (error) {
        console.error("Error fetching repository contents:", error);
        setError("Error fetching repository contents");
    } finally {
        setLoading(false);
    }
};

console.log(files)
  const decodeBase64Unicode = (str) => {
    const decoded = atob(str.replace(/\s/g, ""));
    try {
      return decodeURIComponent(escape(decoded));
    } catch (error) {
      return decoded;
    }
  };

  const handleSelected = (index) => {
    dispatch(setSelectedEmployee(index));
    localStorage.setItem("EID", files[index].name)
    
    navigate("/employee");
  };

  return (
    <div className="container mx-auto px-4 py-8 mb-20">
      <div className="">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-right mr-6" style={{ color: "#5F5F5F" }}>
          الموظفين
          <p style={{fontSize: "14px", fontWeight: "400"}}>  (قد يأحذ الموظف الجديد بعض الوقت للظهور) </p>
          <p style={{fontSize: "14px", fontWeight: "400", color: "#BD6939"}} onClick={() => fetchData()}> تحديث  </p>
          </h2>
          <div>
            {files.map((file, index) => {
              const groupId = localStorage.getItem("groupId");
              if (file.name !== "admin" && file.name !== "orders" && groupId && file.content && file.content.length > 0 && file.content[0].groupId === groupId) {
                return (
                  <div className="flex justify-center mt-4 w-full" key={index} style={{ cursor: "pointer" }} onClick={() => handleSelected(index)}>
                    <div className="w-11/12 h-24 bg-white rounded-lg border border-gray-400 shadow-md flex p-4">
                      <div className="flex items-center w-full">
                        <div className="flex items-center justify-center flex-col">
                          <img src={maleImage} className="w-12" alt="Male" />
                          <p className="text-center">{file.name}</p>
                        </div>
                      </div>
                      <div className="flex flex-col justify-center w-full">
                        <p className="text-right" style={{ fontWeight: "bold", fontSize: "16px", color: "#BD6939" }}>{file.content[0].employeeName}</p>
                        <div className="flex justify-end mt-2">
                          <div className="flex items-center mr-6">
                            <img src={phone} className="w-5 h-5" alt="Phone" />
                            <p className="">{file.content[0].employeeTitle}</p>
                          </div>
                          <div className="flex items-center">
                            <img src={phone} className="w-5 h-5" alt="Phone" />
                            <p className="">{file.content[0].employeeSalary}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              } else {
                return null;
              }
            })}

            {files.length === 0 && !loading && (
              <p className="text-center mt-4 text-xl" style={{ color: "#BD6939" }}>
                لا يوجد موظفين
              </p>
            )}
            {loading && (
              <p className="text-center mt-4 text-xl" style={{ color: "#BD6939" }}>
                جار التحميل...
              </p>
            )}
            {error && (
              <p className="text-center mt-4 text-xl" style={{ color: "red" }}>
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    
    </div>
  );
}

export default HOMEPAGE;
