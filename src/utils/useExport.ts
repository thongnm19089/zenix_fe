import { TableColumnType } from "antd";
import ExcelJS from 'exceljs';
import objectPath from "object-path";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import { FreeSans } from '@/assets/font/font'

const useExport = <RecordType extends object>({
    columns,
    data,
    fileName,
    pdfTheme,
    pdfOptions,
}: {
    columns: TableColumnType<RecordType>[];
    data: RecordType[];
    fileName: string;
    pdfTheme?: "striped" | "grid" | "plain";
    pdfOptions?: {
        styles?: Record<string, any>;
        headStyles?: Record<string, any>;
        columnStyles?: Record<number, { cellWidth?: number;[key: string]: any }>;
    };
}) => {

    const onExcelPrint = async () => {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Sheet1');

        const totalColumns = columns.length;
        const lastColumn = String.fromCharCode(65 + totalColumns - 1);

        const logoId = workbook.addImage({
            base64: 'data:image/png;base64,...',  // Thay bằng chuỗi base64 của logo
            extension: 'png',
        });

        sheet.addImage(logoId, {
            tl: { col: 0, row: 0 },  // Vị trí top-left của ảnh
            ext: { width: 200, height: 60 },  // Kích thước của ảnh
        });

        sheet.mergeCells(`A4:${lastColumn}4`);  // Hợp nhất các ô từ A4 đến cột cuối cùng
        const companyCell = sheet.getCell('A4');
        companyCell.value = 'CÔNG TY CỔ PHẦN GIẢI PHÁP CÔNG NGHỆ MCI';
        companyCell.font = { bold: true, size: 16 };
        companyCell.alignment = { vertical: 'middle', horizontal: 'center' };  // Căn giữa cả chiều dọc và ngang

        sheet.mergeCells(`A5:${lastColumn}5`);  // Hợp nhất các ô từ A5 đến cột cuối cùng
        const addressCell = sheet.getCell('A5');
        addressCell.value = 'Địa chỉ: Tầng 5, Tòa nhà Star City, 23 Lê Văn Lương, Phường Nhân Chính, Thanh Xuân, Hà Nội';
        addressCell.alignment = { vertical: 'middle', horizontal: 'center' };  // Căn giữa cả chiều dọc và ngang

        sheet.mergeCells(`A6:${lastColumn}6`);  // Hợp nhất các ô từ A6 đến cột cuối cùng
        const contactCell = sheet.getCell('A6');
        contactCell.value = 'SĐT: 0352.433.233 | Email: cskh@mcivietnam.com';
        contactCell.alignment = { vertical: 'middle', horizontal: 'center' };  // Căn giữa cả chiều dọc và ngang

        sheet.addRow(['']); 

        const headerRow = sheet.addRow(columns.map(col => col.title));
        headerRow.font = { bold: true };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

        columns.forEach((col, index) => {
            const column = sheet.getColumn(index + 1);
            column.width = 20; // Thiết lập chiều rộng mặc định
            column.alignment = { wrapText: true, horizontal: 'center' }; 
        });

        data.forEach((record) => {
            const rowData = columns.map(col => {
                let cellValue = objectPath.get(record, col.key as objectPath.Path);
                if (Array.isArray(cellValue)) {
                    cellValue = cellValue.join(', ');
                }
                return cellValue !== undefined && cellValue !== null ? cellValue : '';
            });
            const row = sheet.addRow(rowData);

            row.eachCell((cell) => {
                cell.alignment = { wrapText: true, vertical: 'top', horizontal: 'center' }; // Căn giữa ngang và dọc dữ liệu
            });
        });

        sheet.eachRow((row) => {
            let maxHeight = 15; // Chiều cao tối thiểu
            row.eachCell((cell) => {
                const cellText = String(cell.value || '');
                const lineBreaks = (cellText.match(/\n/g) || []).length + 1;  // Đếm số dòng
                maxHeight = Math.max(maxHeight, lineBreaks * 15);  // Cập nhật chiều cao dựa trên số dòng
            });
            row.height = maxHeight;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `${fileName}.xlsx`);
    };

    const onCsvPrint = () => {
        let csv = "\uFEFF";

        columns.forEach(({ title, render }, index) => {
            if (render) return;
            if (index !== 0) csv += ",";
            csv += `"${String(title || '').replace(/"/g, '""')}"`;
        });

        csv += "\n";

        data.forEach((record) => {
            columns.forEach(({ key, render }, index) => {
                if (render) return;
                if (index !== 0) csv += ",";
                const cellValue = objectPath.get(record, key as objectPath.Path);
                csv += `"${(cellValue !== undefined && cellValue !== null ? cellValue : '').toString().replace(/"/g, '""')}"`;
            });
            csv += "\n";
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `${fileName}.csv`);
    };

    const onPdfPrint = () => {
        const doc = new jsPDF();
        doc.addFileToVFS("FreeSans.ttf", FreeSans);
        doc.addFont("FreeSans.ttf", "FreeSans", "normal");
        doc.setFont("FreeSans");

        const {
            styles = { font: "FreeSans" },
            headStyles = { fontStyle: 'bold' },
            columnStyles = {
                0: { cellWidth: 10 },
                1: { cellWidth: 25 },
                2: { cellWidth: 30 },
                3: { cellWidth: 20 },
                4: { cellWidth: 20 },
                5: { cellWidth: 20 },
                6: { cellWidth: 20 },
                7: { cellWidth: 20 },
                8: { cellWidth: 20 },
                9: { cellWidth: 35 },
            }
        } = pdfOptions || {};

        autoTable(doc, {
            styles,
            headStyles,
            head: [columns.filter(c => !c.render).map(c => String(c.title || ''))],
            body: data.map(r => columns.filter(c => !c.render).map(c => {
                const cellValue = objectPath.get(r, c.key as objectPath.Path);
                return cellValue !== undefined && cellValue !== null ? cellValue : '';
            })),
            theme: pdfTheme,
            columnStyles,
        });

        doc.save(`${fileName}.pdf`);
    };

    return {
        onExcelPrint,
        onCsvPrint,
        onPdfPrint,
    };
};

export default useExport;