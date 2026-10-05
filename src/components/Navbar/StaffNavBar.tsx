"use client";

import ThemeToggle from "../DarkMode/ThemeToggle";
import DropdownMessage from "../DropDown/DropdownMessage";
import DropdownNotification from "../DropDown/DropdownNotification";
import LocaleSwitcher from "../Multilingual/LocaleSwitcher";
import UserDropdown from "@/components/Auth/UserDropdown";
import { User } from "@/types/userTypes";
import { Button } from "antd";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { BsList } from "react-icons/bs";

interface StaffNavBarProps {
  title: string;
  setIsDrawer: React.Dispatch<React.SetStateAction<boolean>>;
}

function StaffNavBar({ title, setIsDrawer }: StaffNavBarProps) {
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    jobPosition: "",
    logo: "/images/default_company_logo.png",
    companyName: "",
    fullAddress: "",
    avatar: null
  });

  useEffect(() => {
    const userDataString = localStorage.getItem("user");
    const userDataObj = userDataString ? JSON.parse(userDataString) : null;
    // Construct full address string from parts
    const addressParts = [
      userDataObj?.user_profile?.company?.address,
      userDataObj?.user_profile?.company?.district,
      userDataObj?.user_profile?.company?.city,
    ]
      .filter(Boolean)
      .join(", "); // Only add to array if value is not null/undefined/empty, then join with commas

    setUserInfo({
      firstName: userDataObj?.first_name,
      lastName: userDataObj?.last_name,
      jobPosition: userDataObj?.user_profile?.position?.title,
      logo: userDataObj?.user_profile?.company?.logo,
      companyName: userDataObj?.user_profile?.company?.name,
      fullAddress: addressParts,
      avatar: userDataObj?.user_profile?.image
    });
  }, []);

  return (
    <div className="h-[70px] flex justify-between items-center px-4 md:px-10 relative z-100 text-white mt-3">
      <Button icon={<BsList size={24} />} className="md:hidden" onClick={() => setIsDrawer(true)} />
      <div className="max-md:hidden">
        <div className="flex gap-3 items-center">
          <Image src={userInfo.logo} width={50} height={50} alt="logo" style={{ borderRadius: '50%', width: '50px', height: '50px' }} />
          <div className="flex flex-col justify-center">
            <div className="text-lg font-semibold">{userInfo.companyName}</div>
            <div className="text-xs">{userInfo.fullAddress}</div>
          </div>
        </div>
      </div>
      <div className="flex gap-4 items-center">
        <LocaleSwitcher />

        <DropdownMessage />
        <DropdownNotification />
        <div className="h-[35px] w-[35px] border flex justify-center items-center rounded-full ">
          <ThemeToggle />
        </div>

        <UserDropdown firstName={userInfo.firstName} lastName={userInfo.lastName} jobPosition={userInfo.jobPosition} avatar={userInfo.avatar} />
      </div>
    </div>
  );
}

export default StaffNavBar;
