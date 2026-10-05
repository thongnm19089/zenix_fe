import { dowloadFileExcel } from "@/constants/excelFile/dowloadFileExcel";
import { Input } from "antd";
import React, { Dispatch, SetStateAction, useState } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { SiMicrosoftexcel } from "react-icons/si";
import * as XLSX from "xlsx";

interface uploadType {
  fileName: string;
  fileBase64: string;
  dataExcel: any;
  dataType: any;
  setDataExcel: Dispatch<SetStateAction<any[]>>;
  setDisableButton: (value: boolean) => void;
}

const UploadExcel = ({ fileName, fileBase64, dataExcel, setDataExcel, dataType, setDisableButton }: uploadType) => {
  const [fileData, setFileData] = useState<{ name: string }>();

  const keyValueData = Object.keys(dataType);

  const handleChangeFile = () => {
    const inputFile = document.getElementById("file");
    inputFile?.click();
  };

  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    setFileData(file);
    setDisableButton(false);
    if (file) {
      const reader = new FileReader();
      reader.readAsBinaryString(file);
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parseData = XLSX.utils.sheet_to_json(sheet);
        parseData.splice(0, 6);
        parseData.forEach((value) => {
          if (typeof value === "object" && value) {
            const valueArr = Object.values(value);
            const newDataExcel = {};
            valueArr.forEach((item, index) => {
              if (index < valueArr.length) {
                const props = keyValueData[index];
                console.log(props);
                Object.assign(newDataExcel, { [props]: item });
              }
            });
            setDataExcel((dataExcel) => [...dataExcel, newDataExcel]);
          }
        });
      };
    }
  };

  return (
    <div>
      <div className="flex flex-col justify-center items-center w-100%  mb-2">
        <span
          className="cursor-pointer underline italic text-primary mb-5"
          onClick={() => dowloadFileExcel(fileBase64, fileName)}
        >
          {" "}
          (Click vào đây để tải file mẫu và hướng dẫn)
        </span>
        <Input
          id="file"
          hidden
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          onClick={(e: any) => (e.target.value = "")}
        />
        <SiMicrosoftexcel onClick={handleChangeFile} fill="green" size={60} cursor={"pointer"} />
      </div>
      <div className="flex w-100% justify-center mb-2">
        {!fileData ? (
          <div>Không có file nào được tải lên</div>
        ) : (
          <div className="flex justify-center items-center">
            <div>{fileData.name}</div>
            <IoIosCloseCircleOutline
              className="cursor-pointer ml-1"
              onClick={() => {
                setFileData(undefined);
                setDisableButton(true);
              }}
              size={20}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadExcel;
