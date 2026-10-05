import { Button, Dropdown } from 'antd'
import { MenuProps } from 'antd/lib';
import React from 'react'
import { AiOutlineDown } from 'react-icons/ai'
import TrelloList from './TrelloList';
import { useSelector } from 'react-redux';
import { RootState } from "@/store/store";
import { TbArrowsExchange2 } from 'react-icons/tb';
import { BiMessageSquareDetail } from "react-icons/bi";


export default function Board() {
    const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);

    const sortedBoardList = [...(taskBoardTeamPlate || [])].sort((a, b) => a.name.localeCompare(b.name));

    const items: MenuProps["items"] = sortedBoardList?.reduce((accumulator: any, item: any) => {
        if (item.id) {
            accumulator.push({
                key: item.id,
                label: (
                    <div className="text-lg font-semibold py-1">
                        {item.name}
                    </div>
                ),
            });
        }
        return accumulator;
    }, []);

    const board = taskBoardTeamPlate?.map((item: any) => item.name);
    const bg_color = taskBoardTeamPlate?.map((item: any) => item.bg_color);

    return (
        <>
            <div className={`bg-cover bg-center`}
                style={{   backgroundImage: `url(${bg_color})` }}
            >
                <div className="flex max-sm:flex-col max-sm:gap-2 justify-between bg-gray-500 p-2 bg-opacity-20 mb-2">
                    <div className="flex justify-between items-center  ">
                        <Dropdown menu={{ items }}>
                            {board && (
                                <div className="text-xl font-bold flex gap-2 items-center">
                                    {board} <AiOutlineDown size={20} />
                                </div>
                            )}
                        </Dropdown>
                    </div>
                    <div className="mr-4 flex items-center sm:gap-3 max-sm:self-end">
                        <Button ghost className="max-sm:hidden">
                            <div className="flex items-center gap-2">
                                <TbArrowsExchange2 size={16} /> <span className="font-semibold ">Sử dụng</span>
                            </div>
                        </Button>
                        <Button ghost className="max-sm:hidden">
                            <div className="flex items-center gap-2">
                                <BiMessageSquareDetail size={16} /> <span className="font-semibold ">Chi tiết</span>
                            </div>
                        </Button>
                    </div>
                </div>
                <div className={`overflow-x-auto w-[calc(100vw-44px)]  ${isCollapse ? "md:w-[calc(100vw-124px)]" : "md:w-[calc(100vw-300px)]"
                    }  md:min-h-[calc(100vh-140px)] min-h-[calc(100vh-110px)] px-2`}>
                    <div className="p-2.5 rounded-md flex flex-row gap-3" >
                        {taskBoardTeamPlate.map((board: any) => (
                            board.list.map((item: any, index: number) => (
                                <TrelloList
                                    list={item}
                                />
                            ))
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}


const taskBoardTeamPlate = [
    {
        bg_color: "/images/board/bg-5.jpg",
        bg_image: null,
        bg_color_type: null,
        board_type: null,
        id: 113,
        name: "Quy trình công việc",
        list: [
            {
                id: 99,
                name: "Kế hoạch",
                cards: [
                    {
                        id: 105,
                        name: "Kiểm thử",
                        description:
                            "Sau khi team Dev phát triển đưa vào kiểm thử, test các chức năng, hệ thống, phát hiện lỗi",
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
                        description: "Trao đổi với khách hàng về nghiệp vụ, nhận yêu cầu",
                        labels: [{ id: 109, name: "BA", color: "#FFD902" }],
                    },
                    {
                        id: 101,
                        name: "Phân tích yêu cầu",
                        description: "Trao đổi với team dev về nghiệp vụ, đưa ra kế hoạch triển khai",
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
                        description: "- Ký hợp đồng triển khai",
                        labels: [{ id: 112, name: "Sales", color: "#37AE56" }],
                    },
                ],
            },
        ],
    },
];
