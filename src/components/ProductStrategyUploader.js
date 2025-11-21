import React, { useState } from 'react';
import { Upload, Button, Card, Alert, Table, Typography } from 'antd';
import { InboxOutlined, UploadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

const { Dragger } = Upload;
const { Title } = Typography;

const ProductStrategyUploader = ({ onDataUploaded, setLoading, existingData }) => {
  const [fileList, setFileList] = useState([]);
  const [error, setError] = useState(null);
  const [previewData, setPreviewData] = useState(null);

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

        // 检查必要的字段是否存在
        const requiredFields = [
          '项目名称', '产品名称', '产品代码', '大类策略', '细分策略', '是否QD'
        ];

        const missingFields = requiredFields.filter(field => !headers.includes(field));

        if (missingFields.length > 0) {
          setError(`缺少必要字段: ${missingFields.join(', ')}`);
          setLoading(false);
          return;
        }

        // 转换为对象数组
        const result = [];

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (row.length === 0) continue; // 跳过空行

          const obj = {};
          for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = row[j];
          }

          result.push(obj);
        }

        console.log('产品策略数据处理完成:');
        console.log('- 总记录数:', result.length);
        console.log('- 样本数据:', result.slice(0, 3));

        // 设置预览数据
        setPreviewData(result.slice(0, 10));

        onDataUploaded(result);
        setLoading(false);

        console.log('产品策略数据已保存到本地存储，刷新页面后数据不会丢失');
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
      setPreviewData(null);
      setError(null);
    },
  };

  const columns = [
    {
      title: '项目名称',
      dataIndex: '项目名称',
      key: '项目名称',
      width: 200,
    },
    {
      title: '产品名称',
      dataIndex: '产品名称',
      key: '产品名称',
      width: 200,
    },
    {
      title: '产品代码',
      dataIndex: '产品代码',
      key: '产品代码',
      width: 150,
    },
    {
      title: '大类策略',
      dataIndex: '大类策略',
      key: '大类策略',
      width: 150,
    },
    {
      title: '细分策略',
      dataIndex: '细分策略',
      key: '细分策略',
      width: 150,
    },
    {
      title: '是否QD',
      dataIndex: '是否QD',
      key: '是否QD',
      width: 100,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
        上传产品策略表格
      </Title>

      <Card title="上传产品策略数据" bordered={false}>
        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}

        <Dragger {...props}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">
            支持上传Excel文件(.xlsx, .xls)
          </p>
          <p className="ant-upload-hint" style={{ color: '#999', fontSize: 12 }}>
            必填字段：项目名称、产品名称、产品代码、大类策略、细分策略、是否QD
          </p>
        </Dragger>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={() => fileList.length > 0 && processExcelFile(fileList[0])}
            disabled={fileList.length === 0}
          >
            开始分析
          </Button>
        </div>
      </Card>

      {previewData && previewData.length > 0 && (
        <Card title="数据预览（前10条）" style={{ marginTop: 24 }}>
          <Table
            dataSource={previewData}
            columns={columns}
            rowKey={(record, index) => index}
            pagination={false}
            scroll={{ x: 1000 }}
            size="small"
            bordered
          />
        </Card>
      )}

      {existingData && existingData.length > 0 && (
        <Card title={`产品策略数据（共 ${existingData.length} 条）`} style={{ marginTop: 24 }}>
          <Table
            dataSource={existingData}
            columns={columns}
            rowKey={(record, index) => index}
            pagination={{ pageSize: 50, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
            scroll={{ x: 1000 }}
            size="small"
            bordered
          />
        </Card>
      )}
    </div>
  );
};

export default ProductStrategyUploader;
