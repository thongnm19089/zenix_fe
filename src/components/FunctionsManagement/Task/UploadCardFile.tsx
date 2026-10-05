import {
  useCreateCardFileMutation,
} from "@/api/Task/apiTask";
import { Modal, Button, notification, Spin } from 'antd';
import { IBoard, ICard } from '@/types/taskTypes';
import { useEffect, useState } from "react";
import React, { useCallback } from 'react';
import Dropzone from "@/components/Dropzone/Dropzone";
import { useTranslations } from "next-intl";


interface UploadCardFileProps {
  card: ICard;
  refreshCardAndBoard: () => void;
}

const UploadCardFile: React.FC<UploadCardFileProps> = ({ card, refreshCardAndBoard }) => {
  const [createCardFile, { isLoading }] = useCreateCardFileMutation();
  const t: any = useTranslations();

  const handleFileUpload = async (selectedFiles: File[]) => {
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('file', file);  // Append each file to the form data
      });
      formData.append('card', card.id.toString());

      await createCardFile(formData).unwrap();
      refreshCardAndBoard();
      notification.success({
        message: t('noficationAddAndUpdate.uploadSuccess'),
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t('noficationDelete.unableToUploadFile')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };
  return (
    <>
      <div className="mt-5">
          {isLoading && <div className="flex justify-center"><Spin size="large" tip="Uploading..." /></div>} {/* Sử dụng Spin component từ antd để hiển thị loading */}
          <Dropzone onUpload={handleFileUpload} disabled={card.archived}/>
      </div>
    </>
  );
};

export default UploadCardFile;