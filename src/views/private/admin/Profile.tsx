"use client";

import { useChangePasswordMutation, useUpdateProfileMutation } from "@/api/SetUp/apiAccount";
import { User } from "@/types/userTypes";
import {
  Image,
  Segmented,
  Input,
  Form,
  Button,
  notification,
  Checkbox,
} from "antd";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { CiLocationOn } from "react-icons/ci";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.bubble.css";
import "react-quill/dist/quill.snow.css";
import LocaleSwitcher from "@/components/Multilingual/LocaleSwitcher";
import { HiLanguage } from "react-icons/hi2";

const PRIMARY = "#f1692f";

const modules = {
  toolbar: [
    [{ font: [] }, { size: [] }],
    ["bold", "italic", "underline"],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["link", "image"],
  ],
};

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
});

export default function Profile() {
  const [userData, setUserData] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(1);
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [newDesc, setNewDesc] = useState("");
  const t: any = useTranslations();

  const [updateProfile] = useUpdateProfileMutation();
  const [changePassword] = useChangePasswordMutation();

  useEffect(() => {
    const userDataString = localStorage.getItem("user");
    const parsedUserData: User | null = userDataString
      ? JSON.parse(userDataString)
      : null;

    setUserData(parsedUserData);
    setNewDesc(parsedUserData?.user_profile?.desc || "");

    form.setFieldsValue({
      first_name: parsedUserData?.first_name,
      last_name: parsedUserData?.last_name,
      user_address: parsedUserData?.user_profile?.user_address,
      notification_preferences: [
        parsedUserData?.user_profile?.is_mobile_note && "phone",
        parsedUserData?.user_profile?.is_web_note && "computer",
        parsedUserData?.user_profile?.is_email_noti && "email",
      ].filter(Boolean),
    });
  }, []);

  /* ===== LOGIC GIỮ NGUYÊN ===== */
  const onChangeProfile = async (values: any) => {
    const newValue = {
      first_name: values.first_name,
      last_name: values.last_name,
      user_address: values.user_address,
      is_mobile_note: values?.notification_preferences.includes("phone"),
      is_web_note: values?.notification_preferences.includes("computer"),
      is_email_noti: values?.notification_preferences.includes("email"),
    };
    const result = await updateProfile(newValue);
    if ("data" in result) {
      localStorage.setItem("user", JSON.stringify(result.data));
      setUserData(result.data);
      notification.success({ message: t("noficationAddAndUpdate.editedProfileSuccess") });
    }
  };

  const onChangePassword = async (values: any) => {
    try {
      await changePassword(values).unwrap();
      notification.success({ message: t("noficationAddAndUpdate.passwordChanged") });
    } catch (err: any) {
      notification.error({ message: err?.data?.detail });
    }
  };

  /* ===== UI ===== */
  return (
    <div className="mt-44 mx-auto max-w-5xl rounded-xl border bg-white shadow-sm p-8">
      {/* AVATAR & STATS */}
      <div className="flex flex-col items-center">
        <Image
          src={userData?.user_profile?.image || "/images/avatar.png"}
          width={150}
          height={150}
          className="rounded-full object-cover border-4"
          style={{ borderColor: PRIMARY }}
        />
        <p className="mt-3 text-lg font-semibold">@{userData?.username}</p>
        <p className="text-gray-500">
          {userData?.last_name} {userData?.first_name}
        </p>

        {/* STATS */}
        <div className="mt-6 flex gap-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">259</div>
            <div className="text-sm text-gray-500">Posts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">129K</div>
            <div className="text-sm text-gray-500">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">2K</div>
            <div className="text-sm text-gray-500">Following</div>
          </div>
        </div>
      </div>

      {/* SEGMENT */}
      <div className="mt-8">
        <Segmented
          block
          value={isOpen}
          onChange={(v) => setIsOpen(v as number)}
          options={[
            { label: t("detailFunction.aboutMe"), value: 1 },
            { label: t("detailFunction.editProfile"), value: 2 },
            { label: t("detailFunction.changePassword"), value: 3 },
          ]}
        />
      </div>

      {/* ABOUT */}
      {isOpen === 1 && (
        <div className="mt-6 text-center space-y-4">
          {userData?.user_profile?.user_address && (
            <div className="flex justify-center items-center gap-1 text-gray-500">
              <CiLocationOn /> {userData.user_profile.user_address}
            </div>
          )}

          {isEditing ? (
            <>
              <ReactQuill value={newDesc} onChange={setNewDesc} modules={modules} />
              <div className="flex justify-center gap-3 mt-4">
                <Button
                  type="primary"
                  style={{ backgroundColor: PRIMARY, borderColor: PRIMARY }}
                  onClick={() => setIsEditing(false)}
                >
                  {t("admin.save")}
                </Button>
                <Button onClick={() => setIsEditing(false)}>
                  {t("general.cancel")}
                </Button>
              </div>
            </>
          ) : (
            <div
              className="cursor-pointer text-gray-700"
              onClick={() => setIsEditing(true)}
              dangerouslySetInnerHTML={{
                __html:
                  userData?.user_profile?.desc ||
                  t("noficationAddAndUpdate.clickDescription"),
              }}
            />
          )}

          <div className="flex justify-center items-center gap-2 mt-6">
            <HiLanguage />
            <LocaleSwitcher edit />
          </div>
        </div>
      )}

      {/* EDIT PROFILE */}
      {isOpen === 2 && (
        <Form
          form={form}
          layout="vertical"
          onFinish={onChangeProfile}
          className="mt-6 max-w-2xl mx-auto"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <Form.Item label={t("auth.lastName")} name="last_name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label={t("auth.firstName")} name="first_name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </div>

          <Form.Item label={t("auth.address")} name="user_address">
            <Input.TextArea />
          </Form.Item>

          <Form.Item label={t("auth.notificationPreferences")} name="notification_preferences">
            <Checkbox.Group className="flex flex-col gap-2">
              <Checkbox value="phone">{t("auth.viaPhone")}</Checkbox>
              <Checkbox value="computer">{t("auth.viaComputer")}</Checkbox>
              <Checkbox value="email">{t("auth.viaEmail")}</Checkbox>
            </Checkbox.Group>
          </Form.Item>

          <div className="flex justify-end">
            <Button
              type="primary"
              htmlType="submit"
              style={{ backgroundColor: PRIMARY, borderColor: PRIMARY }}
            >
              {t("admin.saveChanges")}
            </Button>
          </div>
        </Form>
      )}

      {/* CHANGE PASSWORD */}
      {isOpen === 3 && (
        <Form
          form={form}
          layout="vertical"
          onFinish={onChangePassword}
          className="mt-6 max-w-xl mx-auto"
        >
          <Form.Item label={t("auth.currentPassword")} name="current_password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>

          <Form.Item label={t("auth.aNewPassword")} name="new_password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>

          <Form.Item
            label={t("user.confirmNewPassword")}
            name="new_password_2"
            dependencies={["new_password"]}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("new_password") === value) return Promise.resolve();
                  return Promise.reject(new Error(t("user.passwordNotMatch")));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <div className="flex justify-end">
            <Button
              type="primary"
              htmlType="submit"
              style={{ backgroundColor: PRIMARY, borderColor: PRIMARY }}
            >
              {t("admin.saveChanges")}
            </Button>
          </div>
        </Form>
      )}
    </div>
  );
}
