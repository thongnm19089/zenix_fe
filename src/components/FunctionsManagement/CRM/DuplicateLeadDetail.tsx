import { Modal, Tag } from "antd";
import { useTranslations } from "next-intl";
import { useLeadDuplicateMutation } from "@/api/CRM/apiLead";
import React, { useState } from "react";
import dayjs from "dayjs";

const DuplicateLeadDetail = ({ mobile, leadId }: { mobile: string, leadId: number }) => {
  const t: any = useTranslations();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [trigger, { data: leadList, isLoading, isError }] = useLeadDuplicateMutation();

  const showModal = () => {
    trigger({ lead_id: leadId })
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  console.log("leadList", leadList);

  return (
    <>
      <a onClick={showModal} style={{ color: "red", cursor: "pointer" }}>
        {mobile}
      </a>
      <Modal
        title={t('crm.duplicateLeadDetails')}
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
        width={700}
      >
        {leadList?.map((lead: any, index: any) => (
          <div key={index} className="p-3 mb-2 bg-gray-100 border-b last:border-b-0">
            <div className="flex justify-between">
              <div className="p-2" ><strong>{t('crm.customer')}:</strong> {lead.name}</div>
              <div className="p-2"><strong>{t('user.phone')}:</strong> <a href={`tel:${lead?.mobile}`}>{lead?.mobile}</a></div>
            </div>
            <div className="flex justify-between">
              <div className="px-2"><strong>{t('table.seller')}:</strong> {lead.seller_str}</div>
              <Tag color={lead?.followers[0]?.stage_color}>{lead?.followers[0]?.stage_str}</Tag>
            </div>

            {lead?.followers &&
              <>
                <div className="p-2">
                  <strong>
                    {t('crm.contactHistory')}:
                  </strong>
                </div>
                <div>
                  {lead?.followers?.map((item: any) => (
                    <div className="p-2 justify-between">
                      <small className="mr-2">
                        {dayjs(item.created).format("DD/MM/YYYY")} {dayjs(item.created).format("HH:mm")}
                      </small>
                      {item.user_str}
                      {item.contact_type && (
                        <Tag bordered={false} color="green" className="mb-1">
                          {item.contact_type_str}
                        </Tag>
                      )}
                      <Tag bordered={false} color={item.stage_color} className="mb-1">
                        {item.stage_str}
                      </Tag>
                      <div>{item.note}</div>
                    </div>
                  ))}
                </div>
              </>

            }


          </div>
        ))}
      </Modal>
    </>
  );
};

export default DuplicateLeadDetail;

