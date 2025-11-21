import React, { useMemo } from 'react';
import { Card, Table, Row, Col, Statistic } from 'antd';
import * as echarts from 'echarts';
import ReactECharts from 'echarts-for-react';
import { formatAmount } from '../utils/chartOptions';

const StrategyDistribution = ({ performanceData, strategyData }) => {
  const analysisData = useMemo(() => {
    if (!performanceData || !strategyData || performanceData.length === 0 || strategyData.length === 0) {
      return null;
    }

    const currentYear = new Date().getFullYear();

    const yearlyData = performanceData.filter(item => {
      return item['签约年份'] === currentYear;
    });

    if (yearlyData.length === 0) {
      return null;
    }

    const strategyMap = {};
    strategyData.forEach(item => {
      const code = item['产品代码'];
      if (code) {
        strategyMap[code] = {
          大类策略: item['大类策略'] || '未知',
          细分策略: item['细分策略'] || '未知',
          是否QD: item['是否QD'] || '未知'
        };
      }
    });

    const majorStrategyStats = {};
    const detailStrategyStats = {};
    let matchedCount = 0;
    let unmatchedCount = 0;
    let matchedAmount = 0;
    let unmatchedAmount = 0;

    yearlyData.forEach(item => {
      const productCode = item['产品代码'];
      const amount = item['认申购金额人民币'] || 0;

      if (productCode && strategyMap[productCode]) {
        matchedCount++;
        matchedAmount += amount;

        const { 大类策略, 细分策略 } = strategyMap[productCode];

        if (!majorStrategyStats[大类策略]) {
          majorStrategyStats[大类策略] = {
            策略名称: 大类策略,
            交易总金额: 0,
            交易笔数: 0,
            客户数: new Set(),
          };
        }
        majorStrategyStats[大类策略].交易总金额 += amount;
        majorStrategyStats[大类策略].交易笔数 += 1;
        majorStrategyStats[大类策略].客户数.add(item['集团号']);

        if (!detailStrategyStats[细分策略]) {
          detailStrategyStats[细分策略] = {
            策略名称: 细分策略,
            所属大类: 大类策略,
            交易总金额: 0,
            交易笔数: 0,
            客户数: new Set(),
          };
        }
        detailStrategyStats[细分策略].交易总金额 += amount;
        detailStrategyStats[细分策略].交易笔数 += 1;
        detailStrategyStats[细分策略].客户数.add(item['集团号']);
      } else {
        unmatchedCount++;
        unmatchedAmount += amount;
      }
    });

    const majorStrategyArray = Object.values(majorStrategyStats).map(item => ({
      ...item,
      客户数: item.客户数.size,
    })).sort((a, b) => b.交易总金额 - a.交易总金额);

    const detailStrategyArray = Object.values(detailStrategyStats).map(item => ({
      ...item,
      客户数: item.客户数.size,
    })).sort((a, b) => b.交易总金额 - a.交易总金额);

    return {
      总交易笔数: yearlyData.length,
      总交易金额: yearlyData.reduce((sum, item) => sum + (item['认申购金额人民币'] || 0), 0),
      匹配笔数: matchedCount,
      匹配金额: matchedAmount,
      未匹配笔数: unmatchedCount,
      未匹配金额: unmatchedAmount,
      匹配率: ((matchedCount / yearlyData.length) * 100).toFixed(2),
      大类策略分布: majorStrategyArray,
      细分策略分布: detailStrategyArray,
    };
  }, [performanceData, strategyData]);

  if (!analysisData) {
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p>暂无数据，请先上传业绩数据和策略数据</p>
          </div>
        </Card>
      </div>
    );
  }

  const majorStrategyColumns = [
    {
      title: '大类策略',
      dataIndex: '策略名称',
      key: '策略名称',
      width: 150,
    },
    {
      title: '交易总金额',
      dataIndex: '交易总金额',
      key: '交易总金额',
      width: 150,
      render: (val) => formatAmount(val),
      sorter: (a, b) => a.交易总金额 - b.交易总金额,
    },
    {
      title: '交易笔数',
      dataIndex: '交易笔数',
      key: '交易笔数',
      width: 100,
      sorter: (a, b) => a.交易笔数 - b.交易笔数,
    },
    {
      title: '客户数',
      dataIndex: '客户数',
      key: '客户数',
      width: 100,
      sorter: (a, b) => a.客户数 - b.客户数,
    },
  ];

  const detailStrategyColumns = [
    {
      title: '细分策略',
      dataIndex: '策略名称',
      key: '策略名称',
      width: 150,
    },
    {
      title: '所属大类',
      dataIndex: '所属大类',
      key: '所属大类',
      width: 120,
    },
    {
      title: '交易总金额',
      dataIndex: '交易总金额',
      key: '交易总金额',
      width: 150,
      render: (val) => formatAmount(val),
      sorter: (a, b) => a.交易总金额 - b.交易总金额,
    },
    {
      title: '交易笔数',
      dataIndex: '交易笔数',
      key: '交易笔数',
      width: 100,
      sorter: (a, b) => a.交易笔数 - b.交易笔数,
    },
    {
      title: '客户数',
      dataIndex: '客户数',
      key: '客户数',
      width: 100,
      sorter: (a, b) => a.客户数 - b.客户数,
    },
  ];

  const majorStrategyChartOption = {
    title: {
      text: '大类策略交易金额分布',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        return `${params.name}<br/>金额: ${formatAmount(params.value)}<br/>占比: ${params.percent.toFixed(2)}%`;
      },
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
    },
    series: [
      {
        type: 'pie',
        radius: '60%',
        data: analysisData.大类策略分布.map(item => ({
          name: item.策略名称,
          value: item.交易总金额,
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        label: {
          formatter: '{b}\n{d}%',
        },
      },
    ],
  };

  const detailStrategyChartOption = {
    title: {
      text: '细分策略交易金额 TOP 10',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params) => {
        const item = params[0];
        return `${item.name}<br/>金额: ${formatAmount(item.value)}`;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value) => {
          if (value >= 100000000) {
            return (value / 100000000).toFixed(1) + '亿';
          } else if (value >= 10000) {
            return (value / 10000).toFixed(1) + '万';
          }
          return value;
        },
      },
    },
    yAxis: {
      type: 'category',
      data: analysisData.细分策略分布.slice(0, 10).map(item => item.策略名称).reverse(),
    },
    series: [
      {
        type: 'bar',
        data: analysisData.细分策略分布.slice(0, 10).map(item => item.交易总金额).reverse(),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' },
          ]),
        },
        label: {
          show: true,
          position: 'right',
          formatter: (params) => formatAmount(params.value),
        },
      },
    ],
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>
        {new Date().getFullYear()}年策略分布分析
      </h2>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总交易笔数"
              value={analysisData.总交易笔数}
              suffix="笔"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总交易金额"
              value={analysisData.总交易金额}
              formatter={(value) => formatAmount(value)}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="匹配笔数"
              value={analysisData.匹配笔数}
              suffix="笔"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="匹配率"
              value={analysisData.匹配率}
              suffix="%"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card>
            <ReactECharts option={majorStrategyChartOption} style={{ height: 400 }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <ReactECharts option={detailStrategyChartOption} style={{ height: 400 }} />
          </Card>
        </Col>
      </Row>

      <Card title="大类策略分布详情" style={{ marginBottom: 24 }}>
        <Table
          dataSource={analysisData.大类策略分布}
          columns={majorStrategyColumns}
          rowKey="策略名称"
          pagination={false}
          size="small"
          bordered
        />
      </Card>

      <Card title="细分策略分布详情">
        <Table
          dataSource={analysisData.细分策略分布}
          columns={detailStrategyColumns}
          rowKey="策略名称"
          pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
          size="small"
          bordered
        />
      </Card>
    </div>
  );
};

export default StrategyDistribution;
