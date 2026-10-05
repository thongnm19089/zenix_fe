import { Button, notification, Upload, UploadFile } from "antd";
import ImgCrop from "antd-img-crop";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const UploadImageList = ({ setImageFile, imageList, size, maxCount }: { setImageFile: any; imageList?: UploadFile[]; size?: number; maxCount?: number }) => {
  const [uploadImageList, setUploadImageList] = useState<UploadFile[]>([]);

  const t: any = useTranslations();

  console.log("imageList", imageList);

  useEffect(() => {
    if (imageList) {
      // Ensure formattedList is always an array, even if fileList is undefined
      const formattedList = imageList?.map((file) => ({
        uid: file?.uid,
        name: file?.name,
        status: file?.status,
        url: file?.url || file?.thumbUrl,
      })) || [];
      setUploadImageList(formattedList);
    } else {
      setUploadImageList([]);
    }
  }, [imageList]);

  const onChange = ({ fileList: newFileList }: { fileList: any }) => {
    setUploadImageList(newFileList);
    setImageFile(newFileList);
  };

  const onPreview = async (file: any) => {
    let src = file.url;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };

  const onRemove = (image: any) => {
    if (image && imageList && imageList?.length < 1) {
      notification.warning({
        message: `${t('admin.uploadNewPhotos')}`,
        description: <p>{t('noficationAddAndUpdate.alternativeImage')}</p>,
        placement: "bottomRight",
      });
    }
  };

  return (
    <ImgCrop rotationSlider modalTitle={t('noficationAddAndUpdate.editPhoto')} modalOk={t("general.confirm")} modalCancel={t("general.close")}>
      <Upload
        listType="picture-card"
        fileList={uploadImageList}
        onChange={onChange}
        onPreview={onPreview}
        onRemove={onRemove}
        beforeUpload={(image, imageList) => {
          // This callback is for new files added by the user
          // If you want to do something before upload, like client-side validation
          return false; // Prevent automatic upload
        }}
        maxCount={maxCount} // Use maxCount prop, or unlimited if not provided
      >
        {t("admin.uploadPhotos")}
      </Upload>
    </ImgCrop>
  );
};
export default UploadImageList;
