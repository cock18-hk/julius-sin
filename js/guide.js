/* 家長第一步（原 Julius APP），全部在本機完成，不傳送任何答案。 */
(function () {
  var D = window.GUIDE_DATA;
  var root = document.getElementById("guide");
  if (!D || !root) return;

  function load(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  var state = {
    age: "2歲",
    answers: {},
    records: load(D.RECORDS_KEY, []),
    saved: false,
    notes: load(D.NOTES_KEY, ""),
    picked: load(D.CONCERNS_KEY, []),
    openFaq: null,
    openProblem: null,
    stepHelp: null,
    openTool: null,
    query: "",
    tried: load(D.TRIED_KEY, []),
    asked: load(D.ASKED_KEY, [])
  };

  function missedItems() {
    return D.checks[state.age].filter(function (_, i) {
      return state.answers[state.age + "-" + i] === false;
    });
  }

  function answeredAll() {
    return D.checks[state.age].every(function (_, i) {
      return state.answers[state.age + "-" + i] != null;
    });
  }

  function rememberAsked(title) {
    state.asked = [title].concat(state.asked.filter(function (t) { return t !== title; })).slice(0, 10);
    save(D.ASKED_KEY, state.asked);
  }

  function render() {
    root.replaceChildren();
    renderHead();
    renderNotice();
    renderPortrait();
    renderStep1();
    renderStep2();
    renderStep3();
    renderStep4();
    renderFaqs();
    renderAbout();
    renderFeedback();
    root.appendChild(el("p", "footer", "記住：留意到、肯去問，已經係幫緊小朋友。唔使一個人擔。"));
  }

  function renderHead() {
    var top = el("header", "top");
    top.appendChild(el("h1", null, "懷疑小朋友有發展問題？"));
    top.appendChild(el("p", null, "好多家長都有呢一刻。唔使怕，一步一步嚟。"));
    root.appendChild(top);
  }

  function renderNotice() {
    var box = el("div", "card notice");
    var b = el("strong", null, "2 至 6 歲係黃金期。");
    box.appendChild(b);
    box.appendChild(document.createTextNode("愈早留意、愈早支援，效果愈好。呢度全部係觀察同資訊，唔係診斷。"));
    root.appendChild(box);
  }

  function renderPortrait() {
    if (
      !state.picked.length &&
      !state.notes.trim() &&
      !state.records.length &&
      !state.asked.length &&
      !state.tried.length
    ) {
      return;
    }
    var card = stepCard("📌", "你記低咗嘅原貌");
    card.appendChild(el("p", "step-text", "上次你見過、問過、試過嘅嘢都喺度。帶住呢個先同專業人士傾，先睇到個情況。"));
    if (state.picked.length) {
      var row = el("div", "portrait-row");
      row.appendChild(el("strong", null, "你見過"));
      row.appendChild(el("span", null, state.picked.join("、")));
      card.appendChild(row);
    }
    if (state.notes.trim()) {
      var n = el("div", "portrait-row");
      n.appendChild(el("strong", null, "你寫低"));
      n.appendChild(el("span", null, state.notes.trim()));
      card.appendChild(n);
    }
    if (state.records[0]) {
      var r = el("div", "portrait-row");
      r.appendChild(el("strong", null, "最近觀察"));
      r.appendChild(el("span", null, state.records[0].date + "　" + state.records[0].age + "　" + state.records[0].missed.length + " 項未做到"));
      card.appendChild(r);
    }
    if (state.asked.length) {
      var a = el("div", "portrait-row");
      a.appendChild(el("strong", null, "你問過"));
      var pills = el("div", "portrait-pills");
      state.asked.forEach(function (title) {
        var problem = D.problems.find(function (p) { return p.title === title; });
        var pill = el("span", "pill");
        var open = el("button", null, problem ? problem.icon + " " + title : title);
        open.type = "button";
        open.addEventListener("click", function () {
          var i = D.problems.findIndex(function (p) { return p.title === title; });
          if (i < 0) return;
          state.query = "";
          state.openProblem = i;
          state.stepHelp = null;
          render();
          var node = document.getElementById("problem-" + i);
          if (node) node.scrollIntoView({ behavior: "smooth", block: "center" });
        });
        var x = el("button", "pill-x", "×");
        x.type = "button";
        x.setAttribute("aria-label", "唔再記 " + title);
        x.addEventListener("click", function () {
          state.asked = state.asked.filter(function (t) { return t !== title; });
          save(D.ASKED_KEY, state.asked);
          render();
        });
        pill.appendChild(open);
        pill.appendChild(x);
        pills.appendChild(pill);
      });
      a.appendChild(pills);
      card.appendChild(a);
    }
    if (state.tried.length) {
      var t = el("div", "portrait-row");
      t.appendChild(el("strong", null, "你試過"));
      t.appendChild(el("span", null, state.tried.join("、")));
      card.appendChild(t);
    }
    root.appendChild(card);
  }

  function stepCard(num, title) {
    var card = el("div", "card step-card");
    var head = el("div", "step-head");
    head.appendChild(el("span", "num", num));
    head.appendChild(el("h2", null, title));
    card.appendChild(head);
    return card;
  }

  function renderStep1() {
    var card = stepCard("1", "記低你見到嘅嘢");
    card.appendChild(el("p", "step-text", "先揀你有見過嘅情況（可揀多項），再補充細節。專業人士最需要嘅係日常觀察，唔係一次測驗。"));
    var chips = el("div", "chips");
    D.concerns.forEach(function (c) {
      var on = state.picked.indexOf(c.text) !== -1;
      var btn = el("button", "chip" + (on ? " on" : ""));
      btn.type = "button";
      btn.appendChild(el("span", "chip-icon", c.icon));
      btn.appendChild(document.createTextNode(c.text));
      btn.addEventListener("click", function () {
        state.picked = on
          ? state.picked.filter(function (t) { return t !== c.text; })
          : state.picked.concat([c.text]);
        save(D.CONCERNS_KEY, state.picked);
        render();
      });
      chips.appendChild(btn);
    });
    card.appendChild(chips);
    if (state.picked.length) {
      card.appendChild(el("div", "hint", "揀咗 " + state.picked.length + " 項，自動記低"));
    }
    var ta = document.createElement("textarea");
    ta.className = "notes";
    ta.rows = 4;
    ta.placeholder = "再寫低細節：幾時開始、幾耐一次、咩情況會好啲……";
    ta.value = state.notes;
    ta.addEventListener("input", function () {
      state.notes = ta.value;
      save(D.NOTES_KEY, state.notes);
    });
    card.appendChild(ta);
    card.appendChild(el("div", "hint", "你揀過、寫過、問過嘅問題都會記喺呢部機。下次打開，最上面睇到個原貌。"));
    root.appendChild(card);
  }

  function renderStep2() {
    var card = stepCard("2", "做一個簡單觀察");
    card.id = "check";
    card.appendChild(el("p", "step-text", "揀返小朋友嘅年齡，逐項答「做到」定「未做到」。"));
    var ages = el("div", "ages");
    ages.setAttribute("role", "group");
    ages.setAttribute("aria-label", "揀年齡");
    Object.keys(D.checks).forEach(function (a) {
      var btn = el("button", "age" + (a === state.age ? " on" : ""), a);
      btn.type = "button";
      btn.addEventListener("click", function () {
        state.age = a;
        state.saved = false;
        render();
      });
      ages.appendChild(btn);
    });
    card.appendChild(ages);

    var list = el("div", "list");
    D.checks[state.age].forEach(function (c, i) {
      var key = state.age + "-" + i;
      var v = state.answers[key];
      var row = el("div", "check" + (v === true ? " yes" : "") + (v === false ? " no" : ""));
      var q = el("div", "q");
      q.appendChild(el("span", "domain", c.domain));
      q.appendChild(el("span", "text", c.text));
      var ans = el("div", "ans");
      var yes = el("button", v === true ? "pick yes" : "", "做到");
      yes.type = "button";
      yes.addEventListener("click", function () {
        state.answers[key] = v === true ? null : true;
        state.saved = false;
        render();
      });
      var no = el("button", v === false ? "pick no" : "", "未做到");
      no.type = "button";
      no.addEventListener("click", function () {
        state.answers[key] = v === false ? null : false;
        state.saved = false;
        render();
      });
      ans.appendChild(yes);
      ans.appendChild(no);
      row.appendChild(q);
      row.appendChild(ans);
      list.appendChild(row);
    });
    card.appendChild(list);

    var missed = missedItems();
    var result = el("div", "card result");
    if (missed.length === 0) {
      result.textContent = "而家未見到特別要留意嘅位。可以隔幾個月再睇一次。";
    } else {
      result.appendChild(document.createTextNode("有 "));
      result.appendChild(el("strong", null, String(missed.length)));
      result.appendChild(document.createTextNode(" 項「未做到」。可以帶住呢個結果，去下一步搵專業人士傾。早啲問，唔使等。"));
    }
    var saveRow = el("div", "save-row");
    var saveBtn = el("button", "save", state.saved ? "儲低咗 ✓" : "儲低今次");
    saveBtn.type = "button";
    saveBtn.disabled = !answeredAll() || state.saved;
    saveBtn.addEventListener("click", function () {
      var rec = {
        date: new Date().toISOString().slice(0, 10),
        age: state.age,
        missed: missed.map(function (m) { return m.domain + "：" + m.text; })
      };
      state.records = [rec].concat(state.records).slice(0, 20);
      save(D.RECORDS_KEY, state.records);
      state.saved = true;
      render();
    });
    saveRow.appendChild(saveBtn);
    if (!answeredAll()) saveRow.appendChild(el("span", "hint", "答晒全部先可以儲"));
    result.appendChild(saveRow);
    card.appendChild(result);

    if (state.records.length) {
      var hist = el("div", "card history");
      var ht = el("div", "h-title");
      ht.appendChild(el("strong", null, "過往紀錄"));
      var clear = el("button", "clear", "清除全部");
      clear.type = "button";
      clear.addEventListener("click", function () {
        state.records = [];
        localStorage.removeItem(D.RECORDS_KEY);
        render();
      });
      ht.appendChild(clear);
      hist.appendChild(ht);
      state.records.forEach(function (r, i) {
        var prev = state.records[i + 1];
        var better = prev && r.age === prev.age && r.missed.length < prev.missed.length;
        var row = el("div", "h-row");
        row.appendChild(el("span", "h-date", r.date));
        row.appendChild(el("span", "h-age", r.age));
        row.appendChild(el("span", "h-count", r.missed.length + " 項未做到"));
        if (better) row.appendChild(el("span", "h-better", "少咗，好事"));
        if (r.missed.length && i === 0) {
          row.appendChild(el("div", "h-detail", r.missed.join("；")));
        }
        hist.appendChild(row);
      });
      card.appendChild(hist);
    }
    root.appendChild(card);
  }

  function contactRow(item) {
    var row = el("div", "contact");
    row.appendChild(el("span", "c-icon", item.icon));
    var body = el("div", "c-body");
    var head = el("div", "c-head");
    head.appendChild(el("strong", null, item.name));
    if (item.cost) head.appendChild(el("span", "c-cost", item.cost));
    body.appendChild(head);
    body.appendChild(el("p", null, item.text));
    row.appendChild(body);
    return row;
  }

  function renderStep3() {
    var card = stepCard("3", "先做全面評估");
    card.appendChild(el("p", "step-text", "唔使自己估「去邊一科」。同一個表徵可以有好多原因——「聽唔明指令」可能係聽力、語言理解、專注，或者整體發展。全面評估由一隊專業（兒科醫生、心理學家、言語同職業治療師等）一齊睇晒各個範疇，報告先會話你知重點喺邊。"));
    card.appendChild(el("div", "sub-title", "點樣去做全面評估："));
    var list = el("div", "list");
    D.assessmentPaths.forEach(function (c) { list.appendChild(contactRow(c)); });
    card.appendChild(list);
    card.appendChild(el("div", "sub-title", "攞到報告之後："));
    var after = el("div", "list");
    D.afterAssessment.forEach(function (c) { after.appendChild(contactRow(c)); });
    card.appendChild(after);
    root.appendChild(card);
  }

  function renderStep4() {
    var card = stepCard("4", "管教，點做先有效？");
    card.appendChild(el("p", "step-text", "唔使等報告先開始。揀一條你日日面對緊嘅問題，或者打關鍵字搜尋，即刻有具體做法；跟住做都幫唔到，撳「逐項幫你分析」。"));
    var search = document.createElement("input");
    search.className = "search";
    search.type = "search";
    search.placeholder = "打關鍵字，例如：咬人、電視、瞓覺……";
    search.setAttribute("aria-label", "搜尋問題");
    search.value = state.query;
    search.addEventListener("input", function () {
      state.query = search.value;
      render();
      var next = document.querySelector(".guide .search");
      if (next) {
        next.focus();
        if (typeof next.setSelectionRange === "function") {
          var len = next.value.length;
          next.setSelectionRange(len, len);
        }
      }
    });
    card.appendChild(search);

    var q = state.query.trim();
    var visible = D.problems
      .map(function (p, i) { return { p: p, i: i }; })
      .filter(function (item) {
        if (!q) return true;
        var p = item.p;
        return (p.title + p.keywords + p.note + p.steps.join("") + p.stepFix.map(function (f) { return f.fail + f.fix; }).join("")).indexOf(q) !== -1;
      });
    if (q && visible.length) card.appendChild(el("div", "hint", "搵到 " + visible.length + " 條"));
    if (q && !visible.length) {
      var empty = el("div", "card result", "搵唔到「" + q + "」。試下其他關鍵字，或者將情況寫喺第 1 步，評估時問專業人士。");
      card.appendChild(empty);
    }

    var list = el("div", "list");
    visible.forEach(function (item) {
      var p = item.p;
      var i = item.i;
      var box = el("div", "faq" + (state.openProblem === i ? " open" : "") + (state.asked.indexOf(p.title) !== -1 ? " asked" : ""));
      box.id = "problem-" + i;
      var qbtn = el("button", "faq-q");
      qbtn.type = "button";
      var left = el("span");
      left.appendChild(el("span", "p-icon", p.icon));
      left.appendChild(document.createTextNode(" " + p.title));
      qbtn.appendChild(left);
      qbtn.appendChild(el("span", "faq-arrow", state.openProblem === i ? "−" : "+"));
      qbtn.addEventListener("click", function () {
        state.openProblem = state.openProblem === i ? null : i;
        state.stepHelp = null;
        rememberAsked(p.title);
        render();
      });
      box.appendChild(qbtn);
      if (state.openProblem === i) {
        var body = el("div", "faq-a");
        var ol = el("ol", "steps");
        p.steps.forEach(function (s) { ol.appendChild(el("li", null, s)); });
        body.appendChild(ol);
        body.appendChild(el("div", "remember", "💡 " + p.note));
        var help = el("button", "help-toggle", state.stepHelp === i ? "▲ 收起分析" : "跟住做都幫唔到忙？逐項幫你分析");
        help.type = "button";
        help.addEventListener("click", function () {
          state.stepHelp = state.stepHelp === i ? null : i;
          render();
        });
        body.appendChild(help);
        if (state.stepHelp === i) {
          var analysis = el("div", "step-analysis");
          p.steps.forEach(function (s, si) {
            var sa = el("div", "sa-item");
            var step = el("div", "sa-step");
            step.appendChild(el("span", "sa-num", String(si + 1)));
            step.appendChild(el("span", null, s));
            sa.appendChild(step);
            var fail = el("p");
            fail.appendChild(el("span", "a-tag", "點解可能冇效"));
            fail.appendChild(document.createTextNode(p.stepFix[si].fail));
            sa.appendChild(fail);
            var fix = el("p");
            fix.appendChild(el("span", "a-tag go", "可以點調整"));
            fix.appendChild(document.createTextNode(p.stepFix[si].fix));
            sa.appendChild(fix);
            analysis.appendChild(sa);
          });
          analysis.appendChild(el("div", "sa-end", "調整咗做法，全家一致做兩至三星期都仲係咁——帶埋你嘅觀察紀錄，返去第 3 步做全面評估，搵出背後原因。"));
          body.appendChild(analysis);
        }
        box.appendChild(body);
      }
      list.appendChild(box);
    });
    card.appendChild(list);

    card.appendChild(el("div", "sub-title", "試過好多方法都冇用？"));
    card.appendChild(el("p", "step-text", "揀返你試過嘅做法，睇下點解——多數唔係你做得錯，而係時機、一致性、獎勵唔啱，或者方法同原因唔夾："));
    var chips = el("div", "chips");
    D.attempts.forEach(function (a) {
      var on = state.tried.indexOf(a.text) !== -1;
      var btn = el("button", "chip" + (on ? " on" : ""));
      btn.type = "button";
      btn.appendChild(el("span", "chip-icon", a.icon));
      btn.appendChild(document.createTextNode(a.text));
      btn.addEventListener("click", function () {
        state.tried = on
          ? state.tried.filter(function (t) { return t !== a.text; })
          : state.tried.concat([a.text]);
        save(D.TRIED_KEY, state.tried);
        render();
      });
      chips.appendChild(btn);
    });
    card.appendChild(chips);
    if (!state.tried.length) {
      card.appendChild(el("div", "hint", "揀一項或多項你試過嘅做法"));
    } else {
      D.attempts.filter(function (a) { return state.tried.indexOf(a.text) !== -1; }).forEach(function (a) {
        var box = el("div", "analysis");
        var head = el("div", "a-head");
        head.appendChild(el("span", "chip-icon", a.icon));
        head.appendChild(el("strong", null, a.text));
        box.appendChild(head);
        var why = el("p");
        why.appendChild(el("span", "a-tag", "點解多數無效"));
        why.appendChild(document.createTextNode(a.why));
        box.appendChild(why);
        var instead = el("p");
        instead.appendChild(el("span", "a-tag go", "試下咁做"));
        instead.appendChild(document.createTextNode(a.instead));
        box.appendChild(instead);
        card.appendChild(box);
      });
    }

    var four = el("div", "card result");
    four.appendChild(el("strong", null, "失效通常得四個原因"));
    var ol = el("ol", "steps");
    [
      "時機錯——教同獎都要即時。佢激動嗰陣教，等於冇教；夜晚先獎朝早嘅嘢，佢連唔返。",
      "唔一致——間唔中就一次，係最強嘅「繼續試」訓練。全家要企同一條線。",
      "未對症——行為有功能（想攞嘢、想走、想人陪、感官唔舒服），用下面嘅 ABC 記錄搵出原因，方法先會啱。",
      "獎唔啱——你覺得係獎，佢未必覺得；獎品仲會隨時間失效，要換。"
    ].forEach(function (t) { ol.appendChild(el("li", null, t)); });
    four.appendChild(ol);
    four.appendChild(document.createTextNode("呢四個原因，對應嘅做法就喺下面五件工具。"));
    card.appendChild(four);

    card.appendChild(el("div", "sub-title", "五件工具，點用先有效："));
    var tools = el("div", "list");
    D.tools.forEach(function (t, i) {
      var box = el("div", "faq" + (state.openTool === i ? " open" : ""));
      var qbtn = el("button", "faq-q");
      qbtn.type = "button";
      var left = el("span");
      left.appendChild(el("span", "p-icon", t.icon));
      left.appendChild(document.createTextNode(" " + t.title));
      qbtn.appendChild(left);
      qbtn.appendChild(el("span", "faq-arrow", state.openTool === i ? "−" : "+"));
      qbtn.addEventListener("click", function () {
        state.openTool = state.openTool === i ? null : i;
        render();
      });
      box.appendChild(qbtn);
      if (state.openTool === i) {
        var body = el("div", "faq-a");
        var steps = el("ol", "steps");
        t.steps.forEach(function (s) { steps.appendChild(el("li", null, s)); });
        body.appendChild(steps);
        body.appendChild(el("div", "remember", "💡 " + t.note));
        box.appendChild(body);
      }
      tools.appendChild(box);
    });
    card.appendChild(tools);
    root.appendChild(card);
  }

  function renderFaqs() {
    var card = stepCard("?", "家長最常問");
    var list = el("div", "list");
    D.faqs.forEach(function (f, i) {
      var box = el("div", "faq");
      var qbtn = el("button", "faq-q");
      qbtn.type = "button";
      qbtn.appendChild(el("span", null, f.q));
      qbtn.appendChild(el("span", "faq-arrow", state.openFaq === i ? "−" : "+"));
      qbtn.addEventListener("click", function () {
        state.openFaq = state.openFaq === i ? null : i;
        render();
      });
      box.appendChild(qbtn);
      if (state.openFaq === i) box.appendChild(el("p", "faq-a", f.a));
      list.appendChild(box);
    });
    card.appendChild(list);
    root.appendChild(card);
  }

  function renderAbout() {
    var card = stepCard("i", "關於呢個工具");
    var list = el("div", "list");
    [
      { icon: "📚", name: "內容有根據", text: "根據約五十條特殊教育文獻同行為治療課程講義整理，再用家長語言寫成——唔係網上炒埋一碟嘅貼士。" },
      { icon: "🔎", name: "觀察唔係診斷", text: "呢度全部係觀察方法同資訊，唔會話你知小朋友有冇問題。懷疑，就帶埋紀錄去做全面評估。" },
      { icon: "🔒", name: "你嘅資料唔上網", text: "你揀嘅關注、寫嘅筆記、做嘅觀察，全部只儲喺你呢部機。冇帳戶、冇收集、冇廣告。" }
    ].forEach(function (c) { list.appendChild(contactRow(c)); });
    card.appendChild(list);
    root.appendChild(card);
  }

  function renderFeedback() {
    var card = stepCard("💬", "你嘅意見");
    card.appendChild(el("p", "step-text", "用呢個工具嗰陣，有咩睇唔明、想多啲講邊方面、或者你嘅情況入面冇——話我知。你一句意見，幫到下一個家長。"));
    if (window.JuliusMeasure) {
      card.appendChild(JuliusMeasure.buttons("guide", "page", {
        prompt: "呢頁有冇幫到你？",
        choices: [
          ["useful", "有用"],
          ["unclear", "睇唔明"],
          ["later", "而家用不上"]
        ]
      }));
    }
    if (D.FEEDBACK_URL) {
      var a = el("a", "feedback", "填意見表（大約兩分鐘）");
      a.href = D.FEEDBACK_URL;
      a.target = "_blank";
      a.rel = "noreferrer";
      card.appendChild(a);
    }
    root.appendChild(card);
  }

  render();
})();
