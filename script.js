document.addEventListener("DOMContentLoaded", () => {
  const mainBtn = document.getElementById("mainBtn");
  let assetChart = null;
  let expenseChart = null;

  // 1. 방문자 통계 (시뮬레이션)
  const setVisitorStats = () => {
    let today = localStorage.getItem('fire_today') || Math.floor(Math.random() * 50) + 100;
    let total = localStorage.getItem('fire_total') || 3421;
    if(!sessionStorage.getItem('v_inc')) {
      today = Number(today) + 1;
      total = Number(total) + 1;
      localStorage.setItem('fire_today', today);
      localStorage.setItem('fire_total', total);
      sessionStorage.setItem('v_inc', '1');
    }
    document.getElementById('todayCount').innerText = Number(today).toLocaleString();
    document.getElementById('totalCount').innerText = Number(total).toLocaleString();
  };
  setVisitorStats();

  // 2. 억 단위 한글 변환
  const formatKrw = (num) => {
    if (num === 0) return "0";
    let absN = Math.abs(Math.round(num));
    if (absN >= 10000) {
      let uk = Math.floor(absN / 10000);
      let man = absN % 10000;
      return num < 0 ? `-${uk}억 ${man.toLocaleString()}` : `${uk}억 ${man.toLocaleString()}`;
    }
    return num.toLocaleString();
  };

  // 3. 🌟 버튼 클릭 로직 (가장 중요)
  mainBtn.addEventListener("click", () => {
    // 1. 쿠팡 열기
    window.open("https://link.coupang.com/a/d2Gw7t", "_blank");

    // 2. 버튼 상태 변경
    mainBtn.disabled = true;
    let count = 5;
    mainBtn.innerText = `분석 중... ${count}초`;

    // 3. 타이머 시작
    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        mainBtn.innerText = `분석 중... ${count}초`;
      } else {
        clearInterval(timer);
        mainBtn.disabled = false;
        mainBtn.innerText = "분석 완료 (결과보기)";
        // 버튼 누르면 바로 실행되도록 연결
        runSimulation();
      }
    }, 1000);
  });

  function runSimulation() {
    const val = (id) => parseFloat(document.getElementById(id).value) || 0;
    const data = {
      asset: val("assetTotal"), incS: val("incomeSelf"), incP: val("incomePartner"),
      exp: val("expenseTotal"), rate: val("interestRate")/100,
      expInf: val("expenseInflation")/100, ageS: val("ageSelf"), ageP: val("agePartner"),
      retS: val("retireSelf"), retP: val("retirePartner"),
      childC: val("childCount"), childY: val("childYears"), childE: val("childExpense")
    };

    const tableBody = document.querySelector("#resultTable tbody");
    tableBody.innerHTML = "";
    let labels = [], assetN = [], assetF = [], incD = [], expD = [];
    let isFIRE = false, fireAge = null, aN = data.asset, aF = data.asset;

    for (let i = 0; i <= (100 - data.ageS); i++) {
      let curAgeS = data.ageS + i;
      let curAgeP = data.ageP + i;
      let curInc = (curAgeS < data.retS ? data.incS * Math.pow(1.03, i) : 0) + (curAgeP < data.retP ? data.incP * Math.pow(1.03, i) : 0);
      let totalExp = (data.exp * Math.pow(1 + data.expInf, i)) + (i < data.childY ? data.childC * data.childE : 0);

      aN = aN * (1 + data.rate) + curInc - totalExp;
      aF = aF * (1 + data.rate) + (isFIRE ? 0 : curInc) - totalExp;

      if (!isFIRE && aN >= totalExp * 25 && aN > 0) { isFIRE = true; fireAge = curAgeS; }

      labels.push(`${curAgeS}세`);
      assetN.push(aN); assetF.push(aF); incD.push(curInc); expD.push(totalExp);

      tableBody.insertAdjacentHTML("beforeend", `<tr><td>${curAgeS}세</td><td>${formatKrw(aN)}</td><td>${formatKrw(aF)}</td><td>${formatKrw(curInc)}</td><td>${formatKrw(totalExp)}</td></tr>`);
    }

    document.getElementById("resultArea").classList.remove("hidden");
    document.getElementById("resultHeadline").innerText = fireAge ? `${fireAge}세 파이어 가능!` : "분석 결과";
    document.getElementById("summaryText").innerHTML = fireAge ? `<strong>${fireAge}세</strong>에 경제적 자유를 얻을 수 있습니다.` : "현재 설정으로는 자산이 부족할 수 있습니다.";
    
    renderCharts(labels, assetN, assetF, incD, expD);
    window.scrollTo({ top: document.getElementById("resultArea").offsetTop - 20, behavior: "smooth" });
  }

  function renderCharts(labels, assetN, assetF, incD, expD) {
    const tip = { callbacks: { label: (c) => `${c.dataset.label}: ${formatKrw(c.raw)}` } };
    const ySc = { ticks: { callback: (v) => formatKrw(v) } };

    if (assetChart) assetChart.destroy();
    assetChart = new Chart(document.getElementById("assetChart"), {
      data: { labels: labels, datasets: [
        { type: 'line', label: '일반 자산', data: assetN, borderColor: '#b0b8c1', borderWidth: 1, borderDash: [5,5] },
        { type: 'line', label: 'FIRE 자산', data: assetF, borderColor: '#3182f6', borderWidth: 3, fill: true, backgroundColor: 'rgba(49,130,246,0.1)' }
      ]},
      options: { responsive: true, maintainAspectRatio: false, plugins: { tooltip: tip }, scales: { y: ySc } }
    });

    if (expenseChart) expenseChart.destroy();
    expenseChart = new Chart(document.getElementById("expenseChart"), {
      data: { labels: labels, datasets: [
        { type: 'line', label: '연 수입', data: incD, borderColor: '#00c64b', borderWidth: 2 },
        { type: 'bar', label: '연 지출', data: expD, backgroundColor: '#f04452' }
      ]},
      options: { responsive: true, maintainAspectRatio: false, plugins: { tooltip: tip }, scales: { y: ySc } }
    });
  }
});
