# Data Analysis Webapp - Version 2.0

**备份日期**: 2025-12-31

## 版本说明

此版本包含以下主要功能和改进：

### 主要功能

1. **客户数据上传与分析**
   - 支持Excel文件上传
   - 字段：全球主AR、全球主AR工号、正行协作理财师、正行协作理财师工号等
   - Excel文件兼容性优化，解决"Bad uncompressed size"错误

2. **客户分析模块**
   - 汇总概览：自拓 vs 协同分布、客户等级分布
   - 协作分析：包含存量总额占比和实际投资额（基于2025年业绩数据计算）
   - 布局：垂直排列（上下布局）

3. **策略分布分析**
   - 策略分布图表
   - 客户下单策略统计表：按理财师自拓/协同维度统计客户购买的细分策略数量
   - 客户明细弹窗：点击客户数可查看详细客户列表和产品信息

4. **下单分析**
   - 正行协作理财师下单详情表
   - 数据对账功能：识别业绩数据与客户数据的差异
   - 调试日志：显示缺失客户、缺失理财师信息等

5. **业绩数据上传**
   - 支持业绩数据Excel上传
   - 用于计算实际投资额

### 技术栈

- **前端**: React + Ant Design
- **图表**: ECharts
- **Excel解析**: XLSX.js
- **后端**: Flask (Python)

### 已知问题

- 业绩数据总额与理财师下单详情表可能存在差异（已添加调试日志帮助排查）

### 目录结构

```
data_analysis_webapp_v2.0/
├── public/              # 静态资源
├── src/
│   ├── components/      # React组件
│   │   ├── CustomerUploader.js
│   │   ├── CustomerDashboard.js
│   │   ├── StrategyDistribution.js
│   │   ├── OrderAnalysis.js
│   │   └── ...
│   ├── utils/          # 工具函数
│   │   └── customerAnalyzer.js
│   └── App.js          # 主应用组件
├── backend/            # Flask后端
├── build/              # 生产构建
└── package.json        # 依赖配置
```

### 部署说明

1. 安装依赖：`npm install`
2. 开发模式：`npm start`
3. 生产构建：`npm run build`
4. 后端运行：`python backend/app.py`
