"use client"
import { Avatar, Button, notification, Tooltip, Form } from 'antd';
import React, { useEffect, useState } from 'react'
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { BiChevronLeft } from 'react-icons/bi';
import ListInput from './ListInput';
import { useCreateCardMutation, useCreateSampleBoardCopyMutation, useCreateTrelloListMutation, useDeleteCardMutation, useDeleteTrelloListMutation, useGetSampleBoardDetailQuery, useReorderCardMutation, useReorderTrelloListMutation } from '@/api/Task/apiTask';
import { useSelector } from 'react-redux';
import { useTranslations } from 'next-intl';
import { useRouter } from "next/navigation";
import { RootState } from "@/store/store";
import { IBoard, ICard, ILabel, IList, IUser } from '@/types/taskTypes';
import SearchTask from '@/components/Search/SearchTask';
import { useSearchParams } from "next/navigation";
import TrelloListSample from './TrelloListSample';
import SelectBoard from '@/components/FunctionsManagement/Task/SelectBoard';

export default function SampleBoard({ slug }: { slug: string | string[] | undefined; }) {

  const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);
  const [form] = Form.useForm();
  const t: any = useTranslations();
  const router = useRouter();
  const [currentBoard, setCurrentBoard] = useState<any>(null);
  const [selectedBoard, setSelectedBoard] = useState<IBoard | null>(null);
  const { data: boardQuery, refetch, error, isLoading } = useGetSampleBoardDetailQuery(slug, { skip: !slug });
  const [createSampleBoardCopy, { isLoading: isCopying }] = useCreateSampleBoardCopyMutation();
  const [isModalVisible, setIsModalVisible] = useState(false);


  function deepCopy(obj: any) {
    return JSON.parse(JSON.stringify(obj));
  }

  useEffect(() => {
    if (boardQuery) {
      setCurrentBoard(deepCopy(boardQuery));
    }
  }, [boardQuery]);

  const handleCloseModal = () => {
    setSelectedBoard(null);
    setIsModalVisible(false);
  };

  const handleCreateBoardCopy = async (slug: string) => {
    try {
      await createSampleBoardCopy(slug).unwrap();
      notification.success({ message: "Board copy created successfully!" });
      refetch();
    } catch (error) {
      console.error("Error:", error); // Log lỗi nếu có
      notification.error({ message: "Failed to create board copy." });
    }
  };


  return (
    <div
      className={`${boardQuery?.bg_color_type === 1 ? boardQuery?.bg_color : ""} ${boardQuery?.bg_color_type === 2 || 3 ? "bg-cover bg-center" : ""
        }`}
      style={
        boardQuery?.bg_color_type === 2
          ? { backgroundImage: `url(${boardQuery?.bg_color})` }
          : boardQuery?.bg_color_type === 3
            ? { backgroundImage: `url(${boardQuery?.bg_image})` }
            : {}
      }
    >
      <div className="flex max-sm:flex-col max-sm:gap-2 justify-between bg-gray-500 p-2 bg-opacity-20 mb-2">
        <div className="flex justify-between items-center  ">

          <Button ghost className="max-sm:hidden mr-3" onClick={() => router.push("/business/sample-board")}>
            <div className="flex items-center gap-2">
              <BiChevronLeft size={20} /><span className="font-semibold ">{t("general.back")}</span>
            </div>
          </Button>
          <div className="flex items-center gap-4">
            <div
              className="inline-flex items-center px-4 py-2 border border-white rounded-lg text-white bg-transparent cursor-pointer transition-colors duration-300 hover:text-blue-500"
            >
              <span className="mr-2 text-lg hover:text-blue-500"></span> {boardQuery?.name}
            </div>

            <Button
              key="copy"
              onClick={(e) => {
                e.stopPropagation();
                handleCreateBoardCopy(boardQuery.slug);
              }}
              className="inline-flex items-center justify-center px-4 py-2 border border-white rounded-lg text-white bg-transparent hover:text-blue-500 transition-colors duration-300"
            >
              Tạo bảng copy
            </Button>
          </div>


        </div>
      </div>
      <div
        className={`overflow-x-auto w-[calc(100vw-44px)]  ${isCollapse ? "md:w-[calc(100vw-124px)]" : "md:w-[calc(100vw-300px)]"
          }  md:min-h-[calc(100vh-140px)] min-h-[calc(100vh-110px)] px-2`}
      >
        <DragDropContext onDragEnd={() => { }}>
          <Droppable droppableId="lists" direction="horizontal" type="LIST">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="p-2.5 rounded-md flex flex-row gap-3"
              >
                {currentBoard?.lists?.map((item: IList, index: number) => (
                  <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                    {(provided) => (
                      <div ref={provided.innerRef}>
                        <TrelloListSample
                          board={currentBoard}
                          list={item}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  )
}
