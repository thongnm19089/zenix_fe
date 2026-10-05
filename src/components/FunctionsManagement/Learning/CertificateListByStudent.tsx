import React from 'react';
import { Card, Spin, Typography } from 'antd';
import { useGetCertificatesByStudentQuery } from '@/api/Learning/apiLearning';

const { Title } = Typography;

interface Certificate {
  id: number;
  created: string;
  issued_date: string;
  certificate_file: string | null;
  feedback: string;
  status: string;
  student: number;
  course: number;
  created_by: number;
  approved_by: number | null;
}

interface CertificateListByStudentProps {
  studentId: number;
  onViewCertificate: (certificateId: number) => void;
}

const CertificateListByStudent: React.FC<CertificateListByStudentProps> = ({ studentId, onViewCertificate }) => {
  const { data: CertificatesByStudent, error, isLoading } = useGetCertificatesByStudentQuery(studentId);

  if (isLoading) return <Spin size="large" />;
  if (error) return <div>Error loading certificates</div>;

  return (
    <div>
      <Title level={4}>Certificates for Student ID: {studentId}</Title>
      {CertificatesByStudent?.map((certificate: Certificate) => (
        <Card key={certificate.id} onClick={() => onViewCertificate(certificate.id)}>
          <p><strong>ID:</strong> {certificate.id}</p>
          <p><strong>Created:</strong> {certificate.created}</p>
          <p><strong>Issued Date:</strong> {certificate.issued_date}</p>
          <p><strong>Certificate File:</strong> {certificate.certificate_file}</p>
          <p><strong>Feedback:</strong> {certificate.feedback}</p>
          <p><strong>Status:</strong> {certificate.status}</p>
          <p><strong>Student ID:</strong> {certificate.student}</p>
          <p><strong>Course ID:</strong> {certificate.course}</p>
          <p><strong>Created By:</strong> {certificate.created_by}</p>
          <p><strong>Approved By:</strong> {certificate.approved_by}</p>
        </Card>
      ))}
    </div>
  );
};

export default CertificateListByStudent;
