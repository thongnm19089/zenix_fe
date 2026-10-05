import Logout from "@/components/Auth/Logout";
import { Dropdown, Avatar } from "antd";
import type { MenuProps } from "antd";
import { useTranslations } from "next-intl";
import Link from "next-intl/link";
import React, { useState } from "react";
import { FiLogOut, FiUser } from "react-icons/fi";

const UserDropdown = ({ firstName, lastName, jobPosition, avatar }: { firstName: string; lastName: string; jobPosition: string, avatar: string | null }) => {
  const t: any = useTranslations();
  const [isLogout, setIsLogout] = useState(false);

  const items: MenuProps["items"] = [
    {
      key: "2",
      label: (
        <Link href="/business/profile">
          <div className="flex gap-2 items-center text-base font-semibold ml-1 py-1">
            <FiUser /> Hồ sơ của bạn
          </div>
        </Link>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "3",
      label: (
        <div className="flex gap-2 items-center text-base font-semibold ml-1 py-1" onClick={() => setIsLogout(true)}>
          <FiLogOut /> {t("auth.logout")}
        </div>
      ),
    },
  ];
  return (
    <>
      <Dropdown menu={{ items }}>
        <div className="flex gap-2" onClick={(e) => e.preventDefault()}>
          <span className="hidden text-right lg:block">
            <span className="block text-sm font-semibold text-white">
              {lastName} {firstName}
            </span>
            <span className="block text-xs">{jobPosition}</span>
          </span>
{avatar ?  <Avatar style={{ verticalAlign: "middle" }} src={avatar} size="large"/> : <Avatar style={{ verticalAlign: "middle" }} size="large">
            {firstName[0]}
          </Avatar>}
          
        </div>
      </Dropdown>
      <Logout setIsLogout={setIsLogout} isLogout={isLogout} />
    </>
  );
};

export default UserDropdown;
