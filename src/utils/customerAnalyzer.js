// 客户数据分析工具函数
import { sortByCustomerLevel } from './chartOptions';

// 分析客户数据：按正行理财师、客户等级、自拓/协同分类统计
export const analyzeCustomerData = (customerData, performanceData = null) => {
  if (!customerData || customerData.length === 0) {
    return {
      advisorAnalysis: [],
      levelAnalysis: [],
      collaborationAnalysis: [],
      summary: {
        totalCustomers: 0,
        totalInvestment: 0,
        selfDevelopedCustomers: 0,
        collaborativeCustomers: 0,
        selfDevelopedInvestment: 0,
        collaborativeInvestment: 0,
        selfDevelopedActualInvestment: 0,
        collaborativeActualInvestment: 0,
      }
    };
  }

  // 如果有业绩数据，计算最新年份的实际投资额
  // 自动检测数据中的最新年份
  let targetYear = new Date().getFullYear();
  if (performanceData && performanceData.length > 0) {
    const years = performanceData
      .map(item => item['签约年份'])
      .filter(year => year && !isNaN(year));
    if (years.length > 0) {
      targetYear = Math.max(...years);
    }
  }

  const actualInvestmentMap = {}; // { groupId: actualAmount }

  if (performanceData && performanceData.length > 0) {
    performanceData.forEach(item => {
      if (item['签约年份'] === targetYear) {
        const groupId = item['集团号'] ? item['集团号'].toString().trim() : '';
        const amount = Number(item['认申购金额人民币']) || 0;

        if (groupId) {
          if (!actualInvestmentMap[groupId]) {
            actualInvestmentMap[groupId] = 0;
          }
          actualInvestmentMap[groupId] += amount;
        }
      }
    });
  }

  // 1. 按正行理财师分组分析
  const advisorMap = new Map();
  
  customerData.forEach(customer => {
    const advisor = customer['正行协作理财师'] || '未知';
    const advisorId = customer['正行协作理财师工号'] || '未知';
    const level = customer['未来会员等级'] || '未知';
    const investment = Number(customer['客户正行产品存量(人民币,不含雪球)']) || 0;
    const isSelfDeveloped = customer['正行协作理财师'] === customer['全球主AR'];
    
    const key = `${advisor}-${advisorId}`;
    
    if (!advisorMap.has(key)) {
      advisorMap.set(key, {
        理财师姓名: advisor,
        理财师工号: advisorId,
        客户总数: 0,
        存量总额: 0,
        自拓客户数: 0,
        协同客户数: 0,
        自拓存量: 0,
        协同存量: 0,
        等级分布: new Map()
      });
    }
    
    const advisorData = advisorMap.get(key);
    advisorData.客户总数++;
    advisorData.存量总额 += investment;
    
    if (isSelfDeveloped) {
      advisorData.自拓客户数++;
      advisorData.自拓存量 += investment;
    } else {
      advisorData.协同客户数++;
      advisorData.协同存量 += investment;
    }
    
    // 等级分布
    if (!advisorData.等级分布.has(level)) {
      advisorData.等级分布.set(level, {
        自拓客户数: 0,
        协同客户数: 0,
        自拓存量: 0,
        协同存量: 0
      });
    }
    
    const levelData = advisorData.等级分布.get(level);
    if (isSelfDeveloped) {
      levelData.自拓客户数++;
      levelData.自拓存量 += investment;
    } else {
      levelData.协同客户数++;
      levelData.协同存量 += investment;
    }
  });

  // 2. 按客户等级分组分析
  const levelMap = new Map();

  customerData.forEach(customer => {
    const level = customer['未来会员等级'] || '未知';
    const investment = Number(customer['客户正行产品存量(人民币,不含雪球)']) || 0;
    const isSelfDeveloped = customer['正行协作理财师'] === customer['全球主AR'];
    
    if (!levelMap.has(level)) {
      levelMap.set(level, {
        客户等级: level,
        客户总数: 0,
        存量总额: 0,
        自拓客户数: 0,
        协同客户数: 0,
        自拓存量: 0,
        协同存量: 0
      });
    }
    
    const levelData = levelMap.get(level);
    levelData.客户总数++;
    levelData.存量总额 += investment;
    
    if (isSelfDeveloped) {
      levelData.自拓客户数++;
      levelData.自拓存量 += investment;
    } else {
      levelData.协同客户数++;
      levelData.协同存量 += investment;
    }
  });

  // 3. 协作类型分析
  const collaborationAnalysis = [
    {
      类型: '自拓客户',
      客户数: 0,
      存量总额: 0,
      实际投资额: 0,
      占比客户数: 0,
      占比存量: 0,
      占比投资额: 0
    },
    {
      类型: '协同客户',
      客户数: 0,
      存量总额: 0,
      实际投资额: 0,
      占比客户数: 0,
      占比存量: 0,
      占比投资额: 0
    }
  ];

  const totalCustomers = customerData.length;
  const totalInvestment = customerData.reduce((sum, customer) =>
    sum + (Number(customer['客户正行产品存量(人民币,不含雪球)']) || 0), 0);

  // 计算总实际投资额
  const totalActualInvestment = Object.values(actualInvestmentMap).reduce((sum, amount) => sum + amount, 0);

  customerData.forEach(customer => {
    const investment = Number(customer['客户正行产品存量(人民币,不含雪球)']) || 0;
    const isSelfDeveloped = customer['正行协作理财师'] === customer['全球主AR'];
    const groupId = customer['集团号'] ? customer['集团号'].toString().trim() : '';
    const actualInvestment = actualInvestmentMap[groupId] || 0;

    if (isSelfDeveloped) {
      collaborationAnalysis[0].客户数++;
      collaborationAnalysis[0].存量总额 += investment;
      collaborationAnalysis[0].实际投资额 += actualInvestment;
    } else {
      collaborationAnalysis[1].客户数++;
      collaborationAnalysis[1].存量总额 += investment;
      collaborationAnalysis[1].实际投资额 += actualInvestment;
    }
  });

  // 计算占比
  collaborationAnalysis[0].占比客户数 = totalCustomers > 0 ? (collaborationAnalysis[0].客户数 / totalCustomers * 100) : 0;
  collaborationAnalysis[0].占比存量 = totalInvestment > 0 ? (collaborationAnalysis[0].存量总额 / totalInvestment * 100) : 0;
  collaborationAnalysis[0].占比投资额 = totalActualInvestment > 0 ? (collaborationAnalysis[0].实际投资额 / totalActualInvestment * 100) : 0;

  collaborationAnalysis[1].占比客户数 = totalCustomers > 0 ? (collaborationAnalysis[1].客户数 / totalCustomers * 100) : 0;
  collaborationAnalysis[1].占比存量 = totalInvestment > 0 ? (collaborationAnalysis[1].存量总额 / totalInvestment * 100) : 0;
  collaborationAnalysis[1].占比投资额 = totalActualInvestment > 0 ? (collaborationAnalysis[1].实际投资额 / totalActualInvestment * 100) : 0;

  // 转换Map为数组并排序
  const advisorAnalysis = Array.from(advisorMap.values())
    .map(advisor => {
      // 将等级分布Map转换为数组
      const levelDistribution = Array.from(advisor.等级分布.entries()).map(([level, data]) => ({
        等级: level,
        ...data
      }));
      
      return {
        ...advisor,
        等级分布: levelDistribution
      };
    })
    .sort((a, b) => b.存量总额 - a.存量总额);

  const levelAnalysis = Array.from(levelMap.values())
    .sort((a, b) => sortByCustomerLevel(a.客户等级, b.客户等级));

  // 汇总数据
  const summary = {
    totalCustomers,
    totalInvestment,
    selfDevelopedCustomers: collaborationAnalysis[0].客户数,
    collaborativeCustomers: collaborationAnalysis[1].客户数,
    selfDevelopedInvestment: collaborationAnalysis[0].存量总额,
    collaborativeInvestment: collaborationAnalysis[1].存量总额,
    selfDevelopedActualInvestment: collaborationAnalysis[0].实际投资额,
    collaborativeActualInvestment: collaborationAnalysis[1].实际投资额
  };

  return {
    advisorAnalysis,
    levelAnalysis,
    collaborationAnalysis,
    summary
  };
};

// 获取理财师详细分析（包含等级分布）
export const getAdvisorDetailAnalysis = (customerData, advisorId) => {
  if (!customerData || customerData.length === 0) return null;
  
  const advisorCustomers = customerData.filter(
    customer => customer['正行协作理财师工号'] === advisorId
  );
  
  if (advisorCustomers.length === 0) return null;
  
  const levelMap = new Map();

  advisorCustomers.forEach(customer => {
    const level = customer['未来会员等级'] || '未知';
    const investment = Number(customer['客户正行产品存量(人民币,不含雪球)']) || 0;
    const isSelfDeveloped = customer['正行协作理财师'] === customer['全球主AR'];
    
    if (!levelMap.has(level)) {
      levelMap.set(level, {
        等级: level,
        自拓客户数: 0,
        协同客户数: 0,
        自拓存量: 0,
        协同存量: 0,
        客户明细: []
      });
    }
    
    const levelData = levelMap.get(level);
    
    if (isSelfDeveloped) {
      levelData.自拓客户数++;
      levelData.自拓存量 += investment;
    } else {
      levelData.协同客户数++;
      levelData.协同存量 += investment;
    }
    
    levelData.客户明细.push({
      客户姓名: customer['客户姓名(遮蔽)'],
      集团号: customer['集团号'],
      投资额: investment,
      类型: isSelfDeveloped ? '自拓' : '协同',
      全球主AR: customer['全球主AR'],
      所属财富中心: customer['所属财富中心']
    });
  });
  
  return {
    理财师: advisorCustomers[0]['正行协作理财师'],
    理财师工号: advisorId,
    等级分布: Array.from(levelMap.values())
  };
};