import "./login.css";
import { Button, Form, Input, Modal, notification } from "antd";
import Image from "next/image";
import React, { useState } from "react";
import { AiOutlineUser } from "react-icons/ai";
import { CiLock } from "react-icons/ci";
import { usePasswordResetRequestMutation } from "@/api/SetUp/apiLogin"; // Đảm bảo bạn import đúng đường dẫn tới apiLogin
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

function PasswordReset({ }) {
    const router = useRouter();
    const t: any = useTranslations();
    const [email, setEmail] = useState('');
    const [passwordResetRequest, { isLoading, isError }] = usePasswordResetRequestMutation();


    const handleOk = async () => {
        try {
            await passwordResetRequest({ email }).unwrap();
            notification.success({
                message: 'Email Sent',
                description: 'A confirmation email has been sent. Please check your email.',
                placement: 'topRight',
            });
        } catch (err) {
            notification.error({
                message: 'Failed to Send Email',
                description: 'There was a problem sending the password reset email. Please try again later.',
                placement: 'topRight',
            });
        }
    };

    return (
        <div className="flex justify-center items-center w-full">
            <div className="screen">
                <div className="relative z-10 h-full p-5 flex flex-col justify-center gap-12 bottom-12">
                    <Image
                        src="/images/Home/logo.svg"
                        alt="logo"
                        width={183}
                        height={51}
                        style={{ filter: "brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)" }}
                    />
                    <Form>
                        <h2 className="font-bold text-[19px]">Đặt lại mật khẩu của bạn</h2>
                        <div className="text-[12px] ">Nhập địa chỉ email bạn đã sử dụng để đăng ký</div>
                        <br />
                        <Form.Item
                            name="email"
                            rules={[{ required: true, message: "Vui lòng nhập email đăng ký của bạn!" }]}
                        >
                            <Input
                                type="email"
                                placeholder="Nhập email đã đăng ký của bạn"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Form.Item>
                        {isError && <div className="text-red-500"> Không gửi được yêu cầu đặt lại mật khẩu.</div>}
                        <div className="flex justify-between">
                            <Button
                                onClick={() => {
                                    router.push("login");
                                }}
                                className="mr-2"
                            >
                                {t("general.back")}
                            </Button>
                            <Button type="primary" onClick={handleOk} className="ml-2">
                                Gửi email đặt lại mật khẩu
                            </Button>
                        </div>

                    </Form>
                </div>
                <div className="screen__background">
                    <span className="screen__background__shape screen__background__shape4"></span>
                    <span className="screen__background__shape screen__background__shape3"></span>
                    <span className="screen__background__shape screen__background__shape2"></span>
                    <span className="screen__background__shape screen__background__shape1"></span>
                </div>
            </div>
        </div>
    );
}

export default PasswordReset;
