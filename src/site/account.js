import { useState, useEffect } from "react";
import { Octokit } from "@octokit/core";
import maleImage from "./images/maleImage.png"
import trueSign from "./images/trueSign.png"

export const ACCOUNT = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState([]);
  const [data, setData] = useState([]);
  const [subscriptionMonths, setSubscriptionMonths] = useState(""); // State to hold input value
  const [orderstate, setorderstate] = useState(false)

  useEffect(() => {
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

        setInfo(filesList);
      } catch (error) {
        console.error("Error fetching repository contents:", error);
        setError("Error fetching repository contents");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (info.length > 0) {
      const finalObject = info.find((item) => item.name === "admin")?.content ?? [];
      setData(finalObject);
    }
  }, [info]);

  const decodeBase64Unicode = (str) => {
    const decoded = atob(str.replace(/\s/g, ""));
    try {
      return decodeURIComponent(escape(decoded));
    } catch (error) {
      return decoded;
    }
  };

  const updateSubscription = (index, newSubscription) => {
    const updatedData = [...data];
    updatedData[index].subscription = newSubscription;
    setData(updatedData);
  };

  const saveSubscription = async (index) => {
    const updatedData = [...data];

    // Add the new key-value pair to the object at the specified index
    updatedData[index].saveSub = subscriptionMonths;

    console.log(updatedData);

    setData(updatedData);
    await sendData(updatedData);
  };

  const sendData = async (updatedContent) => {
    try {
      const octokit = new Octokit({
        auth: process.env.REACT_APP_GITHUB_AUTH_TOKEN,
        baseUrl: "https://api.github.com",
      });

      const getFileResponse = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
        owner: "SajadKenani",
        repo: "meemdatabase",
        path: "orders",
      });

      const fileSha = getFileResponse.data.sha;
      const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(updatedContent))));

      const response = await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
        owner: "SajadKenani",
        repo: "meemdatabase",
        path: "orders",
        message: "Updated orders with subscription extension",
        content: contentBase64,
        sha: fileSha,
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
      setorderstate(true)
      console.log("Orders file updated:", response.data);
    } catch (error) {
      console.error("Error updating orders file:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
    return formattedDate;
  };

  const handleSigningOut = () => {
    localStorage.clear();
    window.location.assign("");
    window.location.reload();
  };

  return (
    <div className="home-container ">
    {loading && <p>Loading...</p>}
    {error && <p>{error}</p>}
    <div className="flex justify-center pb-10">
      {data.map((file, index) => (
        file.name !== "admin" && file.groupId === localStorage.getItem("groupId") && (
          <div className=" mt-20" key={index}>
            <div className="card-item ">
              <div className="flex justify-center items-center w-full">
                <img src={maleImage} alt="Male" style={{ width: "100px", height: "100px", borderRadius: "50%" }} />
              </div>
              <strong> {file.name} </strong>
              <label className="">
                <div style={{ color: "#BD6939", marginTop: "20px" }}>
                  <strong>مدة الاشتراك:</strong> {file.subscription} أشهر
                </div>
              </label>
              <div className="card-item" style={{ color: "#BD6939" }}>
                <strong>حالة التفعيل:</strong>{" "}
                {file.isAccepted ? "مفعل" : "غير مفعل"}
              </div>
            </div>
            <div className="card-item -mt-2" style={{ color: "#BD6939" }}>
              <strong>تاريخ الانتهاء:</strong> {formatDate(file.expirationDate)}
            </div>
            <div style={{ bottom: "0px", marginTop: "100px" }}>
              <input
                type="number"
                value={subscriptionMonths}
                onChange={(e) => setSubscriptionMonths(e.target.value)}
                placeholder="اكتب مدة التمديد"
                style={{
                  width: "80%",
                  height: "50px",
                  borderRadius: "6px",
                  padding: "10px",
                  marginBottom: "10px",
                }}
              />
              <button
                onClick={() => saveSubscription(index)}
                disabled={!subscriptionMonths}
                style={{
                  color: "white",
                  backgroundColor: subscriptionMonths ? "#BD6939" : "#ccc",
                  fontWeight: "bold",
                  marginTop: "15px",
                  width: "80%",
                  height: "50px",
                  borderRadius: "6px",
                }}
              >
                تمديد الاشتراك
              </button>
              <button
                onClick={handleSigningOut}
                style={{
                  backgroundColor: "white",
                  width: "80%",
                  height: "50px",
                  borderRadius: "6px",
                  color: "#BD6939",
                  fontWeight: "bold",
                  marginTop: "80px",
                  border: "2px solid #BD6939",
                }}
              >
                تسجيل الخروج
              </button>
            </div>
            {orderstate && 

            
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
        
        <h1 style={{fontSize: "20px", fontWeight: "bold", color: "#5F5F5F"}}> تم ارسال طلبك بنجاح </h1>
  
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
             العودة الى الصفحة الرئيسية
            </button>
   
  
        </div>
        </div>
  
        </div> 

            }
          </div>
        )
      ))}
    </div>
  </div>
  
  );
};
