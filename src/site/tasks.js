import { useState, useEffect } from "react";
import add from "./images/add.png";
import trueSign from "./images/trueSign.png";
import { Octokit } from "@octokit/rest";
import { useSelector } from "react-redux";

export const TASKS = () => {
    const [input, setInput] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [files, setFiles] = useState([]);
    const [tasksArray, setTasksArray] = useState([]);
    const selected = useSelector((state) => state.employee.employeeSelected);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (files.length > 0 && files[selected] && files[selected].content[0].employeeTasks) {
            setTasksArray(files[selected].content[0].employeeTasks);
        }
    }, [files, selected]);

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

    const sendData = async (info, filePath) => {
        setLoading(true);
        setError(null);

        try {
            const octokit = new Octokit({
                auth: process.env.REACT_APP_GITHUB_AUTH_TOKEN,
                baseUrl: "https://api.github.com",
            });

            const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(info))));

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
        } catch (error) {
            console.error("Error creating or updating file:", error);
            setError("Error creating or updating file");
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = () => {
        const newTask = { task: input, situation: "لم يكتمل بعد" };
        setTasksArray((prevTasksArray) => {
            const updatedTasksArray = [...prevTasksArray, newTask];

            setFiles((prevFiles) => {
                const updatedFiles = [...prevFiles];
                updatedFiles[selected].content[0].employeeTasks = updatedTasksArray;

                sendData([updatedFiles[selected].content[0]], updatedFiles[selected].name);

                return updatedFiles;
            });

            return updatedTasksArray;
        });

        setInput("");
        setShowModal(false);
    };

    const handleRemoveTask = (index) => {
        setTasksArray((prevTasksArray) => {
            const updatedTasksArray = prevTasksArray.filter((_, i) => i !== index);

            setFiles((prevFiles) => {
                const updatedFiles = [...prevFiles];
                updatedFiles[selected].content[0].employeeTasks = updatedTasksArray;

                sendData([updatedFiles[selected].content[0]], updatedFiles[selected].name);

                return updatedFiles;
            });

            return updatedTasksArray;
        });
    };

    return (
        <div style={{ padding: "15px", paddingBottom: "160px" }}>
            <h2 className="text-2xl font-bold mb-4 text-right mr-6 mb-10" style={{ color: "#5F5F5F" }}>المهام</h2>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {tasksArray.map((task, index) => (
                <div className="flex justify-center mt-4" key={index}>
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
                                    width: "30px",
                                    height: "30px",
                                    color: "white",
                                    marginRight: "10px",
                                    backgroundColor: "#C3764B",
                                    borderRadius: "15px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                }}
                                onClick={() => handleRemoveTask(index)}
                            >
                                X
                            </div>
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
                                    cursor: "pointer",
                                }}
                            >
                                {task.situation}
                            </div>
                        </div>
                        <p>{task.task}</p>
                    </div>
                </div>
            ))}

            <div
                style={{
                    position: "fixed",
                    bottom: "0",
                    right: "0",
                    marginBottom: "100px",
                    marginRight: "50px",
                    width: "60px",
                    height: "60px",
                    backgroundColor: "#C3764B",
                    borderRadius: "15px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                }}
                onClick={() => setShowModal(true)}
            >
                <img className="w-6 h-6" src={add} alt="Add" />
            </div>

            {showModal && (
                <div
                    style={{
                        width: "100%",
                        height: "100vh",
                        backgroundColor: "#00000044",
                        position: "fixed",
                        top: 0,
                        left: 0,
                        zIndex: 9999,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "white",
                            width: "80%",
                            height: "300px",
                            borderRadius: "10px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <div style={{ padding: "30px" }}>
                            <textarea
                                style={{
                                    backgroundColor: "#EEEEEE",
                                    width: "100%",
                                    height: "120px",
                                    borderRadius: "10px",
                                }}
                                onChange={(event) => setInput(event.target.value)}
                                placeholder="أدخل المهمة هنا"
                            />
                            <button
                                onClick={handleAddTask}
                                style={{
                                    padding: "0 20px",
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
                                اضافة
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
