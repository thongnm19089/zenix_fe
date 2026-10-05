import { notification, Upload } from "antd";
import ImgCrop from "antd-img-crop";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const UploadImage = ({ setImageFile, imageList, size }: { setImageFile: any; imageList: any; size?: number }) => {
  const [fileList, setFileList] = useState<any[]>([]);
  const t: any = useTranslations();

  console.log("imageList", imageList);
  
  useEffect(() => {
    if (imageList) {
      const ImageList = imageList.map((item: { id: number; image: string }) => ({
        uid: item.id,
        status: "done",
        url: item.image,
      }));
      setFileList(ImageList);
    } else {
      setFileList([]);
    }
  }, [imageList]);


  const onChange = ({ fileList: newFileList }: { fileList: any }) => {
    setFileList(newFileList);
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

  const onRemove = (file: any) => {
    if (file && fileList.length < 1) {
      notification.warning({
        message: `${t('admin.uploadNewPhotos')}`,
        description: <p>{t('noficationAddAndUpdate.alternativeImage')}</p>,
        placement: "bottomRight",
      });
    }
  };

  return (
    <ImgCrop rotationSlider modalTitle={t('noficationAddAndUpdate.editPhoto')} modalOk= {t("general.confirm")} modalCancel={t("general.close")}>
      <Upload
        listType="picture-card"
        fileList={fileList}
        onChange={onChange}
        onPreview={onPreview}
        onRemove={onRemove}
        beforeUpload={(file) => {
          setFileList([...fileList, file]);
          // setImageFile([...fileList, file]);
          return false;
        }}
      >
        {size ? fileList.length < 1 && `${t("admin.downloadWallpaper")}` : fileList.length < 4 && `${t("admin.uploadPhotos")}` }
      </Upload>
    </ImgCrop>
  );
};
export default UploadImage;
