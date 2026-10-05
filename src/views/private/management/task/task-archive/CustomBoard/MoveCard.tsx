import { useEffect, useState } from "react";
import { Button, Col, Form, Modal, Row, Select, notification } from "antd";
import { TbArrowsExchange } from "react-icons/tb";
import { useCreateCardMutation, useCreateTrelloListMutation, useDeleteTrelloListMutation, useGetBoardDetailQuery, useGetBoardListQuery } from "@/api/Task/apiTask";
import { IList } from "@/types/taskTypes";


function MoveCard({
    cards,
    listId,
    slug,
}: {
    cards?: Boolean;
    listId: number;
    slug: any;
}) {

    const [isOpen, setOpen] = useState(false);
    const [form] = Form.useForm();
    const defaultValue = 1;
    const [currentBoard, setCurrentBoard] = useState<any>(null);
    const [selectedBoardId, setSelectedBoardId] = useState<number>(defaultValue);

    const [createTrelloList] = useCreateTrelloListMutation();
    const [deleteTrelloList, {isLoading: isLoadingDelete}] = useDeleteTrelloListMutation();
    const [createCard, { isLoading: isLoadingCreate }] = useCreateCardMutation();
    const { data: boardList, refetch } = useGetBoardListQuery({});
    const { data: boardQuery, refetch: refetchBoard } = useGetBoardDetailQuery(slug, { skip: !slug });

    const showModal = () => {
        setOpen(true);
    };

    const handleModalClose = () => {
        setOpen(false);
    };

    const handleNotification = (type: "success" | "error", message: string) => {
        notification[type]({
            message: message,
            placement: "bottomRight",
            className: "h-16",
        });
    };

    const handleChange = (value: number | undefined) => {
        if (value !== undefined) {
            setSelectedBoardId(value);
        }
    };
    // const moveListToAnotherBoard = async (listId: number, targetBoardId: number) => {
    //     try {
    //         const listToMove = boardQuery.lists.find((list: IList) => list.id === listId);

    //         await deleteTrelloList(listId);
    //         const response = await createTrelloList({ name: listToMove.name, board: targetBoardId });

    //         if ("data" in response) {
    //             const newList = response.data;

    //             for (const card of listToMove.cards) {
    //                 await createCard({ name: card.name, trello_list: newList.id, user_ids: [] });
    //             }
    //             setCurrentBoard((boardQuery: any) => {
    //                 const updatedLists = boardQuery?.lists.map((list: IList) => {
    //                     if (list.id === newList.id) {
    //                         return { ...list, cards: listToMove.cards };
    //                     }
    //                     return list;
    //                 });
    //                 return { ...boardQuery, lists: updatedLists };
    //             });
    //         }
    //     } catch (error) {
    //         handleNotification("error", "Failed to move list");
    //     }
    // };



    const moveListToAnotherBoard = async (listId: number, targetBoardId: number) => {
        try {
            const listToMove = boardQuery.lists.find((list: IList) => list.id === listId);
    
            // Xóa danh sách cũ
            await deleteTrelloList(listId);
    
            // Tạo danh sách mới
            const response = await createTrelloList({ name: listToMove.name, board: targetBoardId });
    
            if ("data" in response) {
                const newList = response.data;
    
                // Tạo mảng mới để lưu trữ các thẻ được cập nhật
                const updatedCards:any = [];
    
                // Duyệt qua các thẻ của danh sách cũ
                for (const card of listToMove.cards) {
                    // Tạo thẻ mới trên danh sách mới

                    const newCardResponse = await createCard({
                        name: card.name,
                        trello_list: newList.id,
                        user_ids: [],
                        // Truyền labels từ thẻ cũ sang thẻ mới
                        labels: card.label_list,
                    });
    
                    // Nếu thẻ mới được tạo thành công, thêm vào mảng updatedCards
                    if ("data" in newCardResponse) {
                        updatedCards.push(newCardResponse.data);
                    }
                }
    
                // Cập nhật danh sách nhãn tổng trên bảng mới
                const updatedLabels = boardQuery.labels.concat(listToMove.labels);
    
                // Cập nhật danh sách mới trong trạng thái hiện tại, sử dụng mảng updatedCards và updatedLabels
                setCurrentBoard(() => {
                    const updatedLists = boardQuery?.lists.map((list: IList) => {
                        if (list.id === newList.id) {
                            return { ...list, cards: updatedCards };
                        }
                        return list;
                    });
                    return { ...boardQuery, lists: updatedLists, labels: updatedLabels };
                });
                refetchBoard();
            }
        } catch (error) {
            handleNotification("error", "Failed to move list");
        }
    };

    
    // const moveListToAnotherBoard = async (trelloListId: number, targetBoardId: number) => {
    //     // Keep a copy of the current board state for restoration in case of an error.
    //     const listToMove = boardQuery.lists.find((list: IList) => list.id === listId);
    //     // Optimistically remove the list from local state to make the UI look fast.
    //     const updatedLists = boardQuery?.lists?.filter((list: IList) => list.id !== trelloListId);

    //     setCurrentBoard((prevBoard: any) => ({
    //         ...prevBoard,
    //         lists: updatedLists,
    //     }));
    
    //     try {
    //         // Xóa danh sách khỏi bảng hiện tại
    //         await deleteTrelloList(trelloListId);
    
    //         // Thêm danh sách vào bảng mới
    //         const body = { name: listToMove.name, board: targetBoardId };
    //         console.log("body",body);
    //         const response = await createTrelloList(body);
    //         console.log("response",response);
    //         if ("data" in response) {
    //             const newList = response.data;
    //             console.log("newList",newList);
    //             // Cập nhật board hiện tại
    //             setCurrentBoard((prevBoard: any) => ({
    //                 ...prevBoard,
    //                 lists: [prevBoard?.lists, newList],
    //             }));
    //         }
    //     } catch (error) {
    //         // Restore the original board state because the deletion API call failed.
    //         handleNotification("error", "Failed to move list to another board");
    //     }
    // };
    

    return (
        <>
            <div onClick={showModal}>
                <TbArrowsExchange className="inline-block mr-2" />
                {cards ? "Chuyển danh sách" : "Chuyển thẻ"}
            </div>

            <Modal
                title={cards ? "Di chuyển danh sách" : "Di chuyển thẻ"}
                open={isOpen}
                onCancel={handleModalClose}
                footer={null}
                width={370}
            >
                <div className="mt-3">
                    <Form
                        form={form}
                    >
                        <Form.Item name="">
                            <Select
                                placeholder="Không gian làm việc"
                                style={{ width: 320 }}
                                allowClear
                                showSearch
                                onChange={handleChange}
                                filterOption={(input, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {boardList?.results?.map((item: any) => (
                                    <Select.Option key={item.id} value={item.id} label={item.name}>
                                        {item.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        {cards ? "" : <>
                            <Row gutter={16}>
                                <Col span={15}>
                                    <Form.Item name="" rules={[{ required: true }]}>
                                        <Select
                                            placeholder="Không gian làm việc"
                                            style={{ width: 320 }}
                                            allowClear
                                            showSearch
                                            filterOption={(input, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                        >
                                            {boardList?.results?.map((item: any) => (
                                                <Select.Option key={item.id} value={item.id} label={item.name}>
                                                    {item.name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </>}
                        <Button type="primary" htmlType="submit" loading={isLoadingDelete} onClick={() => moveListToAnotherBoard(listId, selectedBoardId)}>
                            Di chuyển
                        </Button>
                    </Form>
                </div>
            </Modal>
        </>
    )
}

export default MoveCard;
