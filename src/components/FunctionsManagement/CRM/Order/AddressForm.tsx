import { locationData } from "@/constants/location";
import { Col, Form, Input, Row, Select } from "antd";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";

const { Option } = Select;

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

function useMobileCheck() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", checkSize);
    checkSize();

    return () => window.removeEventListener("resize", checkSize);
  }, []);

  return isMobile;
}

function AddressForm({ sizeDrawer, customerType }: { sizeDrawer?: boolean; customerType?: string }) {
  const t: any = useTranslations();
  const [districtList, setDistrictList] = useState<District[] | []>([]);
  const [wardList, setWardList] = useState([]);

  const isMobile = useMobileCheck();

  return (
    <>
      {customerType === "business" && <div className="mb-2 mt-4 font-bold text-base">Địa chỉ công ty</div>}

      <Row gutter={16}>
        {/* <Col span={sizeDrawer === undefined ? 8 : sizeDrawer ? 8 : 24}> */}
        <Col span={sizeDrawer === undefined ? (isMobile ? 24 : 8) : sizeDrawer ? 8 : 24}>
          <Form.Item name="city" label={t("table.city")} className="mb-2">
            <Select
              placeholder={t("table.chooseCity")}
              onChange={(value) =>
                setDistrictList(locationData?.filter((item: { Name: string }) => item.Name === value)[0]?.Districts)
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
        <Col span={sizeDrawer === undefined ? (isMobile ? 24 : 8) : sizeDrawer ? 8 : 24}>
          <Form.Item name="district" label={t("table.district")} className="mb-2">
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

        {/* <Col span={sizeDrawer === undefined ? 8 : sizeDrawer ? 8 : 24}> */}
        <Col span={sizeDrawer === undefined ? (isMobile ? 24 : 8) : sizeDrawer ? 8 : 24}>
          <Form.Item name="ward" label={t("table.wards")} className="mb-2">
            <Select placeholder={t("table.chooseWards")} allowClear>
              {wardList?.map((item: { Id: string; Name: string }) => (
                <Option key={item.Id} value={item.Name}>
                  {item.Name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Form.Item
        name="address"
        label={`${customerType === "business" ? "Số nhà, tòa, đường ..." : t("user.address")} `}
      >
        <Input.TextArea />
      </Form.Item>
      {customerType === "business" && (
        <>
          <div className="mb-2 font-bold text-base">Địa chỉ nhận</div>
          <Form.Item name="billing_address">
            <Input.TextArea placeholder="Nhập địa chỉ khách hàng" />
          </Form.Item>
        </>
      )}
    </>
  );
}

export default AddressForm;
