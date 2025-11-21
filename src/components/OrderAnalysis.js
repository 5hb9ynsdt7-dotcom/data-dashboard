import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Empty, Typography, Row, Col, Statistic, Alert } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, TeamOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import * as chartOptions from '../utils/chartOptions';
import { sortByCustomerLevel } from '../utils/chartOptions';
import AdvisorOrderDetail from './AdvisorOrderDetail';

const { Title } = Typography;

const OrderAnalysis = ({ performanceData, customerData }) => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);

  // 分析下单情况的核心函数
  const analyzeOrderStatus = useCallback(() => {
    console.log('开始分析下单情况...');
    
    if (!performanceData || !customerData || performanceData.length === 0 || customerData.length === 0) {
      console.log('数据不完整，跳过分析');
      return null;
    }

    try {
      // 创建业绩数据的集团号集合 (今年有下单的客户)
      const performanceGroupIds = new Set();
      performanceData.forEach(item => {
        if (item['集团号']) {
          performanceGroupIds.add(item['集团号'].toString().trim());
        }
      });

      console.log('业绩数据中的集团号数量:', performanceGroupIds.size);

      // 分析每个正行协作理财师的客户下单情况
      const advisorAnalysis = new Map();

      customerData.forEach(customer => {
        const groupId = customer['集团号'] ? customer['集团号'].toString().trim() : '';
        const directAdvisorId = customer['国内理财师工号'] ? customer['国内理财师工号'].toString().trim() : '';
        const directAdvisorName = customer['国内理财师'] ? customer['国内理财师'].toString().trim() : '';
        const collabAdvisorId = customer['正行协作理财师工号'] ? customer['正行协作理财师工号'].toString().trim() : '';
        const collabAdvisorName = customer['正行协作理财师'] ? customer['正行协作理财师'].toString().trim() : '';
        const investment = customer['客户正行产品存量(人民币,不含雪球)'] || 0;
        
        // 检查是否今年有下单
        const hasOrdered = groupId && performanceGroupIds.has(groupId);
        
        // 获取该客户今年的交易金额
        let orderAmount = 0;
        if (hasOrdered) {
          performanceData.forEach(perf => {
            if (perf['集团号'] && perf['集团号'].toString().trim() === groupId) {
              orderAmount += perf['认申购金额人民币'] || 0;
            }
          });
        }

        // 只统计正行协作理财师，但分别统计自拓和协同客户
        if (collabAdvisorId && collabAdvisorName) {
          // 初始化理财师数据
          const advisorKey = collabAdvisorName;
          const totalKey = `${advisorKey}-总计`;
          const directKey = `${advisorKey}-自拓`;
          const collabKey = `${advisorKey}-协同`;
          
          // 初始化总计数据
          if (!advisorAnalysis.has(totalKey)) {
            advisorAnalysis.set(totalKey, {
              理财师姓名: collabAdvisorName,
              类型: '总计',
              客户总数: 0,
              有单客户数: 0,
              无单客户数: 0,
              客户存量: 0,
              客户交易金额: 0,
              sortOrder: 0
            });
          }
          
          // 初始化自拓数据
          if (!advisorAnalysis.has(directKey)) {
            advisorAnalysis.set(directKey, {
              理财师姓名: collabAdvisorName,
              类型: '自拓',
              客户总数: 0,
              有单客户数: 0,
              无单客户数: 0,
              客户存量: 0,
              客户交易金额: 0,
              sortOrder: 1
            });
          }
          
          // 初始化协同数据
          if (!advisorAnalysis.has(collabKey)) {
            advisorAnalysis.set(collabKey, {
              理财师姓名: collabAdvisorName,
              类型: '协同',
              客户总数: 0,
              有单客户数: 0,
              无单客户数: 0,
              客户存量: 0,
              客户交易金额: 0,
              sortOrder: 2
            });
          }
          
          // 更新总计数据
          const totalAdvisor = advisorAnalysis.get(totalKey);
          totalAdvisor.客户总数++;
          totalAdvisor.客户存量 += investment;
          if (hasOrdered) {
            totalAdvisor.有单客户数++;
            totalAdvisor.客户交易金额 += orderAmount;
          } else {
            totalAdvisor.无单客户数++;
          }
          
          // 判断是自拓还是协同客户
          const isDirectCustomer = directAdvisorId === collabAdvisorId && directAdvisorName === collabAdvisorName;
          
          if (isDirectCustomer) {
            // 自拓客户
            const directAdvisor = advisorAnalysis.get(directKey);
            directAdvisor.客户总数++;
            directAdvisor.客户存量 += investment;
            if (hasOrdered) {
              directAdvisor.有单客户数++;
              directAdvisor.客户交易金额 += orderAmount;
            } else {
              directAdvisor.无单客户数++;
            }
          } else {
            // 协同客户
            const collabAdvisorData = advisorAnalysis.get(collabKey);
            collabAdvisorData.客户总数++;
            collabAdvisorData.客户存量 += investment;
            if (hasOrdered) {
              collabAdvisorData.有单客户数++;
              collabAdvisorData.客户交易金额 += orderAmount;
            } else {
              collabAdvisorData.无单客户数++;
            }
          }
        }
      });

      // 转换为数组并按理财师分组排序
      const advisorMap = new Map();

      // 先按理财师姓名分组
      for (const [key, value] of advisorAnalysis) {
        const advisorName = value.理财师姓名 ? value.理财师姓名.toString().trim() : '';
        if (!advisorMap.has(advisorName)) {
          advisorMap.set(advisorName, []);
        }
        advisorMap.get(advisorName).push(value);
      }
      
      // 生成最终的数组，每个理财师先显示总计，然后是自拓和协同
      const advisorList = [];

      // 按理财师姓名排序
      const sortedAdvisorNames = Array.from(advisorMap.keys()).sort();

      for (const advisorName of sortedAdvisorNames) {
        // 过滤掉"正行深圳虚拟理财师"
        if (advisorName === '正行深圳虚拟理财师') {
          console.log(`跳过理财师: ${advisorName}`);
          continue;
        }

        const records = advisorMap.get(advisorName);
        // 按类型排序：总计、自拓、协同
        const sortedRecords = records.sort((a, b) => a.sortOrder - b.sortOrder);

        console.log(`理财师 ${advisorName} 的记录:`, sortedRecords.map(r => `${r.理财师姓名}-${r.类型} (sortOrder: ${r.sortOrder})`));

        advisorList.push(...sortedRecords);
      }
      
      console.log('最终的advisorList长度:', advisorList.length);
      console.log('最终的advisorList前10条:', advisorList.slice(0, 10).map(r => `${r.理财师姓名}-${r.类型}`));

      const summary = {
        总客户数: customerData.length,
        有单客户数: new Set(customerData.filter(c => {
          const groupId = c['集团号'] ? c['集团号'].toString().trim() : '';
          return groupId && performanceGroupIds.has(groupId);
        }).map(c => c['集团号'])).size,
        无单客户数: customerData.length - new Set(customerData.filter(c => {
          const groupId = c['集团号'] ? c['集团号'].toString().trim() : '';
          return groupId && performanceGroupIds.has(groupId);
        }).map(c => c['集团号'])).size,
        总存量: customerData.reduce((sum, c) => sum + (c['客户正行产品存量(人民币,不含雪球)'] || 0), 0),
        总交易金额: performanceData.reduce((sum, p) => sum + (p['认申购金额人民币'] || 0), 0),
        下单率: 0
      };
      
      summary.下单率 = summary.总客户数 > 0 ? (summary.有单客户数 / summary.总客户数 * 100) : 0;

      console.log('下单分析完成:', {
        理财师数量: advisorList.length,
        总客户数: summary.总客户数,
        有单客户数: summary.有单客户数,
        下单率: summary.下单率.toFixed(2) + '%'
      });

      // 按等级统计下单率
      const levelOrderRate = {
        全量: new Map(),
        自拓: new Map(),
        协同: new Map()
      };

      customerData.forEach(customer => {
        const groupId = customer['集团号'] ? customer['集团号'].toString().trim() : '';
        const directAdvisorId = customer['国内理财师工号'] ? customer['国内理财师工号'].toString().trim() : '';
        const directAdvisorName = customer['国内理财师'] ? customer['国内理财师'].toString().trim() : '';
        const collabAdvisorId = customer['正行协作理财师工号'] ? customer['正行协作理财师工号'].toString().trim() : '';
        const collabAdvisorName = customer['正行协作理财师'] ? customer['正行协作理财师'].toString().trim() : '';
        const level = customer['未来会员等级'] ? customer['未来会员等级'].toString().trim() : '未知';
        const investment = customer['客户正行产品存量(人民币,不含雪球)'] || 0;

        const hasOrdered = groupId && performanceGroupIds.has(groupId);
        let orderAmount = 0;
        if (hasOrdered) {
          performanceData.forEach(perf => {
            if (perf['集团号'] && perf['集团号'].toString().trim() === groupId) {
              orderAmount += perf['认申购金额人民币'] || 0;
            }
          });
        }

        const isDirectCustomer = directAdvisorId === collabAdvisorId && directAdvisorName === collabAdvisorName;

        // 只统计有正行协作理财师的客户
        if (collabAdvisorId && collabAdvisorName) {
          // 全量统计
          if (!levelOrderRate.全量.has(level)) {
            levelOrderRate.全量.set(level, {
              等级: level,
              客户总数: 0,
              有单客户数: 0,
              无单客户数: 0,
              客户存量: 0,
              客户交易金额: 0
            });
          }
          const allLevelData = levelOrderRate.全量.get(level);
          allLevelData.客户总数++;
          allLevelData.客户存量 += investment;
          if (hasOrdered) {
            allLevelData.有单客户数++;
            allLevelData.客户交易金额 += orderAmount;
          } else {
            allLevelData.无单客户数++;
          }

          // 自拓/协同统计
          if (isDirectCustomer) {
            if (!levelOrderRate.自拓.has(level)) {
              levelOrderRate.自拓.set(level, {
                等级: level,
                客户总数: 0,
                有单客户数: 0,
                无单客户数: 0,
                客户存量: 0,
                客户交易金额: 0
              });
            }
            const directLevelData = levelOrderRate.自拓.get(level);
            directLevelData.客户总数++;
            directLevelData.客户存量 += investment;
            if (hasOrdered) {
              directLevelData.有单客户数++;
              directLevelData.客户交易金额 += orderAmount;
            } else {
              directLevelData.无单客户数++;
            }
          } else {
            if (!levelOrderRate.协同.has(level)) {
              levelOrderRate.协同.set(level, {
                等级: level,
                客户总数: 0,
                有单客户数: 0,
                无单客户数: 0,
                客户存量: 0,
                客户交易金额: 0
              });
            }
            const collabLevelData = levelOrderRate.协同.get(level);
            collabLevelData.客户总数++;
            collabLevelData.客户存量 += investment;
            if (hasOrdered) {
              collabLevelData.有单客户数++;
              collabLevelData.客户交易金额 += orderAmount;
            } else {
              collabLevelData.无单客户数++;
            }
          }
        }
      });

      // 转换为数组并排序
      const levelOrderRateArray = {
        全量: Array.from(levelOrderRate.全量.values()).sort((a, b) => sortByCustomerLevel(a.等级, b.等级)),
        自拓: Array.from(levelOrderRate.自拓.values()).sort((a, b) => sortByCustomerLevel(a.等级, b.等级)),
        协同: Array.from(levelOrderRate.协同.values()).sort((a, b) => sortByCustomerLevel(a.等级, b.等级))
      };

      return {
        advisorList,
        summary,
        levelOrderRate: levelOrderRateArray
      };

    } catch (error) {
      console.error('分析下单情况时出错:', error);
      return null;
    }
  }, [performanceData, customerData]);

  useEffect(() => {
    console.log('useEffect 触发, performanceData.length:', performanceData?.length, 'customerData.length:', customerData?.length);
    const result = analyzeOrderStatus();
    console.log('分析结果:', result?.advisorList?.length, '条记录');
    setAnalysisResult(result);
  }, [analyzeOrderStatus]);

  // 过滤数据
  const getFilteredData = () => {
    if (!analysisResult) return [];
    
    let filteredData = [...analysisResult.advisorList];
    
    console.log('getFilteredData 前10条:', filteredData.slice(0, 10).map(r => `${r.理财师姓名}-${r.类型}`));
    
    // 所有数据都是正行协作理财师，无需额外筛选
    return filteredData;
  };

  // 获取图表数据
  const getChartData = () => {
    const filteredData = getFilteredData();
    
    if (!filteredData || filteredData.length === 0) return null;

    // 正行协作理财师客户下单率图表数据
    const orderData = filteredData
      .filter(advisor => advisor.客户总数 > 0 && advisor.类型 === '总计')
      .map(advisor => ({
        理财师: advisor.理财师姓名,
        有单客户数: advisor.有单客户数,
        无单客户数: advisor.无单客户数,
        总客户数: advisor.客户总数,
        下单率: advisor.客户总数 > 0 ? parseFloat((advisor.有单客户数 / advisor.客户总数 * 100).toFixed(2)) : 0
      }))
      .sort((a, b) => b.下单率 - a.下单率);

    return {
      orderData
    };
  };

  // 获取正行协作理财师客户下单率图表配置
  const getOrderRateChartOption = () => {
    const chartData = getChartData();
    if (!chartData || !chartData.orderData || chartData.orderData.length === 0) return {};

    const data = chartData.orderData;
    
    return {
      title: {
        text: '正行协作理财师客户下单率排行',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'bold' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: function(params) {
          const data = params[0];
          const index = data.dataIndex;
          const item = chartData.orderData[index];
          return `${item.理财师}<br/>
                  总客户数: ${item.总客户数}人<br/>
                  有单客户: ${item.有单客户数}人<br/>
                  无单客户: ${item.无单客户数}人<br/>
                  下单率: ${item.下单率.toFixed(2)}%`;
        }
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item.理财师),
        axisLabel: {
          rotate: 45,
          interval: 0,
          fontSize: 10
        }
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLabel: {
          formatter: '{value}%'
        }
      },
      series: [{
        type: 'bar',
        data: data.map(item => item.下单率),
        itemStyle: {
          color: function(params) {
            const rate = params.value;
            if (rate >= 80) return '#52c41a';
            if (rate >= 60) return '#faad14';
            if (rate >= 40) return '#fa8c16';
            return '#f5222d';
          }
        },
        label: {
          show: true,
          position: 'top',
          formatter: (params) => `${params.value.toFixed(2)}%`
        }
      }],
      grid: {
        bottom: 100
      }
    };
  };

  if (!performanceData || !customerData || performanceData.length === 0 || customerData.length === 0) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          message="数据不完整"
          description="需要同时上传业绩数据和客户数据才能进行下单分析"
          type="warning"
          showIcon
        />
      </div>
    );
  }

  if (!analysisResult) {
    return <Empty description="正在分析数据..." />;
  }

  const filteredData = getFilteredData();
  
  console.log('渲染Table前的filteredData前10条:', filteredData.slice(0, 10).map(r => `${r.理财师姓名}-${r.类型}`));

  // 表格列定义
  const columns = [
    {
      title: '正行协作理财师',
      dataIndex: '理财师姓名',
      key: '理财师姓名',
      width: 180,
      fixed: 'left',
      render: (text, record) => {
        if (record.类型 === '总计') {
          return (
            <span
              style={{
                fontWeight: 'bold',
                fontSize: '14px',
                color: '#1890ff',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
              onClick={() => setSelectedAdvisor(text)}
            >
              {text}（总）
            </span>
          );
        } else if (record.类型 === '自拓') {
          return (
            <span style={{
              color: '#52c41a',
              marginLeft: 20,
              fontSize: '13px'
            }}>
              └─ {text}（自拓）
            </span>
          );
        } else if (record.类型 === '协同') {
          return (
            <span style={{
              color: '#fa8c16',
              marginLeft: 20,
              fontSize: '13px'
            }}>
              └─ {text}（协同）
            </span>
          );
        }
        return text;
      }
    },
    {
      title: '客户总数',
      dataIndex: '客户总数',
      key: '客户总数',
      width: 100,
      render: (text) => text || 0
    },
    {
      title: '有单客户数',
      dataIndex: '有单客户数',
      key: '有单客户数',
      width: 120,
      render: (text, record) => (
        <span style={{ color: '#52c41a' }}>
          <CheckCircleOutlined style={{ marginRight: 4 }} />
          {text || 0}
        </span>
      )
    },
    {
      title: '无单客户数',
      dataIndex: '无单客户数',
      key: '无单客户数',
      width: 120,
      render: (text, record) => (
        <span style={{ color: '#f5222d' }}>
          <CloseCircleOutlined style={{ marginRight: 4 }} />
          {text || 0}
        </span>
      )
    },
    {
      title: '下单率',
      key: '下单率',
      width: 100,
      render: (text, record) => {
        const rate = record.客户总数 > 0 ? (record.有单客户数 / record.客户总数 * 100) : 0;
        const color = rate >= 80 ? '#52c41a' : rate >= 60 ? '#faad14' : rate >= 40 ? '#fa8c16' : '#f5222d';
        return <span style={{ color, fontWeight: 'bold' }}>{rate.toFixed(1)}%</span>;
      },
    },
    {
      title: '存量(万元)',
      dataIndex: '客户存量',
      key: '客户存量',
      width: 150,
      render: (text) => chartOptions.formatAmount(text || 0)
    },
    {
      title: '交易金额(万元)',
      dataIndex: '客户交易金额',
      key: '客户交易金额',
      width: 160,
      render: (text) => chartOptions.formatAmount(text || 0)
    }
  ];

  // 如果选中了理财师，显示详情页
  if (selectedAdvisor) {
    return (
      <AdvisorOrderDetail
        advisorName={selectedAdvisor}
        performanceData={performanceData}
        customerData={customerData}
        onBack={() => setSelectedAdvisor(null)}
      />
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
        客户下单分析
      </Title>

      {/* 汇总统计 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={4}>
            <Statistic
              title="总客户数"
              value={analysisResult.summary.总客户数}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title="有单客户数"
              value={analysisResult.summary.有单客户数}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title="无单客户数"
              value={analysisResult.summary.无单客户数}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title="整体下单率"
              value={analysisResult.summary.下单率}
              precision={2}
              suffix="%"
              valueStyle={{ 
                color: analysisResult.summary.下单率 >= 60 ? '#52c41a' : '#fa8c16' 
              }}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title="总存量"
              value={analysisResult.summary.总存量}
              precision={0}
              suffix="元"
              formatter={value => chartOptions.formatAmount(value)}
              valueStyle={{ color: '#722ed1' }}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title="总交易金额"
              value={analysisResult.summary.总交易金额}
              precision={0}
              suffix="元"
              formatter={value => chartOptions.formatAmount(value)}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Col>
        </Row>
      </Card>

      {/* 按等级统计下单率 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {/* 全量客户 */}
        <Col span={8}>
          <Card title="全量客户等级下单率" size="small">
            <Table
              dataSource={analysisResult.levelOrderRate.全量}
              columns={[
                {
                  title: '客户等级',
                  dataIndex: '等级',
                  key: '等级',
                  width: 100,
                },
                {
                  title: '客户数',
                  dataIndex: '客户总数',
                  key: '客户总数',
                  width: 80,
                },
                {
                  title: '有单',
                  dataIndex: '有单客户数',
                  key: '有单客户数',
                  width: 70,
                  render: (text) => (
                    <span style={{ color: '#52c41a' }}>
                      {text || 0}
                    </span>
                  )
                },
                {
                  title: '下单率',
                  key: '下单率',
                  width: 90,
                  render: (text, record) => {
                    const rate = record.客户总数 > 0 ? (record.有单客户数 / record.客户总数 * 100) : 0;
                    const color = rate >= 80 ? '#52c41a' : rate >= 60 ? '#faad14' : rate >= 40 ? '#fa8c16' : '#f5222d';
                    return <span style={{ color, fontWeight: 'bold' }}>{rate.toFixed(1)}%</span>;
                  }
                }
              ]}
              rowKey="等级"
              pagination={false}
              size="small"
              bordered
            />
          </Card>
        </Col>

        {/* 自拓客户 */}
        <Col span={8}>
          <Card title="自拓客户等级下单率" size="small">
            <Table
              dataSource={analysisResult.levelOrderRate.自拓}
              columns={[
                {
                  title: '客户等级',
                  dataIndex: '等级',
                  key: '等级',
                  width: 100,
                },
                {
                  title: '客户数',
                  dataIndex: '客户总数',
                  key: '客户总数',
                  width: 80,
                },
                {
                  title: '有单',
                  dataIndex: '有单客户数',
                  key: '有单客户数',
                  width: 70,
                  render: (text) => (
                    <span style={{ color: '#52c41a' }}>
                      {text || 0}
                    </span>
                  )
                },
                {
                  title: '下单率',
                  key: '下单率',
                  width: 90,
                  render: (text, record) => {
                    const rate = record.客户总数 > 0 ? (record.有单客户数 / record.客户总数 * 100) : 0;
                    const color = rate >= 80 ? '#52c41a' : rate >= 60 ? '#faad14' : rate >= 40 ? '#fa8c16' : '#f5222d';
                    return <span style={{ color, fontWeight: 'bold' }}>{rate.toFixed(1)}%</span>;
                  }
                }
              ]}
              rowKey="等级"
              pagination={false}
              size="small"
              bordered
            />
          </Card>
        </Col>

        {/* 协同客户 */}
        <Col span={8}>
          <Card title="协同客户等级下单率" size="small">
            <Table
              dataSource={analysisResult.levelOrderRate.协同}
              columns={[
                {
                  title: '客户等级',
                  dataIndex: '等级',
                  key: '等级',
                  width: 100,
                },
                {
                  title: '客户数',
                  dataIndex: '客户总数',
                  key: '客户总数',
                  width: 80,
                },
                {
                  title: '有单',
                  dataIndex: '有单客户数',
                  key: '有单客户数',
                  width: 70,
                  render: (text) => (
                    <span style={{ color: '#52c41a' }}>
                      {text || 0}
                    </span>
                  )
                },
                {
                  title: '下单率',
                  key: '下单率',
                  width: 90,
                  render: (text, record) => {
                    const rate = record.客户总数 > 0 ? (record.有单客户数 / record.客户总数 * 100) : 0;
                    const color = rate >= 80 ? '#52c41a' : rate >= 60 ? '#faad14' : rate >= 40 ? '#fa8c16' : '#f5222d';
                    return <span style={{ color, fontWeight: 'bold' }}>{rate.toFixed(1)}%</span>;
                  }
                }
              ]}
              rowKey="等级"
              pagination={false}
              size="small"
              bordered
            />
          </Card>
        </Col>
      </Row>

      {/* 图表展示 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card>
            <ReactECharts
              option={getOrderRateChartOption()}
              style={{ height: 400 }}
              notMerge={true}
            />
          </Card>
        </Col>
      </Row>

      {/* 详细数据表格 */}
      <Card title="正行协作理财师下单详情表" style={{ marginBottom: 24 }}>
        <style>
          {`
            .advisor-total-row {
              background-color: #e6f7ff !important;
              font-weight: bold;
            }
            .advisor-direct-row {
              background-color: #f6ffed !important;
            }
            .advisor-collab-row {
              background-color: #fff7e6 !important;
            }
            .ant-table-tbody > tr.advisor-total-row:hover > td {
              background-color: #bae7ff !important;
            }
            .ant-table-tbody > tr.advisor-direct-row:hover > td {
              background-color: #d9f7be !important;
            }
            .ant-table-tbody > tr.advisor-collab-row:hover > td {
              background-color: #ffe7ba !important;
            }
          `}
        </style>
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey={(record, index) => `${record.理财师姓名}-${record.类型}-${index}`}
          rowClassName={(record) => {
            if (record.类型 === '总计') return 'advisor-total-row';
            if (record.类型 === '自拓') return 'advisor-direct-row';
            if (record.类型 === '协同') return 'advisor-collab-row';
            return '';
          }}
          pagination={false}
          scroll={{ x: 1200 }}
          size="middle"
          bordered
          summary={pageData => {
            // 只统计总计行的数据
            const totalRows = pageData.filter(item => item.类型 === '总计');
            const totalCustomers = totalRows.reduce((sum, item) => sum + (item.客户总数 || 0), 0);
            const totalOrdered = totalRows.reduce((sum, item) => sum + (item.有单客户数 || 0), 0);
            const totalUnordered = totalRows.reduce((sum, item) => sum + (item.无单客户数 || 0), 0);
            const totalInvestment = totalRows.reduce((sum, item) => sum + (item.客户存量 || 0), 0);
            const totalTransaction = totalRows.reduce((sum, item) => sum + (item.客户交易金额 || 0), 0);

            const orderRate = totalCustomers > 0 ? (totalOrdered / totalCustomers * 100) : 0;

            return (
              <Table.Summary.Row style={{ fontWeight: 'bold', backgroundColor: '#fafafa' }}>
                <Table.Summary.Cell index={0}>总合计</Table.Summary.Cell>
                <Table.Summary.Cell index={1}>{totalCustomers}</Table.Summary.Cell>
                <Table.Summary.Cell index={2}>{totalOrdered}</Table.Summary.Cell>
                <Table.Summary.Cell index={3}>{totalUnordered}</Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
                  <span style={{ 
                    color: orderRate >= 60 ? '#52c41a' : '#fa8c16', 
                    fontWeight: 'bold' 
                  }}>
                    {orderRate.toFixed(1)}%
                  </span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5}>{chartOptions.formatAmount(totalInvestment)}</Table.Summary.Cell>
                <Table.Summary.Cell index={6}>{chartOptions.formatAmount(totalTransaction)}</Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </Card>
    </div>
  );
};

export default OrderAnalysis;