import React, { useState, useEffect } from "react";
import { Octokit } from "@octokit/core";
import "../site/comingOrders.css"; // Adjust the path as per your CSS file
import { useNavigate } from "react-router-dom";

const ComingOrders = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState([]);
  const [orders, setOrders] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate()

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
      const finalObject = info.find((item) => item.name === "orders")?.content ?? [];
      setOrders(finalObject);
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

  const deleteOrder = async (index) => {
    setDeleting(true);
    try {
      // Create a copy of the orders array and remove the selected order
      const updatedOrders = [...orders];
      updatedOrders.splice(index, 1);

      // Update the state
      setOrders(updatedOrders);

      // Prepare the content for GitHub update
      const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(updatedOrders))));

      const octokit = new Octokit({
        auth: process.env.REACT_APP_GITHUB_AUTH_TOKEN,
      });

      // Get the SHA of the current file
      const { data } = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
        owner: "SajadKenani",
        repo: "meemdatabase",
        path: "orders",
      });

      const sha = data.sha;

      // Update the file on GitHub
      await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
        owner: "SajadKenani",
        repo: "meemdatabase",
        path: "orders",
        message: "Delete order",
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

      console.log("Order deleted and file updated on GitHub");

    } catch (error) {
      console.error("Error deleting order:", error);
      setError("Error deleting order");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="coming-orders-container">
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      <div className="coming-orders-list">
        <h2>الطلبات</h2>
        <button onClick={() => navigate("/")}> العودة </button>
        {orders.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>الاسم</th>
                <th>رقم الهاتف</th>
                <th>مدة تمديد الاشتراك</th>
                <th>حالة الحساب</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((item, index) => (
                item.saveSub &&
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.phone}</td>
                  <td>{item.saveSub}</td>
                  <td>{item.isAccepted ? 'مفعل' : 'غير مفعل'}</td>
                  <td>
                    <button
                      style={{ backgroundColor: "red" }}
                      onClick={() => deleteOrder(index)}
                      disabled={deleting}
                    >
                      حذف الطلب
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>لايوجد طلبات</p>
        )}
      </div>
    </div>
  );
};

export default ComingOrders;
