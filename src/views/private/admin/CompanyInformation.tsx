"use client";

import { useDeleteBranchMutation, useGetBranchListQuery } from "@/api/SetUp/apiBranch";
import { useEditCompanyMutation } from "@/api/SetUp/apiCompany";
import { useDeleteDivisionMutation, useGetDivisionsQuery } from "@/api/SetUp/apiDivision";
import { useDeleteLocationMutation, useGetLocationListQuery } from "@/api/SetUp/apiLocation";
import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import AddAndUpdateBranch from "@/components/FunctionsAdmin/AddAndUpdateBranch";
import AddAndUpdateDivision from "@/components/FunctionsAdmin/AddAndUpdateDivision";
import AddAndUpdateLocation from "@/components/FunctionsAdmin/AddAndUpdateLocation";
import { locationData } from "@/constants/location";
import { User } from "@/types/userTypes";
import { Button, Col, Form, Input, Row, List, Select, Popconfirm, Tabs, notification } from "antd";
import type { TabsProps } from "antd";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";

const { Option } = Select;

// địa điểm
interface locationItem {
  city: string;
  id: number;
}

// nhánh
interface BranchItem {
  name: string;
  code: string;
  id: number;
}

// phòng ban
interface DivisionItem {
  title: string;
  code: string;
  id: number;
}

type Ward = {
  Id?: string;
  Name?: string;
  Level: string;
};

type District = {
  Id: string;
  Name: string;
  Wards: Ward[];
};

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

/* eslint-disable no-template-curly-in-string */
const validateMessages = {
  required: "${label} is required!",
  types: {
    email: "${label} is not a valid email!",
    number: "${label} is not a valid number!",
  },
  number: {
    range: "${label} must be between ${min} and ${max}",
  },
};

// địa điểm
const Location: React.FC = () => {
  const [deleteLocation, { isLoading: isLoadingDelete }] = useDeleteLocationMutation();

  const t: any = useTranslations();

  const { data: location } = useGetLocationListQuery();

  const onDelete = async (locationId: any) => {
    try {
      await deleteLocation({ locationId });
      notification.success({
        message: `${t("noficationDelete.locationSuccess")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t("noficationDelete.locationError")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => {};

  return (
    <>
      <div className="flex justify-end my-4 mr-8">
        <AddAndUpdateLocation title={t("nav.location")} titleLabel={t("table.city")} />
      </div>
      <List<locationItem>
        className="w-full "
        bordered
        itemLayout="horizontal"
        dataSource={location?.results || []}
        renderItem={(item, index) => (
          <List.Item
            key={index}
            actions={[
              <AddAndUpdateLocation
                edit={true}
                title={t("nav.location")}
                titleLabel={t("table.city")}
                locationId={item.id}
              />,
              <Popconfirm
                title={t("noficationDelete.location")}
                description={t("noficationDelete.confirmMessage")}
                onConfirm={() => onDelete(item.id)}
                onCancel={cancel}
                okText={t("general.confirm")}
                cancelText={t("general.close")}
                placement="left"
                okButtonProps={{ loading: isLoadingDelete }}
              >
                <Button danger size="small">
                  {t("general.delete")}
                </Button>
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta title={item.city} />
          </List.Item>
        )}
        locale={{ emptyText: `${t("admin.noLocation")}` }}
      />
    </>
  );
};

// phòng ban
const Divisions: React.FC = () => {
  const [deleteDivision, { isLoading: isLoadingDelete }] = useDeleteDivisionMutation();

  const t: any = useTranslations();
  const { data: divisions } = useGetDivisionsQuery();

  const onDelete = async (divisionId: any) => {
    try {
      await deleteDivision({ divisionId });
      notification.success({
        message: `${t("noficationDelete.roomSuccess")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t("noficationDelete.branchError")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => {};

  return (
    <>
      <div className="flex justify-end my-4 mr-8">
        <AddAndUpdateDivision />
      </div>
      <List<DivisionItem>
        className="w-full "
        bordered
        itemLayout="horizontal"
        dataSource={divisions?.results || []}
        renderItem={(item) => (
          <List.Item
            key={item.code}
            actions={[
              <AddAndUpdateDivision edit={true} divisionId={item.id} />,
              <Popconfirm
                title={t("noficationDelete.room")}
                description={t("noficationDelete.roomSure")}
                onConfirm={() => onDelete(item.id)}
                onCancel={cancel}
                okText={t("general.confirm")}
                cancelText={t("general.close")}
                placement="left"
                okButtonProps={{ loading: isLoadingDelete }}
              >
                <Button danger size="small">
                  {t("general.delete")}
                </Button>
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta title={item.title} />
          </List.Item>
        )}
        locale={{ emptyText: `${t("noficationDelete.noRoom")}` }}
      />
    </>
  );
};

// nhánh
const Branch: React.FC = () => {
  const [deleteBranch, { isLoading: isLoadingDelete }] = useDeleteBranchMutation();

  const t: any = useTranslations();
  const { data: branchList } = useGetBranchListQuery();

  const onDelete = async (branchId: any) => {
    try {
      await deleteBranch({ branchId });
      notification.success({
        message: `${t("noficationDelete.branchSuccess")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t("noficationDelete.branchError")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => {};

  return (
    <>
      <div className="flex justify-end my-4 mr-8">
        <AddAndUpdateBranch />
      </div>
      <List<BranchItem>
        className="w-full "
        bordered
        itemLayout="horizontal"
        dataSource={branchList?.results || []}
        renderItem={(item) => (
          <List.Item
            key={item.code}
            actions={[
              <AddAndUpdateBranch edit={true} branchId={item.id} />,
              <Popconfirm
                title={t("noficationDelete.branchesTitle")}
                description={t("noficationDelete.branchesDescription")}
                onConfirm={() => onDelete(item.id)}
                onCancel={cancel}
                okText={t("general.confirm")}
                cancelText={t("general.close")}
                placement="left"
                okButtonProps={{ loading: isLoadingDelete }}
              >
                <Button danger size="small">
                  {t("general.delete")}
                </Button>
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta title={item.name} />
          </List.Item>
        )}
        locale={{ emptyText: `${t("admin.noBranches")}` }}
      />
    </>
  );
};

// thông tin
const CompanyInformation: React.FC = () => {
  const t: any = useTranslations();
  const [userData, setUserData] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editCompany, { isLoading: isLoadingEdit }] = useEditCompanyMutation();
  const [districtList, setDistrictList] = useState<District[] | []>([]);
  const [wardList, setWardList] = useState([]);
  // Get the userData from the local storage
  useEffect(() => {
    const userDataString = localStorage.getItem("user");
    const parsedUserData: User | null = userDataString ? JSON.parse(userDataString) : null;
    setUserData(parsedUserData);
    // Populate form fields
    form.setFieldsValue({
      companyName: parsedUserData?.user_profile?.company?.name,
      mst: parsedUserData?.user_profile?.company?.MST,
      shortName: parsedUserData?.user_profile?.company?.short_name,
      total_allowed_users: parsedUserData?.user_profile?.company?.total_allowed_users,
      current_users_count: parsedUserData?.user_profile?.company?.current_users_count,
      token: parsedUserData?.user_profile?.company?.token,
      package_type_str: parsedUserData?.user_profile?.company?.package_type_str,
      address: parsedUserData?.user_profile?.company?.address || "",
      ward: parsedUserData?.user_profile?.company?.ward || "",
      district: parsedUserData?.user_profile?.company?.district || "",
      city: parsedUserData?.user_profile?.company?.city || "",
      country: parsedUserData?.user_profile?.company?.country || "",
      zip_code: parsedUserData?.user_profile?.company?.zip_code || "",
      fax: parsedUserData?.user_profile?.company?.fax || "",
      hotline: parsedUserData?.user_profile?.company?.hotline || "",
      youtube_channel: parsedUserData?.user_profile?.company?.youtube_channel || "",
      facebook_page: parsedUserData?.user_profile?.company?.facebook_page || "",
      tiktok: parsedUserData?.user_profile?.company?.tiktok || "",
      website: parsedUserData?.user_profile?.company?.website || "",
      customer_type: parsedUserData?.user_profile?.company?.customer_type,
    });
    // Set the image preview here
    if (parsedUserData?.user_profile?.company?.logo) {
      setImagePreview(parsedUserData.user_profile.company.logo);
    }
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const imgFile = e.target.files[0];
      setSelectedImage(imgFile);

      // Update the preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === "string") {
          setImagePreview(event.target.result);
        }
      };
      reader.readAsDataURL(imgFile);
    }
  };

  const onFinish = async (values: any) => {
    const formData = new FormData();
    // Append the image if there is one
    if (selectedImage) {
      formData.append("logo", selectedImage);
    }
    // Append other form values
    if (userData?.user_profile?.company?.id) {
      // Chuyển đổi id sang string trước khi thêm vào formData
      formData.append("company_id", userData.user_profile.company.id.toString());
    }
    formData.append("short_name", values.shortName);
    formData.append("address", values.address);
    formData.append("ward", values.ward);
    formData.append("district", values.district);
    formData.append("city", values.city);
    formData.append("country", values.country);
    formData.append("zip_code", values.zip_code);
    formData.append("fax", values.fax);
    formData.append("hotline", values.hotline);
    formData.append("tiktok", values.tiktok);
    formData.append("facebook_page", values.facebook_page);
    formData.append("youtube_channel", values.youtube_channel);
    formData.append("website", values.website);
    formData.append("customer_type", values.customer_type);

    try {
      const response = await editCompany(formData);
      if ("data" in response) {
        const userDataString = localStorage.getItem("user");
        const userObj: User | null = userDataString ? JSON.parse(userDataString) : null;
        if (userObj) {
          userObj.user_profile.company.short_name = response.data.short_name;
          userObj.user_profile.company.address = response.data.address;
          userObj.user_profile.company.ward = response.data.ward;
          userObj.user_profile.company.city = response.data.city;
          userObj.user_profile.company.country = response.data.country;
          userObj.user_profile.company.zip_code = response.data.zip_code;
          userObj.user_profile.company.fax = response.data.fax;
          userObj.user_profile.company.hotline = response.data.hotline;
          userObj.user_profile.company.facebook_page = response.data.facebook_page;
          userObj.user_profile.company.youtube_channel = response.data.youtube_channel;
          userObj.user_profile.company.website = response.data.website;
          userObj.user_profile.company.customer_type = response.data.customer_type;
        }
        const updatedUserData = JSON.stringify(userObj);
        localStorage.setItem("user", updatedUserData);
        notification.success({
          message: "Success",
          description: "Company information updated successfully!",
          placement: "topRight", // Optional: adjust the placement as needed
        });
      } else if ("error" in response) {
        console.error(response.error);
      }
    } catch (error) {
      console.error("There was an error uploading the image:", error);
      notification.error({
        message: "Error",
        description: "There was an error updating the company information.",
        placement: "topRight", // Optional: adjust the placement as needed
      });
    }
  };

  return (
    <>
      <div className=" mt-5">
        <Form
          form={form}
          {...layout}
          name="nest-messages"
          onFinish={onFinish}
          validateMessages={validateMessages}
          className="animate-fade-in-up"
        >
          <Row>
            <Col xl={8} lg={24} className="p-3 w-100">
              <Form.Item>
                <div className="items-center m-0">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        margin: "auto",
                        padding: "20px",
                        width: "200px",
                        height: "200px",
                        display: "block",
                        borderRadius: "50%",
                      }}
                    />
                  )}
                  <label className=" flex cursor-pointer d-block m-auto w-50 items-center border-2 justify-center rounded-full text-dark hover:bg-primary hover:text-white ">
                    <h1>{t("admin.changeAvatar")}</h1>
                    <Input
                      type="file"
                      onChange={handleImageChange}
                      accept="image/*"
                      className="absolute bottom-0 right-0 opacity-0"
                    />
                  </label>
                </div>
              </Form.Item>
            </Col>

            <Col xl={16} lg={24} className="p-3 ">
              <div>
                <div>
                  <h1 className="text-xl font-bold">Thông tin công ty</h1>
                  <Row className="px-[50px]">
                    <Col xl={12} lg={24}>
                      <p>{t("admin.companyName")}:</p>
                      <Form.Item name="companyName">
                        <Input
                          disabled
                          className=" rounded-lg transition ease-in-out duration-300 hover:border-blue-500"
                        />
                      </Form.Item>
                    </Col>
                    <Col xl={12} lg={24}>
                      <p>{t("admin.abbreviations")}:</p>
                      <Form.Item name="shortName">
                        <Input className="  rounded-lg transition ease-in-out duration-300 hover:border-blue-500" />
                      </Form.Item>
                    </Col>
                    <Col xl={12} lg={24}>
                      <p>{t("admin.taxCode")}:</p>
                      <Form.Item name="mst">
                        <Input
                          disabled
                          className=" rounded-lg transition ease-in-out duration-300 hover:border-blue-500"
                        />
                      </Form.Item>
                    </Col>
                    <Col xl={12} lg={24}>
                      <p>Nguồn khách hàng chính:</p>
                      <Form.Item name="customer_type" initialValue={userData?.user_profile?.company?.customer_type}>
                        <Select placeholder={t("user.gender")} className="">
                          <Select.Option value="individual">{t("crm.individualCustomers")}</Select.Option>
                          <Select.Option value="business">{t("crm.businessesCustomers")}</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xl={12} lg={24}>
                      <p>{t("admin.maxUser")}:</p>
                      <Form.Item name="total_allowed_users">
                        <Input
                          disabled
                          className=" rounded-lg transition ease-in-out duration-300 hover:border-blue-500"
                        />
                      </Form.Item>
                    </Col>
                    <Col xl={12} lg={24}>
                      <p>{t("admin.currentUsers")}:</p>
                      <Form.Item name="current_users_count">
                        <Input
                          disabled
                          className=" rounded-lg transition ease-in-out duration-300 hover:border-blue-500"
                        />
                      </Form.Item>
                    </Col>
                    <Col xl={12} lg={24}>
                      <p>{t("admin.package")}:</p>
                      <Form.Item name="package_type_str">
                        <Input
                          disabled
                          className=" rounded-lg transition ease-in-out duration-300 hover:border-blue-500"
                        />
                      </Form.Item>
                    </Col>
                    <Col xl={12} lg={24}>
                      <p>{t("admin.zipCode")}:</p>
                      <Form.Item name="zip_code">
                        <Input className="  rounded-lg transition ease-in-out duration-300 hover:border-blue-500" />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
                <div>
                  <h1 className="text-xl font-bold">Thông tin liên hệ</h1>
                  <Row className="px-[50px]">
                    <Col xl={12} lg={24}>
                      <p>{t("user.phone")}:</p>
                      <Form.Item name="hotline" required className="mb-2">
                        <Input className="  rounded-lg transition ease-in-out duration-300 hover:border-blue-500" />
                      </Form.Item>
                    </Col>
                    <Col xl={12} lg={24}>
                      <p>Fax:</p>
                      <Form.Item name="fax" required className="mb-2">
                        <Input className="  rounded-lg transition ease-in-out duration-300 hover:border-blue-500" />
                      </Form.Item>
                    </Col>
                    <Col xl={12} lg={24}>
                      <p>Facebook Page:</p>
                      <Form.Item name="facebook_page" required className="mb-2">
                        <Input className="  rounded-lg transition ease-in-out duration-300 hover:border-blue-500" />
                      </Form.Item>
                    </Col>
                    <Col xl={12} lg={24}>
                      <p>Youtube:</p>
                      <Form.Item name="youtube_channel" required className="mb-2">
                        <Input className="  rounded-lg transition ease-in-out duration-300 hover:border-blue-500" />
                      </Form.Item>
                    </Col>
                    <Col xl={12} lg={24}>
                      <p>Website:</p>
                      <Form.Item name="website" required className="mb-2">
                        <Input className="  rounded-lg transition ease-in-out duration-300 hover:border-blue-500" />
                      </Form.Item>
                    </Col>
                    <Col xl={12} lg={24}>
                      <p>Tiktok:</p>
                      <Form.Item name="tiktok" required className="mb-2">
                        <Input className="  rounded-lg transition ease-in-out duration-300 hover:border-blue-500" />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
                <div>
                  <h1 className="text-xl font-bold">Địa chỉ</h1>
                  <Row className="px-[50px]">
                    <Col xl={12} lg={24}>
                      <p>Số nhà, đường / phố:</p>
                      <Form.Item name="address">
                        <Input className="  rounded-lg transition ease-in-out duration-300 hover:border-blue-500" />
                      </Form.Item>
                    </Col>
                    <Col xl={12} lg={24}>
                      <p>{t("table.wards")}:</p>
                      <Form.Item name="ward" className="mb-2 ">
                        <Select placeholder={t("table.chooseWards")} allowClear>
                          {wardList?.map((item: { Id: string; Name: string }) => (
                            <Option key={item.Id} value={item.Name}>
                              {item.Name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xl={12} lg={24}>
                      <p>{t("table.city")}:</p>
                      <Form.Item name="city" className="mb-2 ">
                        <Select
                          placeholder={t("table.chooseCity")}
                          onChange={(value) =>
                            setDistrictList(
                              locationData?.filter((item: { Name: string }) => item.Name === value)[0]?.Districts
                            )
                          }
                        >
                          {locationData &&
                            locationData?.map((item: { Id: string; Name: string }) => (
                              <Option key={item.Id} value={item.Name}>
                                {item.Name}
                              </Option>
                            ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xl={12} lg={24}>
                      <p>{t("table.district")}:</p>
                      <Form.Item name="district" required className="mb-2">
                        <Select
                          placeholder={t("table.chooseDistrict")}
                          onChange={(value) =>
                            setWardList((districtList?.filter((item: any) => item.Name === value)[0] as any)?.Wards)
                          }
                        >
                          {districtList?.map((item: { Id: string; Name: string }) => (
                            <Option key={item.Id} value={item.Name}>
                              {item.Name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xl={12} lg={24}>
                      <p>{t("admin.nation")}:</p>
                      <Form.Item name="country">
                        <Input className="  rounded-lg transition ease-in-out duration-300 hover:border-blue-500" />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
                <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className=" rounded-lg px-6 bg-blue-500 text-white hover:bg-blue-600 transition duration-300 float-left"
                    loading={isLoadingEdit}
                  >
                    {t("admin.save")}
                  </Button>
                </Form.Item>
              </div>
            </Col>
          </Row>
        </Form>
      </div>
    </>
  );
};

const CompanyInfo: React.FC = () => {
  const t: any = useTranslations();
  const onChange = (key: string) => {
    console.log(key);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `${t("nav.companyInformation")}`,
      children: <CompanyInformation />,
    },
    {
      key: "2",
      label: `${t("nav.divisions")}`,
      children: <Divisions />,
    },
    {
      key: "3",
      label: `${t("nav.location")}`,
      children: <Location />,
    },
    {
      key: "4",
      label: `${t("nav.branch")}`,
      children: <Branch />,
    },
  ];

  return (
    <>
      <BreadcrumbFunction title={t("nav.companyInformation")} functionName={t("admin.administrator")} />
      <Tabs className="mt-6" defaultActiveKey="1" items={items} onChange={onChange} />
    </>
  );
};

export default CompanyInfo;
