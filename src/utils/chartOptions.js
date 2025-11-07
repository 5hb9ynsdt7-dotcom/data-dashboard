/**
 * 图表配置工具函数
 */

// 格式化金额（万元/亿元）
export const formatAmount = (value) => {
  if (value >= 100000000) {
    return (value / 100000000).toFixed(2) + '亿';
  } else if (value >= 10000) {
    return (value / 10000).toFixed(2) + '万';
  }
  return Math.round(value).toString();
};

// 理财师业绩排行图表配置
export const getAdvisorRankChartOption = (data, limit = 10) => {
  if (!data || data.length === 0) return null;
  
  // 按交易金额从大到小排序
  const sortedData = [...data].sort((a, b) => b.交易总金额 - a.交易总金额);
  const topAdvisors = sortedData.slice(0, limit);
  const names = topAdvisors.map(item => item.理财师姓名 || `未知(${item.理财师工号})`);
  const amounts = topAdvisors.map(item => item.交易总金额);
  const counts = topAdvisors.map(item => item.交易笔数);
  
  // 反转数组，使最大值显示在最上面
  names.reverse();
  amounts.reverse();
  counts.reverse();
  
  return {
    title: {
      text: '理财师业绩排行',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params) {
        const advisor = params[0].name;
        const value = params[0].value;
        const index = params[0].dataIndex;
        return `${advisor}<br/>交易金额: ${formatAmount(value)}元<br/>交易笔数: ${counts[index]}笔`;
      }
    },
    grid: {
      left: '3%',
      right: '20%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '交易金额',
      nameLocation: 'start',
      position: 'bottom',
      splitLine: {
        show: false
      },
      axisLabel: {
        formatter: function(value) {
          return formatAmount(value);
        },
        fontSize: 10,
        margin: 12
      },
      nameTextStyle: {
        fontSize: 10
      }
    },
    yAxis: {
      type: 'category',
      data: names,
      axisLabel: {
        width: 100,
        overflow: 'truncate',
        interval: 0,
        fontSize: 10
      }
    },
    series: [
      {
        name: '交易金额',
        type: 'bar',
        data: amounts,
        label: {
          show: true,
          position: 'right',
          formatter: function(params) {
            const index = params.dataIndex;
            return `${formatAmount(params.value)}元 (${counts[index]}笔)`;
          },
          fontSize: 10
        },
        tooltip: {
          valueFormatter: value => formatAmount(value) + '元'
        }
      }
    ]
  };
};

// 客户等级分布图表配置
export const getCustomerLevelChartOption = (data) => {
  if (!data || data.length === 0) return null;
  
  const names = data.map(item => item.客户等级);
  const amounts = data.map(item => item.交易总金额);
  const counts = data.map(item => item.交易笔数);
  const customers = data.map(item => item.客户数);
  
  // 计算总金额用于计算占比
  const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);
  
  return {
    title: {
      text: '客户等级分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        const index = params.dataIndex;
        const percentage = ((amounts[index] / totalAmount) * 100).toFixed(2);
        return `${params.name}<br/>
                交易金额: ${formatAmount(amounts[index])}元<br/>
                交易笔数: ${counts[index]}笔<br/>
                客户数: ${customers[index]}个<br/>
                占比: ${percentage}%`;
      }
    },
    legend: {
      top: 'bottom',
      left: 'center'
    },
    series: [
      {
        name: '客户等级',
        type: 'pie',
        radius: ['30%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: function(params) {
            const index = params.dataIndex;
            const percentage = ((amounts[index] / totalAmount) * 100).toFixed(2);
            return `${params.name}\n${formatAmount(amounts[index])}元\n${percentage}%`;
          },
          fontSize: 10
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '12',
            fontWeight: 'bold'
          }
        },
        data: names.map((name, index) => ({
          name,
          value: amounts[index]
        }))
      }
    ]
  };
};

// BU分布图表配置
export const getBUChartOption = (data) => {
  if (!data || data.length === 0) return null;
  
  const names = data.map(item => item.BU);
  const amounts = data.map(item => item.交易总金额);
  const counts = data.map(item => item.交易笔数);
  const customers = data.map(item => item.客户数);
  
  // 计算总金额用于计算占比
  const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);
  
  return {
    title: {
      text: 'BU分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        const index = params.dataIndex;
        const percentage = ((amounts[index] / totalAmount) * 100).toFixed(2);
        return `${params.name}<br/>
                交易金额: ${formatAmount(amounts[index])}元<br/>
                交易笔数: ${counts[index]}笔<br/>
                客户数: ${customers[index]}个<br/>
                占比: ${percentage}%`;
      }
    },
    legend: {
      top: 'bottom',
      left: 'center'
    },
    series: [
      {
        name: 'BU分布',
        type: 'pie',
        radius: '50%',
        data: names.map((name, index) => ({
          name,
          value: amounts[index]
        })),
        label: {
          show: true,
          formatter: function(params) {
            const index = params.dataIndex;
            const percentage = ((amounts[index] / totalAmount) * 100).toFixed(2);
            return `${params.name}\n${formatAmount(amounts[index])}元\n${percentage}%`;
          },
          fontSize: 10
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          },
          label: {
            fontSize: 12,
            fontWeight: 'bold'
          }
        }
      }
    ]
  };
};

// 产品分布图表配置
export const getProductChartOption = (data) => {
  if (!data || data.length === 0) return null;
  
  // 不限制产品数量，显示所有产品
  const names = data.map(item => item.产品名称);
  const amounts = data.map(item => item.交易总金额);
  const counts = data.map(item => item.交易笔数);
  const customers = data.map(item => item.客户数);
  
  return {
    title: {
      text: '产品销售排行',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params) {
        const product = params[0];
        return `${product.name}<br/>
                交易金额: ${formatAmount(product.value)}元<br/>
                交易笔数: ${counts[product.dataIndex]}笔<br/>
                客户数: ${customers[product.dataIndex]}个`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: names,
      axisLabel: {
        interval: 0,
        rotate: 45,
        width: 100,
        overflow: 'truncate',
        fontSize: 9, // 缩小字体
        formatter: function(value) {
          // 超过5个字符的名称折成两行显示
          if (value.length > 5) {
            const midIndex = Math.floor(value.length / 2);
            return value.substring(0, midIndex) + '\n' + value.substring(midIndex);
          }
          return value;
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '交易金额(元)',
      axisLabel: {
        formatter: function(value) {
          return formatAmount(value);
        }
      }
    },
    series: [
      {
        name: '交易金额',
        type: 'bar',
        data: amounts,
        label: {
          show: true,
          position: 'top',
          formatter: function(params) {
            const index = params.dataIndex;
            return formatAmount(params.value) + `(${counts[index]}笔)`;
          },
          fontSize: 10
        }
      }
    ]
  };
};

// 时间趋势图表配置
export const getTimeChartOption = (data) => {
  if (!data || !data.byMonth || data.byMonth.length === 0) return null;
  
  const months = data.byMonth.map(item => item.年月);
  const amounts = data.byMonth.map(item => item.交易总金额);
  const counts = data.byMonth.map(item => item.交易笔数);
  
  return {
    title: {
      text: '交易金额月度趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      },
      formatter: function(params) {
        let result = `${params[0].name}<br/>`;
        params.forEach(param => {
          const color = param.color;
          const seriesName = param.seriesName;
          const value = param.value;
          const valueFormat = seriesName === '交易金额' 
            ? `${formatAmount(value)}元` 
            : `${value}笔`;
          
          result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color};"></span>`;
          result += `${seriesName}: ${valueFormat}<br/>`;
        });
        return result;
      }
    },
    legend: {
      data: ['交易金额', '交易笔数'],
      top: 'bottom'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: true,
        data: months,
        axisLabel: {
          rotate: 45
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '交易金额',
        position: 'left',
        axisLabel: {
          formatter: function(value) {
            return formatAmount(value);
          }
        }
      },
      {
        type: 'value',
        name: '交易笔数',
        position: 'right',
        axisLabel: {
          formatter: '{value}笔'
        }
      }
    ],
    series: [
      {
        name: '交易金额',
        type: 'bar',
        yAxisIndex: 0,
        data: amounts,
        itemStyle: {
          color: '#5470c6'
        },
        barMaxWidth: 50,
        label: {
          show: true,
          position: ['0', '67%'],
          formatter: function(params) {
            return formatAmount(params.value);
          },
          fontSize: 10,
          color: '#fff'
        }
      },
      {
        name: '交易笔数',
        type: 'line',
        yAxisIndex: 1,
        data: counts,
        symbol: 'circle',
        symbolSize: 8,
        smooth: true,
        itemStyle: {
          color: '#91cc75'
        },
        lineStyle: {
          width: 3,
          type: 'solid'
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}笔',
          fontSize: 12
        }
      }
    ]
  };
};

// 主理财师业绩表图表配置
export const getMainAdvisorChartOption = (data, limit = 10) => {
  if (!data || data.length === 0) return null;
  
  // 按交易金额从大到小排序
  const sortedData = [...data].sort((a, b) => b.交易总金额 - a.交易总金额);
  // 限制显示前15名主理财师，避免过于拥挤
  const advisorData = sortedData.slice(0, 15);
  const names = advisorData.map(item => item.主理财师姓名 || `未知(${item.主理财师工号})`);
  const amounts = advisorData.map(item => item.交易总金额);
  const counts = advisorData.map(item => item.交易笔数);
  const customers = advisorData.map(item => item.客户数);
  
  // 反转数组，使最大值显示在最上面
  names.reverse();
  amounts.reverse();
  counts.reverse();
  customers.reverse();
  
  return {
    title: {
      text: '主理财师业绩排行',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params) {
        const advisor = params[0].name;
        const value = params[0].value;
        const index = params[0].dataIndex;
        return `${advisor}<br/>交易金额: ${formatAmount(value)}元<br/>交易笔数: ${counts[index]}笔<br/>客户数: ${customers[index]}人`;
      }
    },
    grid: {
      left: '3%',
      right: '20%',
      bottom: '10%',
      top: '80',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '交易金额',
      nameLocation: 'start',
      position: 'bottom',
      splitLine: {
        show: false
      },
      axisLabel: {
        formatter: function(value) {
          return formatAmount(value);
        },
        fontSize: 10,
        margin: 12
      },
      nameTextStyle: {
        fontSize: 10
      }
    },
    yAxis: {
      type: 'category',
      data: names,
      axisLabel: {
        width: 120,
        overflow: 'truncate',
        interval: 0,
        fontSize: 11,
        margin: 8
      },
      // 添加滚动条以适应大量数据
      axisPointer: {
        show: true
      }
    },
    series: [
      {
        name: '交易金额',
        type: 'bar',
        data: amounts,
        barCategoryGap: '30%',
        label: {
          show: true,
          position: 'right',
          formatter: function(params) {
            const index = params.dataIndex;
            return `${formatAmount(params.value)}元 (${counts[index]}笔)`;
          },
          fontSize: 10
        },
        tooltip: {
          valueFormatter: value => formatAmount(value) + '元'
        }
      }
    ]
  };
};

// 客户等级出单表格配置
export const getCustomerLevelTableOption = (data, totalAmount) => {
  if (!data || data.length === 0) return null;
  
  return {
    title: {
      text: '客户等级出单情况',
      left: 'center',
      textStyle: {
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'item'
    },
    grid: {
      top: '60',
      left: '3%',
      right: '3%',
      bottom: '3%',
      containLabel: true
    },
    dataset: {
      dimensions: ['客户等级', '交易金额', '交易笔数', '金额占比', '单均金额'],
      source: data.map(item => {
        const averageAmount = item.交易总金额 / item.交易笔数;
        const amountPercentage = (item.交易总金额 / totalAmount) * 100;
        return {
          '客户等级': item.客户等级,
          '交易金额': item.交易总金额,
          '交易笔数': item.交易笔数,
          '金额占比': amountPercentage.toFixed(2) + '%',
          '单均金额': averageAmount
        };
      })
    },
    xAxis: { 
      type: 'category',
      axisLabel: {
        fontSize: 9
      }
    },
    yAxis: {
      axisLabel: {
        fontSize: 9
      }
    },
    series: [
      {
        type: 'bar',
        encode: {
          // 使用x轴表示客户等级
          x: '客户等级',
          // 使用y轴表示交易金额
          y: '交易金额'
        },
        label: {
          show: true,
          formatter: function(params) {
            return formatAmount(params.value.交易金额);
          },
          position: 'top'
        },
        itemStyle: {
          color: function(params) {
            // 根据交易金额设置不同颜色深度
            const value = params.value.交易金额;
            const max = Math.max(...data.map(item => item.交易总金额));
            const colorIntensity = Math.max(0.3, value / max);
            return `rgba(70, 130, 180, ${colorIntensity})`;
          }
        }
      }
    ]
  };
};

// 项目名称销售排行图表配置
export const getProjectChartOption = (data, limit = 10) => {
  if (!data || data.length === 0) return null;
  
  // 按交易金额排序并获取前N个项目
  const topProjects = data.slice(0, limit);
  const names = topProjects.map(item => item.项目名称);
  const amounts = topProjects.map(item => item.交易总金额);
  const counts = topProjects.map(item => item.交易笔数);
  
  // 计算总金额用于计算占比
  const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);
  
  return {
    title: {
      text: '项目销售排行',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        const index = params.dataIndex;
        const percentage = ((amounts[index] / totalAmount) * 100).toFixed(2);
        return `${params.name}<br/>
                交易金额: ${formatAmount(amounts[index])}元<br/>
                交易笔数: ${counts[index]}笔<br/>
                占比: ${percentage}%`;
      }
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      right: 10,
      top: 40,
      bottom: 20,
      data: names,
      textStyle: {
        fontSize: 10
      }
    },
    series: [
      {
        name: '项目销售',
        type: 'pie',
        radius: '55%',
        center: ['40%', '50%'],
        data: names.map((name, index) => ({
          name,
          value: amounts[index]
        })),
        label: {
          show: true,
          formatter: function(params) {
            const index = params.dataIndex;
            const percentage = ((amounts[index] / totalAmount) * 100).toFixed(2);
            return `${params.name.length > 8 ? params.name.slice(0, 8) + '...' : params.name}\n${formatAmount(amounts[index])}元\n${percentage}%`;
          },
          fontSize: 10
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          },
          label: {
            fontSize: 12,
            fontWeight: 'bold'
          }
        }
      }
    ]
  };
};

// 理财师与主理财师映射关系百分比堆积柱形图
export const getAdvisorToMainAdvisorStackedChartOption = (data) => {
  if (!data || data.length === 0) return null;
  
  // 按理财师分组
  const advisorGroups = {};
  const mainAdvisorSet = new Set();
  
  data.forEach(item => {
    const advisor = item.理财师;
    const mainAdvisor = item.主理财师;
    const amount = item.交易金额;
    
    if (!advisorGroups[advisor]) {
      advisorGroups[advisor] = {
        理财师: advisor,
        总金额: 0,
        主理财师映射: {}
      };
    }
    
    advisorGroups[advisor].总金额 += amount;
    
    if (!advisorGroups[advisor].主理财师映射[mainAdvisor]) {
      advisorGroups[advisor].主理财师映射[mainAdvisor] = 0;
    }
    
    advisorGroups[advisor].主理财师映射[mainAdvisor] += amount;
    mainAdvisorSet.add(mainAdvisor);
  });
  
  // 转换为数组
  const advisors = Object.values(advisorGroups)
    .sort((a, b) => b.总金额 - a.总金额)
    .slice(0, 10); // 取前10名理财师
  
  // 获取主理财师并按总交易金额排序
  const mainAdvisorTotals = {};
  data.forEach(item => {
    if (!mainAdvisorTotals[item.主理财师]) {
      mainAdvisorTotals[item.主理财师] = 0;
    }
    mainAdvisorTotals[item.主理财师] += item.交易金额;
  });
  
  // 显示所有主理财师，不再限制数量
  const mainAdvisors = Array.from(mainAdvisorSet)
    .sort((a, b) => mainAdvisorTotals[b] - mainAdvisorTotals[a]);
  
  // 为每个理财师计算各主理财师的百分比数据
  const percentData = {};
  advisors.forEach(advisor => {
    percentData[advisor.理财师] = {};
    let totalAmount = advisor.总金额;
    
    // 计算每个主理财师的占比
    mainAdvisors.forEach(mainAdvisor => {
      const amount = advisor.主理财师映射[mainAdvisor] || 0;
      const percentage = (amount / totalAmount) * 100;
      percentData[advisor.理财师][mainAdvisor] = percentage;
    });
  });
  
  // 构建系列数据
  const series = mainAdvisors.map(mainAdvisor => {
    return {
      name: mainAdvisor,
      type: 'bar',
      stack: '总计',
      label: {
        show: true,
        formatter: function(params) {
          // 只有占比大于2%的才显示标签及主理财师姓名
          return params.value > 2 ? `${mainAdvisor}:${params.value.toFixed(1)}%` : '';
        },
        fontSize: 9,
        position: 'inside'
      },
      emphasis: {
        focus: 'series'
      },
      data: advisors.map(advisor => {
        return percentData[advisor.理财师][mainAdvisor] || 0;
      })
    };
  });
  
  return {
    title: {
      text: '',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params) {
        let result = `${params[0].name}<br/>`;
        
        params.forEach(param => {
          if (param.value > 0.5) {
            result += `${param.seriesName}: ${param.value.toFixed(2)}%<br/>`;
          }
        });
        
        return result;
      }
    },
    legend: {
      data: mainAdvisors,
      type: undefined,
      orient: 'horizontal',
      top: 'bottom',
      textStyle: {
        fontSize: 9
      },
      itemWidth: 15,
      itemHeight: 10,
      formatter: function(name) {
        if(name.length > 10) {
          return name.substring(0, 10) + '...';
        }
        return name;
      },
      pageIconSize: 0,
      padding: [5, 10, 5, 10],
      selectedMode: false,
      left: 'center',
      itemGap: 8,
      align: 'auto',
      bottom: 0
    },
    grid: {
      left: '5%',
      right: '4%',
      bottom: '20%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: advisors.map(advisor => advisor.理财师),
      axisLabel: {
        rotate: 30,
        fontSize: 10,
        interval: 0
      }
    },
    yAxis: {
      type: 'value',
      name: '交易金额占比',
      nameTextStyle: {
        fontSize: 10,
        padding: [0, 0, 0, 15]
      },
      nameGap: 25,
      axisLabel: {
        formatter: '{value}%',
        fontSize: 10
      },
      max: 100
    },
    series: series
  };
};

export const getProjectPieChartOption = (data) => {
  if (!data || data.length === 0) return {};
  
  // 按交易金额排序
  const sortedData = [...data].sort((a, b) => b.交易总金额 - a.交易总金额);
  
  // 获取前六名项目
  const topSix = sortedData.slice(0, 6);
  
  // 计算其他项目的总金额
  const otherAmount = sortedData.slice(6).reduce((sum, item) => sum + item.交易总金额, 0);
  
  // 准备饼图数据
  let pieData = topSix.map(item => ({
    name: item.项目名称,
    value: item.交易总金额
  }));
  
  // 如果有其他项目，添加到数据中
  if (otherAmount > 0) {
    pieData.push({
      name: '其他',
      value: otherAmount
    });
  }
  
  // 计算总金额用于百分比显示
  const totalAmount = pieData.reduce((sum, item) => sum + item.value, 0);
  
  return {
    title: {
      text: '项目销售分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const percentage = ((params.value / totalAmount) * 100).toFixed(2);
        return `${params.name}<br/>金额: ${formatAmount(params.value)}元<br/>占比: ${percentage}%`;
      }
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      right: 10,
      top: 100,
      bottom: 20,
      data: pieData.map(item => item.name)
    },
    series: [
      {
        name: '项目销售',
        type: 'pie',
        radius: '50%',
        center: ['40%', '50%'],
        data: pieData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          formatter: '{b}: {d}%'
        }
      }
    ]
  };
}; 