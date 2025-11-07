import React, { useState } from 'react';
import { Upload, Button, Card, Alert } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import moment from 'moment';

const { Dragger } = Upload;

const FileUploader = ({ onDataUploaded, setLoading }) => {
  const [fileList, setFileList] = useState([]);
  const [error, setError] = useState(null);

  // 处理日期字符串
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    
    console.log('解析日期:', dateStr, '类型:', typeof dateStr);
    
    // 如果是数字（可能是Excel日期序列号）
    if (typeof dateStr === 'number') {
      // Excel日期从1900-01-01开始，序列号为1
      // 注意：Excel有一个1900年2月29日的bug，需要特殊处理
      const excelEpoch = new Date(1900, 0, 1);
      const adjustedDate = new Date(excelEpoch.getTime() + (dateStr - (dateStr > 60 ? 2 : 1)) * 24 * 60 * 60 * 1000);
      const result = moment(adjustedDate);
      console.log('Excel日期序列号转换结果:', result.format('YYYY-MM-DD'));
      return result;
    }
    
    // 尝试多种日期格式
    const formats = ['YYYY-MM-DD', 'YYYY/MM/DD', 'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY年MM月DD日', 'MM-DD-YYYY'];
    let date = null;
    
    // 先尝试各种格式
    for (const format of formats) {
      const parsed = moment(dateStr, format);
      if (parsed.isValid()) {
        date = parsed;
        console.log(`日期格式匹配 [${format}]:`, date.format('YYYY-MM-DD'));
        break;
      }
    }
    
    // 如果所有格式都失败，尝试直接解析
    if (!date) {
      date = moment(dateStr);
      if (date.isValid()) {
        console.log('默认日期解析:', date.format('YYYY-MM-DD'));
      }
    }
    
    // 验证年份合理性（防止解析错误）
    if (date && date.isValid()) {
      const year = date.year();
      // 检查年份是否合理 (例如2000-2050)
      if (year < 1980 || year > 2050) {
        console.warn('解析出不合理的年份:', year, '原始值:', dateStr);
        // 尝试交换日月（解决日期格式差异）
        for (const format of ['DD-MM-YYYY', 'DD/MM/YYYY']) {
          const altDate = moment(dateStr, format);
          if (altDate.isValid() && altDate.year() >= 1980 && altDate.year() <= 2050) {
            date = altDate;
            console.log('调整后的日期解析:', date.format('YYYY-MM-DD'));
            break;
          }
        }
      }
    }
    
    return date && date.isValid() ? date : null;
  };

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

        // 获取表头
        const headers = jsonData[0];
        
        // 检查必要的字段是否存在
        const requiredFields = [
          '集团号', '客户等级名称', '客户当前所属BU', '认申购金额人民币', 
          '主理财师工号', '主理财师姓名', '订单签约时间', '支线产品名称',
          '项目名称', '理财师', '理财师工号'
        ];
        
        const missingFields = requiredFields.filter(field => !headers.includes(field));
        
        if (missingFields.length > 0) {
          setError(`缺少必要字段: ${missingFields.join(', ')}`);
          setLoading(false);
          return;
        }

        // 转换为对象数组
        const result = [];
        let dateErrors = 0;
        let successCount = 0;
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (row.length === 0) continue; // 跳过空行
          
          const obj = {};
          for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = row[j];
          }
          
          // 处理日期字段
          if (obj['订单签约时间']) {
            const date = parseDate(obj['订单签约时间']);
            if (date) {
              // 保存原始日期字符串
              obj['订单签约时间原始值'] = obj['订单签约时间'];
              // 格式化为统一的日期字符串格式
              obj['订单签约时间'] = date.format('YYYY-MM-DD');
              // 添加年月日字段用于筛选 - 使用数字类型存储
              obj['签约年份'] = Number(date.year());
              obj['签约月份'] = Number(date.month() + 1);
              obj['签约日期'] = Number(date.date());
              
              successCount++;
            } else {
              console.warn('无法解析的日期格式:', obj['订单签约时间']);
              // 保持原始值不变，但不设置年月日字段
              dateErrors++;
            }
          }
          
          // 转换金额为数字
          if (obj['认申购金额人民币'] !== undefined) {
            // 如果是字符串，移除所有非数字字符（逗号、空格等）
            if (typeof obj['认申购金额人民币'] === 'string') {
              obj['认申购金额人民币'] = Number(obj['认申购金额人民币'].replace(/[^\d.-]/g, '')) || 0;
            } else {
              obj['认申购金额人民币'] = Number(obj['认申购金额人民币']) || 0;
            }
          }
          
          result.push(obj);
        }

        console.log('数据处理完成:');
        console.log('- 总记录数:', result.length);
        console.log('- 成功解析日期:', successCount);
        console.log('- 日期解析失败:', dateErrors);
        
        // 检查数据完整性
        const transactionCount = result.length;
        const totalAmount = result.reduce((sum, item) => sum + (item['认申购金额人民币'] || 0), 0);
        const advisors = new Set(result.map(item => item['理财师工号']).filter(Boolean));
        
        console.log('数据验证:');
        console.log('- 交易笔数:', transactionCount);
        console.log('- 交易总金额:', totalAmount.toLocaleString(), '元');
        console.log('- 理财师数量:', advisors.size);
        
        // 输出几条样本数据用于验证
        console.log('样本数据检查:');
        result.slice(0, 3).forEach((item, index) => {
          console.log(`记录${index+1}:`, {
            订单签约时间: item['订单签约时间'],
            签约年份: item['签约年份'], 
            签约月份: item['签约月份'], 
            签约日期: item['签约日期'],
            类型年: typeof item['签约年份'],
            类型月: typeof item['签约月份'],
            类型日: typeof item['签约日期']
          });
        });
        
        onDataUploaded(result);
        setLoading(false);
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
    <Card title="上传数据表格" bordered={false}>
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
          开始分析
        </Button>
      </div>
    </Card>
  );
};

export default FileUploader; 