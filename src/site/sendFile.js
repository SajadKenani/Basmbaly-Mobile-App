import React, { useState, useEffect, useCallback, useRef } from "react";
import { Octokit } from "@octokit/core";
import { v4 as uuidv4 } from "uuid";
import debounce from "lodash.debounce";
import Barcode from "react-barcode";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {  setEmployeeBarcode } from '../actions/employeeActions'; // Ensure the path is correct

const SENDDATA = () => {
    const [files, setFiles] = useState([]);
    const [fileName, setFileName] = useState(uuidv4().split("-")[0]);
    const [infoArray, setInfoArray] = useState([]); // State for holding array of employee information
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [barcodeData, setBarcodeData] = useState("");
    const [qrCode, setQrCode] = useState(""); // State for QR code URL
    const barcodeRef = useRef(null); // Ref for the Barcode component

    const dispatch = useDispatch();

    const discount = useSelector((state) => state.employee.discount);
    useEffect(() => {
      const newFileName = uuidv4().split("-")[0];
      setInfoArray([...infoArray, { fileName: newFileName }]);
    }, [])

    const setEmployeeBarcode = (e) => {
        dispatch(setEmployeeBarcode(e.target.value));
      };



    return (
        <div className=" mt-10">

   
        </div>
    );
};

export default SENDDATA;
