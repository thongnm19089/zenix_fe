import "./login.css";
import React, { useState } from 'react';
import { Button, Form, Input } from "antd";
import Image from "next/image";
import { CiLock } from "react-icons/ci";
import { useResetPasswordMutation } from "@/api/SetUp/apiLogin"; // Đảm bảo bạn import đúng đường dẫn tới apiLogin

interface ResetPasswordProps {
    uidb64: string;
    token: string;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ uidb64, token }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [resetPassword, { isLoading }] = useResetPasswordMutation();

    const handleSubmit = async (values: any) => {
        if (values.password !== values.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            await resetPassword({ uidb64, token, new_password: values.password }).unwrap();
            setSuccess('Password reset successfully');
            setError('');
        } catch (err) {
            setError('Failed to reset password');
        }
    };

    return (
        <div className="flex justify-center items-center w-full">
            <div className="screen">
                <div className="relative z-10 h-full p-5 flex flex-col justify-center gap-12 mt-24">
                    <Image
                        src="/images/Home/logo.svg"
                        alt="logo"
                        width={183}
                        height={51}
                        style={{ filter: "brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)" }}
                    />
                    <Form className="flex-1" onFinish={handleSubmit}>
                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: "Vui lòng điền mật khẩu mới!" }]}
                            className="mb-3"
                        >
                            <Input.Password
                                prefix={<CiLock className="site-form-item-icon" />}
                                type="password"
                                placeholder="New Password"
                                className="bg-input bg-inherit"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </Form.Item>
                        <Form.Item
                            name="confirmPassword"
                            rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu mới!" }]}
                            className="mb-1"
                        >
                            <Input.Password
                                prefix={<CiLock className="site-form-item-icon" />}
                                type="password"
                                placeholder="Confirm New Password"
                                className="bg-input bg-inherit"
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </Form.Item>
                        {error && <div className="text-red-500">{error}</div>}
                        {success && <div className="text-green-500">{success}</div>}
                        <Form.Item>
                            <Button htmlType="submit" className="login__submit mt-2" block loading={isLoading}>
                                Reset Password
                            </Button>
                        </Form.Item>
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
};

export default ResetPassword;
