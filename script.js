document.addEventListener("DOMContentLoaded", () => {
  const mainBtn = document.getElementById("mainBtn");
  let assetChart = null;
  let expenseChart = null;
  let isAdClicked = false;

  // 1. 방문자 통계
  const updateVisitors = () => {
    let total = parseInt(localStorage.getItem("total_v") || 3852);
    let today = parseInt(localStorage.getItem("today_v") || 124);
    total++; today++;
    localStorage.setItem("total_v", total);
    localStorage.setItem("today_v", today);
    document.getElementById("totalVisit").innerText = total.toLocaleString();
    document.getElementById("todayVisit").innerText = today.toLocaleString();
  };
  updateVisitors();

  // 2. 억 단위 한글 변환 함수
  const formatKrw = (num) => {
    if (num === 0) return "0";
    let isNegative = num < 0;
    let absN = Math.abs(Math.round(num));
    let result = "";
    if (absN >= 10000) {
      let uk = Math.floor(absN / 10000);
      let man = absN % 10000;
      result = `${uk}억`;
      if (man > 0) result += ` ${man.toLocaleString()}`;
    } else {
      result = `${absN.toLocaleString()}`;
    }
    return isNegative ? `-${result}` : result;
  };

  // 3. 버튼 클릭 이벤트 (쿠팡 5초 게이트)
  mainBtn.addEventListener("click", () => {
    if (!isAdClicked) {
      window.open("https://link.coupang.com/a/d2Gw7t", "_blank");
      isAdClicked = true;
      let count = 5;
      mainBtn.disabled = true;
      const timer = setInterval(() => {
        mainBtn.innerText = `분석 준비 중... ${count}초`;
        count--;
        if (count < 0) {
          clearInterval(timer);
          mainBtn.disabled = false;
          mainBtn.innerText = "분석 결과 확인하기";
          mainBtn.style.background = "#00c64b";
        }
      }, 1000);
    } else {
      calculateFIRE();
    }
  });

  // 4. 시뮬레이션 계산 로직
  function calculateFIRE() {
    const val = (id) => parseFloat(document.getElementById(id).value) || 0;
    const data = {
      asset: val("assetTotal"), incS: val("incomeSelf"), incP: val("incomePartner"),
      exp: val("expenseTotal"), rate: val("interestRate") / 100,
      expInf: val("expenseInflation") / 100, incInf: val("incomeInflation") / 100,
      retS: val("retireSelf"), retP: val("retirePartner"),
      ageS: val("ageSelf"), ageP: val("agePartner"),
      childC: val("childCount"), childY: val("childYears"), childE: val("childExpense")
    };

    const tableBody = document.querySelector("#resultTable tbody");
    tableBody.innerHTML = "";
    let labels = [], assetN = [], assetF = [], incD = [], expB = [], expC = [];
    let isFIRE = false, fireAge = null, aN = data.asset, aF = data.asset;

    for (let i = 0; i <= (100 - data.ageS); i++) {
      let curAgeS = data.ageS + i;
      let curAgeP = data.ageP + i;
      let curInc = (curAgeS < data.retS ? data.incS * Math.pow(1 + data.incInf, i) : 0) + 
                   (curAgeP < data.retP ? data.incP * Math.pow(1 + data.incInf, i) : 0);
      let baseExp = data.exp * Math.pow(1 + data.expInf, i);
      let childExp = (i < data.childY) ? (data.childC * data.childE * Math.pow(1 + data.expInf, i)) : 0;
      let totalExp = baseExp + childExp;

      aN = aN * (1 + data.rate) + curInc - totalExp;
      aF = aF * (1 + data.rate) + (isFIRE ? 0 : curInc) - totalExp;

      if (!isFIRE && aN >= totalExp * 25 && aN > 0) { isFIRE = true; fireAge = curAgeS; }

      labels.push(`${curAgeS}세`);
      assetN.push(aN); assetF.push(aF); incD.push(curInc); expB.push(baseExp); expC.push(childExp);

      tableBody.insertAdjacentHTML("beforeend", `<tr>
        <td>${curAgeS}세</td>
        <td>${formatKrw(aN)}</td>
        <td style="color:#00c64b">${formatKrw(aF)}</td>
        <td>${formatKrw(curInc)}</td>
        <td>${formatKrw(totalExp)}</td>
      </tr>`);
    }

    document.getElementById("resultArea").classList.remove("hidden");
    document.getElementById("resultHeadline").innerText = fireAge ? `${fireAge}세에 파이어 달성!` : "분석 결과";
    document.getElementById("summaryText").innerHTML = fireAge ? `목표 연령 <strong>${fireAge}세</strong>에 경제적 자유가 가능합니다.` : "현재 설정으로는 자산 고갈 위험이 있습니다.";

    renderCharts(labels, assetN, assetF, incD, expB, expC);
    window.scrollTo({ top: document.getElementById("resultArea").offsetTop - 20, behavior: "smooth" });
  }

  function renderCharts(labels, assetN, assetF, incD, expB, expC) {
    const commonY = { ticks: { callback: (v) => formatKrw(v) } };
    const commonTip = { callbacks: { label: (c) => `${c.dataset.label}: ${formatKrw(c.raw)}` } };

    if (assetChart) assetChart.destroy();
    assetChart = new Chart(document.getElementById("assetChart"), {
      data: {
        labels: labels,
        datasets: [
          { type: 'line', label: '일반 자산', data: assetN, borderColor: '#8b95a1', borderWidth: 1, borderDash: [5, 5] },
          { type: 'line', label: '파이어 자산', data: assetF, borderColor: '#3182f6', borderWidth: 3, fill: true, backgroundColor: 'rgba(49,130,246,0.1)' }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { tooltip: commonTip }, scales: { y: commonY } }
    });

    if (expenseChart) expenseChart.destroy();
    expenseChart = new Chart(document.getElementById("expenseChart"), {
      data: {
        labels: labels,
        datasets: [
          { type: 'line', label: '수입', data: incD, borderColor: '#00c64b', borderWidth: 2 },
          { type: 'bar', label: '지출', data: expB.map((v, i) => v + expC[i]), backgroundColor: '#f04452' }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { tooltip: commonTip }, scales: { y: commonY } }
    });
  }
});
