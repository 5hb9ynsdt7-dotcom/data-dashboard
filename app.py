import os
from flask import Flask, request, send_from_directory, jsonify
import pandas as pd

# Flask应用配置：服务React构建文件
app = Flask(__name__, static_folder='build', static_url_path='')
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'xlsx', 'csv'}

# 确保上传文件夹存在
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

# 主页路由：服务React应用
@app.route('/')
def serve_react_app():
    return send_from_directory(app.static_folder, 'index.html')

# 所有前端路由：让React Router处理
@app.route('/<path:path>')
def serve_react_routes(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

# API路由：文件上传和数据处理
@app.route('/api/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': '没有选择文件'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': '文件名为空'}), 400
        
        if file and allowed_file(file.filename):
            filename = file.filename
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # 处理上传的文件
            if filename.rsplit('.', 1)[1].lower() == 'xlsx':
                df = pd.read_excel(filepath)
            elif filename.rsplit('.', 1)[1].lower() == 'csv':
                df = pd.read_csv(filepath)
            else:
                return jsonify({'error': '不支持的文件类型'}), 400

            # 数据分析
            num_rows = len(df)
            num_cols = len(df.columns)
            columns = df.columns.tolist()
            
            # 转换为适合前端的格式
            sample_data = df.head(10).to_dict('records')
            
            # 基础统计分析
            analysis_result = {
                'filename': filename,
                'rows': num_rows,
                'columns': num_cols,
                'column_names': columns,
                'sample_data': sample_data,
                'data_types': df.dtypes.to_dict()
            }
            
            # 如果有特定列，进行分组分析
            if '客户等级名称' in df.columns:
                customer_level_analysis = df.groupby('客户等级名称').agg({
                    '客户等级名称': 'count'
                }).rename(columns={'客户等级名称': '客户数量'}).reset_index()
                analysis_result['customer_level_analysis'] = customer_level_analysis.to_dict('records')
            
            # 理财师分析（如果存在相关列）
            advisor_columns = [col for col in df.columns if '理财师' in col or '主理财师' in col]
            if advisor_columns:
                for col in advisor_columns:
                    if col in df.columns:
                        advisor_analysis = df.groupby(col).size().reset_index(name='交易笔数')
                        analysis_result[f'{col}_analysis'] = advisor_analysis.to_dict('records')
            
            return jsonify({'success': True, 'data': analysis_result})
            
        else:
            return jsonify({'error': '不支持的文件类型'}), 400
            
    except Exception as e:
        return jsonify({'error': f'处理文件时出错: {str(e)}'}), 500

# 健康检查
@app.route('/api/health')
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Data Dashboard API is running'})

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)
