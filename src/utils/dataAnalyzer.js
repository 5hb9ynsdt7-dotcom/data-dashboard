/**
 * 数据分析工具函数
 */

// 根据理财师统计业绩
export const analyzeByFinancialAdvisor = (data) => {
  if (!data || data.length === 0) return [];
  
  const result = {};
  
  data.forEach(item => {
    const advisorId = item['理财师工号'];
    const advisorName = item['理财师'];
    const amount = item['认申购金额人民币'] || 0;
    
    if (!advisorId) return;
    
    if (!result[advisorId]) {
      result[advisorId] = {
        理财师工号: advisorId,
        理财师姓名: advisorName,
        交易总金额: 0,
        交易笔数: 0,
        客户数: new Set(),
      };
    }
    
    result[advisorId].交易总金额 += amount;
    result[advisorId].交易笔数 += 1;
    result[advisorId].客户数.add(item['集团号']);
  });
  
  // 转换为数组并计算客户数量
  return Object.values(result).map(item => ({
    ...item,
    客户数: item.客户数.size,
    客户数统计: Array.from(item.客户数)
  })).sort((a, b) => b.交易总金额 - a.交易总金额);
};

// 根据客户等级分析
export const analyzeByCustomerLevel = (data) => {
  if (!data || data.length === 0) return [];
  
  const result = {};
  
  data.forEach(item => {
    const level = item['客户等级名称'] || '未知';
    const amount = item['认申购金额人民币'] || 0;
    
    if (!result[level]) {
      result[level] = {
        客户等级: level,
        交易总金额: 0,
        交易笔数: 0,
        客户数: new Set(),
      };
    }
    
    result[level].交易总金额 += amount;
    result[level].交易笔数 += 1;
    result[level].客户数.add(item['集团号']);
  });
  
  // 转换为数组
  return Object.values(result).map(item => ({
    ...item,
    客户数: item.客户数.size,
  })).sort((a, b) => b.交易总金额 - a.交易总金额);
};

// 根据BU分析
export const analyzeByBU = (data) => {
  if (!data || data.length === 0) return [];
  
  const result = {};
  
  data.forEach(item => {
    const bu = item['客户当前所属BU'] || '未知';
    const amount = item['认申购金额人民币'] || 0;
    
    if (!result[bu]) {
      result[bu] = {
        BU: bu,
        交易总金额: 0,
        交易笔数: 0,
        客户数: new Set(),
      };
    }
    
    result[bu].交易总金额 += amount;
    result[bu].交易笔数 += 1;
    result[bu].客户数.add(item['集团号']);
  });
  
  // 转换为数组
  return Object.values(result).map(item => ({
    ...item,
    客户数: item.客户数.size,
  })).sort((a, b) => b.交易总金额 - a.交易总金额);
};

// 根据产品分析
export const analyzeByProduct = (data) => {
  if (!data || data.length === 0) return [];
  
  const result = {};
  
  data.forEach(item => {
    const product = item['支线产品名称'] || '未知';
    const amount = item['认申购金额人民币'] || 0;
    
    if (!result[product]) {
      result[product] = {
        产品名称: product,
        交易总金额: 0,
        交易笔数: 0,
        客户数: new Set(),
      };
    }
    
    result[product].交易总金额 += amount;
    result[product].交易笔数 += 1;
    result[product].客户数.add(item['集团号']);
  });
  
  // 转换为数组
  return Object.values(result).map(item => ({
    ...item,
    客户数: item.客户数.size,
  })).sort((a, b) => b.交易总金额 - a.交易总金额);
};

// 根据时间分析
export const analyzeByTime = (data) => {
  if (!data || data.length === 0) return [];
  
  const byYear = {};
  const byMonth = {};
  
  data.forEach(item => {
    if (!item['签约年份'] || !item['签约月份']) return;
    
    const year = item['签约年份'];
    const month = item['签约月份'];
    const yearMonth = `${year}-${month.toString().padStart(2, '0')}`;
    const amount = item['认申购金额人民币'] || 0;
    
    // 按年统计
    if (!byYear[year]) {
      byYear[year] = {
        年份: year,
        交易总金额: 0,
        交易笔数: 0,
      };
    }
    
    byYear[year].交易总金额 += amount;
    byYear[year].交易笔数 += 1;
    
    // 按月统计
    if (!byMonth[yearMonth]) {
      byMonth[yearMonth] = {
        年月: yearMonth,
        年份: year,
        月份: month,
        交易总金额: 0,
        交易笔数: 0,
      };
    }
    
    byMonth[yearMonth].交易总金额 += amount;
    byMonth[yearMonth].交易笔数 += 1;
  });
  
  return {
    byYear: Object.values(byYear).sort((a, b) => a.年份 - b.年份),
    byMonth: Object.values(byMonth).sort((a, b) => a.年月.localeCompare(b.年月)),
  };
};

// 获取数据总览
export const getDataSummary = (data) => {
  if (!data || data.length === 0) return null;
  
  const totalAmount = data.reduce((sum, item) => sum + (item['认申购金额人民币'] || 0), 0);
  const uniqueCustomers = new Set(data.map(item => item['集团号'])).size;
  
  // 获取实际的理财师数量
  const actualAdvisors = analyzeByFinancialAdvisor(data);
  const uniqueAdvisors = actualAdvisors.length;
  
  const uniqueProducts = new Set(data.map(item => item['支线产品名称'])).size;
  
  return {
    交易总金额: totalAmount,
    交易笔数: data.length,
    客户数量: uniqueCustomers,
    理财师数量: uniqueAdvisors,
    产品数量: uniqueProducts,
  };
};

// 根据主理财师统计业绩
export const analyzeByMainAdvisor = (data) => {
  if (!data || data.length === 0) return [];
  
  const result = {};
  
  data.forEach(item => {
    const mainAdvisorId = item['主理财师工号'];
    const mainAdvisorName = item['主理财师姓名'];
    const amount = item['认申购金额人民币'] || 0;
    
    if (!mainAdvisorId && !mainAdvisorName) return;
    
    // 使用工号或姓名作为主键，优先使用工号
    const key = mainAdvisorId || mainAdvisorName;
    
    if (!result[key]) {
      result[key] = {
        主理财师工号: mainAdvisorId,
        主理财师姓名: mainAdvisorName,
        交易总金额: 0,
        交易笔数: 0,
        客户数: new Set(),
      };
    }
    
    result[key].交易总金额 += amount;
    result[key].交易笔数 += 1;
    result[key].客户数.add(item['集团号']);
  });
  
  // 转换为数组并计算客户数量
  return Object.values(result).map(item => ({
    ...item,
    客户数: item.客户数.size,
    客户数统计: Array.from(item.客户数)
  })).sort((a, b) => b.交易总金额 - a.交易总金额);
};

// 根据项目名称分析
export const analyzeByProject = (data) => {
  if (!data || data.length === 0) return [];
  
  const result = {};
  
  data.forEach(item => {
    const project = item['项目名称'] || '未知';
    const amount = item['认申购金额人民币'] || 0;
    
    if (!result[project]) {
      result[project] = {
        项目名称: project,
        交易总金额: 0,
        交易笔数: 0,
        客户数: new Set(),
      };
    }
    
    result[project].交易总金额 += amount;
    result[project].交易笔数 += 1;
    result[project].客户数.add(item['集团号']);
  });
  
  // 转换为数组
  return Object.values(result).map(item => ({
    ...item,
    客户数: item.客户数.size,
  })).sort((a, b) => b.交易总金额 - a.交易总金额);
};

// 分析理财师与主理财师映射关系及交易金额占比
export const analyzeAdvisorToMainAdvisorMapping = (data) => {
  if (!data || data.length === 0) return [];
  
  // 第一步：按理财师分组，计算每个理财师的总交易金额和对应主理财师的交易金额
  const advisorMap = {};
  
  data.forEach(item => {
    const advisorId = item['理财师工号'];
    const advisorName = item['理财师'];
    const mainAdvisorId = item['主理财师工号'];
    const mainAdvisorName = item['主理财师姓名'];
    const amount = item['认申购金额人民币'] || 0;
    
    // 跳过没有理财师信息的记录
    if (!advisorId && !advisorName) return;
    
    // 理财师唯一标识，优先使用工号
    const advisorKey = advisorId || advisorName;
    
    // 主理财师唯一标识，优先使用工号
    const mainAdvisorKey = mainAdvisorId || mainAdvisorName || '未知';
    
    // 初始化理财师记录
    if (!advisorMap[advisorKey]) {
      advisorMap[advisorKey] = {
        理财师工号: advisorId,
        理财师姓名: advisorName,
        交易总金额: 0,
        主理财师映射: {}
      };
    }
    
    // 累加理财师总交易金额
    advisorMap[advisorKey].交易总金额 += amount;
    
    // 初始化主理财师记录
    if (!advisorMap[advisorKey].主理财师映射[mainAdvisorKey]) {
      advisorMap[advisorKey].主理财师映射[mainAdvisorKey] = {
        主理财师工号: mainAdvisorId,
        主理财师姓名: mainAdvisorName,
        交易金额: 0
      };
    }
    
    // 累加主理财师对应的交易金额
    advisorMap[advisorKey].主理财师映射[mainAdvisorKey].交易金额 += amount;
  });
  
  // 第二步：计算占比并转换为表格所需的扁平数据结构
  const result = [];
  
  Object.values(advisorMap).forEach(advisor => {
    const advisorName = advisor.理财师姓名 || advisor.理财师工号 || '未知';
    const totalAmount = advisor.交易总金额;
    
    // 遍历该理财师对应的所有主理财师
    Object.values(advisor.主理财师映射).forEach(mainAdvisor => {
      const mainAdvisorName = mainAdvisor.主理财师姓名 || mainAdvisor.主理财师工号 || '未知';
      const amount = mainAdvisor.交易金额;
      const percentage = (amount / totalAmount * 100).toFixed(2);
      
      // 添加一条理财师-主理财师的映射记录
      result.push({
        理财师: advisorName,
        主理财师: mainAdvisorName,
        交易金额: amount,
        占比: percentage
      });
    });
  });
  
  // 按照交易金额降序排列
  return result.sort((a, b) => b.交易金额 - a.交易金额);
}; 