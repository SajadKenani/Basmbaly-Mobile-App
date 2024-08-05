import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Octokit } from "@octokit/core";
import maleLogo from "./images/maleImage.png";
import arrow from "./images/Arrow.png";
import trueSign from "./images/trueSign.png";
import { useNavigate } from "react-router-dom";
import { TASKS } from "./tasks";

export const EMPLOYEEINFO = () => {
    const [page, setPage] = useState(0);
    const selected = useSelector((state) => state.employee.employeeSelected);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [info, setInfo] = useState([]);
    const navigate = useNavigate()

    const [success, setsuccess] = useState(false);
    const [deleteUser, usedeleteUser] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        setInfo(files);
    }, [files]);

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

            setFiles(filesList);
        } catch (error) {
            console.error("Error fetching repository contents:", error);
            setError("Error fetching repository contents");
        } finally {
            setLoading(false);
        }
    };

    const sendData = async (info, filePath) => {
      const infoObject = info;
      setLoading(true);
      setError(null);
  
      try {
          const octokit = new Octokit({
              auth: process.env.REACT_APP_GITHUB_AUTH_TOKEN,
              baseUrl: 'https://api.github.com',
          });
  
          const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(infoObject))));
  
          let fileExists = false;
          let sha = null;
  
          // Check if the file exists
          try {
              const { data: fileData } = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
                  owner: "SajadKenani",
                  repo: "meemdatabase",
                  path: filePath,
              });
              fileExists = true;
              sha = fileData.sha;
          } catch (error) {
              if (error.status === 404) {
                  fileExists = false;
              } else {
                  throw error;
              }
          }
  
          // Create or update the file
          const response = await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
              owner: "SajadKenani",
              repo: "meemdatabase",
              path: filePath,
              message: fileExists ? "Update file" : "Add new file",
              content: contentBase64,
              sha: fileExists ? sha : undefined,
              committer: {
                  name: "Your Name",
                  email: "your-email@example.com",
              },
              author: {
                  name: "Your Name",
                  email: "your-email@example.com",
              },
              headers: {
                  "X-GitHub-Api-Version": "2022-11-28",
              },
          });
  
          console.log("File created or updated:", response.data);
          setsuccess(true)
          setLoading(false);
   
      } catch (error) {
          console.error("Error creating or updating file:", error);
          setError("Error creating or updating file");
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

    const handleDiscountObject = (event) => {
        event.preventDefault();

        const newDiscount = { price: "", hours: "0", minutes: "0" };

        const updatedDiscounts = [...info[selected].content[0].employeeDiscount, newDiscount];

        const updatedContent = info[selected].content.map((contentItem, index) => {
            if (index === 0) {
                return {
                    ...contentItem,
                    employeeDiscount: updatedDiscounts
                };
            }
            return contentItem;
        });

        const updatedData = info.map((dataItem, index) => {
            if (index === selected) {
                return {
                    ...dataItem,
                    content: updatedContent
                };
            }
            return dataItem;
        });

        setInfo(updatedData);
    };

    const handleRemoveDiscount = (index) => {
        const updatedDiscounts = info[selected].content[0].discount.filter((_, i) => i !== index);

        const updatedContent = info[selected].content.map((contentItem, contentIndex) => {
            if (contentIndex === 0) {
                return {
                    ...contentItem,
                    employeeDiscount: updatedDiscounts
                };
            }
            return contentItem;
        });

        const updatedData = info.map((dataItem, dataIndex) => {
            if (dataIndex === selected) {
                return {
                    ...dataItem,
                    employeeDiscount: updatedContent
                };
            }
            return dataItem;
        });

        setInfo(updatedData);
    };

    const submitInfo = () => {
      sendData(info[selected].content, files[selected].name)

    }

    const handleNameChange = (e) => {
      const updatedInfo = info.map((item, index) => {
          if (index === selected) {
              const updatedContent = [...item.content];
              updatedContent[0] = {
                  ...updatedContent[0],
                  employeeName: e.target.value
              };
              return { ...item, content: updatedContent };
          }
          return item;
      });

      setInfo(updatedInfo);
  };

  const handlePhoneChange = (e) => {
    const updatedInfo = info.map((item, index) => {
        if (index === selected) {
            const updatedContent = [...item.content];
            updatedContent[0] = {
                ...updatedContent[0],
                employeePhone: e.target.value
            };
            return { ...item, content: updatedContent };
        }
        return item;
    });

    setInfo(updatedInfo);
};

const handleSalaryChange = (e) => {
  const updatedInfo = info.map((item, index) => {
      if (index === selected) {
          const updatedContent = [...item.content];
          updatedContent[0] = {
              ...updatedContent[0],
              employeeSalary: e.target.value
          };
          return { ...item, content: updatedContent };
      }
      return item;
  });

  setInfo(updatedInfo);
};

const handlePasswordChange = (e) => {
  const updatedInfo = info.map((item, index) => {
      if (index === selected) {
          const updatedContent = [...item.content];
          updatedContent[0] = {
              ...updatedContent[0],
              employeePassword: e.target.value
          };
          return { ...item, content: updatedContent };
      }
      return item;
  });

  setInfo(updatedInfo);

};

const handleStartdChange = (e) => {
    const updatedInfo = info.map((item, index) => {
        if (index === selected) {
            const updatedContent = [...item.content];
            updatedContent[0] = {
                ...updatedContent[0],
                employeeStart: e.target.value
            };
            return { ...item, content: updatedContent };
        }
        return item;
    });
  
    setInfo(updatedInfo);
  
  };

const handleDiscountChange = (e, i) => {
  e.preventDefault();
  const updatedInfo = info.map((item, index) => {
    if (index === selected) {
      const updatedContent = [...item.content];
      updatedContent[0] = {
        ...updatedContent[0],
        employeeDiscount: updatedContent[0].employeeDiscount.map((discountItem, discountIndex) => {
          if (discountIndex === i) {
            return {
              ...discountItem,
              price: e.target.value
            };
          }
          return discountItem;
        })
      };
      return { ...item, content: updatedContent };
    }
    return item;
  });

  setInfo(updatedInfo);
};

const handleHoursChange = (e, i) => {
  e.preventDefault();
  const updatedInfo = info.map((item, index) => {
    if (index === selected) {
      const updatedContent = [...item.content];
      updatedContent[0] = {
        ...updatedContent[0],
        employeeDiscount: updatedContent[0].employeeDiscount.map((discountItem, discountIndex) => {
          if (discountIndex === i) {
            return {
              ...discountItem,
              hours: e.target.value
            };
          }
          return discountItem;
        })
      };
      return { ...item, content: updatedContent };
    }
    return item;
  });

  setInfo(updatedInfo);
};

const handleMinutesChange = (e, i) => {
  e.preventDefault();
  const updatedInfo = info.map((item, index) => {
    if (index === selected) {
      const updatedContent = [...item.content];
      updatedContent[0] = {
        ...updatedContent[0],
        employeeDiscount: updatedContent[0].employeeDiscount.map((discountItem, discountIndex) => {
          if (discountIndex === i) {
            return {
              ...discountItem,
              minutes: e.target.value
            };
          }
          return discountItem;
        })
      };
      return { ...item, content: updatedContent };
    }
    return item;
  });

  setInfo(updatedInfo);
};
const deleteFile = async (objectId) => {
    setLoading(true);
    setError(null);

    try {
        const octokit = new Octokit({
            auth: process.env.REACT_APP_GITHUB_AUTH_TOKEN,
        });

        const filePath = files[objectId].name; // Assuming files is an array of objects containing 'path' property
        console.log(filePath)

        // Check if the file exists before deleting
        const { data: fileData } = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
            owner: "SajadKenani",
            repo: "meemdatabase",
            path: filePath,
        });

        const sha = fileData.sha;

        // Delete the file
        await octokit.request("DELETE /repos/{owner}/{repo}/contents/{path}", {
            owner: "SajadKenani",
            repo: "meemdatabase",
            path: filePath,
            message: "Delete file",
            sha: sha,
            committer: {
                name: "Your Name",
                email: "your-email@example.com",
            },
            author: {
                name: "Your Name",
                email: "your-email@example.com",
            },
            headers: {
                "X-GitHub-Api-Version": "2022-11-28",
            },
        });

        console.log("File deleted successfully");
        setFiles(files.filter((file, index) => index !== objectId)); // Update state to remove deleted file
        usedeleteUser(true)
    } catch (error) {
        console.error("Error deleting file:", error);
        setError("Error deleting file: " + error.message); // Update error state with more details
    } finally {
        setLoading(false);
    }
};





    return (
        <div>
              
   

            {page === 0 && (
                <>
                    <div className="flex justify-center mt-10">
                        <img src={maleLogo} alt="Male Logo" />
                    </div>
                    <div className="mt-4 p-6" style={{ width: "100%" }}>
                        <p style={{ textAlign: "end", fontSize: "16px", color: "#BD6939", fontWeight: "bold", fontSize: "18px" }}>الاسم الكامل</p>
                        <input
                            style={{ width: "100%", backgroundColor: "#F1F1F1", marginTop: "14px", height: "50px", borderRadius: "5px", paddingRight: "10px", textAlign: "end" }}
                            value={info[selected] && info[selected].content[0].employeeName}
                            onChange={handleNameChange}
                            required
                            
                        />
                    </div>
                    <div className="-mt-6 p-6" style={{ width: "100%" }}>
                        <p style={{ textAlign: "end", fontSize: "16px", color: "#BD6939", fontWeight: "bold", fontSize: "18px" }}>رقم الهاتف</p>
                        <input
                            style={{ width: "100%", backgroundColor: "#F1F1F1", marginTop: "14px", height: "50px", borderRadius: "5px", paddingRight: "10px", textAlign: "end" }}
                            value={info[selected] && info[selected].content[0].employeePhone}
                            onChange={handlePhoneChange}
                            required
                            
                        />
                    </div>
                </>
            )}

            {page === 1 && (
                <>
                    <div className="flex justify-center"></div>
                    <div className="mt-4 p-6" style={{ width: "100%" }}>
                        <p style={{ textAlign: "end", fontSize: "16px", color: "#BD6939", fontWeight: "bold", fontSize: "18px" }}>راتب الموظف الشهري</p>
                        <input
                            style={{ width: "100%", backgroundColor: "#F1F1F1", marginTop: "14px", height: "50px", borderRadius: "5px", paddingRight: "10px", textAlign: "end" }}
                            value={info[selected] && info[selected].content[0].employeeSalary}
                            onChange={handleSalaryChange}
                            required
                            
                        />
                    </div>
                    <div className="-mt-6 p-6" style={{ width: "100%" }}>
                        <p style={{ textAlign: "end", fontSize: "16px", color: "#BD6939", fontWeight: "bold", fontSize: "18px" }}>كلمة مرور الموظف</p>
                        <input
                            style={{ width: "100%", backgroundColor: "#F1F1F1", marginTop: "14px", height: "50px", borderRadius: "5px", paddingRight: "10px", textAlign: "end" }}
                            value={info[selected] && info[selected].content[0].employeePassword}
                            onChange={handlePasswordChange}
                            required
                            
                        />
                    </div>
                    <div className="-mt-6 p-6" style={{ width: "100%" }}>
                        <p style={{ textAlign: "end", fontSize: "16px", color: "#BD6939", fontWeight: "bold", fontSize: "18px" }}>وقت حضور الموظف</p>
                        <input
                            style={{ width: "100%", backgroundColor: "#F1F1F1", marginTop: "14px", height: "50px", borderRadius: "5px", paddingRight: "10px", textAlign: "end" }}
                            value={info[selected] && info[selected].content[0].employeeStart }
                            onChange={handleStartdChange}
                            required
                            
                        />
                    </div>
                </>
            )}

            {page === 2 && (
                <>
                                                  <div className="mt-4 p-6 -mb-14" style={{ width: "100%" }}>
                        <p style={{ textAlign: "end", fontSize: "16px", color: "#BD6939", fontWeight: "bold", fontSize: "18px" }}>الخصومات  </p>
                  
                    
                    </div>
                    {info[selected] && info[selected].content[0].employeeDiscount && info[selected].content[0].employeeDiscount.map((item, index) => (
                        <div key={index}>
         
                            <div className="flex p-4 ">
                                <div className="mt-10 p-1" style={{ width: "100%" }}>
                                    <p style={{ textAlign: "end", fontSize: "16px", color: "#7F7F7F" }}>المبلغ المراد خصمه</p>
                                    <div className="flex">
                                        <div className="flex" style={{ alignItems: "center", justifyContent: "center", padding: "10px" }}>
                                            <div
                                                style={{ backgroundColor: "red", width: "20px", height: "20px", borderRadius: "10000px", marginTop: "8px", cursor: "pointer" }}
                                                onClick={() => handleRemoveDiscount(index)}
                                            ></div>
                                        </div>
                                        <input
                                            type="number"
                                            min="0"
                                            value={item.price}
                                            style={{ width: "100%", backgroundColor: "#F1F1F1", marginTop: "14px", height: "50px", borderRadius: "5px", paddingRight: "10px", textAlign: "end" }}
                                            onChange={(e) => handleDiscountChange(e, index)}
                                            
                                        />
                                    </div>
                                </div>

                                <div className="mt-10 p-1" style={{ width: "100%" }}>
                                    <p style={{ textAlign: "end", fontSize: "16px", color: "#7F7F7F" }}>مدة التأخير</p>
                                    <div className="flex">
                                        <p style={{ fontFamily: "Tajawal", alignItems: "center", display: "flex" }}>
                                            <span style={{ fontFamily: "Tajawal", fontWeight: "bold", color: "#7F7F7F" }}>د</span>
                                        </p>
                                        <input
                                            type="number"
                                            min="0"
                                            value={item.minutes}
                                            style={{ width: "100%", backgroundColor: "#F1F1F1", marginTop: "14px", height: "50px", borderRadius: "5px", paddingRight: "10px", textAlign: "end" }}
                                            className="m-1"
                                            onChange={(e) => handleMinutesChange(e, index)}
                                            
                                        />
                                        <p style={{ fontFamily: "Tajawal", alignItems: "center", display: "flex", color: "#7F7F7F" }}>
                                            <span style={{ fontFamily: "Tajawal", fontWeight: "bold" }}>س</span>
                                        </p>
                                        <input
                                            type="number"
                                            min="0"
                                            value={item.hours}
                                            style={{ width: "100%", backgroundColor: "#F1F1F1", marginTop: "14px", height: "50px", borderRadius: "5px", paddingRight: "10px", textAlign: "end" }}
                                            className="m-1"
                                            onChange={(e) => handleHoursChange(e, index)}
                                            
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="mt-4 flex justify-around p-4 mt-4" style={{ width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <button
                                style={{
                                    width: "30px",
                                    height: "30px",
                                    backgroundColor: "#BD6939",
                                    marginTop: "20px",
                                    borderRadius: "5px",
                                    textAlign: "center",
                                    color: "white",
                                    fontWeight: "bold",
                                    fontSize: "16px",
                                    borderRadius: "1000px",
                                    margin: "10px",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "0"
                                }}
                            >
                                ?
                            </button>
                        </div>
                        <button
                            style={{
                                backgroundColor: "#BD6939",
                                marginTop: "14px",
                                height: "50px",
                                borderRadius: "5px",
                                textAlign: "center",
                                color: "white",
                                fontWeight: "bold",
                                fontSize: "16px",
                                paddingLeft: "20px",
                                paddingRight: "20px",
                            }}
                            onClick={handleDiscountObject}
                        >
                            اضافة مدة خصم
                        </button>
                    </div>
                </>
            )}

            <div className="flex flex-col h-full justify-center relative" style={{ height: "100%" }}>
                <div className="mt-auto w-full p-8 pb-32">
                    <div className="flex justify-center">
                        <div
                            onClick={() => page > 0 ? setPage(page - 1) : setPage(2)}
                            className="m-2 flex cursor-pointer items-center justify-center rounded-full"
                            style={{ width: "60px", height: "60px", backgroundColor: "#BD6939" }}
                        >
                            <img style={{ transform: "rotate(180deg)" }} src={arrow} alt="Arrow" />
                        </div>
                        <div
                            onClick={() => page < 2 ? setPage(page + 1) : setPage(0)}
                            className="m-2 flex cursor-pointer items-center justify-center rounded-full"
                            style={{ width: "60px", height: "60px", backgroundColor: "#BD6939" }}
                        >
                            <img src={arrow} alt="Arrow" />
                        </div>
                    </div>
                    <button
                        style={{
                            width: "100%",
                            border: "1px solid #BD6939",
                            marginTop: "14px",
                            height: "50px",
                            borderRadius: "5px",
                            textAlign: "center",
                            fontWeight: "bold",
                            fontSize: "16px",
                            color: "#BD6939",
                            backgroundColor: "white",
                        }}
                        onClick={() => navigate("/discounts")}
                       
                    >
                        الخصومات
                    </button>
                    <button
                        style={{
                            width: "100%",
                            border: "1px solid #BD6939",
                            marginTop: "14px",
                            height: "50px",
                            borderRadius: "5px",
                            textAlign: "center",
                            fontWeight: "bold",
                            fontSize: "16px",
                            color: "#BD6939",
                            backgroundColor: "white",
                        }}
                        onClick={() => deleteFile(info[selected] && selected)}
                       
                    >
                        حذف الموظف
                    </button>
                    <button
                        style={{
                            width: "100%",
                            border: "1px solid #BD6939",
                            marginTop: "14px",
                            height: "50px",
                            borderRadius: "5px",
                            textAlign: "center",
                            fontWeight: "bold",
                            fontSize: "16px",
                            color: "#BD6939",
                            backgroundColor: "white",
                        }}
                        onClick={() => navigate("/employee/tasks")}
                       
                    > 
                        المهام
                    </button>
                    <button
                    onClick={submitInfo}
                        style={{
                            width: "100%",
                            backgroundColor: "#BD6939",
                            marginTop: "14px",
                            height: "50px",
                            borderRadius: "5px",
                            textAlign: "center",
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "16px",
                        }}
                    >
                        حفظ المعلومات
                    </button>
                </div>
            </div>

        { success &&   
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
      
      <h1 style={{fontSize: "20px", fontWeight: "bold", color: "#5F5F5F"}}> تم التعديل بنجاح </h1>

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

      </div> }

      {deleteUser && 
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
        
        <h1 style={{fontSize: "20px", fontWeight: "bold", color: "#5F5F5F"}}> تم الحذف بنجاح </h1>
  
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


        </div>
    );
};
