import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme, Button, Modal, message } from 'antd';
import { UploadOutlined, DashboardOutlined, TableOutlined, TeamOutlined, BarChartOutlined, DeleteOutlined, UserOutlined, AppstoreOutlined, PieChartOutlined } from '@ant-design/icons';
import FileUploader from './components/FileUploader';
import DataDashboard from './components/DataDashboard';
import DataTable from './components/DataTable';
import CustomerUploader from './components/CustomerUploader';
import CustomerDashboard from './components/CustomerDashboard';
import OrderAnalysis from './components/OrderAnalysis';
import ProductStrategyUploader from './components/ProductStrategyUploader';
import StrategyDistribution from './components/StrategyDistribution';
import './App.css';

const { Header, Content, Footer, Sider } = Layout;

function App() {
  const [selectedKey, setSelectedKey] = useState('1');
  const [data, setData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [productStrategyData, setProductStrategyData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 从localStorage加载数据
  useEffect(() => {
    const savedData = localStorage.getItem('performanceData');
    const savedCustomerData = localStorage.getItem('customerData');
    const savedProductStrategyData = localStorage.getItem('productStrategyData');

    if (savedData) {
      try {
        setData(JSON.parse(savedData));
      } catch (error) {
        console.error('Error loading performance data from localStorage:', error);
        localStorage.removeItem('performanceData');
      }
    }

    if (savedCustomerData) {
      try {
        setCustomerData(JSON.parse(savedCustomerData));
      } catch (error) {
        console.error('Error loading customer data from localStorage:', error);
        localStorage.removeItem('customerData');
      }
    }

    if (savedProductStrategyData) {
      try {
        setProductStrategyData(JSON.parse(savedProductStrategyData));
      } catch (error) {
        console.error('Error loading product strategy data from localStorage:', error);
        localStorage.removeItem('productStrategyData');
      }
    }
  }, []);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleDataUpload = (parsedData) => {
    setData(parsedData);
    // 保存到localStorage
    try {
      localStorage.setItem('performanceData', JSON.stringify(parsedData));
    } catch (error) {
      console.error('Error saving performance data to localStorage:', error);
    }
    setSelectedKey('2'); // 上传完成后自动切换到数据分析面板
  };

  const handleCustomerDataUpload = (parsedData) => {
    setCustomerData(parsedData);
    // 保存到localStorage
    try {
      localStorage.setItem('customerData', JSON.stringify(parsedData));
    } catch (error) {
      console.error('Error saving customer data to localStorage:', error);
    }
    setSelectedKey('5'); // 上传完成后自动切换到客户分析面板
  };

  const handleProductStrategyDataUpload = (parsedData) => {
    setProductStrategyData(parsedData);
    // 保存到localStorage
    try {
      localStorage.setItem('productStrategyData', JSON.stringify(parsedData));
      message.success(`成功上传 ${parsedData.length} 条产品策略数据`);
    } catch (error) {
      console.error('Error saving product strategy data to localStorage:', error);
      message.error('保存产品策略数据失败');
    }
  };

  const handleClearAllData = () => {
    Modal.confirm({
      title: '确认清除所有数据',
      content: '这将清除所有已上传的业绩数据、客户数据和产品策略数据，此操作不可撤销。确定要继续吗？',
      okText: '确认清除',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        setData(null);
        setCustomerData(null);
        setProductStrategyData(null);
        localStorage.removeItem('performanceData');
        localStorage.removeItem('customerData');
        localStorage.removeItem('productStrategyData');
        setSelectedKey('1');
        message.success('所有数据已清除');
      },
    });
  };

  const renderContent = () => {
    switch (selectedKey) {
      case '1':
        return <FileUploader onDataUploaded={handleDataUpload} setLoading={setLoading} />;
      case '2':
        return <DataDashboard data={data} />;
      case '3':
        return <DataTable data={data} />;
      case '4':
        return <CustomerUploader onDataUploaded={handleCustomerDataUpload} setLoading={setLoading} />;
      case '5':
        return <CustomerDashboard customerData={customerData} />;
      case '6':
        return <OrderAnalysis performanceData={data} customerData={customerData} />;
      case '7':
        return <ProductStrategyUploader onDataUploaded={handleProductStrategyDataUpload} setLoading={setLoading} existingData={productStrategyData} />;
      case '8':
        return <StrategyDistribution performanceData={data} strategyData={productStrategyData} />;
      default:
        return <FileUploader onDataUploaded={handleDataUpload} setLoading={setLoading} />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
      >
        <div className="logo">数据分析平台</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onSelect={({ key }) => setSelectedKey(key)}
          items={[
            {
              key: '1',
              icon: <UploadOutlined />,
              label: '业绩数据',
            },
            {
              key: '2',
              icon: <DashboardOutlined />,
              label: '业绩分析',
              disabled: !data,
            },
            {
              key: '3',
              icon: <TableOutlined />,
              label: '业绩表格',
              disabled: !data,
            },
            {
              key: '4',
              icon: <TeamOutlined />,
              label: '客户数据',
            },
            {
              key: '5',
              icon: <BarChartOutlined />,
              label: '客户分析',
              disabled: !customerData,
            },
            {
              key: '6',
              icon: <UserOutlined />,
              label: '下单分析',
              disabled: !data || !customerData,
            },
            {
              key: '7',
              icon: <AppstoreOutlined />,
              label: '产品策略',
            },
            {
              key: '8',
              icon: <PieChartOutlined />,
              label: '策略分布',
              disabled: !data || !productStrategyData,
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div></div>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={handleClearAllData}
            style={{ display: (data || customerData || productStrategyData) ? 'inline-flex' : 'none' }}
          >
            清除所有数据
          </Button>
        </Header>
        <Content style={{ margin: '24px 16px 0' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {loading ? <div className="loading-indicator">数据处理中...</div> : renderContent()}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>数据分析平台 ©{new Date().getFullYear()}</Footer>
      </Layout>
    </Layout>
  );
}

export default App; 