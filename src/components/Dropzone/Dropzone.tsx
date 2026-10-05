import React, { useCallback, FC } from 'react';
import { useDropzone } from 'react-dropzone';

interface DropzoneProps {
  onUpload: (files: File[]) => void;
  disabled?: boolean; // Thêm prop disabled
}

const Dropzone: FC<DropzoneProps> = ({ onUpload, disabled = false }) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!disabled && acceptedFiles.length > 0) {
        onUpload(acceptedFiles);
      }
    },
    [onUpload, disabled]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed border-gray-300 p-6 m-2 text-center cursor-pointer ${
        disabled ? 'cursor-not-allowed opacity-50' : ''
      }`}
    >
      <input {...getInputProps()} disabled={disabled} />
      {isDragActive && !disabled ? (
        <p>Thả file vào đây...</p>
      ) : (
        <p>{disabled ? 'Chọn file bị vô hiệu hóa' : 'Kéo file vào đây hoặc click để chọn file'}</p>
      )}
    </div>
  );
};

export default Dropzone;
