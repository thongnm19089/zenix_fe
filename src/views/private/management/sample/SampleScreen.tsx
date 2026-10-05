"use client";
import React, { useState, useEffect } from 'react';
import { Select, Form, Button, Typography, Row, Col, Input, message, Carousel } from 'antd';
import paymentData from './paymentData.json'; // Import dữ liệu từ file JSON
import PlanSelection from './PlanSelection';
import coupons from './coupons.json'; // Import dữ liệu coupon
import HeaderSlide from './HeaderSlide';
import { useSelector } from 'react-redux';
import { RootState } from "@/store/store";

const { Text } = Typography;
const { Option } = Select;

type PaymentPlan = {
    size: number;
    time: number;
    original_price: number;
    discount_price: number;
    discount_percentage: number;
};

type Coupon = {
    code: string;
    discount_percentage?: number;
    discount_amount?: number;
    expiration_date: string;
    remaining_quantity: number;
};

function PaymentCalculator() {
    const [size, setSize] = useState(10);
    const [time, setTime] = useState(1);
    const [selectedPrice, setSelectedPrice] = useState<PaymentPlan | undefined>(undefined);
    const [form] = Form.useForm();
    const [coupon, setCoupon] = useState<Coupon | null>(null);
    const [couponCode, setCouponCode] = useState<string>('');
    const isCollapse = useSelector(
        (state: RootState) => state.collapse.isCollapse
    );
    const formatCurrency = (value: number) => {
        return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };

    const calculatePrice = (size: number, time: number): PaymentPlan | undefined => {
        return paymentData.find(item => item.size === size && item.time === time);
    };

    const checkCouponValidity = (code: string) => {
        const foundCoupon = coupons.find(coupon => coupon.code === code);
        if (foundCoupon) {
            const expirationDate = new Date(foundCoupon.expiration_date);
            const today = new Date();
            if (foundCoupon.remaining_quantity > 0 && expirationDate > today) {
                setCoupon(foundCoupon);
                message.success('Coupon hợp lệ!');
            } else {
                message.error('Coupon đã hết hạn hoặc không còn hiệu lực!');
            }
        } else {
            message.error('Coupon không tồn tại!');
        }
    };

    const calculateFinalPrice = () => {
        if (!selectedPrice) return 0;
        let finalPrice = selectedPrice.discount_price;
        if (coupon) {
            if (coupon.discount_percentage) {
                finalPrice -= (finalPrice * coupon.discount_percentage) / 100;
            } else if (coupon.discount_amount) {
                finalPrice -= coupon.discount_amount;
            }
        }
        return finalPrice > 0 ? finalPrice : 0;
    };

    const calculateDiscountAmount = () => {
        if (!selectedPrice || !coupon) return 0;
        if (coupon.discount_percentage) {
            return (selectedPrice.discount_price * coupon.discount_percentage) / 100;
        } else if (coupon.discount_amount) {
            return coupon.discount_amount;
        }
        return 0;
    };

    useEffect(() => {
        const price = calculatePrice(size, time);
        setSelectedPrice(price);
    }, [size, time]);

    return (
        <div className={`overflow-x-auto w-screen  ${isCollapse ? "md:w-[calc(100vw-124px)]" : "md:w-[calc(100vw-300px)]"
            }   p-6`}>
            <HeaderSlide />
            {/* Carousel Banner */}

            <Row justify="center" style={{ marginBottom: '16px' }
            }>
                <PlanSelection setSize={setSize} setTime={setTime} />
            </Row >
            <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: '12px', backgroundColor: '#fff' }}>
                <Form
                    form={form}
                    layout="vertical"
                    style={{ padding: '24px' }}
                >
                    <Form.Item label="Tên khách hàng" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]} style={{ marginBottom: '16px' }}>
                        <Input placeholder="Tên khách hàng" size="large" />
                    </Form.Item>
                    <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]} style={{ marginBottom: '16px' }}>
                        <Input placeholder="Email" size="large" />
                    </Form.Item>
                    <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]} style={{ marginBottom: '16px' }}>
                        <Input placeholder="Số điện thoại" size="large" />
                    </Form.Item>
                    <Form.Item label="Mã số thuế" name="tax_code" style={{ marginBottom: '16px' }}>
                        <Input placeholder="Mã số thuế" size="large" />
                    </Form.Item>
                    <Form.Item label="Website công ty" name="website" style={{ marginBottom: '16px' }}>
                        <Input placeholder="Website công ty" size="large" />
                    </Form.Item>
                    <Form.Item label="Tên tài khoản admin" name="admin_name" rules={[{ required: true, message: 'Vui lòng nhập tên tài khoản admin!' }]} style={{ marginBottom: '16px' }}>
                        <Input placeholder="Tên tài khoản admin" size="large" />
                    </Form.Item>

                    <Form.Item label="Mã giảm giá (Coupon)" style={{ marginBottom: '16px' }}>
                        <Input
                            value={couponCode}
                            onChange={e => setCouponCode(e.target.value)}
                            placeholder="Nhập mã coupon"
                            size="large"
                        />
                        <Button type="primary" onClick={() => checkCouponValidity(couponCode)} style={{ marginTop: '8px' }} size="large" block>
                            Kiểm tra mã
                        </Button>
                    </Form.Item>

                    <Form.Item label="Chọn số lượng user (Size)" style={{ marginBottom: '16px' }}>
                        <Select value={size} onChange={value => setSize(value)} size="large" style={{ width: '100%' }}>
                            <Option value={10}>10</Option>
                            <Option value={20}>20</Option>
                            <Option value={30}>30</Option>
                            <Option value={50}>50</Option>
                            <Option value={70}>70</Option>
                            <Option value={100}>100</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="Chọn thời gian (Tháng)" style={{ marginBottom: '16px' }}>
                        <Select value={time} onChange={value => setTime(value)} size="large" style={{ width: '100%' }}>
                            <Option value={1}>1 tháng</Option>
                            <Option value={3}>3 tháng</Option>
                            <Option value={6}>6 tháng</Option>
                            <Option value={12}>12 tháng</Option>
                            <Option value={24}>24 tháng</Option>
                            <Option value={36}>36 tháng</Option>
                        </Select>
                    </Form.Item>

                    {selectedPrice && (
                        <>
                            <Text className='font-medium text-sm text-gray-500' style={{ display: 'block', marginBottom: '12px' }}>Mua ngay với giá</Text>
                            <Row align="middle" justify="center">
                                <Col>
                                    <Text className='font-bold' style={{ fontSize: '28px', color: 'black', fontWeight: 'bold' }}>
                                        {formatCurrency(calculateFinalPrice())}
                                    </Text>
                                </Col>
                            </Row>
                            {selectedPrice?.discount_percentage > 0 && (
                                <Row className='mt-0' justify="center" style={{ marginTop: '8px' }}>
                                    <Text delete style={{ fontSize: '14px', color: '#999', textAlign: 'start' }}>
                                        {formatCurrency(selectedPrice.original_price)}
                                    </Text>
                                    <Text style={{ fontSize: '14px', color: '#f5222d', marginLeft: '8px' }}>
                                        {selectedPrice.discount_percentage}% giảm giá
                                    </Text>
                                </Row>
                            )}
                            {coupon && (
                                <Row justify="center" style={{ marginTop: '8px' }}>
                                    <Text style={{ fontSize: '14px', color: '#f5222d' }}>
                                        Giảm thêm: {formatCurrency(calculateDiscountAmount())} ({coupon.discount_percentage ? `${coupon.discount_percentage}%` : `${formatCurrency(coupon.discount_amount!)}`})
                                    </Text>
                                </Row>
                            )}
                        </>
                    )}

                    <Form.Item style={{ marginTop: '24px' }}>
                        <Button type="primary" block size="large" style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}>
                            Thanh toán ngay
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
}

export default PaymentCalculator;
