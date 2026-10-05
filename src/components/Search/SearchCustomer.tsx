import { useGetCustomerListQuery } from "@/api/CRM/apiLead";
import { Form, Input, Select } from "antd";
import { useTranslations } from "next-intl";
import React from "react";
import { CiSearch } from "react-icons/ci";

const { Option } = Select;

let searchTimeout: any;

const SearchCustomer: React.FC<{
  placeholder: string;
  style?: React.CSSProperties;
  customerList: any;
  searchValue?: string;
  setSearchValue: (value: string) => void;
  setCustomerId: (value: number) => void;
  disable: any;
  customerType?: any;
}> = ({
  placeholder,
  customerList,
  searchValue,
  setSearchValue,
  setCustomerId,
  disable,
  customerType
}) => {
    const t: any = useTranslations();
    const handleSearch = (newValue: string) => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      searchTimeout = setTimeout(() => {
        setSearchValue(newValue);
      }, 500); // Trì hoãn tìm kiếm 500ms sau khi người dùng dừng gõ
    };

    const handleChange = (newValue: string) => {
      setSearchValue(newValue);
    };
    // const handleBlur = (newValue: any) => {
    //   console.log(newValue);
    // };

    return (
      <Form.Item
        label={`${customerType ? customerType === "individual"
          ? t("user.fullName")
          : "Tên Doanh nghiệp" : ""
          }`}
        name="name"
        required
        className="mb-2"
      >
        <Select
          showSearch
          // onBlur={handleBlur}
          allowClear
          value={searchValue}
          defaultActiveFirstOption={false}
          suffixIcon={<CiSearch />}
          filterOption={false}
          onSearch={handleSearch}
          onChange={handleChange}
          placeholder={placeholder}
          onSelect={(value, key) => setCustomerId(Number(key.key))}
          onClear={() => setCustomerId(0)}
          disabled={disable}
        >
          {
            searchValue ? (
              <Option key={0} value={searchValue}>
                {searchValue}
              </Option>
            ) : null
          }
          {
            customerList?.results?.map((option: any) => {
              if (searchValue && option.name?.includes(searchValue)) {
                return (
                  <Option key={option.id} value={option.name}>
                    {option.name}
                  </Option>
                );
              } else {
                return (
                  <Option key={option.id} value={option.name}>
                    {option?.MST ? option.name + " | " + option?.MST : option.name}
                  </Option>
                );
              }
            })
          }
        </Select>
      </Form.Item>
    );
  };
// searchValue === customerList?.results?.length ? customerList?.results?.name : searchValue


export default SearchCustomer;
