import React, { useEffect, useState } from "react";
import { Table } from "antd";
import { useTranslations } from "next-intl";


interface Card {
  board_name: string;
  name: string;
  user_names: string[];
  deadline: string | number | Date;
}

interface DetailTableProps {
  cardList: Card[];
}

const DetailTable: React.FC<DetailTableProps> = ({ cardList }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const t: any = useTranslations();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Tạo danh sách lựa chọn cho bộ lọc
  const boardNameFilters = Array.from(new Set(cardList.map(card => card.board_name))).map(board_name => ({
    text: board_name,
    value: board_name,
  }));

  const titleFilters = Array.from(new Set(cardList.map(card => card.name))).map(name => ({
    text: name,
    value: name,
  }));

  const userFilters = Array.from(new Set(cardList.flatMap(card => card.user_names))).map(userName => ({
    text: userName,
    value: userName,
  }));

  const columns = [
    {
      title: `${t('chart.jobBoard')}`,
      dataIndex: "board_name",
      key: "board_name",
      sorter: (a: { board_name: string; }, b: { board_name: any; }) => a.board_name.localeCompare(b.board_name),
      // Thêm bộ lọc vào cột 'board_name'
      filters: boardNameFilters,
      onFilter: (value: any, record: any) => record.board_name.includes(value),
    },
    {
      title: `${t('table.title')}`,
      dataIndex: "name",
      key: "name",
      sorter: (a: { name: string; }, b: { name: any; }) => a.name.localeCompare(b.name),
      filters: titleFilters,
      onFilter: (value: any, record: any) => record.name.includes(value),
    },
    {
      title: `${t('hr.userInfo')}`,
      dataIndex: "user_names",
      key: "user_names",
      sorter: (a: { user_names: string[]; }, b: { user_names: any[]; }) => a.user_names[0]?.localeCompare(b.user_names[0]),
      render: (userNames: any[]) => userNames?.join(", "), // Hiển thị danh sách người dùng dưới dạng chuỗi
      filters: userFilters,
      onFilter: (value: any, record: any) => record.user_names.includes(value),
    },
    {
      title: `${t('table.deadline')}`,
      dataIndex: "deadline",
      key: "deadline",
      sorter: (a: { deadline: string | number | Date; }, b: { deadline: string | number | Date; }) => {
        const deadlineA = a.deadline instanceof Date ? a.deadline : new Date(a.deadline);
        const deadlineB = b.deadline instanceof Date ? b.deadline : new Date(b.deadline);
        return deadlineA.getTime() - deadlineB.getTime();
      },
      render: (deadline: string | number | Date) => deadline ? (new Date(deadline)).toLocaleDateString() : 'No Deadline' // Chuyển đổi deadline sang dạng ngày tháng nếu có
    },
    // Thêm các cột khác nếu cần
  ];

  // Cấu hình phân trang
  const paginationConfig = {
    showSizeChanger: true, // Cho phép thay đổi kích thước trang
    pageSizeOptions: ['10', '20', '50', '100'], // Các tùy chọn kích thước trang
    defaultPageSize: 10, // Kích thước trang mặc định
  };

  return <Table
    dataSource={cardList}
    columns={columns}
    scroll={isMobile ? { x: 'max-content' } : undefined}
    pagination={paginationConfig} // Áp dụng cấu hình phân trang
  />;
}

export default DetailTable;
