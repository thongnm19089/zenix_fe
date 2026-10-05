"use client";
import React, { useState } from "react";
import { Badge, Button, Dropdown, Checkbox, notification, Spin } from "antd";
import { useGetSampleBoardsQuery, useCreateSampleBoardCopyMutation } from "@/api/Task/apiTask";
import { IBoard } from "@/types/taskTypes";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";
import { FiMoreHorizontal } from "react-icons/fi";
import { BsArchive } from "react-icons/bs";

const PRIMARY = "#f1692f";

const SampleBoardsPage: React.FC = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isCopyCountAsc, setIsCopyCountAsc] = useState(true);
  const [selectedCreators, setSelectedCreators] = useState<string[]>([]);
  const [boardType, setBoardType] = useState<string | null>(null);

  const { data, isLoading, refetch } = useGetSampleBoardsQuery(boardType);
  const [createSampleBoardCopy, { isLoading: isCopying }] = useCreateSampleBoardCopyMutation();

  const toggleFilterVisibility = () => setIsFilterVisible(!isFilterVisible);
  const toggleCopyCountSort = () => setIsCopyCountAsc(!isCopyCountAsc);

  if (isLoading) {
    return (
      <Spin
        size="large"
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "20%",
          color: PRIMARY,
        }}
      />
    );
  }

  const sortedBoards = data?.all_boards
    ? [...data.all_boards].sort((a, b) =>
      isCopyCountAsc ? a.copy_count - b.copy_count : b.copy_count - a.copy_count
    )
    : [];

  const filteredBoards = sortedBoards.filter(
    (board) => selectedCreators.length === 0 || selectedCreators.includes(board.creator_str)
  );

  const currentBoards = filteredBoards.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = filteredBoards.length
    ? Math.ceil(filteredBoards.length / itemsPerPage)
    : 1;

  const handleCreatorFilterChange = (checkedValues: any) =>
    setSelectedCreators(checkedValues);

  const handleBoardTypeClick = (type: string | null) => {
    setBoardType(type);
    setCurrentPage(1);
    refetch();
  };

  return (
    <div className="min-h-screen flex flex-col relative p-4">
      {/* FILTER BOARD TYPE */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <Button
          style={{
            backgroundColor: !boardType ? PRIMARY : "#e5e7eb",
            color: !boardType ? "#fff" : "#333",
            borderColor: PRIMARY,
          }}
          onClick={() => handleBoardTypeClick(null)}
        >
          Tất cả
        </Button>

        {data?.board_choices?.map((item: any) => (
          <Button
            key={item.value}
            style={{
              backgroundColor: boardType === item.value ? PRIMARY : "#fde3cf",
              color: boardType === item.value ? "#fff" : "#333",
              borderColor: PRIMARY,
            }}
            onClick={() => handleBoardTypeClick(item.value)}
          >
            {item.display}
          </Button>
        ))}
      </div>

      {/* FILTER + SORT */}
      <div className="flex gap-2 justify-end mb-6">
        <Button
          onClick={toggleFilterVisibility}
          style={{ borderColor: PRIMARY, color: PRIMARY }}
        >
          Bộ lọc
        </Button>

        <Button
          onClick={toggleCopyCountSort}
          style={{ borderColor: PRIMARY, color: PRIMARY }}
        >
          Số lần sao chép
        </Button>
      </div>

      {/* FILTER PANEL */}
      {isFilterVisible && (
        <div className="mb-6 p-4 bg-white rounded-xl shadow-lg w-[300px] border">
          <h4 className="font-semibold mb-3 text-lg text-[#f1692f]">
            Lọc theo người tạo
          </h4>

          <Checkbox.Group onChange={handleCreatorFilterChange}>
            <div className="flex flex-col gap-2">
              {(Array.from(
                new Set(data?.all_boards.map((b: IBoard) => b.creator_str))
              ) as string[]).map((creator, index) => (
                <Checkbox key={index} value={creator}>
                  {creator || "Không rõ"}
                </Checkbox>
              ))}
            </div>
          </Checkbox.Group>
        </div>
      )}

      {/* BOARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {currentBoards.map((board: IBoard, idx: number) => (
          <motion.div
            key={board.id}
            onClick={() => router.push(`/business/sample-board/${board.slug}`)}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="relative w-[250px] h-36 rounded-xl p-3 cursor-pointer overflow-hidden shadow-lg hover:scale-[1.04] transition"
            style={{
              ...(board.bg_color_type === 2
                ? { backgroundImage: `url(${board.bg_color})` }
                : board.bg_color_type === 3
                  ? { backgroundImage: `url(${board.bg_image})` }
                  : { backgroundColor: "#9ca3af" }),
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* DROPDOWN */}
            <Dropdown
              trigger={["click"]}
              menu={{
                items: [
                  {
                    key: "0",
                    label: (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/business/sample-board/${board.slug}`);
                        }}
                      >
                        Xem chi tiết
                      </span>
                    ),
                  },
                  {
                    key: "1",
                    label: (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          createSampleBoardCopy(board.slug).then(() => refetch());
                        }}
                      >
                        Tạo bảng copy
                      </span>
                    ),
                  },
                ],
              }}
            >
              <Button
                type="text"
                onClick={(e) => e.stopPropagation()}
                className="absolute top-2 right-2 text-white"
                icon={<FiMoreHorizontal size={18} />}
              />
            </Dropdown>

            <div className="absolute inset-0 bg-black/40" />

            <div className="relative z-10 text-white flex flex-col gap-1">
              <div className="font-semibold text-base line-clamp-1">
                {board.name}
              </div>
              <div className="text-sm">Người tạo: {board.creator_str}</div>
              <div className="text-sm">Số bản sao: {board.copy_count}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex gap-2 justify-end mt-8">
        <Button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
          <FaChevronLeft />
        </Button>

        {[...Array(totalPages)].map((_, i) => (
          <Button
            key={i}
            type={currentPage === i + 1 ? "primary" : "default"}
            style={
              currentPage === i + 1
                ? { backgroundColor: PRIMARY, borderColor: PRIMARY }
                : {}
            }
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </Button>
        ))}

        <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
          <FaChevronRight />
        </Button>
      </div>
    </div>
  );
};

export default SampleBoardsPage;
