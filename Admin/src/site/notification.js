import React, { useState, useEffect } from "react";
import { Octokit } from "@octokit/core";
import { useNavigate } from "react-router-dom";
import "../site/comingOrders.css"; // Adjust the path as per your CSS file

const NOTIFICATION = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState([]);
  const [notification, setNotification] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const navigate = useNavigate();

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
    if (info && info.length > 0) {
      const finalObject = info.find((item) => item.name === "notification")?.content ?? [];
      setNotification(finalObject);
    }
  }, [info]);

  const deleteOrder = async (index) => {
    setDeleting(true);
    try {
      // Create a copy of the orders array and remove the selected order
      const updatedOrders = [...notification];
      updatedOrders.splice(index, 1); // Assuming index is provided by caller

      // Update the state
      setNotification(updatedOrders);

      // Prepare the content for GitHub update
      const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(updatedOrders))));

      const octokit = new Octokit({
        auth: process.env.REACT_APP_GITHUB_AUTH_TOKEN,
      });

      // Get the SHA of the current file
      const { data } = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
        owner: "SajadKenani",
        repo: "meemdatabase",
        path: "notification",
      });

      const sha = data.sha;

      // Update the file on GitHub
      await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
        owner: "SajadKenani",
        repo: "meemdatabase",
        path: "notification",
        message: "Update notification",
        content: contentBase64,
        sha: sha,
        committer: {
          name: "Your Name",
          email: "your-email@example.com",
        },
        author: {
          name: "Your Name",
          email: "your-email@example.com",
        },
      });

      console.log("Notification updated and file updated on GitHub");

    } catch (error) {
      console.error("Error updating notification:", error);
      setError("Error updating notification");
    } finally {
      setDeleting(false);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const sendNotification = async () => {
    if (!inputValue.trim()) return; // Check if input is empty or only whitespace

    const updatedNotification = [...notification, { message: inputValue.trim() }];

    // Update state with the new notification
    setNotification(updatedNotification);

    // Prepare content for GitHub update
    const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(updatedNotification))));

    const octokit = new Octokit({
      auth: process.env.REACT_APP_GITHUB_AUTH_TOKEN,
    });

    try {
      // Get SHA of current file
      const { data } = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
        owner: "SajadKenani",
        repo: "meemdatabase",
        path: "notification",
      });

      const sha = data.sha;

      // Update file on GitHub
      await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
        owner: "SajadKenani",
        repo: "meemdatabase",
        path: "notification",
        message: "Add new notification",
        content: contentBase64,
        sha: sha,
        committer: {
          name: "Your Name",
          email: "your-email@example.com",
        },
        author: {
          name: "Your Name",
          email: "your-email@example.com",
        },
      });

      console.log("Notification added and file updated on GitHub");
      setInputValue(""); // Clear input field after sending
    } catch (error) {
      console.error("Error adding notification:", error);
      setError("Error adding notification");
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

  return (
    <div>
      <div>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="اكتب رسالتك هنا"
          style={{
            width: "80%",
            height: "50px",
            borderRadius: "6px",
            padding: "10px",
            marginBottom: "10px",
          }}
        />
        <button
          onClick={sendNotification}
          style={{
            color: "white",
            backgroundColor: inputValue.trim() ? "#BD6939" : "#ccc",
            fontWeight: "bold",
            marginTop: "15px",
            width: "80%",
            height: "50px",
            borderRadius: "6px",
          }}
        >
        ارسل راسلة للتنبيهات
        </button>
      </div>

      <div style={{width: "90%"}}>
  <h2 className="text-2xl font-bold mb-4 text-right mr-10 mt-8 " style={{ color: "#5F5F5F", textAlign: "end"  }}>
    التنبيهات
  </h2>
  <div className="m-10">
    {loading && <p className="text-center text-gray-500">جار التحميل...</p>}
    {error && <p className="text-center text-red-500">{error}</p>}
    {notification && notification.length > 0 ? (
      <div className="space-y-4">
        {notification.map((item, index) => (
          <div className="flex">
            <div style={{textAlign: "end"}} className="p-4 bg-white shadow-md rounded-lg" key={index}>
            <div style={{textAlign: "end"}} className="text-lg font-semibold text-gray-800">{item.message}</div>
           
          </div>
          
          </div>
        ))}
      </div>
    ) : (
      <p className="text-center text-gray-500">لايوجد تنبيهات</p>
    )}
  </div>
</div>
    </div>
  );
};

export default NOTIFICATION;
