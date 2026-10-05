import SearchCustomer from "@/components/Search/SearchCustomer";
import { Col, Form, Input, Radio, Row } from "antd";
import { useTranslations } from "next-intl";
import React from "react";

function CustomerForm({
  edit,
  isBusiness,
  customerType,
  setCustomerType,
  customerList,
  searchValue,
  setSearchValue,
  setCustomerId,
  disable,
  leadId,
}: {
  edit?: boolean;
  isBusiness?: boolean;
  customerType: string;
  setCustomerType: (value: string) => void;
  customerList: any;
  searchValue?: string;
  setSearchValue: (value: string) => void;
  setCustomerId: (value: any) => void;
  disable: any;
  leadId?: any;
}) {
  const t: any = useTranslations();

  return (
    <>
      {isBusiness && (
        <Radio.Group
          onChange={(e) => setCustomerType(e.target.value)}
          value={customerType}
          disabled={ leadId ? !disable : disable}
        >
          <Radio value="individual">{t("crm.individualCustomers")}</Radio>
          <Radio value="business">{t("crm.businessesCustomers")}</Radio>
        </Radio.Group>
      )}

      {edit ? (
        <Form.Item
          label={`${customerType === "individual"
              ? t("user.fullName")
              : "Tên Doanh nghiệp"
            }`}
          name="name"
          required
          className="mb-2"
          rules={[
            { required: true, message: "Xin nhập tên khách hàng!" },
          ]}
        >

          <Input placeholder={t("user.customerFullName")} />
        </Form.Item>
      ) : (
        <SearchCustomer
          customerList={customerList}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          placeholder={
            customerType === "business"
              ? "Nhập tên doanh nghiệp"
              : "Nhập tên khách hàng"
          }
          setCustomerId={setCustomerId}
          disable={disable}
          customerType={customerType}
        />
      )}

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="mobile"
            label={`${customerType === "individual"
                ? t("user.phone")
                : "Số điện thoại doanh nghiệp"
              }`}
            required
            className="mb-2"
            rules={[
              { required: true, message: "Xin nhập số điện thoại khách hàng!" },
            ]}
          >
            <Input placeholder={t("user.customerPhoneNumber")} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={`${customerType === "individual"
                ? t("user.email")
                : "Email doanh nghiệp"
              }`}
            name="email"
            className="mb-2"
          >
            <Input placeholder={t("auth.customerEmail")} />
          </Form.Item>
        </Col>
      </Row>

      {customerType === "business" && (
        <>
          {/* <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Tên viết tắt" name="short_name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="MST" name="MST" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>  */}
          <Form.Item label="Người liên hệ" name="contact_person">
            <Input.TextArea />
          </Form.Item>
        </>
      )}

      {/* {value === "corporate" && (
        <Form.List name="journal_entry">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <div key={key} className="relative">
                  <IoIosRemoveCircleOutline
                    onClick={() => remove(name)}
                    className="absolute top-[39px] -left-[22px] cursor-pointer text-red-500"
                  />
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        label={`Tên người nhận ${key + 1}`}
                        name={[name, "invoice_number"]}
                        rules={[{ required: true }]}
                        className="mb-1 "
                      >
                        <Input placeholder="Tên người nhận" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        label={`Số điện thoại người nhận ${key + 1}`}
                        name={[name, "ref_code"]}
                        rules={[{ required: true }]}
                        className="mb-1"
                      >
                        <Input placeholder="Số điện thoại người nhận" />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              ))}

              {!edit && (
                <Form.Item className="mt-3">
                  <Button type="dashed" onClick={() => add()} block>
                    + Thêm người nhận
                  </Button>
                </Form.Item>
              )}
            </>
          )}
        </Form.List>
      )} */}
    </>
  );
}

export default CustomerForm;
