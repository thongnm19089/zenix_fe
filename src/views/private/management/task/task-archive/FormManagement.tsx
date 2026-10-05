"use client";

import React, { useState } from 'react'
import { Button, Dropdown } from 'antd';
import { FiMoreHorizontal } from 'react-icons/fi';
import { LuLayoutTemplate } from "react-icons/lu";
import { motion } from "framer-motion";
import Board from './FormBoard/Board';

export default function FormManagement() {
  const [isMotionClicked, setIsMotionClicked] = useState(false);

  const getDropdownUser = () => {
    const items = [
      {
        key: "1",
        label: (
          <div>
            Áp dụng
          </div>
        ),
      },
      {
        key: "2",
        label: (
          <div>
            Ẩn
          </div>
        ),
      },
    ];

    return items;
  };

  const handleClick = () => {
    setIsMotionClicked(true);
  };
  return (
    <div className='px-5'>
      {!isMotionClicked ? (
        <>
          <div className="text-lg font-semibold mb-3 mt-6 flex items-center gap-2">
            <LuLayoutTemplate /> Mẫu có sẵn
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 },
              }}
              onClick={handleClick}
              className={`w-full h-28 px-4 py-3 gap-4 rounded cursor-pointer bg-cover bg-center`}
              style={{
                 backgroundImage: `url(${taskBoardTeamPlate.bg_color})` }
              }
            >
              <div className="flex justify-between items-center gap-3">
                <div className="text-white font-semibold">{taskBoardTeamPlate.name}</div>
                <Dropdown
                  menu={{ items: getDropdownUser() }}
                  placement="bottomLeft"
                  arrow
                  trigger={["click"]}
                >
                  <Button
                    type="text"
                    icon={<FiMoreHorizontal className="text-white" size={20} />}
                    onClick={(e) => {
                      e.stopPropagation(); // This should prevent the card's click event
                    }}
                  />
                </Dropdown>
              </div>
            </motion.div>
          </div>

          <div className="text-lg font-semibold mb-3 mt-6 flex gap-2 items-center">
            <LuLayoutTemplate /> Mẫu của khách
          </div>
        </>
      ) : (
        <Board />
      )}
    </div>
  )
}


const taskBoardTeamPlate = {
  bg_color: "/images/board/bg-5.jpg",
  bg_image: null,
  bg_color_type: null,
  board_type: null,
  id: 113,
  name: "Quy trình công việc",
  slugs: "quy-trinh-cong-viec",
  list: [
    {
      id: 99,
      name: "Kế hoạch",
      cards: [
        {
          id: 105,
          name: "Kiểm thử",
          description:
            "<p>Sau khi team Dev phát triển đưa vào kiểm thử, test các chức năng, hệ thống, phát hiện lỗi</p>",
          labels: [{ id: 106, name: "Tester", color: "#1677FF" }],
        },
        {
          id: 104,
          name: "Triển khai",
          labels: [{ id: 107, name: "Dev", color: "#7516FF" }],
        },
      ],
    },
    {
      id: 9,
      name: "Cần làm",
      cards: [
        {
          id: 103,
          name: "Phát triển mã nguồn",
          labels: [{ id: 108, name: "Dev", color: "#7516FF" }],
        },
      ],
    },
    {
      id: 89,
      name: "Đang làm",
      cards: [
        {
          id: 102,
          name: "Thu thập yêu cầu",
          description: "<p>Trao đổi với khách hàng về nghiệp vụ, nhận yêu cầu</p>",
          labels: [{ id: 109, name: "BA", color: "#FFD902" }],
        },
        {
          id: 101,
          name: "Phân tích yêu cầu",
          description: "<p>Trao đổi với team dev về nghiệp vụ, đưa ra kế hoạch triển khai</p>",
          labels: [
            { id: 110, name: "BA", color: "#FFD902" },
            { id: 111, name: "Dev", color: "#7516FF" },
          ],
        },
      ],
    },
    {
      id: 39,
      name: "Hoàn thành",
      cards: [
        {
          id: 100,
          name: "Ký hơp đồng",
          description: "<p>- Ký hợp đồng triển khai</p>",
          labels: [{ id: 112, name: "Sales", color: "#37AE56" }],
        },
      ],
    },
  ],
};

