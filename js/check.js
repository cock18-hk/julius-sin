/* 篩檢頁：SDQ 家長版，全部在本機瀏覽器內完成，不傳送任何答案。 */
(function () {
  var data = window.SDQ_DATA;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  var form = document.getElementById("quiz");
  data.items.forEach(function (item, index) {
    var field = el("fieldset", "question");
    var legend = el("legend", "question-text");
    legend.appendChild(el("span", "q-no mono", String(index + 1)));
    legend.appendChild(document.createTextNode(item.text));
    field.appendChild(legend);

    var opts = el("div", "q-options");
    data.options.forEach(function (label, value) {
      var id = "q" + index + "_" + value;
      var input = document.createElement("input");
      input.type = "radio";
      input.name = "q" + index;
      input.id = id;
      input.value = String(value);
      var lab = el("label", "q-option", label);
      lab.setAttribute("for", id);
      opts.appendChild(input);
      opts.appendChild(lab);
    });
    field.appendChild(opts);
    form.appendChild(field);
  });

  // 進度提示
  var progress = document.getElementById("progress");
  form.addEventListener("change", function () {
    var answered = form.querySelectorAll("input[type=radio]:checked").length;
    progress.textContent = "已答 " + answered + " / " + data.items.length + " 題";
    if (answered === data.items.length) {
      progress.textContent = "已答齊，可以按下「看結果」。";
    }
  });

  function scoreOf(item, raw) {
    var v = parseInt(raw, 10);
    return item.reverse ? 2 - v : v;
  }

  function bandIndex(scaleKey, score) {
    var bands = data.scales[scaleKey].bands;
    for (var i = 0; i < bands.length; i++) {
      if (score >= bands[i][0] && score <= bands[i][1]) return i;
    }
    return 0;
  }

  function bandLabel(scaleKey, idx) {
    var scale = data.scales[scaleKey];
    return (scale.lowerIsWorse ? data.prosocialBandLabels : data.bandLabels)[idx];
  }

  document.getElementById("submit").addEventListener("click", function () {
    var unanswered = [];
    data.items.forEach(function (item, i) {
      if (!form.querySelector("input[name=q" + i + "]:checked")) unanswered.push(i + 1);
    });
    var warn = document.getElementById("warn");
    if (unanswered.length) {
      warn.hidden = false;
      warn.textContent = "還有未答的題目：第 " + unanswered.join("、") + " 題。請答齊再看結果。";
      form.querySelectorAll(".question")[unanswered[0] - 1].scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    warn.hidden = true;

    var scores = { emotion: 0, conduct: 0, hyper: 0, peer: 0, prosocial: 0 };
    data.items.forEach(function (item, i) {
      var raw = form.querySelector("input[name=q" + i + "]:checked").value;
      scores[item.scale] += scoreOf(item, raw);
    });
    var total = scores.emotion + scores.conduct + scores.hyper + scores.peer;

    render({ scores: scores, total: total });
  });

  function render(result) {
    var box = document.getElementById("result");
    box.innerHTML = "";
    box.hidden = false;

    box.appendChild(el("h2", null, "初步結果"));

    var totalBand = bandIndex("total", result.total);
    var overall = el("p", "overall band-" + totalBand);
    overall.appendChild(el("b", null, "困難總分 " + result.total + " 分（0–40），屬「" + bandLabel("total", totalBand) + "」。"));
    box.appendChild(overall);

    var note = el("p", "muted");
    note.textContent =
      "這是由家長填寫的初步觀察，不是診斷，也不能直接告訴孩子有沒有特殊學習需要。" +
      "分數只反映你過去六個月的觀察，受當時情況影響。如有懷疑，請把結果帶給學校或醫生參考。";
    box.appendChild(note);

    var list = el("div", "scale-list");
    ["emotion", "conduct", "hyper", "peer", "prosocial"].forEach(function (key) {
      var score = result.scores[key];
      var band = bandIndex(key, score);
      var row = el("div", "scale-row band-" + band + (data.scales[key].lowerIsWorse ? " lower-worse" : ""));
      row.appendChild(el("span", "scale-name", data.scales[key].name));
      row.appendChild(el("span", "scale-score mono", score + " 分"));
      row.appendChild(el("span", "scale-band", bandLabel(key, band)));
      row.appendChild(el("span", "scale-desc", data.scales[key].desc));
      list.appendChild(row);
    });
    box.appendChild(list);

    // 按結果給下一步
    var advice = el("div", "advice");
    if (totalBand >= 2) {
      advice.appendChild(el("h3", null, "建議下一步（分數偏高）"));
      var ul = el("ul");
      [
        "把這份結果（連同日期）告訴班主任、特殊教育需要統籌主任（SENCO）、學生輔導人員或學校社工，請學校觀察和跟進。",
        "學校會按「先支援、後評估」原則，有需要時轉介校本教育心理學家評估。",
        "如擔心有發展上的問題（如自閉症、過度活躍等），可經家庭醫生或母嬰健康院轉介衞生署兒童體能智力測驗服務（12 歲以下）：電話 2246 6659。",
        "教育局一般查詢：2891 0088；教育心理服務（香港及九龍）3698 4321、（新界）2437 7270。"
      ].forEach(function (t) { ul.appendChild(el("li", null, t)); });
      advice.appendChild(ul);
    } else if (totalBand === 1) {
      advice.appendChild(el("h3", null, "建議下一步（略高於平均）"));
      var ul2 = el("ul");
      [
        "先留意孩子在哪一個範疇得分較高，記下日常生活中的具體例子。",
        "若情況持續或加重，可以向班主任或學生輔導人員查詢，看看學校如何支援。",
        "幾個月後可以再填一次，比較變化。"
      ].forEach(function (t) { ul2.appendChild(el("li", null, t)); });
      advice.appendChild(ul2);
    } else {
      advice.appendChild(el("h3", null, "下一步"));
      var p = el("p");
      p.textContent =
        "今次的觀察接近平均。如果你仍有擔心（例如學業成績明顯落後、讀寫特別吃力），" +
        "這份問卷未必涵蓋到，可以直接問班主任，或參考教育局的支援資料。";
      advice.appendChild(p);
    }
    box.appendChild(advice);

    if (window.JuliusMeasure) {
      box.appendChild(JuliusMeasure.buttons("check", "result", {
        prompt: "這個結果有沒有幫你知道下一步？",
        choices: [
          ["useful", "有，知道問誰"],
          ["unclear", "仍然不清楚"],
          ["later", "現在用不上"]
        ]
      }));
    }

    var again = el("button", "btn ghost", "重新填寫");
    again.type = "button";
    again.addEventListener("click", function () {
      form.reset();
      progress.textContent = "";
      box.hidden = true;
      box.innerHTML = "";
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    box.appendChild(again);

    box.scrollIntoView({ behavior: "smooth", block: "start" });
  }
})();
