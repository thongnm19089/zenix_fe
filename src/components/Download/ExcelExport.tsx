import React, { useState } from 'react';
import { Button, Modal, Select } from 'antd';
import { BsFiletypeXls } from 'react-icons/bs';
import * as XLSX from 'xlsx';

function ExcelExport({ open, setOpen, data, pageSize, setPageSize }: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>>, data: any, pageSize: number, setPageSize: React.Dispatch<React.SetStateAction<number>> }) {


  const showModal = () => {
    setOpen(true);
  };

  const handleModalClose = () => {
    setOpen(false);
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
  };

  const handleExport = () => {
    exportToExcel(data);
    setOpen(false);
  };

  const exportToExcel = (data: any) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, 'data.xlsx');
  };

  return (
    <div>
      <Button
        type="dashed"
        icon={<BsFiletypeXls className="text-blue-500" />}
        onClick={showModal}
        className="flex items-center justify-center border-blue-500 text-blue-500 max-sm:hidden"
      >
        Xuất Excel
      </Button>
      <Modal
        title="Xuất file Excel"
        open={open}
        onOk={handleModalClose}
        onCancel={handleModalClose}
        footer={null}
        width={370}
      >
        <div className='flex gap-2 items-center'>
          <div className='font-semibold'>Số hàng cần xuất:</div>
          <Select
            defaultValue={pageSize}
            style={{ width: 120 }}
            onChange={handlePageSizeChange}
          >
            <Select.Option value={10}>10</Select.Option>
            <Select.Option value={50}>50</Select.Option>
            <Select.Option value={100}>100</Select.Option>
            <Select.Option value={200}>200</Select.Option>
            <Select.Option value={500}>500</Select.Option>
          </Select>
          <Button type='primary' onClick={handleExport}>
            Xuất
          </Button></div>

      </Modal>
    </div>
  );
}

export default ExcelExport;
