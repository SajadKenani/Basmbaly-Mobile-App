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
  <h2 className="text-2xl font-bold mb-4 text-right mr-10 mt-8" style={{ color: "#5F5F5F" }}>
    التنبيهات
  </h2>
  <div className="m-10">
    {loading && <p className="text-center text-gray-500">جار التحميل...</p>}
    {error && <p className="text-center text-red-500">{error}</p>}
    {notification && notification.length > 0 ? (
      <div className="space-y-4">
        {notification.map((item, index) => (
    
          <div className="p-4 bg-white shadow-md rounded-lg" key={index}>
            <div className="text-lg font-semibold text-gray-800">{item.message}</div>
            <div className="text-sm text-gray-500">{item.date}</div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-center text-gray-500">لايوجد تنبيهات</p>
    )}
  </div>
</div>

  );
};

export default NOTIFICATION;
