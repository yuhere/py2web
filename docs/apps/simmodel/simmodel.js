// const dmp = new diff_match_patch();
// // var ms_start = (new Date()).getTime();
// // var diffs = dmp.diff_main(text1, text2);
// // var ms_end = (new Date()).getTime();
// // console.log( (ms_end - ms_start) / 1000 + 's', JSON.stringify(diffs, null, 2));
// // https://github.com/google/diff-match-patch/wiki/Line-or-Word-Diffs
// // Line Mode
// var ms_start = (new Date()).getTime();
// var a = dmp.diff_linesToChars_("text 1", "text 2");
// var lineText1 = a.chars1;
// var lineText2 = a.chars2;
// var lineArray = a.lineArray;
// var diffs = dmp.diff_main(lineText1, lineText2, false);
// 
// var ds = dmp.diff_prettyHtml(diffs);
// console.log(ds);
// dmp.diff_charsToLines_(diffs, lineArray)

/**
 * 对比计算，获得相同的次数.
 */
function diff(v1, v2) {
    var text1 = v1.join("\n") + "\n";
    var text2 = v2.join("\n") + "\n";
    const dmp = new diff_match_patch();
    // var ms_start = (new Date()).getTime();
    // var diffs = dmp.diff_main(text1, text2);
    // var ms_end = (new Date()).getTime();
    // console.log( (ms_end - ms_start) / 1000 + 's', JSON.stringify(diffs, null, 2));
    // https://github.com/google/diff-match-patch/wiki/Line-or-Word-Diffs
    // Line Mode
    var ms_start = (new Date()).getTime();
    var a = dmp.diff_linesToChars_(text1, text2);
    var lineText1 = a.chars1;
    var lineText2 = a.chars2;
    var lineArray = a.lineArray;
    var d = dmp.diff_main(lineText1, lineText2, false);
    dmp.diff_charsToLines_(d, lineArray)
    // var ms_end = (new Date()).getTime();
    // console.log( (ms_end - ms_start) / 1000 + 's', JSON.stringify(diffs, null, 2));
    // console.log(d);
    return d.reduce(function(ret, itm, idx){
        let flg = itm['0'],
            val = itm['1'];
        let v = val.split("\n").filter((t)=>t).map((t)=>parseInt(t));
        // console.log(v);
        if (flg===0) {
            ret["same"] = ret["same"] + v.length
        } else {
            ret["diff"] = ret["diff"] + v.length
        }
        
        return ret;
    }, {
        same: 0, diff: 0
    })
    // 
}

/**
 * 分词.
 *
 * 将句子分成 token 列表，保留了原词和位置信息。
 *   1, 可以用于恢复原句;
 *   2, 结合字典可以产生 vector;
 */
function ttokenize(sentence) {
    let tokens = tokenize(sentence, true);
    let pos = 0;
    let tks = [];
    for (let j=0;j<tokens.length;j++) {
        let v = tokens[j],
            i = pos,
            l = v.length,
            t = (/^(?:\w|[\u4E00-\u9FA5\uF900-\uFA2D])+$/g.test(v) ? "w" /*word*/ : "o" /*other*/);
        // [\u4E00-\u9FA5\uF900-\uFA2D] 中文
        pos = pos + v.length;
        tks.push({v,i,t,l});
    }
    return tks;
}

/**
 * 查找 token 在 tokens 的索引.
 */
function tokenIndexOf(token, tokens, startPos = 0) {
    let tkv = token["v"].toLowerCase();
    for (let i=startPos;i<tokens.length;i++) {
        let ttkv = tokens[i]["v"].toLowerCase();
        if (tkv===ttkv) {
            return i;
        }
    }
    return -1;
}

/**
 * 二分查找插入.
 * 
 * https://www.npmjs.com/package/binary-search-insert
 * 
 * Mutates sortedArray and returns index of inserted value
 * @param {Array} A sorted array
 * @param {*} An item to insert in the sorted array
 * @param {Function} A comparator function that takes two arguments and returns a number. 
 *   The first argument will be a member of sortedArray, the second argument will be item.
 *   If item < member, return value < 0
 *   If item > member, return value > 0
 * @returns {Number} index of array where item is inserted
 */
function binarySearchInsert(sortedArray, item, comparator) {
    comparator = comparator || (function (a, b) { return a[1] - b[1]; })
    //
    var high = sortedArray.length - 1;
    var lastIndex = high;
    var low = 0;
    var mid = 0;
    if (sortedArray.length === 0) {
        sortedArray.push(item);
        return 0;
    }
    // 
    while (low <= high) {
        // https://github.com/darkskyapp/binary-search
        // http://googleresearch.blogspot.com/2006/06/extra-extra-read-all-about-it-nearly.html
        mid = low + (high - low >> 1);
        var _cmp = comparator(sortedArray[mid], item);
        if (_cmp <= 0.0) { // searching too low
            low = mid + 1;
        } else { // searching too high
            high = mid - 1;
        }
    }
    // 
    var cmp = comparator(sortedArray[mid], item);
    if (cmp <= 0.0) {
        mid++;
    }
    
    sortedArray.splice(mid, 0, item);
    return mid;
}
function binarySearchInsertAndKeepTopN(sortedArray, item, comparator, N = 5) {
    binarySearchInsert(sortedArray, item, comparator);
    if (sortedArray.length > N) {
        sortedArray.splice(N);
    }
}

/**
 * 这个方法根据词频*在文章中(大文本)*被使用的更多，而不是词序。
 * 在小句子中根据词序计算相似度的效果需要进一步测试。
 * 
 * 句子向量使用数组表示，数组的索引是顺序，元素代表字典索引。
 * 也就是 x轴表示词在字典中的索引，y轴表示词在句子中出现的顺序(+1).
 * 
 * 向量的转换：
 *   "cb" => ([a, 0], [b, 2], [c, 1], [d, 0], [e, 0], [f, 0], [g, 0], [h, 0], [i, 0])
 *         => [0,2,1,0,0,0,0,0,0]
 *
 * 9│                   
 * 8│                   
 * 7│                   
 * 6│                   
 * 5│                   
 * 4│                   
 * 3│                *  
 * 2│   *               
 * 1│ *                 
 * 0└ ─ ─ ─ ─ ─ ─ ─ ─ ─
 *    a b c d e f g h i
 * 
 * 语料库：
 *   1) "abh"
 *     4│                   
 *     3│                *  
 *     2│   *               
 *     1│ *                 
 *     0└ ─ ─ ─ ─ ─ ─ ─ ─ ─
 *        a b c d e f g h i
 * 
 *   2) "cag"
 *     4│                   
 *     3│             *     
 *     2│ *                 
 *     1│     *             
 *     0└ ─ ─ ─ ─ ─ ─ ─ ─ ─
 *        a b c d e f g h i
 *
 *   3) "if"
 *     4│                   
 *     3│                   
 *     2│           *       
 *     1│                 * 
 *     0└ ─ ─ ─ ─ ─ ─ ─ ─ ─
 *        a b c d e f g h i
 * 
 * 输入句子是 "cb", 分别计算与 "abh" 和 "cag" 的夹角.
 *
 *     3│                   
 *     2│   *               
 *     1│     *             
 *     0└ ─ ─ ─ ─ ─ ─ ─ ─ ─
 *        a b c d e f g h i
 * 
 * 输入句子向量的转换：
 *   "cb" => ([a, 0], [b, 2], [c, 1], [d, 0], [e, 0], [f, 0], [g, 0], [h, 0], [i, 0])
 *         => [0,2,1,0,0,0,0,0,0]
 *
 * 语料库句子向量转换：
 *   "abh" => ([a, 1], [b, 2], [c, 0], [d, 0], [e, 0], [f, 0], [g, 0], [h, 3], [i, 0])
 *          => [1,2,0,0,0,0,0,3,0]
 *   "cag" => ([a, 2], [b, 0], [c, 1], [d, 0], [e, 0], [f, 0], [g, 3], [h, 0], [i, 0])
 *          => [2,0,1,0,0,0,3,0,0]
 *   "if"  => ([a, 0], [b, 0], [c, 0], [d, 0], [e, 0], [f, 2], [g, 0], [h, 0], [i, 1])
 *          => [0,0,0,0,0,2,0,0,1]
 * 
 * 余弦定理计算2个向量夹角:   << 仅当语料库句子中至少包含一个输入句子的元素时才计算
 *    "cb" ^ "abh" = 0.47809144373375745
 *    "cb" ^ "cag" = 0.11952286093343936
 *    "cb" ^ "if"  = 0 << 在输入的句子中不存在，不需要计算
 * 
 * console.log(cosine_similarity([0,2,1,0,0,0,0,0,0], [1,2,0,0,0,0,0,3,0]));
 * console.log(cosine_similarity([0,2,1,0,0,0,0,0,0], [2,0,1,0,0,0,3,0,0]));
 * console.log(cosine_similarity([0,2,1,0,0,0,0,0,0], [0,0,0,0,0,2,0,0,1]));
 * 
 * 
 * https://www.cnblogs.com/airnew/p/9563703.html
 * https://blog.csdn.net/zz_dd_yy/article/details/51926305?utm_source=blogxgwz8
 * https://akasatanahama.com/posts/101/ p5.jsとnumjs - コサイン類似度 p5.js and numjs - Cosine Similarity
 * https://www.npmjs.com/package/cos1ne-similarity
 * https://github.com/rtomrud/cos-similarity/blob/master/index.js
 * https://www.skypack.dev/view/statsmodels-js
 */
function cosine_similarity(vectorA = [], vectorB = []) {
    // https://github.com/rtomrud/cos-similarity/blob/master/index.js
    const dimensionality = Math.min(vectorA.length, vectorB.length);
    let dotAB = 0;
    let dotA = 0;
    let dotB = 0;
    let dimension = 0;
    while (dimension < dimensionality) {
        const componentA = vectorA[dimension];
        const componentB = vectorB[dimension];
        dotAB += componentA * componentB;
        dotA += componentA * componentA;
        dotB += componentB * componentB;
        dimension += 1;
    }
    const magnitude = Math.sqrt(dotA * dotB);
    return magnitude === 0 ? 0 : dotAB / magnitude;
}


/**
 * 计算2个序列的编辑距离。
 * https://blog.csdn.net/qq_29311407/article/details/79802216
 */
function minDistance(s1, s2) {
    const len1 = s1.length
    const len2 = s2.length
    let matrix = []
    for (let i = 0; i <= len1; i++) {
        matrix[i] = new Array()   // 构造二维数组
        for (let j = 0; j <= len2; j++) {
            // 初始化
            if (i === 0) {
                matrix[i][j] = j
            } else if (j === 0) {
                matrix[i][j] = i
            } else {
                // 进行最小值分析
                let cost = 0
                if (s1[i - 1] !== s2[j - 1]) { // 相同为0，不同置1
                    cost = 1
                }
                const temp = matrix[i - 1][j - 1] + cost
                matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, temp)
            }
        }
    }
    return matrix[len1][len2] //返回右下角的值
}

/**
 * 根据输入找出语料库中相似度最高的 top N 条例句子.
 *
 * 相似度计算：
 *   a) 对比输入句子与语料库中的句子，找出 相同点 和 不同点。
 *      相同点高的，得分高；相同点相同，不同点低的分数高；
 *      ?根据 相同点/不同点 在例句中的占比?
 *   b) 向量夹角计算；
 *   c) 最小编辑距离；
 *   d) 尝试其他方法：???
 * 
 * sentence 句子；
 * corpus 语料库，把一系列句子分解(tokenize)、向量化组成的集合；
 * dictionary 语料库中出现过的词；
 * vector 句子根据字典向量化构建的词索引数组；类似于 BOW(`bag-of-words`)的表示方法, 
 *        假设字典中存在 ["c", "b", "a"] 三个词，索引作为它们的id，即[0, 1, 2]，
 *        那么 ["a", "b"] 的 id 为[2, 1]，如果 BOW 按顺序表示为 ([2, 0], [1, 1])，
 *        第一元素代表词 id，第二个元素代表顺序。简化表示为 (2, 1)，用索引代表它的顺序。
 * 
 * token 句子的分解，包含字符、句中位置、长度信息; 有两种类型，w: 单词，o：其他(包括空格，标点等)
 */
function SimModel(sentences) {

    const dictionary = [],   // 字典
          corpus = [];       // 语料库，包括向量列表和 token 列表

    /**
     * 构建语料库.
     *
     * 这个方法可以多次被调用, 用于向语料库中追加例句.
     */
    function build(sentences) {
        let cnt = 0;
        for (let sentence of sentences) {
            // TODO 避免重复的例句被加入语料库.
            // let hash = md5(sentence);              // hash 固定长度
            // if (corpus.hasOwnProperty(hash)) continue;
            let vector = [];
            let tokens = ttokenize(sentence);
            for (let token of tokens) {
                let {v,i,t,l} = token;
                if (t==="w") {
                    let lword = v.toLowerCase();
                    let id = dictionary.indexOf(lword);
                    if (id===-1) {
                        id = dictionary.push(lword) -1;
                    }
                    vector.push(id);
                }
            }
            if (tokens.length!==0) {
                corpus.push([vector, tokens]);
                cnt++;
            } 
        }
        return cnt;
    }

    sentences && build(sentences);

    /**
     * 根据 token 从字典构造向量.
     *
     * token 与 vector 的区别；
     *   1， vector 可以根据 token 和 字典 构建；
     *   2， token 由分词程序产生，保留了原词和位置信息，可以用于恢复原句，
     *       vector 由 token 在字典中的位置组成，不包含其他信息，
     *       不在字典中存在的 token 将被忽略，它不能恢复原句；
     */
    function token2vector(tokens) {
        let vector = [];
        for (let i=0;i<tokens.length;i++) {
            let t = tokens[i]
            let idx = dictionary.indexOf(t["v"])
            if (idx!==-1) {
                vector.push(idx);
            }
        }
        return vector;
    }

    /**
     * 
     */
    function score_diff(a, b) {
        let diff_cnt = diff(a, b);   // diff 结果中相同的数量 <<< 这个算法效率不高，优化的空间比较大
        return diff_cnt["same"] / (diff_cnt["same"] + diff_cnt["diff"]);
        // let score = diff(input, vector);
        // if (score["same"] > 0) {
        //     binarySearchInsertAndKeepTopN(matches, [i, score], function(a, b) {
        //         if (a[1]["same"] === b[1]["same"]) {
        //             return a[1]["diff"] - b[1]["diff"]
        //         } else {
        //             return b[1]["same"] - a[1]["same"]
        //         }
        //     }, N);
        // }
        // if (score["same"] > 0) {
        //     binarySearchInsertAndKeepTopN(matches, [i, score], function(a, b) {
        //         if (a[1]["same"] === b[1]["same"]) {
        //             return a[1]["diff"] - b[1]["diff"]
        //         } else {
        //             return b[1]["same"] - a[1]["same"]
        //         }
        //     }, N);
        // }
    }

    /**
     * 最小 编辑距离
     *
     * 最小编辑距离在语料库句子中的占比.
     */
    function score_min_distance(ar1, ar2) {
        let mdis = minDistance(ar1, ar2);
        // console.log("score_min_distance...", mdis, (ar2.length - mdis) / ar2.length);
        return (ar2.length - mdis) / ar2.length;
    }

    /**
     * 
     * 1，根据字典生成2个完整的向量 full-vector；
     * 2，计算并返回它们 cosine_similarity
     */
    function score_cos_similarity(BOWa = [], BOWb = []) {
        let dlen = dictionary.length;
        let a = (new Array(dlen)).fill(0),
            b = (new Array(dlen)).fill(0);
        BOWa.forEach(function(itm, idx){
            a[itm] = idx + 1;
        });
        BOWb.forEach(function(itm, idx){
            b[itm] = idx + 1;
        });
        let score = cosine_similarity(a, b);
        // console.log(a, b, score);
        return score;
    }


    function similarity(a, b, way = "cos" /*["diff", "mind", "cos"]*/) {
        // ########### diff 算法
        if (way==="diff") {
            return score_diff(a, b);
        }
        // ########### min distance 算法
        if (way==="mind") {
            return score_min_distance(a, b);
        }
        // ########### cos_similarity 算法
        if (way==="cos") {
            return score_cos_similarity(a, b);
        }
    }

    /**
     * 根据输入计算相似度，返回句子在语料库的索引列表。
     *
     * input 是有效的向量.
     */
    function match(input, way, N = 5) {
        if (input.length===0) return [];
        let matches = [];
        for (let i = 0; i < corpus.length;i++) {
            // 计算两个向量的相似程度，并按它排序做成列表。
            let [vector, tokens] = corpus[i];
            let score = similarity(input, vector, way);   //
            if (score > 0) {
                binarySearchInsertAndKeepTopN(matches, [i, score], function(a, b) {
                    return b[1] - a[1];
                }, N);
            }
        }
        return matches;
    }

    /**
     * 根据输入的向量匹配语料库中的例句.
     * 
     * 返回相似度最高的 top n 个结果.
     */
    function topv(vector, way="cos", topN = 5) {
        let lst = match(vector, way, topN);
        return lst.map(function(itm, idx) {
            return [corpus[itm[0]][1], itm[1]];  // 返回例句 tokens（用于还原语句）, 相似度对象.
        });
    }

    /**
     * 根据输入的 tokens 匹配语料库中的例句.
     */
    function topt(tokens, way="cos", topN = 5) {
        return topv(token2vector(tokens), way, topN);
    }

    /**
     * 根据数据的句子产生 tokens.
     *
     * 这个函数与 ttokenize 的区别在于，
     * 这个函数会过滤字典中不存在的 token。
     */
    topt.vtokenize = function(sentence) {
        sentence = sentence.toLowerCase();
        let itokens = ttokenize(sentence);
        return itokens.filter(function(tk, idx) {
            let {v,i,t,l} = tk;
            tk["d"] = dictionary.indexOf(v);
            return tk["d"]!==-1;
        })
    }

    topt.t2v = token2vector;
    topt.build = build;

    /**
     * 根据匹配结果列表和输入 tokens 生成 html.
     */
    topt.prettyHtml = function(matches, input_tokens) {
        let html = "<ul>\n";
        for (let k=0;k<matches.length;k++) {
            html = html + "<li>\n";
            let [tokens, score] = matches[k]; // 匹配结果中的 tokens 是完整的，可以用于恢复原句。
            // ##################
            let itoken_pos = 0;
            for (let j=0;j<tokens.length;j++) {
                let token = tokens[j];
                let tkpos = tokenIndexOf(token, input_tokens, itoken_pos);
                let {v,i,t,l} = token
                if (tkpos!==-1) {
                    html = html + "<b>" + v + "</b>";
                    itoken_pos = tkpos + 1;  // 从下一个开始找
                } else {
                    html = html + v;
                }
            }
            html = html + " <sup>" + score.toFixed(2) + "</sup>\n";
            html = html + "</li>\n";
        }
        html = html + "</ul>";
        return html;
    }
    
    topt.summaryHtml = function() {
        return "<div>Dictionary:" + dictionary.length + "</div>" +
               "<div>Corpus:" + corpus.length + "</div>";
    }
    
    //
    topt.dictionary = dictionary;
    topt.corpus = corpus;
    //
    return topt;
}

$(document).ready(function() {
    function mksim() {
        let lines = $("#examples").val().split(/\r?\n/g);
        let sentences = lines.filter((line) => !!line);
        let s = SimModel(sentences);
        //
        $("#model").html(s.summaryHtml());
        // console.log("...", s.dictionary, s.corpus);
        return s;
    }
    let similarity = mksim();
    $("#mk").bind("click", function(e) {
        similarity = mksim();
    });
    //
    function cal_similarity() {
        let algorithm = $('input[name=algorithm]:checked').val();
        let input = $("#inp").val();
        let input_tokens = similarity.vtokenize(input);
        // console.log(ttokenize(input));
        // let input_vector = similarity.t2v(input_tokens);
        let top_matches = similarity(input_tokens, algorithm);
        let ul_html = similarity.prettyHtml(top_matches, input_tokens);
        $("#output").html(ul_html);
    }
    
    //
    $("#inp").bind("input", cal_similarity);
    $("input[name=algorithm]").bind("change", cal_similarity);
})
