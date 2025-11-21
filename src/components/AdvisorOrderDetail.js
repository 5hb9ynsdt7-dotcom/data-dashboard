import React, { useState, useEffect, useMemo } from 'react';
import { Card, Table, Button, Typography, Row, Col, Statistic } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import * as chartOptions from '../utils/chartOptions';
import { sortByCustomerLevel } from '../utils/chartOptions';

const { Title } = Typography;

const AdvisorOrderDetail = ({ advisorName, performanceData, customerData, onBack }) => {
  const [detailData, setDetailData] = useState(null);

  // 分析理财师详细数据
  const analyzeAdvisorDetail = useMemo(() => {
    if (!advisorName || !performanceData || !customerData || performanceData.length === 0 || customerData.length === 0) {
      return null;
    }

    try {
      // 创建业绩数据的集团号集合
      const performanceGroupIds = new Set();
      performanceData.forEach(item => {
        if (item['集团号']) {
          performanceGroupIds.add(item['集团号'].toString().trim());
        }
      });

      // 筛选出该理财师的客户
      const advisorCustomers = customerData.filter(customer => {
        const collabAdvisorName = customer['正行协作理财师'] ? customer['正行协作理财师'].toString().trim() : '';
        return collabAdvisorName === advisorName;
      });

      // 总计数据按等级分组
      const totalByLevel = new Map();
      // 自拓数据按等级分组
      const directByLevel = new Map();
      // 协同数据按国内理财师+等级分组
      const collabByAdvisorLevel = new Map();

      advisorCustomers.forEach(customer => {
        const groupId = customer['集团号'] ? customer['集团号'].toString().trim() : '';
        const directAdvisorId = customer['国内理财师工号'] ? customer['国内理财师工号'].toString().trim() : '';
        const directAdvisorName = customer['国内理财师'] ? customer['国内理财师'].toString().trim() : '';
        const collabAdvisorId = customer['正行协作理财师工号'] ? customer['正行协作理财师工号'].toString().trim() : '';
        const level = customer['未来会员等级'] ? customer['未来会员等级'].toString().trim() : '未知';
        const investment = customer['客户正行产品存量(人民币,不含雪球)'] || 0;

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

        const isDirectCustomer = directAdvisorId === collabAdvisorId && directAdvisorName === advisorName;

        // 统计总计按等级
        if (!totalByLevel.has(level)) {
          totalByLevel.set(level, {
            等级: level,
            客户总数: 0,
            有单客户数: 0,
            无单客户数: 0,
            客户存量: 0,
            客户交易金额: 0
          });
        }
        const totalLevelData = totalByLevel.get(level);
        totalLevelData.客户总数++;
        totalLevelData.客户存量 += investment;
        if (hasOrdered) {
          totalLevelData.有单客户数++;
          totalLevelData.客户交易金额 += orderAmount;
        } else {
          totalLevelData.无单客户数++;
        }

        if (isDirectCustomer) {
          // 自拓客户按等级统计
          if (!directByLevel.has(level)) {
            directByLevel.set(level, {
              等级: level,
              客户总数: 0,
              有单客户数: 0,
              无单客户数: 0,
              客户存量: 0,
              客户交易金额: 0
            });
          }
          const directLevelData = directByLevel.get(level);
          directLevelData.客户总数++;
          directLevelData.客户存量 += investment;
          if (hasOrdered) {
            directLevelData.有单客户数++;
            directLevelData.客户交易金额 += orderAmount;
          } else {
            directLevelData.无单客户数++;
          }
        } else {
          // 协同客户按国内理财师分组
          if (!collabByAdvisorLevel.has(directAdvisorName)) {
            collabByAdvisorLevel.set(directAdvisorName, {
              国内理财师: directAdvisorName,
              总计: {
                客户总数: 0,
                有单客户数: 0,
                无单客户数: 0,
                客户存量: 0,
                客户交易金额: 0
              },
              等级分布: new Map()
            });
          }

          const collabAdvisorData = collabByAdvisorLevel.get(directAdvisorName);

          // 更新该国内理财师的总计
          collabAdvisorData.总计.客户总数++;
          collabAdvisorData.总计.客户存量 += investment;
          if (hasOrdered) {
            collabAdvisorData.总计.有单客户数++;
            collabAdvisorData.总计.客户交易金额 += orderAmount;
          } else {
            collabAdvisorData.总计.无单客户数++;
          }

          // 按等级统计
          if (!collabAdvisorData.等级分布.has(level)) {
            collabAdvisorData.等级分布.set(level, {
              等级: level,
              客户总数: 0,
              有单客户数: 0,
              无单客户数: 0,
              客户存量: 0,
              客户交易金额: 0
            });
          }
          const collabLevelData = collabAdvisorData.等级分布.get(level);
          collabLevelData.客户总数++;
          collabLevelData.客户存量 += investment;
          if (hasOrdered) {
            collabLevelData.有单客户数++;
            collabLevelData.客户交易金额 += orderAmount;
          } else {
            collabLevelData.无单客户数++;
          }
        }
      });

      // 转换为数组
      const totalByLevelArray = Array.from(totalByLevel.values())
        .sort((a, b) => sortByCustomerLevel(a.等级, b.等级));

      const directByLevelArray = Array.from(directByLevel.values())
        .sort((a, b) => sortByCustomerLevel(a.等级, b.等级));

      const collabByAdvisorArray = Array.from(collabByAdvisorLevel.values())
        .map(advisor => ({
          ...advisor,
          等级分布: Array.from(advisor.等级分布.values())
            .sort((a, b) => sortByCustomerLevel(a.等级, b.等级))
        }))
        .sort((a, b) => b.总计.客户存量 - a.总计.客户存量);

      return {
        totalByLevel: totalByLevelArray,
        directByLevel: directByLevelArray,
        collabByAdvisor: collabByAdvisorArray,
        summary: {
          客户总数: advisorCustomers.length,
          有单客户数: advisorCustomers.filter(c => {
            const groupId = c['集团号'] ? c['集团号'].toString().trim() : '';
            return groupId && performanceGroupIds.has(groupId);
          }).length,
          总存量: advisorCustomers.reduce((sum, c) => sum + (c['客户正行产品存量(人民币,不含雪球)'] || 0), 0)
        }
      };
    } catch (error) {
      console.error('分析理财师详细数据时出错:', error);
      return null;
    }
  }, [advisorName, performanceData, customerData]);

  useEffect(() => {
    setDetailData(analyzeAdvisorDetail);
  }, [analyzeAdvisorDetail]);

  if (!detailData) {
    return <div>加载中...</div>;
  }

  // 表格列定义
  const columns = [
    {
      title: '分类',
      dataIndex: '分类',
      key: '分类',
      width: 250,
      fixed: 'left',
      render: (text, record) => {
        let style = {};
        let displayText = text;

        if (record.类型 === '总计-标题') {
          style = { fontWeight: 'bold', fontSize: '15px', color: '#1890ff', backgroundColor: '#e6f7ff' };
        } else if (record.类型 === '自拓-标题') {
          style = { fontWeight: 'bold', fontSize: '15px', color: '#52c41a', backgroundColor: '#f6ffed' };
        } else if (record.类型 === '协同-标题') {
          style = { fontWeight: 'bold', fontSize: '15px', color: '#fa8c16', backgroundColor: '#fff7e6' };
        } else if (record.类型 === '等级') {
          style = { marginLeft: 20, color: '#595959' };
          displayText = `└─ ${text}`;
        } else if (record.类型 === '国内理财师') {
          style = { marginLeft: 20, fontWeight: 'bold', color: '#722ed1' };
          displayText = `└─ ${text}`;
        } else if (record.类型 === '国内理财师-等级') {
          style = { marginLeft: 40, color: '#8c8c8c', fontSize: '13px' };
          displayText = `└─ ${text}`;
        }

        return <span style={style}>{displayText}</span>;
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
      render: (text) => (
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
      render: (text) => (
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
      }
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

  // 生成表格数据
  const generateTableData = () => {
    const tableData = [];
    let index = 0;

    // 1. 总计部分
    tableData.push({
      key: `total-${index++}`,
      分类: `${advisorName}（总）`,
      类型: '总计-标题',
      客户总数: detailData.totalByLevel.reduce((sum, item) => sum + item.客户总数, 0),
      有单客户数: detailData.totalByLevel.reduce((sum, item) => sum + item.有单客户数, 0),
      无单客户数: detailData.totalByLevel.reduce((sum, item) => sum + item.无单客户数, 0),
      客户存量: detailData.totalByLevel.reduce((sum, item) => sum + item.客户存量, 0),
      客户交易金额: detailData.totalByLevel.reduce((sum, item) => sum + item.客户交易金额, 0)
    });

    detailData.totalByLevel.forEach(level => {
      tableData.push({
        key: `total-level-${index++}`,
        分类: level.等级,
        类型: '等级',
        ...level
      });
    });

    // 2. 自拓部分
    if (detailData.directByLevel.length > 0) {
      tableData.push({
        key: `direct-${index++}`,
        分类: `${advisorName}（自拓）`,
        类型: '自拓-标题',
        客户总数: detailData.directByLevel.reduce((sum, item) => sum + item.客户总数, 0),
        有单客户数: detailData.directByLevel.reduce((sum, item) => sum + item.有单客户数, 0),
        无单客户数: detailData.directByLevel.reduce((sum, item) => sum + item.无单客户数, 0),
        客户存量: detailData.directByLevel.reduce((sum, item) => sum + item.客户存量, 0),
        客户交易金额: detailData.directByLevel.reduce((sum, item) => sum + item.客户交易金额, 0)
      });

      detailData.directByLevel.forEach(level => {
        tableData.push({
          key: `direct-level-${index++}`,
          分类: level.等级,
          类型: '等级',
          ...level
        });
      });
    }

    // 3. 协同部分
    if (detailData.collabByAdvisor.length > 0) {
      tableData.push({
        key: `collab-${index++}`,
        分类: `${advisorName}（协同）`,
        类型: '协同-标题',
        客户总数: detailData.collabByAdvisor.reduce((sum, item) => sum + item.总计.客户总数, 0),
        有单客户数: detailData.collabByAdvisor.reduce((sum, item) => sum + item.总计.有单客户数, 0),
        无单客户数: detailData.collabByAdvisor.reduce((sum, item) => sum + item.总计.无单客户数, 0),
        客户存量: detailData.collabByAdvisor.reduce((sum, item) => sum + item.总计.客户存量, 0),
        客户交易金额: detailData.collabByAdvisor.reduce((sum, item) => sum + item.总计.客户交易金额, 0)
      });

      detailData.collabByAdvisor.forEach(advisor => {
        // 国内理财师汇总行
        tableData.push({
          key: `collab-advisor-${index++}`,
          分类: advisor.国内理财师,
          类型: '国内理财师',
          客户总数: advisor.总计.客户总数,
          有单客户数: advisor.总计.有单客户数,
          无单客户数: advisor.总计.无单客户数,
          客户存量: advisor.总计.客户存量,
          客户交易金额: advisor.总计.客户交易金额
        });

        // 该国内理财师下的等级分布
        advisor.等级分布.forEach(level => {
          tableData.push({
            key: `collab-advisor-level-${index++}`,
            分类: level.等级,
            类型: '国内理财师-等级',
            ...level
          });
        });
      });
    }

    return tableData;
  };

  const tableData = generateTableData();

  return (
    <div style={{ padding: 24 }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={onBack}
        style={{ marginBottom: 16 }}
      >
        返回列表
      </Button>

      <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
        {advisorName} - 客户下单详情分析
      </Title>

      {/* 汇总统计 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="客户总数"
              value={detailData.summary.客户总数}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="有单客户数"
              value={detailData.summary.有单客户数}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="总存量"
              value={detailData.summary.总存量}
              formatter={value => chartOptions.formatAmount(value)}
              suffix="元"
              valueStyle={{ color: '#722ed1' }}
            />
          </Col>
        </Row>
      </Card>

      {/* 详细数据表格 */}
      <Card title="详细分组数据">
        <Table
          dataSource={tableData}
          columns={columns}
          pagination={false}
          scroll={{ x: 1200 }}
          size="middle"
          bordered
          rowClassName={(record) => {
            if (record.类型 === '总计-标题') return 'advisor-total-row';
            if (record.类型 === '自拓-标题') return 'advisor-direct-row';
            if (record.类型 === '协同-标题') return 'advisor-collab-row';
            if (record.类型 === '国内理财师') return 'advisor-collab-sub-row';
            return '';
          }}
        />
        <style>
          {`
            .advisor-total-row {
              background-color: #e6f7ff !important;
              font-weight: bold;
            }
            .advisor-direct-row {
              background-color: #f6ffed !important;
              font-weight: bold;
            }
            .advisor-collab-row {
              background-color: #fff7e6 !important;
              font-weight: bold;
            }
            .advisor-collab-sub-row {
              background-color: #f9f0ff !important;
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
            .ant-table-tbody > tr.advisor-collab-sub-row:hover > td {
              background-color: #efdbff !important;
            }
          `}
        </style>
      </Card>
    </div>
  );
};

export default AdvisorOrderDetail;
