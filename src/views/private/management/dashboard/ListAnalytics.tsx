"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import React from "react";

const PRIMARY = "#f1692f";

const ListAnalytics = () => {
    const t: any = useTranslations();

    const analyticData = [
        {
            key: 1,
            name: t("detailFunction.Analytics Company"),
            image: "/images/Home/analytics/company.svg",
            href: "analytics/dashboard-company",
        },
        {
            key: 2,
            name: t("detailFunction.Analytics Sales"),
            image: "/images/Home/analytics/sales.svg",
            href: "analytics/dashboard-sales",
        },
        {
            key: 3,
            name: t("detailFunction.Analytics Marketing"),
            image: "/images/Home/analytics/marketing-analysis.svg",
            href: "analytics/dashboard-marketing",
        },
        {
            key: 4,
            name: t("detailFunction.Analytics Inventory"),
            image: "/images/Home/analytics/inventory-warehouse.svg",
            href: "analytics/dashboard-inventory",
        },
        {
            key: 5,
            name: t("detailFunction.Analytics Procurement"),
            image: "/images/Home/analytics/procurement.svg",
            href: "analytics/dashboard-procurement",
        },
        {
            key: 6,
            name: t("detailFunction.Analytics Product"),
            image: "/images/Home/analytics/product.svg",
            href: "analytics/dashboard-product",
        },
        {
            key: 7,
            name: t("detailFunction.Analytics Finance"),
            image: "/images/Home/analytics/finance.svg",
            href: "analytics/dashboard-finance",
        },
        {
            key: 8,
            name: t("detailFunction.Analytics Customer"),
            image: "/images/Home/analytics/customer.svg",
            href: "analytics/dashboard-customer",
        },
        {
            key: 9,
            name: t("detailFunction.Analytics HR"),
            image: "/images/Home/analytics/hr.svg",
            href: "analytics/dashboard-hr",
        },
        {
            key: 10,
            name: t("detailFunction.Analytics Task"),
            image: "/images/Home/analytics/task.svg",
            href: "analytics/dashboard-task",
        },
    ];

    return (
        <>
            {/* TITLE */}
            <div className="text-center uppercase text-[28px] font-bold text-[#f1692f] pb-10 pt-2">
                {t("functionCategory.Data Analytics")}
            </div>

            {/* GRID */}
            <div className="grid lg:grid-cols-4 sm:grid-cols-3 gap-6 lg:px-16">
                {analyticData.map((item, idx) => (
                    <motion.div
                        key={item.key}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.08, duration: 0.45 }}
                    >
                        <div
                            className="
                                    group
                                    relative
                                    bg-white
                                    border border-gray-100
                                    shadow-md
                                    hover:shadow-xl
                                    transition-all duration-300
                                    p-6
                                    text-center
                                    flex flex-col items-center
                                    min-h-[200px]
                                "
                        >
                            {/* ICON */}
                            <div
                                className="
                                w-16 h-16
                                flex items-center justify-center
                                bg-[#fff3ee]
                                mb-4
                                transition-all
                                group-hover:scale-110
                                rounded-lg  "
                            >
                                <Image
                                    src={item.image}
                                    width={36}
                                    height={36}
                                    alt="analytics icon"
                                />
                            </div>

                            {/* NAME */}
                            <h3 className="font-semibold text-gray-700 mb-6 group-hover:text-[#f1692f] transition">
                                {item.name}
                            </h3>

                            {/* ACTION */}
                            <button
                                onClick={() => (window.location.href = item.href)}
                                className="
                                absolute bottom-4
                                opacity-0 translate-y-4
                                group-hover:opacity-100
                                group-hover:translate-y-0
                                transition-all duration-300
                                px-6 py-2
                                bg-[#f1692f]
                                text-white
                                text-sm font-semibold
                                shadow-md
                                hover:bg-[#e45f1e]
                                rounded-full
                            "
                            >
                                Open →
                            </button>

                        </div>
                    </motion.div>
                ))}
            </div>
        </>
    );
};

export default ListAnalytics;
