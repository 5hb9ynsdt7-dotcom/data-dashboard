# Data Dashboard - 数据分析平台

一个基于React和Flask的数据分析平台，支持数据上传、分析和可视化。

## 功能特性

- 📊 **数据上传**: 支持Excel和CSV格式文件上传
- 📈 **数据分析**: 自动分析上传的数据并生成统计报告
- 🎯 **可视化图表**: 
  - 主理财师业绩排行图表
  - 客户等级分布饼图
  - 产品销售排行柱状图
  - BU分布分析
- 📱 **响应式设计**: 支持PC和移动端访问

## 技术栈

### 前端
- React 18.2.0
- Ant Design 5.12.2
- ECharts 5.4.3 (图表库)
- Moment.js (时间处理)

### 后端
- Python Flask
- Pandas (数据处理)
- OpenPyXL (Excel文件处理)

## 快速开始

### 环境要求
- Node.js 16+
- Python 3.7+

### 安装和运行

1. **克隆项目**
```bash
git clone <repository-url>
cd data_analysis_webapp
```

2. **安装前端依赖**
```bash
npm install
```

3. **安装后端依赖**
```bash
pip install -r requirements.txt
```

4. **启动前端服务**
```bash
npm start
```

5. **启动后端服务**
```bash
python app.py
```

6. **访问应用**
- 前端: http://localhost:3000
- 后端API: http://localhost:8080

## 项目结构

```
data_analysis_webapp/
├── public/                 # 静态资源
├── src/                   # 前端源代码
│   ├── components/        # React组件
│   │   ├── FileUploader.js
│   │   ├── DataDashboard.js
│   │   └── DataTable.js
│   ├── utils/            # 工具函数
│   └── App.js            # 主应用组件
├── templates/            # Flask模板
├── uploads/              # 文件上传目录
├── app.py               # Flask后端服务
├── package.json         # 前端依赖
└── requirements.txt     # Python依赖
```

## 使用指南

1. **上传数据**: 点击"上传数据"按钮，选择Excel或CSV文件
2. **查看分析**: 上传成功后自动切换到数据分析面板
3. **查看图表**: 
   - 主理财师业绩排行（已优化显示）
   - 各类统计图表和数据表格
4. **查看明细**: 切换到"数据表格"查看原始数据

## 更新日志

### v0.1.0 (最新)
- ✅ 基础数据上传功能
- ✅ 数据分析和可视化
- ✅ 主理财师业绩排行图表优化（高度增加200%）
- ✅ 响应式UI设计

## 许可证

MIT License