from flask import Flask, request, jsonify, send_file, render_template
from docxtpl import DocxTemplate, InlineImage
from docx.shared import Mm
from flask_cors import CORS
import os
from xlsxtpl.writerx import BookWriter
from ethiopian_date import EthiopianDateConverter
from datetime import datetime

app = Flask(__name__)
cors = CORS(app)


@app.route('/', methods=["GET"])
def index():
    return "The server is running"


@app.route('/generate-atc-sheet', methods=['POST'])
def generate_report():
    data = request.get_json()
    print(data)
    pth = os.path.dirname(__file__)
    fname = os.path.join(pth, 'diSales_template.xlsx')
    writer = BookWriter(fname)
    payload = [{'tpl_idx': 0, 'ctx': data}]

    # writer.jinja_env.globals.update(dir=dir, getattr=getattr)
    writer.render_book2(payloads=payload)
    fname = os.path.join(pth, 'output.xlsx')
    writer.save(fname)
    return send_file('output.xlsx', as_attachment=True)

@app.route('/generate-bulk-sheet', methods=['POST'])
def generate_bulk_report():
    data = request.get_json()
    print(data)
    pth = os.path.dirname(__file__)
    fname = os.path.join(pth, 'bulk_template.xlsx')
    writer = BookWriter(fname)
    payload = [{'tpl_idx': 0, 'ctx': data}]

    # writer.jinja_env.globals.update(dir=dir, getattr=getattr)
    writer.render_book2(payloads=payload)
    fname = os.path.join(pth, 'output.xlsx')
    writer.save(fname)
    return send_file('output.xlsx', as_attachment=True)


@app.route('/generate-purchase-process', methods=['POST'])
def generate_sales():
    now = datetime.now()

# Extract the current year, month, and day
    current_year = now.year
    current_month = now.month
    current_day = now.day

    conv = EthiopianDateConverter.to_ethiopian
    et_date = conv(current_year, current_month, current_day)
    print("format", et_date.year, et_date.month, et_date.day)

    doc = DocxTemplate("purchase_template.docx")
    data  = request.get_json()
    doc.render({**data, "yy": et_date.year, "mm": et_date.month})
    
    # Save the document object as a temporary file
    temp_file_path = 'purchase_temporary.docx'
    doc.save(temp_file_path)
    return send_file(temp_file_path, as_attachment=True)


@app.route('/generate-quotations', methods=['POST'])
def generate_quotations():
    doc = DocxTemplate("quotation_template.docx")
    data  = request.get_json()

    date = datetime.strptime(data.get("date"), "%m/%d/%Y")
    expirationDate = datetime.fromisoformat(data.get("expirationDate").replace("Z", "+00:00"))


    current_year = date.year
    current_month = date.month
    current_day = date.day

    conv = EthiopianDateConverter.to_ethiopian
    et_date = conv(current_year, current_month, current_day)
    print("format", et_date.year, et_date.month, et_date.day)
    doc.render({**data, "yy": et_date.year, "mm": et_date.month, "expirationDate":expirationDate.strftime("%m/%d/%Y")})

    # Save the document object as a temporary file
    temp_file_path = 'quotation_temp.docx'
    doc.save(temp_file_path)
    return send_file(temp_file_path, as_attachment=True)


if __name__ == '__main__':
    app.run(port=8000, debug=True)
