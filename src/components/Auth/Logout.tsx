"use client";

import { setIsAuth } from "@/features/authSlice";
import { Button, Modal } from "antd";
import { deleteCookie } from "cookies-next";
import { useTranslations } from "next-intl";
import { useRouter } from "next-intl/client";
import React from "react";
import { useDispatch } from "react-redux";

interface LogoutProps {
  isLogout: boolean;
  setIsLogout: React.Dispatch<React.SetStateAction<boolean>>;
}

const Logout: React.FC<LogoutProps> = ({ isLogout, setIsLogout }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const t: any = useTranslations();
  const handleOk = () => {
    deleteCookie("access_token");
    deleteCookie("refresh_token");
    localStorage.clear();
    sessionStorage.clear();
    setIsLogout(false);
    router.push("/login");
    dispatch(setIsAuth(false));
  };
  const handleCancel = () => {
    setIsLogout(false);
  };

  return (
    <Modal title={t("auth.logout")} open={isLogout} footer={null}>
      <p className="text-red-500 italic font-medium">{t("auth.logoutDes")}</p>
      <div className="flex justify-end mt-2 gap-2">
        <Button type="primary" danger onClick={handleOk}>
          {t("general.confirm")}
        </Button>{" "}
        <Button onClick={handleCancel}>{t("general.cancel")}</Button>
      </div>
    </Modal>
  );
};

export default Logout;
