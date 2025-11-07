import React, { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import { UploadOutlined, DashboardOutlined, TableOutlined } from '@ant-design/icons';
import FileUploader from './components/FileUploader';
import DataDashboard from './components/DataDashboard';
import DataTable from './components/DataTable';
import './App.css';

const { Header, Content, Footer, Sider } = Layout;

function App() {
  const [selectedKey, setSelectedKey] = useState('1');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleDataUpload = (parsedData) => {
    setData(parsedData);
    setSelectedKey('2'); // 上传完成后自动切换到数据分析面板
  };

  const renderContent = () => {
    switch (selectedKey) {
      case '1':
        return <FileUploader onDataUploaded={handleDataUpload} setLoading={setLoading} />;
      case '2':
        return <DataDashboard data={data} />;
      case '3':
        return <DataTable data={data} />;
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
              label: '上传数据',
            },
            {
              key: '2',
              icon: <DashboardOutlined />,
              label: '数据分析',
              disabled: !data,
            },
            {
              key: '3',
              icon: <TableOutlined />,
              label: '数据表格',
              disabled: !data,
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
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