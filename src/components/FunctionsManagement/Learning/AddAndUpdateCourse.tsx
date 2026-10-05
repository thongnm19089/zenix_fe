"use client";

import { useCreateCourseMutation, useUpdateCourseMutation } from "@/api/Learning/apiLearning";
import { useGetSetUpLearningQuery } from "@/api/Learning/apiLearning";
import { Button, Form, Input, Drawer, Select, Upload, notification, Rate, Switch } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import { FiEdit } from "react-icons/fi";

const AddAndUpdateCourse = ({ edit, course }: any) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const t: any = useTranslations();
  const [form] = Form.useForm();
  const [createCourse, { isLoading: isLoadingAdd }] = useCreateCourseMutation();
  const [updateCourse, { isLoading: isLoadingEdit }] = useUpdateCourseMutation();
  const { data: setupList, error, isLoading } = useGetSetUpLearningQuery({});
  const [modules, setModules] = useState(course ? course.modules : []);
  const [fileList, setFileList] = useState<any>([]);
  const [imageList, setImageList] = useState<any>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);

  const showDrawer = () => {
    setIsDrawerOpen(true);
  };

  const handleCancel = () => {
    setIsDrawerOpen(false);
  };

  const handleCategoryChange = (categoryId: number) => {
    const subcategories = setupList?.subcategory_list?.filter(
      (subcategory: any) => subcategory.category === categoryId
    );
    setFilteredSubcategories(subcategories);
    form.setFieldsValue({ subcategory_id: undefined });
  };

  const onFinish = async (values: any) => {
    const body = new FormData();

    const adminIds = values.admin_ids
      ? values.admin_ids.map((admin: any) => admin.value)
      : course.admin_list.map((admin: any) => admin.id);
    adminIds.forEach((id: any) => body.append("admin_ids", id));

    // Assuming student_ids is an empty list
    const student_ids = [] as [];
    student_ids.forEach((id) => body.append("student_ids", id));

    // Append basic fields
    body.append("title", values.title);
    body.append("description", values.description);
    body.append("category", values.category_id);
    body.append("subcategory", values.subcategory_id);
    body.append("rating", values.rating);  // Append rating value

    body.append("is_public", values.is_public ? "true" : "false"); // Convert boolean to string

    // Append files
    if (fileList.length > 0 && fileList[0].originFileObj) {
      body.append("file", fileList[0].originFileObj);
    }

    if (imageList.length > 0 && imageList[0].originFileObj) {
      body.append("image", imageList[0].originFileObj);
    }

    const simplifiedModules = modules.map((module: any) => ({
      title: module.title,
      description: module.description
    }));

    simplifiedModules.forEach((module: any) => {
      body.append("modules", JSON.stringify(module));
    });

    try {
      const result = edit ? await updateCourse({ courseId: course.id, data: body }) : await createCourse(body);

      if (result && "error" in result) {
        notification.error({
          message: t("task.errorTask"),
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        form.resetFields();
        setIsDrawerOpen(false);
        notification.success({
          message: edit ? t("noficationAddAndUpdate.editCourse") : t("noficationAddAndUpdate.createCourse"),
          placement: "bottomRight",
          className: "h-16",
        });
      }
    } catch (error) {
      console.log(error);
      setIsDrawerOpen(true);
    }
  };


  const handleModuleChange = (index: number, field: string, value: string) => {
    const newModules = [...modules];
    newModules[index][field] = value;
    setModules(newModules);
  };

  const addModule = () => {
    setModules([...modules, { title: "", description: "" }]);
  };

  const removeModule = (index: number) => {
    const newModules = modules.filter((_: any, i: number) => i !== index);
    setModules(newModules);
  };

  useEffect(() => {
    if (edit && isDrawerOpen && course) {
      const initialAdmins = course.admin_list?.map((admin: any) => ({
        value: admin.id,
        label: admin.username
      })) || [];

      // Đảm bảo rằng modules luôn là một mảng (array)
      const initialModules = Array.isArray(course.modules) ? course.modules : [course.modules];

      form.setFieldsValue({
        ...course,
        admin_ids: initialAdmins,
        category_id: course?.category,
        subcategory_id: course?.subcategory,
        rating: course?.rating || 4,
      });

      setModules(initialModules);  // Đảm bảo rằng modules được thiết lập đúng định dạng

      setImageList(
        course?.image ? [{
          uid: "-1",
          name: course.image.split("/").pop(),
          status: "done",
          url: course.image,
        }] : []
      );

      setFileList(
        course?.file
          ? [
            {
              uid: "-1",
              name: course.file.split("/").pop(),
              status: "done",
              url: course.file,
            },
          ]
          : []
      );
    }
  }, [isDrawerOpen, course, edit]);



  return (
    <>
      {edit ? (
        <div onClick={showDrawer}>
          <FiEdit className="inline-block mr-2" />
          {t("general.edit")}
        </div>
      ) : (
        <Button type="dashed" block onClick={showDrawer}>
          {t("general.createNew")}
        </Button>
      )}

      <Drawer
        title={`${edit ? t("general.edit") : t("general.createNew")}`}
        open={isDrawerOpen}
        onClose={handleCancel}
        width={1000}
      >
        <Form
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          initialValues={{
            remember: false
            // is_public: edit ? course?.is_public : false,
          }}

          onFinish={onFinish}
          form={form}
        >
          <Form.Item
            name="title"
            label={t("table.title")}
            className="my-4"
            rules={[{ required: true, message: t("form.required") }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="description" label={t("verticalValues.desc")} className="my-4">
            <Input.TextArea />
          </Form.Item>

          <Form.Item name="category_id" label={t("setup.categories")} className="my-4" rules={[{ required: true, message: t("noficationAddAndUpdate.selectACategory") }]}>
            <Select
              showSearch
              placeholder={t("hr.selectCategory")}
              optionFilterProp="children"
              onChange={handleCategoryChange}
              filterOption={(input, option) =>
                option?.children ? option.children.toString().toLowerCase().includes(input.toLowerCase()) : false
              }
            >
              {setupList?.category_list?.map((category: any) => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="subcategory_id" label={t("setup.subcategories")} className="my-4" rules={[{ required: true, message: t("learning.selectASubCategory") }]}>
            <Select
              showSearch
              placeholder={t("learning.selectSubCategory")}
              optionFilterProp="children"
              disabled={!filteredSubcategories.length}
              filterOption={(input, option) =>
                option?.children ? option.children.toString().toLowerCase().includes(input.toLowerCase()) : false
              }
            >
              {filteredSubcategories.map((subcategory: any) => (
                <Select.Option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="admin_ids" label={t("user.is_admin")} className="my-4">
            <Select
              mode="multiple"
              showSearch
              labelInValue
              placeholder={t("table.chooseAdmin")}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option?.children ? option.children.toString().toLowerCase().includes(input.toLowerCase()) : false
              }
            >
              {setupList?.employee_list?.map((user: any) => (
                <Select.Option key={user?.id} value={user?.id}>
                  {user.username}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="image" label={t("general.image")} className="my-4">
            <Upload
              listType="picture"
              maxCount={1}
              fileList={imageList}
              onChange={({ fileList }) => setImageList(fileList)}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined rev={undefined} />}>{t("general.upload")}</Button>
            </Upload>
          </Form.Item>

          <Form.Item name="file" label={t("general.file")} className="my-4">
            <Upload
              maxCount={1}
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined rev={undefined} />}>{t("general.upload")}</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="rating"
            label={t("learning.rate")}
            className="my-4"
            rules={[{ required: true, message: t("learning.selectARate") }]}
          >
            <Rate allowHalf defaultValue={4} count={5} />
          </Form.Item>

          <div>
            <h3>{t("general.modules")}</h3>
            {modules?.map((module: any, index: number) => (
              <div key={index} style={{ display: "flex", marginBottom: 10 }}>
                <Input
                  value={module.title}
                  onChange={(e) => handleModuleChange(index, "title", e.target.value)}
                  placeholder={t("table.title")}
                  style={{ flex: 1, marginRight: 5 }}
                />
                <Input.TextArea
                  value={module.description}
                  onChange={(e) => handleModuleChange(index, "description", e.target.value)}
                  placeholder={t("verticalValues.desc")}
                  style={{ flex: 2, marginRight: 5 }}
                />
                <Button onClick={() => removeModule(index)}>{t("general.delete")}</Button>
              </div>
            ))}
            <Button onClick={addModule}>{t("noficationAddAndUpdate.addModule")}</Button>
          </div>
          <Form.Item
            name="is_public"
            label={t("learning.isPublic")}
            valuePropName="checked"
          >
            <Switch defaultChecked={false} />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button type="primary" htmlType="submit" className="mb-2" loading={edit ? isLoadingEdit : isLoadingAdd}>
              {t("general.confirm")}
            </Button>
            <Button onClick={handleCancel}>{t("general.cancel")}</Button>
          </div>
        </Form>
      </Drawer>
    </>
  );
};

export default AddAndUpdateCourse;
