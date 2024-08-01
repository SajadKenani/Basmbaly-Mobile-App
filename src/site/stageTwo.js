import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setEmployeeSalary, setEmployeeDiscount } from '../actions/employeeActions'; // Ensure the path is correct
import { Link } from 'react-router-dom';

function STAGETWO({ fileName }) {
  const dispatch = useDispatch();
  const salary = useSelector((state) => state.employee.employeeSalary);
  const discount = useSelector((state) => state.employee.employeeDiscount);

  const [showInstruction, setshowInstruction] = useState(false)
  const [discountnum, usediscountnum] = useState(0);

  const handleSalaryChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    dispatch(setEmployeeSalary(value));
  };

  const handleDelayDurationHourChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    const newDiscount = [...discount];
    newDiscount[index].hours = value;
    dispatch(setEmployeeDiscount(newDiscount));
  };

  const handleDelayDurationMinutesChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    const newDiscount = [...discount];
    newDiscount[index].minutes = value;
    dispatch(setEmployeeDiscount(newDiscount));
  };

  const handleDelayDiscount = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    const newDiscount = [...discount];
    newDiscount[index].price = value;
    dispatch(setEmployeeDiscount(newDiscount));
  };

  const handleDiscountObject = (event) => {
    event.preventDefault();
    usediscountnum(discountnum + 1);

    const newDiscount = [...discount];
    newDiscount.push({ price: "", hours: "0", minutes: "0" });
    dispatch(setEmployeeDiscount(newDiscount));
  };

  const handleRemoveDiscount = (index) => {
    const newDiscount = [...discount];
    newDiscount.splice(index, 1);
    dispatch(setEmployeeDiscount(newDiscount));
    usediscountnum(discountnum - 1);
  };



  return (
    <form className="pl-10 pr-10 pt-10" style={{ width: "100%", height: "56vh", boxShadow: "0px -30px 10px 10px rgba(0, 0, 0, 0.04)", zIndex: "2", borderRadius: "35px" }}>
      <div>
        <div>
          <div className="flex justify-between" style={{ alignItems: "center" }}>
            <p style={{ fontWeight: "bold" }}>ID: {fileName}</p>
            <h3 style={{ fontSize: "24px", fontWeight: "bold", color: "#5F5F5F" }}> اضافة موظف </h3>
          </div>

          <div className="mt-10" style={{ width: "100%" }}>
            <p style={{ textAlign: "end", fontSize: "16px", color: "#7F7F7F" }}> الراتب الشهري للموظف </p>
            <input
              type="number"
              min="0"
              value={salary}
              onChange={handleSalaryChange}
              style={{ width: "100%", backgroundColor: "#F1F1F1", marginTop: "14px", height: "50px", borderRadius: "5px", paddingRight: "10px", textAlign: "end" }}
            />
          </div>

          {Array.from({ length: discount.length }).map((_, index) => (
            <div className='flex' key={index}>
              <div className="mt-10 p-1" style={{ width: "100%" }}>
                <p style={{ textAlign: "end", fontSize: "16px", color: "#7F7F7F" }}> المبلغ المراد خصمه </p>
                <div className='flex'>
                  <div className='flex' style={{ alignItems: "center", justifyContent: "center", padding: "10px" }}>
                    <div
                      style={{ backgroundColor: "red", width: "20px", height: "20px", borderRadius: "10000px", marginTop: "8px", cursor: "pointer" }}
                      onClick={() => handleRemoveDiscount(index)}
                    ></div>
                  </div>
                  <input
                    type='number'
                    min='0'
                    value={discount[index]?.price || ""}
                    onChange={(e) => handleDelayDiscount(e, index)}
                    style={{ width: "100%", backgroundColor: "#F1F1F1", marginTop: "14px", height: "50px", borderRadius: "5px", paddingRight: "10px", textAlign: "end" }}
                  />
                </div>
              </div>

              <div className="mt-10 p-1 " style={{ width: "100%" }}>
                <p style={{ textAlign: "end", fontSize: "16px", color: "#7F7F7F" }}> مدة التأخير </p>
                <div className='flex '>
                  <p style={{ fontFamily: "Tajawal", alignItems: "center", display: "flex" }}>
                    <span style={{ fontFamily: "Tajawal", fontWeight: "bold", color: "#7F7F7F" }}>د</span>
                  </p>
                  <input
                    type='number'
                    min='0'
                    value={discount[index]?.minutes || ""}
                    onChange={e => handleDelayDurationMinutesChange(e, index)}
                    style={{ width: "100%", backgroundColor: "#F1F1F1", marginTop: "14px", height: "50px", borderRadius: "5px", paddingRight: "10px", textAlign: "end" }}
                    className='m-1'
                  /> 
                  <p style={{ fontFamily: "Tajawal", alignItems: "center", display: "flex", color: "#7F7F7F" }}>
                    <span style={{ fontFamily: "Tajawal", fontWeight: "bold" }}>س</span>
                  </p>
                  <input
                    type='number'
                    min='0'
                    value={discount[index]?.hours || ""}
                    onChange={e => handleDelayDurationHourChange(e, index)}
                    style={{ width: "100%", backgroundColor: "#F1F1F1", marginTop: "14px", height: "50px", borderRadius: "5px", paddingRight: "10px", textAlign: "end" }}
                    className='m-1'
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="mt-4 flex justify-around" style={{ width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "10px" }}>
              <button
                style={{
                  width: "30px",
                  height: "30px",
                  backgroundColor: "#BD6939",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "5px",
                  textAlign: "center",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "16px",
                  borderRadius: "1000px",
                  padding: "0",
                }}

                onClick={(event) => { 
                  event.preventDefault();
                  setshowInstruction(true);
                }}
                
              >
                ?
              </button>
            </div>
            <button
              onClick={handleDiscountObject}
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
            >
              اضافة مدة خصم
            </button>
          </div>
        </div>
      </div>

      <div className="mt-20" style={{ width: "100%" }}>
        <Link to={"/add/stageThree"}>
          <button
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
              marginBottom: "100px",
            }}
          >
            متابعة
          </button>
        </Link>
      </div>
      {showInstruction && 
           <div style={{
            width: "100%",
            height: "100vh",
            backgroundColor: "white",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            boxSizing: "border-box"
          }}>
            <div style={{
              width: "90%",
              maxWidth: "400px",
              backgroundColor: "#f8f9fa",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)"
            }}>
              <h2 style={{ color: "#343a40", marginBottom: "15px", textAlign: "center" }}>
                خاصية خصم على راتب الموظف عند التأخر
              </h2>
              <p style={{ color: "#495057", lineHeight: "1.6", fontSize: "14px" }}>
                في تطبيقنا، قمنا بإضافة ميزة جديدة تتيح خصم جزء من راتب الموظف عند التأخر عن العمل. هذه الخاصية تعتمد على استخدام تقنية QR-Code لتسجيل حضور الموظف.
              </p>
              <h3 style={{ color: "#343a40", marginTop: "15px", fontSize: "16px" }}>
                كيفية عمل الخاصية:
              </h3>
              <ul style={{ color: "#495057", lineHeight: "1.6", fontSize: "14px", paddingInlineStart: "20px" }}>
                <li style={{textDecoration: "rtl"}}>توليد QR-Code: يتم توليد رمز QR-Code فريد لكل موظف يتم تحديثه يومياً.</li>
                <li style={{textDecoration: "rtl"}}>مسح QR-Code: عند وصول الموظف إلى مقر العمل، يقوم بمسح QR-Code المخصص له عبر هاتفه الذكي لتسجيل حضوره.</li>
                <li style={{textDecoration: "rtl"}}>تسجيل الحضور والخصم: إذا تم مسح QR-Code بعد وقت الحضور المحدد، يتم تسجيل الوقت المتأخر تلقائيًا ويتم حساب الخصم بناءً على الوقت المتأخر.</li>
                <li style={{textDecoration: "rtl"}}>تقارير الحضور: يمكن للموظف الاطلاع على تقارير حضوره وخصوماته من خلال التطبيق. يمكن للإدارة مراقبة حضور الموظفين وإدارة الخصومات بشكل فعال.</li>
              </ul>
              <h3 style={{ color: "#343a40", marginTop: "15px", fontSize: "16px" }}>
                مميزات الخاصية:
              </h3>
              <ul style={{ color: "#495057", lineHeight: "1.6", fontSize: "14px", paddingInlineStart: "20px" }}>
                <li style={{textDecoration: "ltr"}}>دقة وفعالية: تعتمد هذه الخاصية على التكنولوجيا لضمان تسجيل دقيق للحضور.</li>
                <li style={{textDecoration: "ltr"}}>شفافية: يمكن للموظف متابعة سجلات حضوره والخصومات بشكل مباشر.</li>
                <li style={{textDecoration: "ltr"}}>سهولة الاستخدام: يمكن استخدام الهواتف الذكية لمسح QR-Code بسهولة وسرعة.</li>
              </ul>
              <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                <button
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#BD6939",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                  onClick={(event) => {
                    event.preventDefault();
                    setshowInstruction(false);
                  }}
                >
                  رجوع
                </button>
              </div>
            </div>
          </div>
              }
    </form>
  );
}

export default STAGETWO;
