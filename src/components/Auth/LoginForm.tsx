"use client";

import { Button, Form, Input, Modal, notification, Divider } from "antd";
import Image from "next/image";
import { useState } from "react";
import { AiOutlineUser } from "react-icons/ai";
import { CiLock } from "react-icons/ci";
import { FcGoogle } from "react-icons/fc";
import { usePasswordResetRequestMutation } from "@/api/SetUp/apiLogin";
import { useRouter } from "next/navigation";
import "./login.css";

export default function LoginForm({
  onFinish,
  onGoogleLogin,
  error,
  onChangeInput,
  loading,
}: any) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");

  const [resetPassword, { isLoading }] =
    usePasswordResetRequestMutation();

  const handleReset = async () => {
    await resetPassword({ email });
    notification.success({ message: "Đã gửi email khôi phục" });
    setOpen(false);
  };

  return (
    <>
      <div className="login-card">
        <Image
          src="/images/Home/logo.svg"
          alt="logo"
          width={160}
          height={48}
          className="logo"
          style={{ filter: "brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)" }}
        />

        <Form layout="vertical" onFinish={onFinish} className="login-form">
          <Form.Item label="Username" name="username" rules={[{ required: true }]}>
            <Input
              size="large"
              prefix={<AiOutlineUser />}
              placeholder="Nhập username"
              onChange={onChangeInput}
            />
          </Form.Item>

          <Form.Item label="Password" name="password" rules={[{ required: true }]}>
            <Input.Password
              size="large"
              prefix={<CiLock />}
              placeholder="Nhập mật khẩu"
              onChange={onChangeInput}
            />
          </Form.Item>

          {error && <div className="error-text">{error}</div>}

          <Button
            htmlType="submit"
            size="large"
            loading={loading}
            className="btn-primary"
            block
          >
            Đăng nhập
          </Button>

          <div className="forgot" onClick={() => setOpen(true)}>
            Quên mật khẩu?
          </div>

          <Divider plain>HOẶC</Divider>

          <Button
            size="large"
            block
            className="btn-google"
            onClick={onGoogleLogin}
          >
            <FcGoogle size={22} />
            <span>Đăng nhập với Google</span>
          </Button>

          <div className="footer-links">
            <span onClick={() => router.push("/introduction")}>About</span>
            <span onClick={() => router.push("/instruction")}>Instruction</span>
            <span onClick={() => router.push("/payment")}>Payment</span>
          </div>
        </Form>
      </div>

      {/* RESET PASSWORD */}
      <Modal
        open={open}
        onOk={handleReset}
        confirmLoading={isLoading}
        onCancel={() => setOpen(false)}
        okText="Gửi email"
      >
        <Input
          size="large"
          placeholder="Nhập email đăng ký"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Modal>
    </>
  );
}
