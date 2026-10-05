import React, { useState, useEffect } from 'react';
import { Upload, Button, notification, UploadFile } from "antd";
import { useTranslations } from "next-intl";
import { UploadChangeParam } from 'antd/lib/upload/interface';

const UploadFileList = ({ setFileList, fileList, size, maxCount }: { setFileList: any; fileList?: UploadFile[]; size?: number; maxCount?: number }) => {
  const [uploadFileList, setUploadFileList] = useState<UploadFile[]>([]);
  const t: any = useTranslations();

  useEffect(() => {
    // Ensure formattedList is always an array, even if fileList is undefined
    const formattedList = fileList?.map((file) => ({
      uid: file?.uid,
      name: file?.name,
      status: file?.status,
      url: file?.url,
    })) || [];

    setUploadFileList(formattedList);
  }, [fileList]);

  const onChange = ({ fileList: newFileList }: UploadChangeParam<UploadFile>) => {
    setUploadFileList(newFileList); // Update the state with the new file list
    setFileList(newFileList.map(file => file.originFileObj)); // Update parent component's file list
  };

  return (
    <Upload
      listType="text"
      fileList={uploadFileList}
      onChange={onChange}
      beforeUpload={(file, fileList) => {
        // This callback is for new files added by the user
        // If you want to do something before upload, like client-side validation
        return false; // Prevent automatic upload
      }}
      maxCount={maxCount} // Use maxCount prop, or unlimited if not provided
    >
      <Button type="default">{t("general.upload")}</Button>
    </Upload>
  );
};

export default UploadFileList;
