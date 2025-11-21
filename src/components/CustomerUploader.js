import React, { useState } from 'react';
import { Upload, Button, Card, Alert } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

const { Dragger } = Upload;

const CustomerUploader = ({ onDataUploaded, setLoading }) => {
  const [fileList, setFileList] = useState([]);
  const [error, setError] = useState(null);

  const processExcelFile = (file) => {
    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        if (jsonData.length < 2) {
          setError('文件内容为空或格式不正确');
          setLoading(false);
          return;
        }

        const headers = jsonData[0];
        
        const requiredFields = [
          '集团号', '客户正行产品存量(人民币,不含雪球)', '国内理财师工号', '国内理财师',
          '是否受伤客户', '客户姓名(遮蔽)', '未来会员等级', '正行协作理财师',
          '正行协作理财师工号', '所属财富中心'
        ];
        
        const missingFields = requiredFields.filter(field => !headers.includes(field));
        
        if (missingFields.length > 0) {
          setError(`缺少必要字段: ${missingFields.join(', ')}`);
          setLoading(false);
          return;
        }

        const result = [];
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (row.length === 0) continue;
          
          const obj = {};
          for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = row[j];
          }
          
          if (obj['客户正行产品存量(人民币,不含雪球)'] !== undefined) {
            if (typeof obj['客户正行产品存量(人民币,不含雪球)'] === 'string') {
              obj['客户正行产品存量(人民币,不含雪球)'] = Number(obj['客户正行产品存量(人民币,不含雪球)'].replace(/[^\d.-]/g, '')) || 0;
            } else {
              obj['客户正行产品存量(人民币,不含雪球)'] = Number(obj['客户正行产品存量(人民币,不含雪球)']) || 0;
            }
          }
          
          result.push(obj);
        }

        console.log('客户数据处理完成:');
        console.log('- 总记录数:', result.length);
        
        const totalInvestment = result.reduce((sum, item) => sum + (item['客户正行产品存量(人民币,不含雪球)'] || 0), 0);
        const advisors = new Set(result.map(item => item['正行协作理财师工号']).filter(Boolean));
        
        console.log('数据验证:');
        console.log('- 客户数量:', result.length);
        console.log('- 总投资额:', totalInvestment.toLocaleString(), '元');
        console.log('- 理财师数量:', advisors.size);
        
        onDataUploaded(result);
        setLoading(false);
        
        // 提示用户数据已保存
        console.log('客户数据已保存到本地存储，刷新页面后数据不会丢失');
      } catch (err) {
        console.error('解析Excel文件时出错:', err);
        setError('解析文件时出错，请确保上传的是有效的Excel文件');
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError('读取文件时出错');
      setLoading(false);
    };
    
    reader.readAsArrayBuffer(file);
  };

  const props = {
    name: 'file',
    multiple: false,
    fileList,
    accept: '.xlsx,.xls',
    beforeUpload: (file) => {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                       file.type === 'application/vnd.ms-excel';
      if (!isExcel) {
        setError('只能上传Excel文件！');
        return Upload.LIST_IGNORE;
      }
      setFileList([file]);
      return false;
    },
    onRemove: () => {
      setFileList([]);
      setError(null);
    },
  };

  return (
    <Card title="上传客户数据表格" bordered={false}>
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      
      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
        <p className="ant-upload-hint">
          支持上传Excel文件(.xlsx, .xls)，文件需包含所有必要字段
        </p>
      </Dragger>
      
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Button
          type="primary"
          onClick={() => fileList.length > 0 && processExcelFile(fileList[0])}
          disabled={fileList.length === 0}
        >
          上传客户数据
        </Button>
      </div>
    </Card>
  );
};

export default CustomerUploader;
