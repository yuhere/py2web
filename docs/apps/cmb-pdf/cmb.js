// 2. 设置 Worker 路径（全局变量 pdfjsLib 现在可以直接安全访问）
// pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.js';

const statusDiv = document.getElementById('status');
const outputPre = document.getElementById('output');

async function parsePdf(source) {
    try {
        statusDiv.textContent = "正在加载和解析 PDF，请稍候...";
        outputPre.textContent = "";

        const loadingTask = pdfjsLib.getDocument(source);
        const pdfDocument = await loadingTask.promise;

        statusDiv.textContent = `PDF 加载成功！总页数: ${pdfDocument.numPages}。正在提取文本...`;

        let fullText = "";
        const pages = [];
        for (let i = 1; i <= pdfDocument.numPages; i++) {
            const page = await pdfDocument.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(" ");
            pages.push({
                pageNumber: i,
                text: pageText,
                records: parsePageText(pageText)
            });
            fullText += `==================== 第 ${i} 页 ====================\n` + pageText + "\n\n";
        }

        statusDiv.textContent = `解析完成！共提取 ${pdfDocument.numPages} 页内容。`;
        outputPre.textContent = fullText;
        console.log("====", pages);

    } catch (error) {
        statusDiv.textContent = "解析出错！";
        outputPre.textContent = error.message;
        console.error(error);
    }
}

// 按钮 1：解析本地文件
document.getElementById('localBtn').addEventListener('click', () => {
    const fileInput = document.getElementById('pdfFile');
    const file = fileInput.files[0];
    if (!file) {
        alert("请先选择一个本地的 PDF 文件！");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const typedarray = new Uint8Array(e.target.result);
        parsePdf({ data: typedarray });
    };
    reader.readAsArrayBuffer(file);
});

// 按钮 2：解析网络示例 PDF
document.getElementById('netBtn').addEventListener('click', () => {
    const sampleUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'; // 换成标准的公开pdf
    // 为了稳妥，这里用另一个通用的公开 PDF 链接
    parsePdf('https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf');
});


function parsePageText(pageText) {
    var isFirstPage = pageText.indexOf("招商银行交易流水") !== -1 && pageText.indexOf("Transaction Statement of China Merchants Bank") !== -1;
    var isLastPage = pageText.indexOf("温馨提示： 1.交易流水验真：进入一网通首页") !== -1;


    // 1. 使用 2025-09-27 日期格式pattern将文本切成多段
    // 利用正则表达式零宽断言（向前断言），在不丢失日期本身的前提下进行分割
    function splitRecords(text) {
        const pos_x = text.indexOf("合并统计");
        const pos_y = text.indexOf("合并收入(+)");
        const pos_z = text.indexOf("合并支出(-)");
        if (pos_x !== -1 && pos_y !== -1 && pos_z !== -1) {
            const footer_text = text.substring(pos_x);
            text = text.substring(0, pos_x);
        }
        // 匹配类似 2025-09-27 的日期，并在其前面切分
        const segments = text.split(/(?=\d{4}-\d{2}-\d{2})/);
        // 过滤掉不包含日期开头的无效段落（如表头信息）
        const segments_a = segments.filter(seg => /\d{4}-\d{2}-\d{2}/.test(seg));

        return segments_a
    }

    // 2. parseRecord函数：从文本分段中提取各项数据
    function parseRecord(segment) {
        const fields = segment.split(/   /);
        for (let i = 0; i < fields.length; i++) {
            fields[i] = fields[i].trim();
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(fields[0])) {
            return null;
        }
        //  正常数据
        // if (fields.length === 7) {
        //    return fields;
        // }
        //
        if (fields.length === 5) {
            let m = /^([\u4e00-\u9fa5]+)\s+((?:.*?)\d{2,})\s+(.*)$/.exec(fields[4]);
            if (m) {
                fields.splice(4, 1, m[1], m[2], m[3])
            } else {
                if (["柜台取现", "柜台存现"].indexOf(fields[4]) !== -1) {
                    while (fields.length < 7) {
                        fields.push("");
                    }
                } else {
                    console.error("aaaaa", segment, fields);
                    throw "aaaaa";
                }
            }
        } else if (fields.length === 6) {
            let m = /^((?:.*?)\d{2,})\s+(.*)$/.exec(fields[5]);
            if (m) {
                fields.splice(5, 1, m[1], m[2])
            } else {
                if (["结售汇即时售汇"].indexOf(fields[4]) !== -1) {
                    while (fields.length < 7) {
                        fields.push("");
                    }
                } else {
                    console.error("bbbbb", segment, fields);
                    throw "bbbbb";
                }
            }
        }

        if (fields.length !== 7) {
            console.error("====", segment, fields);
            throw "ccccc";
        }

        // ###############################
        var mm = ["date", "currency", "transactionAmount", "balance", "transactionType", "counterParty",
            "customerType"].reduce((ret, name, idx) => {
                ret[name] = fields[idx];


                return ret;
            }, {});




        return mm;
    }

    // 执行解析过程
    const rawSegments = splitRecords(pageText);
    const parsedRecords = rawSegments.map(parseRecord).filter(item => item !== null);

    console.log("解析结果：", parsedRecords);
    return parsedRecords;

}

