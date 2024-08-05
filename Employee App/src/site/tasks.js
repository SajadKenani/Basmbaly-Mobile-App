import { useState, useEffect, useMemo } from "react";
import { Octokit } from "@octokit/rest";
import { useSelector } from "react-redux";

export const TASKS = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [files, setFiles] = useState([]);
    const [data, setData] = useState([]);
    
    const tasks = useSelector((state) => state.employee.tasks);

    useEffect(() => {
        fetchData();
    }, []);

    const filteredFiles = useMemo(() => {
        if (files.length > 0) {
            return files.filter(item =>
                item.name !== "admin" &&
                item.name !== "orders" &&
                item.name !== "notification" &&
                item.name === localStorage.getItem("EEID")
            );
        }
        return [];
    }, [files]);

    useEffect(() => {
        setData(filteredFiles);
    }, [filteredFiles]);

    const fetchData = async () => {
        setLoading(true);
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
                    if (file.name === localStorage.getItem("EEID")) {
                        const fileResponse = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
                            owner: "SajadKenani",
                            repo: "meemdatabase",
                            path: file.path
                        });
                        const content = fileResponse.data.content;
                        const decodedContent = decodeBase64Unicode(content);
                        return { name: file.name, content: JSON.parse(decodedContent) };
                    }
                    return null;
                })
            ).then(results => results.filter(Boolean));

            setFiles(filesList);

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

    const sendData = async (info) => {
        const infoObject = info;
        setLoading(true);
        setError(null);

        try {
            const octokit = new Octokit({
                auth: process.env.REACT_APP_GITHUB_AUTH_TOKEN,
                baseUrl: 'https://api.github.com',
            });

            const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(infoObject))));

            let sha = null;

            try {
                const { data: fileData } = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
                    owner: "SajadKenani",
                    repo: "meemdatabase",
                    path: localStorage.getItem("EEID"),
                });
                sha = fileData.sha;
            } catch (error) {
                if (error.status !== 404) {
                    throw error;
                }
            }

            const response = await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
                owner: "SajadKenani",
                repo: "meemdatabase",
                path: localStorage.getItem("EEID"),
                message: sha ? "Update file" : "Add new file",
                content: contentBase64,
                sha: sha || undefined,
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

        } catch (error) {
            console.error("Error creating or updating file:", error);
            setError("Error creating or updating file");
        } finally {
            setLoading(false);
        }
    };

    const handleTaskClicked = async (index) => {
        const updatedTasks = [...data[0].content];
        if (index === 9999999) {
            await sendData(updatedTasks);
    
        }else {
            updatedTasks[0].employeeTasks[index].situation = "اكتمل";

            await sendData(updatedTasks);
    
            window.location.assign("/");
        }
       

    }
console.log(tasks)
    return (
        <div style={{ padding: "15px", paddingBottom: "160px" }}>
            <h2 className="text-2xl font-bold mb-4 text-right mr-6 mb-10" style={{ color: "#5F5F5F" }}>
                المهام
            </h2>

            {tasks && tasks.map((task, index) => (
                <div
                    className="flex justify-center mt-4"
                    key={index}
                    onClick={() => task.situation !== "اكتمل" && handleTaskClicked(index)}
                >
                    <div
                        style={{
                            width: "90%",
                            height: "80px",
                            border: "1px solid gray",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "20px",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <div
                                style={{
                                    width: "120px",
                                    height: "30px",
                                    color: "white",
                                    backgroundColor: "#C3764B",
                                    borderRadius: "15px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: task.situation === "اكتمل" ? "default" : "pointer",
                                }}
                            >
                                {task.situation}
                            </div>
                        </div>
                        <p>{task.task}</p>
                    </div>
                </div>
            ))}
{/* 
            <button style={{backgroundColor: "#C3764B", color: "white", width: "100px", height: "40px", borderRadius: "10px", marginTop: "20px"}} onClick={() => handleTaskClicked(9999999)}> تحديث </button> */}
        </div>
    );
};
