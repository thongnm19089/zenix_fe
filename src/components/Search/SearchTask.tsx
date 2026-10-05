import { updateSearchParams } from "@/features/searchParamsSlice";
import { IBoard, IList } from "@/types/taskTypes";
import { Avatar, Badge, Button, Checkbox, Form, Input, Popover, Tabs, Tag } from "antd";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useState, useEffect, useMemo } from "react";
import { AiOutlineCheckCircle, AiOutlineUnorderedList } from "react-icons/ai";
import { BiUserCheck } from "react-icons/bi";
import { BsCalendarDate, BsClock } from "react-icons/bs";
import { FiFilter } from "react-icons/fi";
import { MdLabelOutline } from "react-icons/md";
import { useDispatch } from "react-redux";
import { shortenName } from "@/utils/common";
import { TabsProps } from "antd/lib";

type CheckboxFilterValues = {
  users: (number | string)[];
  labels: (number | string)[];
  deadline: string[];
  lists: number[];
};

function SearchTask({
  board,
  form,
  list,
  listFilter,
}: {
  board: IBoard;
  form: any;
  list: IList[];
  listFilter: IList[];
}) {
  const router = useRouter();
  const t: any = useTranslations();
  const pathname = usePathname();
  const searchParams = useSearchParams()!;
  const [inputValue, setInputValue] = useState<string>("");
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const dispatch = useDispatch();
  const [checkboxValues, setCheckboxValues] = useState<CheckboxFilterValues>({
    users: [],
    labels: [],
    deadline: [],
    lists: [],
  });

  const totalCardsFilter = useMemo(() => {
    return listFilter?.reduce((sum, obj: IList) => sum + obj?.cards?.length, 0);
  }, [listFilter]);

  const totalCards = useMemo(() => {
    return list?.reduce((sum, obj: IList) => sum + obj?.cards?.length, 0);
  }, [list]);

  const updateURL = useCallback(
    (newInputValue: string, newCheckboxValues: any) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("card");
      params.delete("users");
      params.delete("labels");
      params.delete("deadline");
      params.delete("lists");

      if (newInputValue) {
        params.set("card", newInputValue);
      }
      if (newCheckboxValues.users.length > 0) {
        params.set("users", newCheckboxValues.users.toString());
      }
      if (newCheckboxValues.labels.length > 0) {
        params.set("labels", newCheckboxValues.labels.toString());
      }
      if (newCheckboxValues.deadline.length > 0) {
        params.set("deadline", newCheckboxValues.deadline.toString());
      }
      if (newCheckboxValues.lists.length > 0) {
        params.set("lists", newCheckboxValues.lists.toString());
      }
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
      dispatch(updateSearchParams(query ? `?${query}` : ""));
    },
    [router, pathname, searchParams, dispatch]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);

      if (timerId) {
        clearTimeout(timerId);
      }
      const id = setTimeout(() => {
        updateURL(value, checkboxValues);
      }, 500);

      setTimerId(id);
    },
    [updateURL, timerId, checkboxValues]
  );

  const handleCheckboxChange = (checkedValues: any, groupId: any) => {
    const latestValue = checkedValues[checkedValues.length - 1];
    if (groupId === "deadline") {
      const deadlineValues = latestValue ? [latestValue] : [];
      form.setFieldsValue({ [groupId]: deadlineValues });
      const newCheckboxValues = {
        ...checkboxValues,
        [groupId]: deadlineValues,
      };
      setCheckboxValues(newCheckboxValues);
      updateURL(inputValue, newCheckboxValues);
      return;
    }
    const newCheckboxValues = {
      ...checkboxValues,
      [groupId]: checkedValues,
    };
    setCheckboxValues(newCheckboxValues);
    updateURL(inputValue, newCheckboxValues);
  };

  useEffect(() => {
    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [timerId]);

  useEffect(() => {
    const parseIdParam = (key: string) => {
      const value = searchParams.get(key);
      if (!value) return [];
      if (value === "NONE") return ["NONE"];
      return value.split(",").map(Number);
    };

    const parseStringParam = (key: string) => {
      const value = searchParams.get(key);
      return value ? value.split(",") : [];
    };

    const cardValue = searchParams.get("card") || "";
    const nextCheckboxValues = {
      users: parseIdParam("users"),
      labels: parseIdParam("labels"),
      deadline: parseStringParam("deadline"),
      lists: parseIdParam("lists") as number[],
    };

    setInputValue(cardValue);
    setCheckboxValues(nextCheckboxValues);
    form.setFieldsValue({
      card: cardValue,
      ...nextCheckboxValues,
    });
  }, [searchParams, form]);

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `Thành viên`,
      children: (
        <div className="overflow-y-auto overflow-x-hidden h-[400px]">
          <Form.Item name="users" noStyle>
            {board?.users && board?.users?.length > 0 && (
              <Checkbox.Group onChange={(checked) => handleCheckboxChange(checked, "users")}>
                <Checkbox value="NONE" className="mb-2">
                  <Button type="text" className="flex items-center gap-1 w-[310px] ">
                    <BiUserCheck size={20} className="h-full font-semibold" /> <div>Không thành viên</div>
                  </Button>
                </Checkbox>
                {board?.users?.map((user, index) => (
                  <div className="flex items-center " key={index}>
                    <Checkbox value={user.id}>
                      <div className="w-[310px] flex gap-2 items-center hover:bg-slate-200 p-1">
                        <Avatar>{user.first_name.charAt(0) + user.last_name.charAt(0)}</Avatar>
                        <div className="font-semibold">
                          {shortenName(user.first_name, user.last_name)}
                        </div>
                        <div>@{user.username}</div>
                      </div>
                    </Checkbox>
                  </div>
                ))}
              </Checkbox.Group>
            )}
          </Form.Item>
        </div>
      ),
    },
    {
      key: "2",
      label: `Thời hạn`,
      children: (
        <div className="overflow-y-auto overflow-x-hidden h-[400px]">
          <Form.Item name="deadline" noStyle>
            <Checkbox.Group onChange={(checked) => handleCheckboxChange(checked, "deadline")}>
              <Checkbox value="NONE">
                <Button type="text" className="flex items-center gap-1 w-[310px] ">
                  <BsCalendarDate size={18} className="h-full font-semibold" /> <div>Không có Deadline</div>
                </Button>
              </Checkbox>
              <Checkbox value="overdue">
                <Button type="text" className="flex items-center gap-1 w-[310px] ">
                  <BsClock size={20} className="h-full font-semibold bg-red-500 rounded-full" /> <div>Quá hạn</div>
                </Button>
              </Checkbox>
              <Checkbox value="today">
                <Button type="text" className="flex items-center gap-1 w-[310px] ">
                  <BsCalendarDate size={18} className="h-full font-semibold text-orange-600" /> <div>Hôm nay</div>
                </Button>
              </Checkbox>
              <Checkbox value="withinDeadline">
                <Button type="text" className="flex items-center gap-1 w-[310px] ">
                  <BsClock size={20} className="h-full font-semibold bg-yellow-500 rounded-full" />{" "}
                  <div>Còn hạn</div>
                </Button>
              </Checkbox>
              <Checkbox value="completedDeadline">
                <Button type="text" className="flex items-center gap-1 w-[310px]">
                  <AiOutlineCheckCircle size={25} className="h-full font-semibold bg-green-500 rounded-full" />{" "}
                  <div>Hoàn thành</div>
                </Button>
              </Checkbox>
            </Checkbox.Group>
          </Form.Item>
        </div>
      ),
    },
    {
      key: "3",
      label: `Nhãn`,
      children: (
        <div className="overflow-y-auto overflow-x-hidden h-[400px]">
          <Form.Item name="labels" noStyle>
            {board?.labels && board?.labels?.length > 0 && (
              <Checkbox.Group onChange={(checked) => handleCheckboxChange(checked, "labels")}>
                <Checkbox value="NONE" className="mb-2">
                  <Button type="text" className="flex items-center gap-1 w-[310px] ">
                    <MdLabelOutline size={20} className="h-full font-semibold" /> <div>Không nhãn</div>
                  </Button>
                </Checkbox>
                {board?.labels?.map((label, index) => (
                  <div className="flex items-center mb-2" key={index}>
                    <Checkbox value={label.id}>
                      <Tag color={label.color} className="w-[310px] p-1">
                        <div className="ml-4">{label.name}</div>
                      </Tag>
                    </Checkbox>
                  </div>
                ))}
              </Checkbox.Group>
            )}
          </Form.Item>
        </div>
      ),
    },
    {
      key: "4",
      label: `List`,
      children: (
        <div className="overflow-y-auto overflow-x-hidden h-[400px]">
          <Form.Item name="lists" noStyle>
            {board?.lists && board?.lists?.length > 0 && (
              <Checkbox.Group onChange={(checked) => handleCheckboxChange(checked, "lists")}>
                {board?.lists?.map((list, index) => (
                  <div className="flex items-center mb-2" key={index}>
                    <Checkbox value={list.id}>
                      <Tag className="w-[310px] p-1">
                        <div className="ml-4 flex items-center gap-2">
                          <AiOutlineUnorderedList size={16} />
                          <span>{list.name}</span>
                        </div>
                      </Tag>
                    </Checkbox>
                  </div>
                ))}
              </Checkbox.Group>
            )}
          </Form.Item>
        </div>
      ),
    },
  ];

  return (
    <Popover
      content={
        <div className="p-2 w-[360px]">
          <Form form={form}>
            <div className="mb-2 text-sm font-semibold">Từ khóa</div>
            <Form.Item name="card" noStyle>
              <Input placeholder={`Search title card...`} value={inputValue} onChange={handleInputChange} />
            </Form.Item>
            <Tabs className="mt-3" defaultActiveKey="1" items={items} />
          </Form>
        </div>
      }
      title={<div className="text-center">{t('general.filter')}</div>}
      trigger="click"
    >
      <Badge count={totalCards === totalCardsFilter ? 0 : totalCardsFilter}>
        <Button ghost className="max-sm:hidden">
          <div className="flex items-center gap-2">
            <FiFilter /> <span className="font-semibold">{t('general.filter')}</span>
          </div>
        </Button>
        <Button type="text" className="sm:hidden px-2">
          <FiFilter size={20} className="text-white" />
        </Button>
      </Badge>
    </Popover>
  );
}

export default SearchTask;
