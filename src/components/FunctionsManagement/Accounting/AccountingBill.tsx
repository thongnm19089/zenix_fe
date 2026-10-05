import React, { useState, useEffect } from "react";
import { Button, Col, Input, Modal, Row, Table } from "antd";
import { useTranslations } from "next-intl";

type TableRow = {
  content: string;
  debit: string;
  credit: string;
  amount: string;
};

const AccountingBill = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [voucherNumber, setVoucherNumber] = useState("");
  const [tableData, setTableData] = useState<TableRow[]>([{ content: "", debit: "", credit: "", amount: "" }]);
  const [totalAmount, setTotalAmount] = useState("");

  const t: any = useTranslations();

  useEffect(() => {
    const calculatedTotalAmount = calculateTotalAmount();
    setTotalAmount(calculatedTotalAmount);
  }, [tableData]);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onPrint = () => {
    setIsModalOpen(false);
    window.print();
    // Xử lý in phiếu
  };

  const addRow = () => {
    setTableData([...tableData, { content: "", debit: "", credit: "", amount: "" }]);
  };

  const handleTableInputChange = (value: string, field: keyof TableRow, rowIndex: number) => {
    let formattedValue = value;

    if (field === "amount") {
      // Loại bỏ dấu chấm để có giá trị nguyên bản
      const originalValue = value.replace(/\./g, '');

      // Sử dụng RegEx để thêm dấu chấm mỗi 3 kí tự số
      formattedValue = originalValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    const updatedTableData = [...tableData];
    updatedTableData[rowIndex][field] = formattedValue;
    setTableData(updatedTableData);
  };

  const formatNumber = (number: string) => {
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const calculateTotalAmount = () => {
    let sum = 0;
    tableData.forEach((row) => {
      // Loại bỏ dấu chấm để có giá trị nguyên bản
      const amount = parseFloat(row.amount.replace(/\./g, '')) || 0;
      sum += amount;
    });
    return sum.toString();
  };

  const columns = [
    { title: "Nội Dung", dataIndex: "content", key: "content", width: 300, className: "border-r border-l", },
    { title: "TK Nợ", dataIndex: "debit", key: "debit", width: 150, className: "border-r", },
    { title: "TK Có", dataIndex: "credit", key: "credit", width: 150, className: "border-r", },
    {
      title: "Số Tiền",
      dataIndex: "amount",
      key: "amount",
      width: 150,
      className: "border-r",
      render: (text: string | undefined | null) => (
        <span>{text !== undefined && text !== null ? formatNumber(text) : ""}</span>
      ),
    },
  ];

  const dataSource = tableData.map((row, index) => ({ ...row, key: index }));

  const renderTotalRow = () => (
    <tr>
      <td colSpan={3} className="text-md">
        Tổng cộng:
      </td>
      <td>
        <Input
          size="small"
          maxLength={100}
          className="ml-1 py-0 px-1 input-print"
          value={formatNumber(totalAmount)}
          readOnly
        />
      </td>
    </tr>
  );

  return (
    <>
      <div className="border p-5">
        <div className="text-center">
          <p className="font-bold text-2xl">Tạo Phiếu Kế Toán</p>
        </div>
        <div className="text-center">
          <p className="font-style: italic">
            <span className="ml-1">
              Ngày
              <Input
                className="w-10 ml-1"
                placeholder="Ngày"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </span>
            <span className="ml-2">
              Tháng
              <Input
                className="w-10 ml-1 "
                placeholder="Tháng"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </span>
            <span className="ml-2">
              Năm
              <Input
                className="w-20 ml-1"
                placeholder="Năm"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </span>
          </p>
        </div>
        <div>
          <div className="text-right">
            <span>
              Số phiếu:
              <Input
                className="w-30 ml-1"
                placeholder="Số phiếu"
                value={voucherNumber}
                onChange={(e) => setVoucherNumber(e.target.value)}
              />
            </span>
          </div>
          <div>
            <table className="w-full text-sm text-left rtl:text-right text-dark-100 dark:text-dark-100">
              <thead className="text-md text-dark-300 bg-gray-50 dark:bg-gray-700 dark:text-dark-100">
                <tr>
                  <th>Nội Dung</th>
                  <th>TK Nợ</th>
                  <th>TK Có</th>
                  <th>Số Tiền</th>
                </tr>
              </thead>
              <tbody>
                {dataSource.map((row, index) => (
                  <tr key={index}>
                    <td>
                      <Input
                        size="small"
                        maxLength={100}
                        className="py-0 px-1 input-print"
                        value={row.content}
                        onChange={(e) => handleTableInputChange(e.target.value, "content", index)}
                      />
                    </td>
                    <td>
                      <Input
                        size="small"
                        maxLength={100}
                        className="ml-1 py-0 px-1 input-print"
                        value={row.debit}
                        onChange={(e) => handleTableInputChange(e.target.value, "debit", index)}
                      />
                    </td>
                    <td>
                      <Input
                        size="small"
                        maxLength={100}
                        className="ml-1 py-0 px-1 input-print"
                        value={row.credit}
                        onChange={(e) => handleTableInputChange(e.target.value, "credit", index)}
                      />
                    </td>
                    <td>
                      <Input
                        size="small"
                        maxLength={100}
                        className="ml-1 py-0 px-1 input-print"
                        value={formatNumber(row.amount)}
                        onChange={(e) => handleTableInputChange(e.target.value, "amount", index)}
                      />
                    </td>
                  </tr>
                ))}
                {renderTotalRow()}
              </tbody>
            </table>
          </div>
          <div className="text-right mt-5">
            <Button type="primary" onClick={addRow}>
              Thêm Dòng
            </Button>
          </div>
        </div>
        <Button type="primary" className="align-center" onClick={showModal}>
          In Phiếu
        </Button>
      </div>

      <Modal
        width={845}
        onCancel={handleCancel}
        open={isModalOpen}
        footer={null}
      >
        <div>
          <div className="text-center">
            <h1 className="font-semibold text-2xl">
              PHIẾU KẾ TOÁN
            </h1>
            <p className="text-md">
              Ngày {date} tháng {month} năm {year}
            </p>
          </div>
          <div className="text-right">Số phiếu: {voucherNumber}</div>

          <Table dataSource={dataSource} columns={columns} pagination={false} className="border" />
          <div className="flex items-center pl-3 border-b border-r border-l bg-gray-100 border-gray-300">
            <div className="flex-grow mx-3 my-2 font-semibold text-dark-100 dark:text-dark-100">
              Tổng Cộng
            </div>
            <div className="flex-shrink-0 mx-3 my-2 w-28 font-semibold text-right text-dark-100 dark:text-dark-100">
              <h3>{formatNumber(totalAmount)}</h3>
            </div>
          </div>

        </div>
        <div className="mt-5">
          <Row>
            <Col span={12}>
              <div className="text-center font-bold text-md">
                <p>Người Lập Phiếu</p>
              </div>
            </Col>
            <Col span={12}>
              <div className="text-center font-bold text-md">
                <p>Kế toán trưởng</p>
              </div>
            </Col>
          </Row>
        </div>
        <div className="flex justify-end mr-15 mt-10 print-hidden">
          <Button type="primary" onClick={onPrint}>In Phiếu</Button>
        </div>
      </Modal>
    </>
  );
};

export default AccountingBill;
