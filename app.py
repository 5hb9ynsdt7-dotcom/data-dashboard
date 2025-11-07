import os
from flask import Flask, request, render_template, redirect, url_for
import pandas as pd

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'xlsx', 'csv'}

# Ensure the upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        if 'file' not in request.files:
            return redirect(request.url)
        file = request.files['file']
        if file.filename == '':
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = file.filename
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            # Process the file (this is where you'll add your data analysis logic)
            try:
                if filename.rsplit('.', 1)[1].lower() == 'xlsx':
                    df = pd.read_excel(filepath)
                elif filename.rsplit('.', 1)[1].lower() == 'csv':
                    df = pd.read_csv(filepath)
                else:
                    return "Unsupported file type"

                # --- Placeholder for Data Analysis ---
                # For now, just display the first 5 rows and some basic info
                num_rows = len(df)
                num_cols = len(df.columns)
                columns = df.columns.tolist()
                head_data = df.head().to_html(classes='table table-striped', index=False)

                # Example: Group by '客户等级名称' and count
                if '客户等级名称' in df.columns:
                    analysis_result = df.groupby('客户等级名称').size().reset_index(name='客户数量')
                    analysis_html = analysis_result.to_html(classes='table table-striped', index=False)
                else:
                    analysis_html = "<p>列 '客户等级名称' 不存在，无法进行分析。</p>"


                return render_template('analysis.html',
                                       filename=filename,
                                       num_rows=num_rows,
                                       num_cols=num_cols,
                                       columns=columns,
                                       table_head=head_data,
                                       analysis_table=analysis_html
                                       )
            except Exception as e:
                return f"处理文件时出错: {e}"
    return render_template('upload.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True) 