import React, { useState, useEffect } from 'react';
import { Card, Table, Tabs, Row, Col, Statistic, Button, Space, Typography, Divider } from 'antd';
import { DownloadOutlined, TeamOutlined, UserOutlined, DollarOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import * as customerAnalyzer from '../utils/customerAnalyzer';
import { sortByCustomerLevel } from '../utils/chartOptions';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const CustomerDashboard = ({ customerData }) => {
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    if (customerData && customerData.length > 0) {
      const result = customerAnalyzer.analyzeCustomerData(customerData);
      setAnalysis(result);
      console.log('客户分析结果:', result);
    }
  }, [customerData]);

  const exportToExcel = (data, fileName) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "数据");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  // 理财师分析表格列
  const advisorColumns = [
    {
      title: '理财师姓名',
      dataIndex: '理财师姓名',
      key: '理财师姓名',
      fixed: 'left',
      width: 120,
    },
    {
      title: '理财师工号',
      dataIndex: '理财师工号',
      key: '理财师工号',
      width: 120,
    },
    {
      title: '客户总数',
      dataIndex: '客户总数',
      key: '客户总数',
      sorter: (a, b) => a.客户总数 - b.客户总数,
      width: 100,
    },
    {
      title: '自拓客户数',
      dataIndex: '自拓客户数',
      key: '自拓客户数',
      sorter: (a, b) => a.自拓客户数 - b.自拓客户数,
      width: 100,
    },
    {
      title: '协同客户数',
      dataIndex: '协同客户数',
      key: '协同客户数',
      sorter: (a, b) => a.协同客户数 - b.协同客户数,
      width: 100,
    },
    {
      title: '存量总额(万元)',
      dataIndex: '存量总额',
      key: '存量总额',
      sorter: (a, b) => a.存量总额 - b.存量总额,
      render: value => (value / 10000).toFixed(2),
      width: 140,
    },
    {
      title: '自拓存量(万元)',
      dataIndex: '自拓存量',
      key: '自拓存量',
      sorter: (a, b) => a.自拓存量 - b.自拓存量,
      render: value => (value / 10000).toFixed(2),
      width: 140,
    },
    {
      title: '协同存量(万元)',
      dataIndex: '协同存量',
      key: '协同存量',
      sorter: (a, b) => a.协同存量 - b.协同存量,
      render: value => (value / 10000).toFixed(2),
      width: 140,
    },
  ];

  // 客户等级分析表格列
  const levelColumns = [
    {
      title: '客户等级',
      dataIndex: '客户等级',
      key: '客户等级',
      width: 120,
      sorter: (a, b) => sortByCustomerLevel(a.客户等级, b.客户等级),
      defaultSortOrder: 'ascend',
    },
    {
      title: '客户总数',
      dataIndex: '客户总数',
      key: '客户总数',
      sorter: (a, b) => a.客户总数 - b.客户总数,
      width: 100,
    },
    {
      title: '自拓客户数',
      dataIndex: '自拓客户数',
      key: '自拓客户数',
      sorter: (a, b) => a.自拓客户数 - b.自拓客户数,
      width: 100,
    },
    {
      title: '协同客户数',
      dataIndex: '协同客户数',
      key: '协同客户数',
      sorter: (a, b) => a.协同客户数 - b.协同客户数,
      width: 100,
    },
    {
      title: '存量总额(万元)',
      dataIndex: '存量总额',
      key: '存量总额',
      sorter: (a, b) => a.存量总额 - b.存量总额,
      render: value => (value / 10000).toFixed(2),
      width: 140,
    },
    {
      title: '自拓存量(万元)',
      dataIndex: '自拓存量',
      key: '自拓存量',
      sorter: (a, b) => a.自拓存量 - b.自拓存量,
      render: value => (value / 10000).toFixed(2),
      width: 140,
    },
    {
      title: '协同存量(万元)',
      dataIndex: '协同存量',
      key: '协同存量',
      sorter: (a, b) => a.协同存量 - b.协同存量,
      render: value => (value / 10000).toFixed(2),
      width: 140,
    },
  ];

  // 协作类型分析表格列
  const collaborationColumns = [
    {
      title: '客户类型',
      dataIndex: '类型',
      key: '类型',
      width: 120,
    },
    {
      title: '客户数',
      dataIndex: '客户数',
      key: '客户数',
      sorter: (a, b) => a.客户数 - b.客户数,
      width: 100,
    },
    {
      title: '客户数占比(%)',
      dataIndex: '占比客户数',
      key: '占比客户数',
      render: value => value.toFixed(2) + '%',
      width: 120,
    },
    {
      title: '存量总额(万元)',
      dataIndex: '存量总额',
      key: '存量总额',
      sorter: (a, b) => a.存量总额 - b.存量总额,
      render: value => (value / 10000).toFixed(2),
      width: 140,
    },
    {
      title: '投资额占比(%)',
      dataIndex: '占比投资额',
      key: '占比投资额',
      render: value => value.toFixed(2) + '%',
      width: 120,
    },
  ];

  if (!customerData || customerData.length === 0) {
    return (
      <Card>
        <Title level={3} style={{ textAlign: 'center' }}>请先上传客户数据</Title>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <Title level={3} style={{ textAlign: 'center' }}>数据分析中...</Title>
      </Card>
    );
  }

  const { summary } = analysis;

  return (
    <div>
      {/* 汇总统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="客户总数"
              value={summary.totalCustomers}
              prefix={<TeamOutlined />}
              suffix="户"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="存量总额"
              value={(summary.totalInvestment / 10000).toFixed(2)}
              prefix={<DollarOutlined />}
              suffix="万元"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="自拓客户"
              value={summary.selfDevelopedCustomers}
              prefix={<UserOutlined />}
              suffix="户"
            />
            <Text type="secondary">
              投资额: {(summary.selfDevelopedInvestment / 10000).toFixed(2)}万元
            </Text>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="协同客户"
              value={summary.collaborativeCustomers}
              prefix={<UserOutlined />}
              suffix="户"
            />
            <Text type="secondary">
              投资额: {(summary.collaborativeInvestment / 10000).toFixed(2)}万元
            </Text>
          </Card>
        </Col>
      </Row>

      {/* 详细分析表格 */}
      <Card
        title="客户分析"
        extra={
          <Space>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={() => {
                switch (activeTab) {
                  case 'advisor':
                    exportToExcel(analysis.advisorAnalysis, '理财师分析');
                    break;
                  case 'level':
                    exportToExcel(analysis.levelAnalysis, '等级分析');
                    break;
                  case 'collaboration':
                    exportToExcel(analysis.collaborationAnalysis, '协作分析');
                    break;
                  default:
                    exportToExcel(customerData, '客户原始数据');
                }
              }}
            >
              导出Excel
            </Button>
          </Space>
        }
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="汇总概览" key="summary">
            <Row gutter={24}>
              <Col span={12}>
                <Card title="自拓 vs 协同分布" size="small">
                  <Table 
                    columns={collaborationColumns}
                    dataSource={analysis.collaborationAnalysis}
                    rowKey="类型"
                    pagination={false}
                    size="small"
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="客户等级分布" size="small">
                  <Table 
                    columns={levelColumns}
                    dataSource={analysis.levelAnalysis.slice(0, 5)}
                    rowKey="客户等级"
                    pagination={false}
                    size="small"
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="理财师分析" key="advisor">
            <Table 
              columns={advisorColumns}
              dataSource={analysis.advisorAnalysis}
              rowKey="理财师工号"
              scroll={{ x: 'max-content' }}
              pagination={{ pageSize: 20 }}
            />
          </TabPane>

          <TabPane tab="等级分析" key="level">
            <Table 
              columns={levelColumns}
              dataSource={analysis.levelAnalysis}
              rowKey="客户等级"
              pagination={{ pageSize: 20 }}
            />
          </TabPane>

          <TabPane tab="协作分析" key="collaboration">
            <Table 
              columns={collaborationColumns}
              dataSource={analysis.collaborationAnalysis}
              rowKey="类型"
              pagination={false}
            />
            <Divider />
            <Title level={5}>说明</Title>
            <Text type="secondary">
              • 自拓客户：正行协作理财师 = 国内理财师<br/>
              • 协同客户：正行协作理财师 ≠ 国内理财师<br/>
              • 投资额为当前时点总投资额(历史投资)
            </Text>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default CustomerDashboard;