import "./style.css";
import { useSelector } from "react-redux";

export const ACCOUNT = () => {
    const name = useSelector((state) => state.employee.name);
    const phone = useSelector((state) => state.employee.phone);
    const title = useSelector((state) => state.employee.title);
    const salary = useSelector((state) => state.employee.salary);
    const start = useSelector((state) => state.employee.start);

    const handleSignOut = () => {
        localStorage.clear()
        window.location.reload()
    };

    return (
        <>
        <div className="account-container">
            <p style={{fontSize: "24px", fontWeight: "bold", color: "#BD6939"}}>{name}</p>
            <p><strong>رقم الهاتف:</strong> {phone}</p>
            <p><strong>المسمى الوظيفي:</strong> {title}</p>
            <p><strong>الراتب:</strong> {salary}</p>
            <p><strong>موعد البدء:</strong> {start}</p>
           
        </div>

        <button className="sign-out-button"  onClick={handleSignOut}>تسجيل الخروج</button>
        </>
    );
}
