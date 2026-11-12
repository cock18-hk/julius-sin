(function () {
  var news = (window.XIAN_ZHIDAO_NEWS || []).slice().sort(function (a, b) {
    return String(b.date).localeCompare(String(a.date));
  });

  var feed = document.querySelector("#feed");
  var filters = document.querySelector("#filters");
  var empty = document.querySelector("#empty");
  var active = "全部";

  var categories = ["全部", "學校與政策", "服務", "研究"];

  function countFor(category) {
    if (category === "全部") return news.length;
    return news.filter(function (item) {
      return item.category === category;
    }).length;
  }

  function renderTally() {
    var tally = document.querySelector("#tally");
    var ask = news.filter(function (item) {
      return item.analysis.action === "現在可以問或可以做";
    }).length;
    var research = news.filter(function (item) {
      return item.analysis.action === "仍是研究，還不用做";
    }).length;
    var parts = ["這一頁有 " + news.length + " 則核對過的資料"];
    if (ask) parts.push(ask + " 則現在可以問");
    if (research) parts.push(research + " 則仍是研究");
    tally.textContent = parts.join("，") + "。";
  }

  function renderStart() {
    var section = document.querySelector("#start");
    var list = document.querySelector("#start-list");
    var ask = news.filter(function (item) {
      return item.analysis.action === "現在可以問或可以做";
    });
    list.replaceChildren();
    if (!ask.length) {
      section.hidden = true;
      return;
    }
    ask.forEach(function (item) {
      var link = document.createElement("a");
      link.className = "start-card";
      link.href = "#" + item.id;
      var art = document.createElement("img");
      art.src = drawings[item.category] || "img/research.svg";
      art.alt = "";
      var body = document.createElement("div");
      var category = document.createElement("p");
      category.className = "start-cat";
      category.textContent = item.category;
      var title = document.createElement("p");
      title.className = "start-title";
      title.textContent = item.title;
      var line = document.createElement("p");
      line.className = "start-line";
      line.textContent = item.parentLine;
      body.append(category, title, line);
      link.append(art, body);
      list.appendChild(link);
    });
  }

  function renderFilters() {
    filters.replaceChildren();
    categories.forEach(function (category) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "filter" + (category === active ? " is-active" : "");
      button.setAttribute("aria-pressed", category === active ? "true" : "false");
      button.textContent = category + " " + countFor(category);
      button.addEventListener("click", function () {
        active = category;
        renderFilters();
        renderFeed();
      });
      filters.appendChild(button);
    });
  }

  function addAnalysisRow(list, label, value) {
    var row = document.createElement("div");
    var term = document.createElement("dt");
    var detail = document.createElement("dd");
    term.textContent = label;
    detail.textContent = value;
    row.appendChild(term);
    row.appendChild(detail);
    list.appendChild(row);
  }

  var drawings = {
    "學校與政策": "img/school.svg",
    "服務": "img/service.svg",
    "研究": "img/research.svg"
  };

  function addFact(box, label, value) {
    var row = document.createElement("p");
    row.className = "fact";
    var name = document.createElement("b");
    name.textContent = label;
    var text = document.createElement("span");
    text.textContent = value;
    row.append(name, text);
    box.appendChild(row);
  }

  function renderCard(item) {
    var article = document.createElement("article");
    article.className = "card";
    article.id = item.id;
    article.dataset.action = item.analysis.action;
    article.dataset.category = item.category;

    var meta = document.createElement("p");
    meta.className = "meta";
    [item.dateLabel, item.region].forEach(function (text) {
      var span = document.createElement("span");
      span.textContent = text;
      meta.appendChild(span);
    });
    var catTag = document.createElement("span");
    catTag.className = "cat-tag";
    catTag.textContent = item.category;
    meta.appendChild(catTag);

    var title = document.createElement("h2");
    var titleLink = document.createElement("a");
    titleLink.href = "#" + item.id;
    titleLink.textContent = item.title;
    title.appendChild(titleLink);

    var summary = document.createElement("div");
    summary.className = "summary";
    item.summary.forEach(function (sentence) {
      var p = document.createElement("p");
      p.textContent = sentence;
      summary.appendChild(p);
    });

    var note = document.createElement("p");
    note.className = "parent-line";
    var noteLabel = document.createElement("span");
    noteLabel.className = "parent-label";
    noteLabel.textContent = item.analysis.action;
    var noteText = document.createElement("span");
    noteText.textContent = item.parentLine;
    note.appendChild(noteLabel);
    note.appendChild(noteText);

    var facts = document.createElement("div");
    facts.className = "facts";
    addFact(facts, "資料種類", item.analysis.kind);
    addFact(facts, "用不用得上", item.analysis.fit);
    addFact(facts, "誰發布、缺了什麼", item.analysis.gaps);

    var source = document.createElement("p");
    source.className = "source";
    var sourceLabel = document.createElement("span");
    sourceLabel.textContent = "原文";
    var link = document.createElement("a");
    link.href = item.sourceUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = item.sourceName;
    source.appendChild(sourceLabel);
    source.appendChild(link);

    var details = document.createElement("details");
    var summaryEl = document.createElement("summary");
    summaryEl.textContent = "看分析";
    var list = document.createElement("dl");
    addAnalysisRow(list, "資料種類", item.analysis.kind);
    addAnalysisRow(list, "對象", item.analysis.audience);
    addAnalysisRow(list, "做法", item.analysis.method);
    addAnalysisRow(list, "結論寫到哪", item.analysis.boundary);
    addAnalysisRow(list, "用不用得上", item.analysis.fit);
    addAnalysisRow(list, "現在做什麼", item.analysis.action);
    addAnalysisRow(list, "誰發布、缺了什麼", item.analysis.gaps);
    details.appendChild(summaryEl);
    details.appendChild(list);

    var top = document.createElement("div");
    top.className = "card-top";
    var copy = document.createElement("div");
    copy.append(meta, title);
    top.append(copy);

    article.append(top, note, facts, summary, source, details);
    if (window.JuliusMeasure) {
      article.appendChild(JuliusMeasure.buttons("info", item.id));
    }
    return article;
  }

  function renderFeed() {
    var visible = news.filter(function (item) {
      return active === "全部" || item.category === active;
    });
    feed.replaceChildren();
    visible.forEach(function (item) {
      feed.appendChild(renderCard(item));
    });
    empty.hidden = visible.length > 0;
  }

  renderTally();
  renderStart();
  renderFilters();
  renderFeed();
})();
