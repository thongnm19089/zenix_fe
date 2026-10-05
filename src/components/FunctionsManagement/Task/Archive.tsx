import {
  useDeleteArchiveCardMutation,
  useDeleteArchiveListMutation,
  useEditArchiveCardMutation,
  useEditArchiveListMutation,
  useGetArchiveCardQuery,
  useGetArchiveListQuery,
} from "@/api/Task/apiTask";
import { Button, Card, Popconfirm, Popover, Spin, Tabs, notification } from "antd";
import { TabsProps } from "antd/lib";
import React, { useState, useEffect } from "react";
import { BsArchive } from "react-icons/bs";
import { useTranslations } from "next-intl";
import dayjs from "dayjs";

interface ArchiveProps {
  boardId: number;
  refreshCardAndBoard: () => void;
  isArchiveOpen: boolean;
  setIsArchiveOpen: (open: boolean) => void;
  refetchArchiveList?: () => void;
  refetchArchiveCard?: () => void;
  hasCardArchived?: boolean;
  setHasCardArchived: (c: boolean) => void
}

function Archive(props: ArchiveProps) {
  const { boardId, refreshCardAndBoard, isArchiveOpen, setIsArchiveOpen, hasCardArchived, setHasCardArchived } = props;
  const [activeTab, setActiveTab] = useState<string>("1");
  const [archiveCardCache, setArchiveCardCache] = useState<any>(null);
  const [archiveListCache, setArchiveListCache] = useState<any>(null);
  const [loadingCardId, setLoadingCardId] = useState<number | null>(null);

  const { data: archiveCard, refetch: refetchArchiveCard, isLoading: isLoadingCardData } = useGetArchiveCardQuery(boardId, {
    skip: !isArchiveOpen || activeTab !== "1",
  });

  const { data: archiveList, refetch: refetchArchiveList, isLoading: isLoadingListData } = useGetArchiveListQuery(boardId, {
    skip: !isArchiveOpen || activeTab !== "2",
  });

  useEffect(() => {
    if (archiveCard && !archiveCardCache) {
      setArchiveCardCache(archiveCard);
    }
    if (archiveList && !archiveListCache) {
      setArchiveListCache(archiveList);
    }
  }, [archiveCard, archiveList, archiveCardCache, archiveListCache]);

  // Mutation hooks
  const [editArchiveList, { isLoading: isLoadingEdit }] = useEditArchiveListMutation();
  const [editArchiveCard, { isLoading: isLoadingCard }] = useEditArchiveCardMutation();
  const [deleteArchiveList, { isLoading: isLoadingDelete }] = useDeleteArchiveListMutation();
  const [deleteArchiveCard, { isLoading: isLoadingDeleteCard }] = useDeleteArchiveCardMutation();

  const t: any = useTranslations();

  useEffect(() => {
    if (isArchiveOpen) {
      if (activeTab === "1" && hasCardArchived) {
        // console.log('Không có cache, refetch archiveCard');
        refetchArchiveCard();
        setHasCardArchived(false);
      } else if (activeTab === "2" && !archiveListCache) {
        refetchArchiveList();
      }
    }
  }, [isArchiveOpen, activeTab, archiveCardCache, archiveListCache, refetchArchiveCard, refetchArchiveList]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const onUndoList = async (id: number) => {
    const body = {
      id: id,
      is_archived: false,
    };
    try {
      await editArchiveList(body);
      refreshCardAndBoard();
      refetchArchiveList();
      setArchiveListCache(null);
    } catch (error) {
      console.log(error);
    }
  };

  const onDeleteList = async (id: number) => {
    try {
      await deleteArchiveList(id);
      notification.success({
        message: "Xóa danh sách lưu trữ thành công",
        placement: "bottomRight",
        className: "h-16",
      });
      refetchArchiveList();
      setArchiveListCache(null);  // Clear cache to force refetch next time
    } catch (error) {
      console.log(error);
      notification.error({
        message: "Xóa danh sách lưu trữ lỗi",
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const onUndoCard = async (id: number) => {
    const body = {
      id: id,
      is_archived: false,
    };
    setLoadingCardId(id)
    try {
      await editArchiveCard(body);
      refreshCardAndBoard();
      refetchArchiveCard();
      setArchiveCardCache(null);  // Clear cache to force refetch next time
      notification.success({
        message: "Hoàn tác thẻ lưu trữ thành công",
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      console.log(error);
      notification.error({
        message: "Hoàn tác thẻ lưu trữ lỗi",
        placement: "bottomRight",
        className: "h-16",
      });
    }
    setLoadingCardId(null)
  };

  const onDeleteCard = async (id: number) => {
    try {
      await deleteArchiveCard(id);
      notification.success({
        message: "Xóa thẻ lưu trữ thành công",
        placement: "bottomRight",
        className: "h-16",
      });
      setArchiveCardCache(null);  // Clear cache to force refetch next time
    } catch (error) {
      console.log(error);
      notification.error({
        message: "Xóa thẻ lưu trữ lỗi",
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `${t('general.card')}`,
      children: (
        isLoadingCardData ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
            <Spin size="large" />
          </div>
        ) : (
          <div className="overflow-y-auto h-[605px]">
            {(hasCardArchived ? archiveCard : archiveCardCache)?.slice(0, 10).map((card: any) => (
              <>
                <Card bodyStyle={{ padding: "10px" }} key={card.id} className="mr-4 bg-slate-100 hover:bg-slate-200">
                  {card.name} <br></br>
                  <small className="italic">{t('general.list')}: {card.list_str}</small><br></br>
                  <small className="italic">{t('general.board')}: {card.board_str}</small><br></br>
                  <small className="italic">{t('general.deleteAt')}: {dayjs(card.updated_at).toString()}</small>
                </Card>
                <div className="mb-2">
                  <Button loading={loadingCardId == card.id} type="link" size="small" onClick={() => onUndoCard(card.id)}>
                    {t('general.undo')}
                  </Button>

                  <Popconfirm
                    title={t('noficationDelete.deleteCard')}
                    description={t('noficationDelete.wantToTag')}
                    onConfirm={() => onDeleteCard(card.id)}
                    okText={t('general.confirm')}
                    cancelText={t('table.actionValues.canceltext')}
                    placement="left"
                    okButtonProps={{ loading: isLoadingDeleteCard }}

                  >
                    <Button type="link" size="small">
                      {t('general.delete')}
                    </Button>
                  </Popconfirm>
                </div>
              </>
            ))}
          </div>
        )
      ),
    },
    {
      key: "2",
      label: `${t('general.list')}`,
      children: (
        isLoadingListData ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
            <Spin size="large" />
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[605px] h-full">
            {(archiveListCache || archiveList)?.slice(0, 10).map((list: any) => (
              <>
                <Card bodyStyle={{ padding: "10px" }} key={list.id} className="mr-4 bg-slate-100 hover:bg-slate-200">
                  {list.name} <br></br>
                  <small className="italic">{t('general.board')}: {list.board_str}</small><br></br>
                  <small className="italic">{t('general.deleteAt')}: {dayjs(list.updated_at).toString()}</small>
                </Card>
                <div className="mb-2">
                  <Button loading={isLoadingEdit} type="link" size="small" onClick={() => onUndoList(list.id)}>
                    {t('general.undo')}
                  </Button>
                  <Popconfirm
                    title={t('noficationDelete.deleteList')}
                    description={t('noficationDelete.wantToListing')}
                    onConfirm={() => onDeleteList(list.id)}
                    okText={t('general.confirm')}
                    cancelText={t('table.actionValues.canceltext')}
                    placement="left"
                    okButtonProps={{ loading: isLoadingDelete }}

                  >
                    <Button type="link" size="small">
                      {t('general.delete')}
                    </Button>
                  </Popconfirm>
                </div>
              </>
            ))}
          </div>
        )
      ),
    },
  ];

  return (
    <Popover
      content={
        <div className="py-2 pl-2 w-[320px] max-h-[700px] h-full">
          <Tabs defaultActiveKey="1" items={items} onChange={handleTabChange} />
        </div>
      }
      title={<div className="text-center">{t('general.storage')}</div>}
      trigger="click"
      onOpenChange={(open) => setIsArchiveOpen(open)}
    >
      <Button ghost className="max-sm:hidden">
        <div className="flex items-center gap-2">
          <BsArchive /> <span className="font-semibold ">{t('general.storage')}</span>
        </div>
      </Button>
      <Button type="text" className="sm:hidden px-2">
        <BsArchive size={20} className=" text-white" />
      </Button>
    </Popover>
  );
}

export default Archive;
