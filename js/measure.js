/* 產品成效：家長標記資訊、檢查、家長工具有沒有幫到。
   不記孩子的答案、分數、姓名。不自動送出。 */
(function () {
  var KEY = "julius-measure";
  var FORM =
    "https://docs.google.com/forms/d/e/1FAIpQLSdGTglqdimtNw7xSjySM3lKn-nDvNH44y61kIoaYX_KUVTOTQ/viewform?usp=pp_url";

  function empty() {
    return { votes: [] };
  }

  function load() {
    try {
      var data = JSON.parse(localStorage.getItem(KEY));
      if (!data || !data.votes) return empty();
      return data;
    } catch (e) {
      return empty();
    }
  }

  function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function vote(place, id, choice) {
    var data = load();
    data.votes = data.votes.filter(function (item) {
      return !(item.place === place && item.id === id);
    });
    data.votes.push({ place: place, id: id, choice: choice, date: today() });
    save(data);
  }

  function getVote(place, id) {
    var found = null;
    load().votes.forEach(function (item) {
      if (item.place === place && item.id === id) found = item.choice;
    });
    return found;
  }

  function counts(place) {
    var tally = { useful: 0, unclear: 0, later: 0 };
    load().votes.forEach(function (item) {
      if (place && item.place !== place) return;
      if (tally[item.choice] != null) tally[item.choice] += 1;
    });
    return tally;
  }

  function formLine(place, words) {
    var n = counts(place);
    return words[0] + " " + n.useful + "、" + words[1] + " " + n.unclear + "、" + words[2] + " " + n.later;
  }

  function formUrl() {
    var text =
      "產品成效（沒有孩子的答案）：資訊" +
      formLine("info", ["有用", "看不懂", "現在用不上"]) +
      "；檢查" +
      formLine("check", ["知道下一步", "仍然不清楚", "現在用不上"]) +
      "；家長工具" +
      formLine("guide", ["有用", "看不懂", "現在用不上"]) +
      "。";
    return FORM + "&entry.89564809=" + encodeURIComponent(text);
  }

  function buttons(place, id, opts) {
    opts = opts || {};
    var choices = opts.choices || [
      ["useful", "有用"],
      ["unclear", "看不懂"],
      ["later", "現在用不上"]
    ];
    var row = document.createElement("div");
    row.className = "measure-votes";
    var label = document.createElement("span");
    label.textContent = opts.prompt || "這則對你有用嗎？";
    row.appendChild(label);
    choices.forEach(function (pair) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "measure-vote";
      button.textContent = pair[1];
      button.setAttribute("aria-pressed", getVote(place, id) === pair[0] ? "true" : "false");
      button.addEventListener("click", function () {
        vote(place, id, pair[0]);
        row.querySelectorAll("button").forEach(function (node) {
          node.setAttribute("aria-pressed", node === button ? "true" : "false");
        });
      });
      row.appendChild(button);
    });
    return row;
  }

  window.JuliusMeasure = {
    vote: vote,
    getVote: getVote,
    counts: counts,
    load: load,
    formUrl: formUrl,
    buttons: buttons
  };
})();
