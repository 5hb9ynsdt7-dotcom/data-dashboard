import React, { useState, useEffect } from 'react';
import { Table, Card, Input, Button, Space, Typography, Tabs } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import * as dataAnalyzer from '../utils/dataAnalyzer';

const { Title } = Typography;
const { TabPane } = Tabs;

const DataTable = ({ data }) => {
  const [searchedColumn, setSearchedColumn] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [activeTab, setActiveTab] = useState('raw');
  
  // 分析后的数据
  const [advisorData, setAdvisorData] = useState([]);
  const [customerLevelData, setCustomerLevelData] = useState([]);
  const [buData, setBuData] = useState([]);
  const [productData, setProductData] = useState([]);
  
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    setFilteredData(data);
    
    // 分析数据
    const advisors = dataAnalyzer.analyzeByFinancialAdvisor(data);
    const levels = dataAnalyzer.analyzeByCustomerLevel(data);
    const bus = dataAnalyzer.analyzeByBU(data);
    const products = dataAnalyzer.analyzeByProduct(data);
    
    setAdvisorData(advisors);
    setCustomerLevelData(levels);
    setBuData(bus);
    setProductData(products);
  }, [data]);
  
  // 处理搜索
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchedColumn(dataIndex);
  };
  
  const handleReset = clearFilters => {
    clearFilters();
  };
  
  const getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`搜索 ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            搜索
          </Button>
          <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            重置
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    render: text => 
      searchedColumn === dataIndex ? (
        <span style={{ backgroundColor: '#ffc069' }}>{text}</span>
      ) : (
        text
      ),
  });
  
  // 导出Excel
  const exportToExcel = (tableData, fileName) => {
    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "数据");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };
  
  // 原始数据表格列定义
  const rawDataColumns = [
    {
      title: '集团号',
      dataIndex: '集团号',
      key: '集团号',
      ...getColumnSearchProps('集团号'),
    },
    {
      title: '客户等级',
      dataIndex: '客户等级名称',
      key: '客户等级名称',
      filters: Array.from(new Set(data?.map(item => item['客户等级名称']) || [])).map(level => ({
        text: level,
        value: level,
      })),
      onFilter: (value, record) => record['客户等级名称'] === value,
    },
    {
      title: '所属BU',
      dataIndex: '客户当前所属BU',
      key: '客户当前所属BU',
      filters: Array.from(new Set(data?.map(item => item['客户当前所属BU']) || [])).map(bu => ({
        text: bu,
        value: bu,
      })),
      onFilter: (value, record) => record['客户当前所属BU'] === value,
    },
    {
      title: '交易金额(元)',
      dataIndex: '认申购金额人民币',
      key: '认申购金额人民币',
      sorter: (a, b) => a['认申购金额人民币'] - b['认申购金额人民币'],
      render: value => value?.toLocaleString(),
    },
    {
      title: '主理财师工号',
      dataIndex: '主理财师工号',
      key: '主理财师工号',
      ...getColumnSearchProps('主理财师工号'),
    },
    {
      title: '主理财师姓名',
      dataIndex: '主理财师姓名',
      key: '主理财师姓名',
      ...getColumnSearchProps('主理财师姓名'),
    },
    {
      title: '订单签约时间',
      dataIndex: '订单签约时间',
      key: '订单签约时间',
      sorter: (a, b) => new Date(a['订单签约时间']) - new Date(b['订单签约时间']),
    },
    {
      title: '支线产品名称',
      dataIndex: '支线产品名称',
      key: '支线产品名称',
      ...getColumnSearchProps('支线产品名称'),
    },
    {
      title: '项目名称',
      dataIndex: '项目名称',
      key: '项目名称',
      ...getColumnSearchProps('项目名称'),
    },
    {
      title: '理财师',
      dataIndex: '理财师',
      key: '理财师',
      ...getColumnSearchProps('理财师'),
    },
    {
      title: '理财师工号',
      dataIndex: '理财师工号',
      key: '理财师工号',
      ...getColumnSearchProps('理财师工号'),
    },
  ];
  
  // 理财师分析表格列定义
  const advisorColumns = [
    {
      title: '理财师工号',
      dataIndex: '理财师工号',
      key: '理财师工号',
      ...getColumnSearchProps('理财师工号'),
    },
    {
      title: '理财师姓名',
      dataIndex: '理财师姓名',
      key: '理财师姓名',
      ...getColumnSearchProps('理财师姓名'),
    },
    {
      title: '交易总金额(元)',
      dataIndex: '交易总金额',
      key: '交易总金额',
      sorter: (a, b) => a.交易总金额 - b.交易总金额,
      defaultSortOrder: 'descend',
      render: value => value?.toLocaleString(),
    },
    {
      title: '交易笔数',
      dataIndex: '交易笔数',
      key: '交易笔数',
      sorter: (a, b) => a.交易笔数 - b.交易笔数,
    },
    {
      title: '客户数',
      dataIndex: '客户数',
      key: '客户数',
      sorter: (a, b) => a.客户数 - b.客户数,
    },
  ];
  
  // 客户等级分析表格列定义
  const levelColumns = [
    {
      title: '客户等级',
      dataIndex: '客户等级',
      key: '客户等级',
    },
    {
      title: '交易总金额(元)',
      dataIndex: '交易总金额',
      key: '交易总金额',
      sorter: (a, b) => a.交易总金额 - b.交易总金额,
      defaultSortOrder: 'descend',
      render: value => value?.toLocaleString(),
    },
    {
      title: '交易笔数',
      dataIndex: '交易笔数',
      key: '交易笔数',
      sorter: (a, b) => a.交易笔数 - b.交易笔数,
    },
    {
      title: '客户数',
      dataIndex: '客户数',
      key: '客户数',
      sorter: (a, b) => a.客户数 - b.客户数,
    },
  ];
  
  // BU分析表格列定义
  const buColumns = [
    {
      title: 'BU',
      dataIndex: 'BU',
      key: 'BU',
    },
    {
      title: '交易总金额(元)',
      dataIndex: '交易总金额',
      key: '交易总金额',
      sorter: (a, b) => a.交易总金额 - b.交易总金额,
      defaultSortOrder: 'descend',
      render: value => value?.toLocaleString(),
    },
    {
      title: '交易笔数',
      dataIndex: '交易笔数',
      key: '交易笔数',
      sorter: (a, b) => a.交易笔数 - b.交易笔数,
    },
    {
      title: '客户数',
      dataIndex: '客户数',
      key: '客户数',
      sorter: (a, b) => a.客户数 - b.客户数,
    },
  ];
  
  // 产品分析表格列定义
  const productColumns = [
    {
      title: '产品名称',
      dataIndex: '产品名称',
      key: '产品名称',
      ...getColumnSearchProps('产品名称'),
    },
    {
      title: '交易总金额(元)',
      dataIndex: '交易总金额',
      key: '交易总金额',
      sorter: (a, b) => a.交易总金额 - b.交易总金额,
      defaultSortOrder: 'descend',
      render: value => value?.toLocaleString(),
    },
    {
      title: '交易笔数',
      dataIndex: '交易笔数',
      key: '交易笔数',
      sorter: (a, b) => a.交易笔数 - b.交易笔数,
    },
    {
      title: '客户数',
      dataIndex: '客户数',
      key: '客户数',
      sorter: (a, b) => a.客户数 - b.客户数,
    },
  ];
  
  const handleTabChange = (key) => {
    setActiveTab(key);
  };
  
  const getExportData = () => {
    switch (activeTab) {
      case 'raw':
        return { data: filteredData, name: '原始数据' };
      case 'advisor':
        return { data: advisorData, name: '理财师分析' };
      case 'level':
        return { data: customerLevelData, name: '客户等级分析' };
      case 'bu':
        return { data: buData, name: 'BU分析' };
      case 'product':
        return { data: productData, name: '产品分析' };
      default:
        return { data: filteredData, name: '数据' };
    }
  };
  
  if (!data || data.length === 0) {
    return (
      <Card>
        <Title level={3} style={{ textAlign: 'center' }}>请先上传数据</Title>
      </Card>
    );
  }
  
  return (
    <div className="data-table-container">
      <Card 
        title="数据表格"
        extra={
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={() => {
              const { data, name } = getExportData();
              exportToExcel(data, name);
            }}
          >
            导出Excel
          </Button>
        }
      >
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="原始数据" key="raw">
            <Table 
              columns={rawDataColumns} 
              dataSource={filteredData} 
              rowKey={(record, index) => index}
              scroll={{ x: 'max-content' }}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab="理财师分析" key="advisor">
            <Table 
              columns={advisorColumns} 
              dataSource={advisorData} 
              rowKey="理财师工号"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab="客户等级分析" key="level">
            <Table 
              columns={levelColumns} 
              dataSource={customerLevelData} 
              rowKey="客户等级"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab="BU分析" key="bu">
            <Table 
              columns={buColumns} 
              dataSource={buData} 
              rowKey="BU"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab="产品分析" key="product">
            <Table 
              columns={productColumns} 
              dataSource={productData} 
              rowKey="产品名称"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default DataTable; 