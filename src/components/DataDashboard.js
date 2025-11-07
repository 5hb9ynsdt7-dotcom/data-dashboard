import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Select, Statistic, Divider, Typography, DatePicker, Empty, Button, message, Table } from 'antd';
import { TeamOutlined, BankOutlined, CalendarOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import * as dataAnalyzer from '../utils/dataAnalyzer';
import * as chartOptions from '../utils/chartOptions';
import './DataDashboard.css'; // 确保导入CSS文件

const { Option } = Select;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const DataDashboard = ({ data }) => {
  const [filteredData, setFilteredData] = useState([]);
  const [buList, setBuList] = useState([]);
  const [levelList, setLevelList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [advisorList, setAdvisorList] = useState([]);
  const [mainAdvisorList, setMainAdvisorList] = useState([]);
  const [selectedBU, setSelectedBU] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedAdvisor, setSelectedAdvisor] = useState('all');
  const [selectedMainAdvisor, setSelectedMainAdvisor] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [summary, setSummary] = useState(null);
  
  // 图表数据
  const [advisorData, setAdvisorData] = useState([]);
  const [mainAdvisorData, setMainAdvisorData] = useState([]);
  const [customerLevelData, setCustomerLevelData] = useState([]);
  const [buData, setBuData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const [timeData, setTimeData] = useState(null);
  const [advisorMappingData, setAdvisorMappingData] = useState([]);
  
  // 添加项目明细表格相关状态
  const [projectTableData, setProjectTableData] = useState([]);
  const [otherProjects, setOtherProjects] = useState([]);
  
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    // 提取筛选条件的选项
    const buSet = new Set();
    const levelSet = new Set();
    const productSet = new Set();
    const projectSet = new Set();
    const advisorSet = new Set();
    const mainAdvisorSet = new Set();
    
    data.forEach(item => {
      if (item['客户当前所属BU']) buSet.add(item['客户当前所属BU']);
      if (item['客户等级名称']) levelSet.add(item['客户等级名称']);
      if (item['支线产品名称']) productSet.add(item['支线产品名称']);
      if (item['项目名称']) projectSet.add(item['项目名称']);
      
      // 理财师信息
      if (item['理财师'] && item['理财师工号']) {
        advisorSet.add(`${item['理财师']}(${item['理财师工号']})`);
      } else if (item['理财师']) {
        advisorSet.add(item['理财师']);
      } else if (item['理财师工号']) {
        advisorSet.add(item['理财师工号']);
      }
      
      // 主理财师信息
      if (item['主理财师姓名'] && item['主理财师工号']) {
        mainAdvisorSet.add(`${item['主理财师姓名']}(${item['主理财师工号']})`);
      } else if (item['主理财师姓名']) {
        mainAdvisorSet.add(item['主理财师姓名']);
      } else if (item['主理财师工号']) {
        mainAdvisorSet.add(item['主理财师工号']);
      }
    });
    
    setBuList(Array.from(buSet));
    setLevelList(Array.from(levelSet));
    setProductList(Array.from(productSet));
    setProjectList(Array.from(projectSet));
    setAdvisorList(Array.from(advisorSet));
    setMainAdvisorList(Array.from(mainAdvisorSet));
    
    // 初始加载时显示所有数据
    setFilteredData(data);
  }, [data]);
  
  useEffect(() => {
    if (!filteredData || filteredData.length === 0) return;
    
    // 计算总览数据
    const summaryData = dataAnalyzer.getDataSummary(filteredData);
    setSummary(summaryData);
    
    // 分析数据并更新各维度的结果
    const advisors = dataAnalyzer.analyzeByFinancialAdvisor(filteredData);
    const mainAdvisors = dataAnalyzer.analyzeByMainAdvisor(filteredData);
    const levels = dataAnalyzer.analyzeByCustomerLevel(filteredData);
    const bus = dataAnalyzer.analyzeByBU(filteredData);
    const products = dataAnalyzer.analyzeByProduct(filteredData);
    const projects = dataAnalyzer.analyzeByProject(filteredData);
    const times = dataAnalyzer.analyzeByTime(filteredData);
    const advisorMapping = dataAnalyzer.analyzeAdvisorToMainAdvisorMapping(filteredData);
    
    setAdvisorData(advisors);
    setMainAdvisorData(mainAdvisors);
    setCustomerLevelData(levels);
    setBuData(bus);
    setProductData(products);
    setProjectData(projects);
    setTimeData(times);
    setAdvisorMappingData(advisorMapping);
    
    // 处理项目数据，保存项目表格数据
    const sortedProjects = [...projects].sort((a, b) => b.交易总金额 - a.交易总金额);
    setProjectTableData(sortedProjects); // 保存完整的项目数据用于表格
    
    // 获取其他项目（除前6个外）
    const others = sortedProjects.slice(6);
    setOtherProjects(others);
  }, [filteredData]);
  
  // 处理日期范围变更
  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    setSelectedMonth(null);
  };
  
  // 清除日期筛选
  const clearDateRange = () => {
    setDateRange(null);
    setSelectedMonth(null);
  };
  
  // 筛选数据
  const filterData = useCallback(() => {
    if (!data || data.length === 0) return;
    
    // 构建筛选条件
    const filters = [];
    
    // 日期筛选条件
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0];
      const endDate = dateRange[1];
      
      // 提取开始日期和结束日期的年月日
      const startYear = startDate.year();
      const startMonth = startDate.month() + 1;
      const startDay = startDate.date();
      
      const endYear = endDate.year();
      const endMonth = endDate.month() + 1;
      const endDay = endDate.date();
      
      filters.push(item => {
        // 必须有有效的年、月、日
        if (!item['签约年份'] || !item['签约月份'] || !item['签约日期']) {
          return false;
        }
        
        // 确保所有值都是数字类型
        const yearNum = Number(item['签约年份']);
        const monthNum = Number(item['签约月份']);
        const dayNum = Number(item['签约日期']);
        
        // 将日期转换为可比较的数值格式 (年*10000 + 月*100 + 日)
        const itemDateValue = yearNum * 10000 + monthNum * 100 + dayNum;
        const startDateValue = startYear * 10000 + startMonth * 100 + startDay;
        const endDateValue = endYear * 10000 + endMonth * 100 + endDay;
        
        // 检查日期是否在范围内
        return itemDateValue >= startDateValue && itemDateValue <= endDateValue;
      });
    }
    
    // BU筛选
    if (selectedBU !== 'all') {
      filters.push(item => item['客户当前所属BU'] === selectedBU);
    }
    
    // 客户等级筛选
    if (selectedLevel !== 'all') {
      filters.push(item => item['客户等级名称'] === selectedLevel);
    }
    
    // 产品筛选
    if (selectedProduct !== 'all') {
      filters.push(item => item['支线产品名称'] === selectedProduct);
    }
    
    // 项目筛选
    if (selectedProject !== 'all') {
      filters.push(item => item['项目名称'] === selectedProject);
    }
    
    // 理财师筛选
    if (selectedAdvisor !== 'all') {
      filters.push(item => {
        const advisorFullName = item['理财师'] && item['理财师工号'] 
          ? `${item['理财师']}(${item['理财师工号']})`
          : item['理财师'] || item['理财师工号'] || '';
        return advisorFullName === selectedAdvisor;
      });
    }
    
    // 主理财师筛选
    if (selectedMainAdvisor !== 'all') {
      filters.push(item => {
        const mainAdvisorFullName = item['主理财师姓名'] && item['主理财师工号'] 
          ? `${item['主理财师姓名']}(${item['主理财师工号']})`
          : item['主理财师姓名'] || item['主理财师工号'] || '';
        return mainAdvisorFullName === selectedMainAdvisor;
      });
    }
    
    // 应用所有筛选条件（同时满足所有条件）
    let filtered = [...data];
    
    if (filters.length > 0) {
      filters.forEach(filterFn => {
        filtered = filtered.filter(filterFn);
      });
    }
    
    // 验证筛选结果
    let totalAmount = 0;
    
    filtered.forEach(item => {
      totalAmount += item['认申购金额人民币'] || 0;
    });
    
    setFilteredData(filtered);
    
    // 显示通知
    if (filtered.length > 0) {
      message.success(`已筛选出${filtered.length}条记录，总金额${(totalAmount/10000).toFixed(2)}万元`);
    } else {
      message.info('没有找到符合条件的记录');
    }
  }, [data, dateRange, selectedBU, selectedLevel, selectedProduct, selectedProject, selectedAdvisor, selectedMainAdvisor]);
  
  // 特定月份快速筛选按钮
  const renderMonthButtons = () => {
    // 快速筛选月份的通用处理函数
    const handleMonthFilter = (monthType, months, monthLabel) => {
      // 检查指定月份是否有数据
            const hasData = data.some(item => {
              if (!item['签约年份'] || !item['签约月份']) return false;
              const yearNum = Number(item['签约年份']);
              const monthNum = Number(item['签约月份']);
        return yearNum === 2025 && months.includes(monthNum);
            });
            
            if (!hasData) {
        message.info(`当前数据中没有${monthLabel}的记录`);
              return;
            }
            
      // 清除日期范围筛选，设置月份选择
            setDateRange(null);
      setSelectedMonth(monthType);
    };

    return (
      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center' }}>
        <Text strong style={{ marginRight: 8 }}>快速筛选:</Text>
        <Button 
          type={selectedMonth === 'q1' ? 'primary' : 'default'} 
          size="small" 
          onClick={() => handleMonthFilter('q1', [1, 2, 3, 4], '1-4月')}
          style={{ marginRight: 8 }}
        >
          1-4月
        </Button>
        <Button 
          type={selectedMonth === 'q2' ? 'primary' : 'default'} 
          size="small" 
          onClick={() => handleMonthFilter('q2', [5, 6], '5-6月')}
          style={{ marginRight: 8 }}
        >
          5-6月
        </Button>
        <Button 
          type={selectedMonth === 'q3' ? 'primary' : 'default'} 
          size="small" 
          onClick={() => handleMonthFilter('q3', [7, 8], '7-8月')}
          style={{ marginRight: 8 }}
        >
          7-8月
        </Button>
        <Button 
          type={selectedMonth === 'q4' ? 'primary' : 'default'} 
          size="small" 
          onClick={() => handleMonthFilter('q4', [9, 10, 11, 12], '9-12月')}
          style={{ marginRight: 8 }}
        >
          9-12月
        </Button>
        {selectedMonth && (
        <Button 
          size="small" 
          onClick={() => {
              setSelectedMonth(null);
              filterData();
          }}
          >
            清除月份筛选
          </Button>
        )}
      </div>
    );
  };
  
  useEffect(() => {
    filterData();
  }, [selectedBU, selectedLevel, selectedProduct, selectedProject, selectedAdvisor, selectedMainAdvisor, dateRange, data, filterData]);
  
  // 处理selectedMonth变化的筛选逻辑
  useEffect(() => {
    if (!selectedMonth || !data || data.length === 0) return;
    
    let filtered = [...data];
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    
    // 根据不同的月份选择进行筛选
    if (selectedMonth === 'q1') {
      // 筛选1-4月的数据
      filtered = filtered.filter(item => {
        if (!item['签约年份'] || !item['签约月份'] || !item['签约日期']) return false;
        const yearNum = Number(item['签约年份']);
        const monthNum = Number(item['签约月份']);
        return yearNum === 2025 && (monthNum >= 1 && monthNum <= 4);
      });
      
      console.log('1-4月筛选结果:', filtered.length, '条记录');
    } 
    else if (selectedMonth === 'q2') {
      // 筛选5-6月的数据
      filtered = filtered.filter(item => {
        if (!item['签约年份'] || !item['签约月份'] || !item['签约日期']) return false;
        const yearNum = Number(item['签约年份']);
        const monthNum = Number(item['签约月份']);
        return yearNum === 2025 && (monthNum >= 5 && monthNum <= 6);
      });
      
      console.log('5-6月筛选结果:', filtered.length, '条记录');
    }
    else if (selectedMonth === 'q3') {
      // 筛选7-8月的数据
      filtered = filtered.filter(item => {
        if (!item['签约年份'] || !item['签约月份'] || !item['签约日期']) return false;
        const yearNum = Number(item['签约年份']);
        const monthNum = Number(item['签约月份']);
        return yearNum === 2025 && (monthNum >= 7 && monthNum <= 8);
      });
      
      console.log('7-8月筛选结果:', filtered.length, '条记录');
    }
    else if (selectedMonth === 'q4') {
      // 筛选9-12月的数据
      filtered = filtered.filter(item => {
        if (!item['签约年份'] || !item['签约月份'] || !item['签约日期']) return false;
        const yearNum = Number(item['签约年份']);
        const monthNum = Number(item['签约月份']);
        return yearNum === 2025 && (monthNum >= 9 && monthNum <= 12);
      });
      
      console.log('9-12月筛选结果:', filtered.length, '条记录');
    }
    else if (selectedMonth === 'ytd') {
      // 筛选今年以来的数据(2025年1月1日到今天)
      filtered = filtered.filter(item => {
        if (!item['签约年份'] || !item['签约月份'] || !item['签约日期']) return false;
        const yearNum = Number(item['签约年份']);
        const monthNum = Number(item['签约月份']);
        const dayNum = Number(item['签约日期']);
        
        // 检查年份是否匹配
        if (yearNum !== 2025) return false;
        
        // 检查日期是否在范围内(1月1日到今天)
        const itemDateValue = yearNum * 10000 + monthNum * 100 + dayNum;
        const startDateValue = 2025 * 10000 + 1 * 100 + 1; // 2025年1月1日
        const endDateValue = 2025 * 10000 + currentMonth * 100 + currentDay; // 今天
        
        return itemDateValue >= startDateValue && itemDateValue <= endDateValue;
      });
      
      console.log('今年以来筛选结果:', filtered.length, '条记录');
    }
    
    // 验证筛选结果
    if (filtered.length > 0) {
      let totalAmount = 0;
      const advisors = new Set();
      
      filtered.forEach(item => {
        totalAmount += item['认申购金额人民币'] || 0;
        if (item['理财师工号']) advisors.add(item['理财师工号']);
      });
      
      console.log('- 交易金额:', totalAmount.toLocaleString(), '元');
      console.log('- 理财师数量:', advisors.size);
      
      setFilteredData(filtered);
      
      // 显示筛选结果通知
      message.success(`已筛选出${filtered.length}条记录，总金额${(totalAmount/10000).toFixed(2)}万元`);
    }
  }, [selectedMonth, data]);
  
  // 获取图表配置
  const getAdvisorChartOption = () => {
    return chartOptions.getAdvisorRankChartOption(advisorData);
  };
  
  const getMainAdvisorChartOption = () => {
    return chartOptions.getMainAdvisorChartOption(mainAdvisorData);
  };
  
  const getCustomerLevelChartOption = () => {
    return chartOptions.getCustomerLevelChartOption(customerLevelData);
  };
  
  const getBUChartOption = () => {
    return chartOptions.getBUChartOption(buData);
  };
  
  const getTimeChartOption = () => {
    return chartOptions.getTimeChartOption(timeData);
  };
  
  const getAdvisorToMainAdvisorStackedChartOption = () => {
    return chartOptions.getAdvisorToMainAdvisorStackedChartOption(advisorMappingData);
  };
  
  // 添加项目销售分布饼图和明细表格组件
  const renderProjectDistribution = () => {
    if (!projectData || projectData.length === 0) {
      return <Empty description="暂无项目数据" />;
    }
    
    // 计算总金额
    const totalAmount = projectTableData.reduce((sum, item) => sum + item.交易总金额, 0);
    
    // 项目明细表格列定义
    const columns = [
      {
        title: '项目名称',
        dataIndex: '项目名称',
        key: 'name',
        width: '35%',
        className: 'project-name-cell',
        render: (text) => <div className="project-name-cell">{text}</div>
      },
      {
        title: '交易金额 (元)',
        dataIndex: '交易总金额',
        key: 'amount',
        width: '25%',
        sorter: (a, b) => a.交易总金额 - b.交易总金额,
        render: (text) => text.toLocaleString('zh-CN'),
      },
      {
        title: '交易笔数',
        dataIndex: '交易笔数',
        key: 'count',
        width: '15%',
        sorter: (a, b) => a.交易笔数 - b.交易笔数,
      },
      {
        title: '占比',
        dataIndex: '交易总金额',
        key: 'percentage',
        width: '15%',
        render: (text) => ((text / totalAmount) * 100).toFixed(2) + '%',
      },
    ];
    
    // 为表格添加序号和标记是否前六
    const tableData = projectTableData.map((item, index) => ({
      ...item,
      key: index,
      isTopSix: index < 6,
    }));
    
    return (
      <div className="project-tables-container">
        <Card
          title="项目销售分布"
          style={{ marginBottom: 24 }}
          bordered={false}
        >
          <Row gutter={24} className="project-distribution-row">
            <Col span={24} className="project-chart-col">
              <ReactECharts
                option={chartOptions.getProjectPieChartOption(projectData)}
                style={{ height: 400 }}
                opts={{ renderer: 'canvas' }}
              />
            </Col>
          </Row>
        </Card>
        
        <Card
          title="其他项目明细"
          style={{ marginBottom: 24 }}
          bordered={false}
        >
          <Table
            className="project-table compact-table"
            columns={columns}
            dataSource={tableData.slice(6)}
            pagination={false}
            size="small"
            summary={() => (
              <Table.Summary>
                <Table.Summary.Row style={{ fontWeight: 'bold' }}>
                  <Table.Summary.Cell index={0}>其他项目合计</Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    {otherProjects.reduce((sum, item) => sum + item.交易总金额, 0).toLocaleString('zh-CN')}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    {otherProjects.reduce((sum, item) => sum + item.交易笔数, 0)}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3}>
                    {((otherProjects.reduce((sum, item) => sum + item.交易总金额, 0) / totalAmount) * 100).toFixed(2) + '%'}
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
            scroll={{ x: 'max-content' }}
          />
        </Card>
      </div>
    );
  };
  
  if (!data || data.length === 0) {
    return <Empty description="请先上传数据" />;
  }
  
  return (
    <div className="dashboard-container">
      <Title level={2} style={{ textAlign: 'center', marginBottom: 20 }}>数据分析仪表盘</Title>
      
      {/* 筛选器 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          {/* 第一行筛选项：理财师、主理财师、项目、产品 */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <Text strong>理财师筛选：</Text>
            <Select 
              style={{ width: '80%' }} 
              value={selectedAdvisor}
              onChange={value => setSelectedAdvisor(value)}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              <Option value="all">全部</Option>
              {advisorList.map(advisor => (
                <Option key={advisor} value={advisor}>{advisor}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Text strong>主理财师筛选：</Text>
            <Select 
              style={{ width: '80%' }} 
              value={selectedMainAdvisor}
              onChange={value => setSelectedMainAdvisor(value)}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              <Option value="all">全部</Option>
              {mainAdvisorList.map(advisor => (
                <Option key={advisor} value={advisor}>{advisor}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Text strong>项目筛选：</Text>
            <Select 
              style={{ width: '80%' }} 
              value={selectedProject}
              onChange={value => setSelectedProject(value)}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              <Option value="all">全部</Option>
              {projectList.map(project => (
                <Option key={project} value={project}>{project}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Text strong>产品筛选：</Text>
            <Select 
              style={{ width: '80%' }} 
              value={selectedProduct}
              onChange={value => setSelectedProduct(value)}
            >
              <Option value="all">全部</Option>
              {productList.map(product => (
                <Option key={product} value={product}>{product}</Option>
              ))}
            </Select>
          </Col>
          
          {/* 第二行筛选项：客户等级、BU、时间范围 */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <Text strong>客户等级筛选：</Text>
            <Select 
              style={{ width: '80%' }} 
              value={selectedLevel}
              onChange={value => setSelectedLevel(value)}
            >
              <Option value="all">全部</Option>
              {levelList.map(level => (
                <Option key={level} value={level}>{level}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Text strong>BU筛选：</Text>
            <Select 
              style={{ width: '80%' }} 
              value={selectedBU}
              onChange={value => setSelectedBU(value)}
            >
              <Option value="all">全部</Option>
              {buList.map(bu => (
                <Option key={bu} value={bu}>{bu}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={16} lg={12}>
            <Text strong>时间范围筛选：</Text>
            <div style={{ display: 'flex', alignItems: 'center', width: '80%' }}>
              <RangePicker 
                style={{ width: '100%' }}
                value={dateRange}
                onChange={handleDateRangeChange}
                format="YYYY-MM-DD"
                placeholder={['开始日期', '结束日期']}
                allowClear={true}
                suffixIcon={<CalendarOutlined />}
                disabled={selectedMonth !== null}
              />
            </div>
            {renderMonthButtons()}
          </Col>
        </Row>
      </Card>
      
      {/* 筛选结果为空时显示空状态 */}
      {filteredData.length === 0 ? (
        <Empty 
          description="没有符合条件的数据" 
          style={{ margin: '50px 0' }}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        // 筛选结果不为空时显示数据和图表
        <>
          {/* 数据概览 */}
          {summary && (
            <Card className="analysis-summary">
              <Row gutter={16} style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto' }}>
                <Col flex="1">
                  <Statistic 
                    title="交易总金额" 
                    value={summary.交易总金额} 
                    precision={2}
                    suffix="元"
                    formatter={value => chartOptions.formatAmount(value)}
                    style={{ fontSize: '0.85em' }}
                    valueStyle={{ fontSize: '16px' }}
                  />
                </Col>
                <Col flex="1">
                  <Statistic 
                    title="交易笔数" 
                    value={summary.交易笔数} 
                    suffix="笔"
                    style={{ fontSize: '0.85em' }}
                    valueStyle={{ fontSize: '16px' }}
                  />
                </Col>
                <Col flex="1">
                  <Statistic 
                    title="客户数量" 
                    value={summary.客户数量} 
                    prefix={<TeamOutlined />}
                    style={{ fontSize: '0.85em' }}
                    valueStyle={{ fontSize: '16px' }}
                  />
                </Col>
                <Col flex="1">
                  <Statistic 
                    title="理财师数量" 
                    value={summary.理财师数量}
                    style={{ fontSize: '0.85em' }}
                    valueStyle={{ fontSize: '16px' }}
                  />
                </Col>
                <Col flex="1">
                  <Statistic 
                    title="产品数量" 
                    value={summary.产品数量} 
                    prefix={<BankOutlined />}
                    style={{ fontSize: '0.85em' }}
                    valueStyle={{ fontSize: '16px' }}
                  />
                </Col>
                <Col flex="1">
                  <Statistic 
                    title="客均交易金额" 
                    value={summary.交易总金额 / summary.客户数量} 
                    precision={2}
                    suffix="元"
                    formatter={value => chartOptions.formatAmount(value)}
                    style={{ fontSize: '0.85em' }}
                    valueStyle={{ fontSize: '16px' }}
                  />
                </Col>
                <Col flex="1">
                  <Statistic 
                    title="人均产能" 
                    value={summary.交易总金额 / 6} 
                    precision={2}
                    suffix="元"
                    formatter={value => chartOptions.formatAmount(value)}
                    style={{ fontSize: '0.85em' }}
                    valueStyle={{ fontSize: '16px' }}
                  />
                </Col>
              </Row>
              
              {/* 筛选条件信息区域，独立于统计数据，防止影响布局 */}
              <Row style={{ marginTop: 8 }}>
                {dateRange && dateRange[0] && dateRange[1] && (
                  <Col xs={24}>
                    <Text type="secondary">
                      当前显示: {dateRange[0].format('YYYY年MM月DD日')} 至 {dateRange[1].format('YYYY年MM月DD日')} 的数据
                    </Text>
                  </Col>
                )}
                {selectedMonth === 'may' && (
                  <Col xs={24}>
                    <Text type="secondary">
                      当前显示: 2025年5月1日 至 2025年5月28日 的数据
                    </Text>
                  </Col>
                )}
                {selectedMonth === 'apr' && (
                  <Col xs={24}>
                    <Text type="secondary">
                      当前显示: 2025年4月 的数据
                    </Text>
                  </Col>
                )}
                {selectedMonth === 'mar' && (
                  <Col xs={24}>
                    <Text type="secondary">
                      当前显示: 2025年3月 的数据
                    </Text>
                  </Col>
                )}
                {selectedMonth === 'feb' && (
                  <Col xs={24}>
                    <Text type="secondary">
                      当前显示: 2025年2月 的数据
                    </Text>
                  </Col>
                )}
                {selectedMonth === 'jan' && (
                  <Col xs={24}>
                    <Text type="secondary">
                      当前显示: 2025年1月 的数据
                    </Text>
                  </Col>
                )}
                {selectedMonth === 'q1' && (
                  <Col xs={24}>
                    <Text type="secondary">
                      当前显示: 2025年1月至4月 的数据
                    </Text>
                  </Col>
                )}
                {selectedMonth === 'q2' && (
                  <Col xs={24}>
                    <Text type="secondary">
                      当前显示: 2025年5月至6月 的数据
                    </Text>
                  </Col>
                )}
                {selectedMonth === 'q3' && (
                  <Col xs={24}>
                    <Text type="secondary">
                      当前显示: 2025年7月至8月 的数据
                    </Text>
                  </Col>
                )}
                {selectedMonth === 'q4' && (
                  <Col xs={24}>
                    <Text type="secondary">
                      当前显示: 2025年9月至12月 的数据
                    </Text>
                  </Col>
                )}
                {selectedMonth === 'ytd' && (
                  <Col xs={24}>
                    <Text type="secondary">
                      当前显示: 2025年1月1日 至 今天 的数据
                    </Text>
                  </Col>
                )}
                {selectedAdvisor !== 'all' && (
                  <Col xs={24}>
                    <Text type="secondary">
                      当前筛选理财师: {selectedAdvisor}
                    </Text>
                  </Col>
                )}
                {selectedMainAdvisor !== 'all' && (
                  <Col xs={24}>
                    <Text type="secondary">
                      当前筛选主理财师: {selectedMainAdvisor}
                    </Text>
                  </Col>
                )}
                {selectedProject !== 'all' && (
                  <Col xs={24}>
                    <Text type="secondary">
                      当前筛选项目: {selectedProject}
                    </Text>
                  </Col>
                )}
              </Row>
            </Card>
          )}
          
          <Divider />
          
          {/* 图表区域 */}
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Card className="chart-card">
                <ReactECharts
                  option={getTimeChartOption() || {}}
                  style={{ height: 400 }}
                  notMerge={true}
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card className="chart-card">
                <ReactECharts
                  option={getAdvisorChartOption() || {}}
                  style={{ height: 400 }}
                  notMerge={true}
                />
              </Card>
            </Col>
          </Row>
          
          {/* 主理财师业绩表 */}
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col xs={24}>
              <Card className="chart-card">
                <ReactECharts
                  option={getMainAdvisorChartOption() || {}}
                  style={{ height: 800 }}
                  notMerge={true}
                />
              </Card>
            </Col>
          </Row>
          
          {/* 理财师与主理财师映射关系表格 */}
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col xs={24}>
              <Card 
                className="chart-card" 
                title="理财师与主理财师映射关系表"
                extra={<Text type="secondary">显示每个理财师对应的主理财师及交易金额占比</Text>}
              >
                <Table 
                  dataSource={advisorMappingData.sort((a, b) => a.理财师.localeCompare(b.理财师) || b.交易金额 - a.交易金额)}
                  rowKey={(record, index) => index}
                  pagination={false}
                  scroll={{ x: false, y: false }}
                  size="middle"
                  className="advisor-mapping-table"
                  rowClassName={(record) => {
                    // 如果理财师和主理财师不相等，应用粉红色背景样式
                    return record.理财师 !== record.主理财师 ? 'different-advisor-row' : '';
                  }}
                  columns={[
                    {
                      title: '理财师',
                      dataIndex: '理财师',
                      key: '理财师',
                      sorter: (a, b) => a.理财师.localeCompare(b.理财师),
                      width: '26%',
                      ellipsis: true,
                    },
                    {
                      title: '主理财师',
                      dataIndex: '主理财师',
                      key: '主理财师',
                      sorter: (a, b) => a.主理财师.localeCompare(b.主理财师),
                      width: '26%',
                      ellipsis: true,
                    },
                    {
                      title: '交易金额(元)',
                      dataIndex: '交易金额',
                      key: '交易金额',
                      sorter: (a, b) => a.交易金额 - b.交易金额,
                      render: (text) => chartOptions.formatAmount(text),
                      width: '26%',
                    },
                    {
                      title: '占比',
                      dataIndex: '占比',
                      key: '占比',
                      sorter: (a, b) => a.占比 - b.占比,
                      render: (text) => `${text}%`,
                      width: '22%',
                    }
                  ]}
                  summary={pageData => {
                    let totalAmount = 0;
                    
                    pageData.forEach(({ 交易金额 }) => {
                      totalAmount += 交易金额;
                    });
                    
                    return (
                      <Table.Summary.Row style={{ fontWeight: 'bold' }}>
                        <Table.Summary.Cell index={0} colSpan={2}>
                          总计
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          {chartOptions.formatAmount(totalAmount)}
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2}>
                          100%
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    );
                  }}
                />
              </Card>
            </Col>
          </Row>
          
          {/* 理财师与主理财师映射关系百分比堆积柱形图 */}
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col xs={24}>
              <Card 
                className="chart-card" 
                title="理财师与主理财师映射关系百分比堆积图"
                extra={<Text type="secondary">展示每个理财师对应的主理财师交易金额占比</Text>}
              >
                <ReactECharts
                  option={getAdvisorToMainAdvisorStackedChartOption() || {}}
                  style={{ height: 420 }}
                  notMerge={true}
                />
              </Card>
            </Col>
          </Row>
          
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col xs={24} md={12}>
              <Card className="chart-card">
                <ReactECharts
                  option={getCustomerLevelChartOption() || {}}
                  style={{ height: 400 }}
                  notMerge={true}
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card className="chart-card">
                <ReactECharts
                  option={getBUChartOption() || {}}
                  style={{ height: 400 }}
                  notMerge={true}
                />
              </Card>
            </Col>
          </Row>
          
          {/* 客户等级出单表格 */}
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col xs={24}>
              <Card 
                className="chart-card" 
                title="客户等级出单表格"
                extra={<Text type="secondary">显示客户等级的交易金额、笔数、客户数量、占比、单均金额和客均交易金额</Text>}
              >
                <div className="customer-level-table">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>客户等级</th>
                        <th>交易金额(元)</th>
                        <th>交易笔数</th>
                        <th>客户数量</th>
                        <th>金额占比</th>
                        <th>单均金额(元)</th>
                        <th>客均交易金额(元)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerLevelData.map((item, index) => {
                        const averageAmount = item.交易总金额 / item.交易笔数;
                        const customerAverageAmount = item.交易总金额 / item.客户数;
                        const amountPercentage = summary ? (item.交易总金额 / summary.交易总金额) * 100 : 0;
                        return (
                          <tr key={index}>
                            <td>{item.客户等级}</td>
                            <td>{chartOptions.formatAmount(item.交易总金额)}</td>
                            <td>{item.交易笔数}</td>
                            <td>{item.客户数}</td>
                            <td>{amountPercentage.toFixed(2)}%</td>
                            <td>{chartOptions.formatAmount(averageAmount)}</td>
                            <td>{chartOptions.formatAmount(customerAverageAmount)}</td>
                          </tr>
                        );
                      })}
                      {/* 汇总行 */}
                      <tr className="summary-row">
                        <td><strong>汇总</strong></td>
                        <td>
                          <strong>
                            {chartOptions.formatAmount(
                              customerLevelData.reduce((sum, item) => sum + item.交易总金额, 0)
                            )}
                          </strong>
                        </td>
                        <td>
                          <strong>
                            {customerLevelData.reduce((sum, item) => sum + item.交易笔数, 0)}
                          </strong>
                        </td>
                        <td>
                          <strong>
                            {summary ? summary.客户数量 : 0}
                          </strong>
                        </td>
                        <td>
                          <strong>100.00%</strong>
                        </td>
                        <td>
                          <strong>
                            {chartOptions.formatAmount(
                              customerLevelData.reduce((sum, item) => sum + item.交易总金额, 0) / 
                              (customerLevelData.reduce((sum, item) => sum + item.交易笔数, 0) || 1)
                            )}
                          </strong>
                        </td>
                        <td>
                          <strong>
                            {chartOptions.formatAmount(
                              customerLevelData.reduce((sum, item) => sum + item.交易总金额, 0) / 
                              (summary ? summary.客户数量 : 1)
                            )}
                          </strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col xs={24}>
              <Card className="chart-card">
                <Title level={4} style={{ textAlign: 'center', marginBottom: 16 }}>产品销售排行</Title>
                <Table 
                  dataSource={productData.sort((a, b) => b.交易总金额 - a.交易总金额)}
                  rowKey={(record, index) => index}
                  pagination={false}
                  size="middle"
                  className="product-sales-table"
                  scroll={{ x: false, y: false }}
                  columns={[
                    {
                      title: '排名',
                      key: '排名',
                      width: '8%',
                      render: (_, __, index) => index + 1,
                    },
                    {
                      title: '产品名称',
                      dataIndex: '产品名称',
                      key: '产品名称',
                      width: '42%',
                      ellipsis: true,
                    },
                    {
                      title: '交易金额(元)',
                      dataIndex: '交易总金额',
                      key: '交易总金额',
                      width: '20%',
                      render: (text) => chartOptions.formatAmount(text),
                      sorter: (a, b) => b.交易总金额 - a.交易总金额,
                      defaultSortOrder: 'descend'
                    },
                    {
                      title: '占比',
                      key: '占比',
                      width: '15%',
                      render: (text, record, index) => {
                        // 计算总金额
                        const totalAmount = productData.reduce((sum, item) => sum + item.交易总金额, 0);
                        // 计算占比
                        const percentage = totalAmount ? (record.交易总金额 / totalAmount * 100).toFixed(2) : '0.00';
                        return `${percentage}%`;
                      },
                      sorter: (a, b) => {
                        const totalAmount = productData.reduce((sum, item) => sum + item.交易总金额, 0);
                        return (b.交易总金额 / totalAmount) - (a.交易总金额 / totalAmount);
                      }
                    },
                    {
                      title: '交易笔数',
                      dataIndex: '交易笔数',
                      key: '交易笔数',
                      width: '15%',
                      render: (text) => `${text}笔`,
                    }
                  ]}
                  summary={pageData => {
                    let totalAmount = 0;
                    let totalCount = 0;
                    
                    pageData.forEach(({ 交易总金额, 交易笔数 }) => {
                      totalAmount += 交易总金额;
                      totalCount += 交易笔数;
                    });
                    
                    return (
                      <Table.Summary.Row style={{ fontWeight: 'bold' }}>
                        <Table.Summary.Cell index={0} colSpan={2}>
                          总计
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2}>
                          {chartOptions.formatAmount(totalAmount)}
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={3}>
                          100.00%
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={4}>
                          {totalCount}笔
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    );
                  }}
                />
              </Card>
            </Col>
          </Row>
          
          {/* 项目销售排行图 */}
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col xs={24}>
              <Card className="chart-card">
                <Title level={4} style={{ textAlign: 'center', marginBottom: 16 }}>项目销售排行</Title>
                <Table 
                  dataSource={projectData.sort((a, b) => b.交易总金额 - a.交易总金额)}
                  rowKey={(record, index) => index}
                  pagination={false}
                  size="middle"
                  className="product-sales-table"
                  scroll={{ x: false, y: false }}
                  columns={[
                    {
                      title: '项目名称',
                      dataIndex: '项目名称',
                      key: '项目名称',
                      width: '45%',
                      ellipsis: true,
                    },
                    {
                      title: '交易金额(元)',
                      dataIndex: '交易总金额',
                      key: '交易总金额',
                      width: '25%',
                      render: (text) => chartOptions.formatAmount(text),
                      sorter: (a, b) => b.交易总金额 - a.交易总金额,
                      defaultSortOrder: 'descend'
                    },
                    {
                      title: '占比',
                      key: '占比',
                      width: '15%',
                      render: (text, record, index) => {
                        // 计算总金额
                        const totalAmount = projectData.reduce((sum, item) => sum + item.交易总金额, 0);
                        // 计算占比
                        const percentage = totalAmount ? (record.交易总金额 / totalAmount * 100).toFixed(2) : '0.00';
                        return `${percentage}%`;
                      },
                      sorter: (a, b) => {
                        const totalAmount = projectData.reduce((sum, item) => sum + item.交易总金额, 0);
                        return (b.交易总金额 / totalAmount) - (a.交易总金额 / totalAmount);
                      }
                    },
                    {
                      title: '交易笔数',
                      dataIndex: '交易笔数',
                      key: '交易笔数',
                      width: '15%',
                      render: (text) => `${text}笔`,
                    }
                  ]}
                  summary={pageData => {
                    let totalAmount = 0;
                    let totalCount = 0;
                    
                    pageData.forEach(({ 交易总金额, 交易笔数 }) => {
                      totalAmount += 交易总金额;
                      totalCount += 交易笔数;
                    });
                    
                    return (
                      <Table.Summary.Row style={{ fontWeight: 'bold' }}>
                        <Table.Summary.Cell index={0}>
                          总计
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          {chartOptions.formatAmount(totalAmount)}
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2}>
                          100.00%
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={3}>
                          {totalCount}笔
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    );
                  }}
                />
              </Card>
            </Col>
          </Row>
          
          {/* 添加项目销售分布组件在合适的位置 */}
          <Divider orientation="left">项目销售分析</Divider>
          {renderProjectDistribution()}
        </>
      )}
    </div>
  );
};

export default DataDashboard; 