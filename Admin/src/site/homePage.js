import { useState, useEffect } from "react";
import { Octokit } from "@octokit/core";
import "../site/home.css";
import { useNavigate } from "react-router-dom";

const HOME = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState([]);
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [buttonLoading, setButtonLoading] = useState(false); // State to manage button loading state
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

  const acceptOrder = async (index) => {
    if (buttonLoading) return; // If button is already loading, return early
    setButtonLoading(true); // Set button loading state to true

    const updatedData = [...data];
    updatedData[index].isAccepted = 1;
    const currentDate = new Date();
    updatedData[index].acceptedDate = currentDate.toISOString().split("T")[0];

    // Calculate the expiration date by adding the subscription months
    const expirationDate = new Date(currentDate);
    expirationDate.setMonth(expirationDate.getMonth() + updatedData[index].subscription);
    updatedData[index].expirationDate = expirationDate.toISOString().split("T")[0];

    setData(updatedData);
    await sendData(updatedData);

    setButtonLoading(false); // Reset button loading state after data is sent
  };

  const cancelOrder = async (index) => {
    if (buttonLoading) return; // If button is already loading, return early
    setButtonLoading(true); // Set button loading state to true

    const updatedData = [...data];
    updatedData[index].isAccepted = 0;
    setData(updatedData);
    await sendData(updatedData);

    setButtonLoading(false); // Reset button loading state after data is sent
  };

  const deleteOrder = async (index) => {
    if (buttonLoading) return; // If button is already loading, return early
    setButtonLoading(true); // Set button loading state to true

    const updatedData = [...data];
    updatedData.splice(index, 1);
    setData(updatedData);
    await sendData(updatedData);

    setButtonLoading(false); // Reset button loading state after data is sent
  };

  const updateSubscription = (index, newSubscription) => {
    const updatedData = [...data];
    updatedData[index].subscription = newSubscription;
    setData(updatedData);
  };

  const saveSubscription = async (index) => {
    if (buttonLoading) return; // If button is already loading, return early
    setButtonLoading(true); // Set button loading state to true

    const updatedData = [...data];
    const currentDate = new Date();
    const expirationDate = new Date(currentDate);
    expirationDate.setMonth(expirationDate.getMonth() + updatedData[index].subscription);
    updatedData[index].expirationDate = expirationDate.toISOString().split("T")[0];
    setData(updatedData);
    await sendData(updatedData);

    setButtonLoading(false); // Reset button loading state after data is sent
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
        path: "admin",
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

      console.log("File updated:", response.data);
    } catch (error) {
      console.error("Error updating file:", error);
    }
  };

  // const calculateRemainingMonths = (expirationDate) => {
  //   const currentDate = new Date();
  //   const expDate = new Date(expirationDate);
  //   let months = (expDate.getFullYear() - currentDate.getFullYear()) * 12;
  //   months -= currentDate.getMonth();
  //   months += expDate.getMonth();
  //   return months <= 0 ? 0 : months;
  // };

  // const calculateRemainingDays = (expirationDate) => {
  //   const currentDate = new Date();
  //   const expDate = new Date(expirationDate);

  //   // Calculate the difference in milliseconds
  //   const timeDiff = expDate.getTime() - currentDate.getTime();

  //   // Convert milliseconds to days
  //   const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

  //   return daysDiff <= 0 ? 0 : daysDiff;
  // };

  // const formatRemainingTime = (remainingMonths, remainingDays) => {
  //   if (remainingMonths === 0 && remainingDays === 0) {
  //     return "انتهت مدة الاشتراك";
  //   } else if (remainingMonths === 0) {
  //     return `باقي يوم ${remainingDays === 1 ? 'واحد' : `${remainingDays} يومين`}`;
  //   } else {
  //     return `باقي شهر ${remainingMonths === 1 ? 'واحد' : `${remainingMonths} شهرين`} ${remainingDays === 1 ? 'يوم' : `[${remainingDays} أيام]`}`;
  //   }
  // };

  // Function to handle search term change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Filtering data based on search term
  const filteredData = data.filter((item) => {
    return (
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.password.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.isAccepted ? 'تم القبول' : 'لم يتم القبول').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Function to check if subscription has expired
  const isSubscriptionExpired = (expirationDate) => {
    const currentDate = new Date();
    const expDate = new Date(expirationDate);
    return expDate < currentDate;
  };

  return (
    <div className="home-container">
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      <div className="search-container">
        <input
          type="text"
          placeholder="ابحث هنا..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <button className="m-10" onClick={() => navigate("/orders")}> مشاهدة الطلبات </button>
        <button className="m-10" style={{backgroundColor: "blue"}} onClick={() => navigate("/notification")}> التنبيهات </button>
      </div>
      <div className="excel-like-table">
        <table>
          <thead>
            <tr>
              <th>الاسم</th>
              <th>رقم الهاتف</th>
              <th>كلمة المرور</th>
              <th>حالة القبول</th>
              <th>مدة الاشتراك</th>
              <th>تاريخ الانتهاء</th>
              <th>تاريخ القبول</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr key={index} className={isSubscriptionExpired(item.expirationDate) ? 'expired-row' : ''}>
                  <td>{item.name}</td>
                  <td>{item.phone}</td>
                  <td>{item.password}</td>
                  <td>{item.isAccepted ? 'تم القبول' : 'لم يتم القبول'}</td>
                  <td>
                    <button
                      className="save-button"
                      style={{ margin: "10px" }}
                      onClick={() => saveSubscription(index)}
                      disabled={buttonLoading}
                    >
                      {buttonLoading ? 'حفظ' : 'حفظ'}
                    </button>
                    أشهر
                    <input
                      type="number"
                      value={item.subscription}
                      onChange={(e) => updateSubscription(index, parseInt(e.target.value))}
                      style={{ width: "35px", margin: "10px" }}
                      disabled={buttonLoading}
                    />
                  </td>
                  <td>{item.expirationDate}</td>
                  <td>{item.acceptedDate}</td>
                  <td>
                    {item.isAccepted === 0 ? (
                      <button
                        className="action-button accept-button"
                        onClick={() => acceptOrder(index)}
                        disabled={buttonLoading}
                      >
                        {buttonLoading ? 'موافقة' : 'موافقة'}
                      </button>
                    ) : (
                      <button
                        className="action-button cancel-button"
                        onClick={() => cancelOrder(index)}
                        disabled={buttonLoading}
                      >
                        {buttonLoading ? 'إلغاء القبول' : 'إلغاء القبول'}
                      </button>
                    )}
                    <button
                      className="action-button delete-button"
                      onClick={() => deleteOrder(index)}
                      disabled={buttonLoading}
                    >
                      {buttonLoading ? 'حذف' : 'حذف'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">لا توجد بيانات تطابق بحثك.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HOME;
