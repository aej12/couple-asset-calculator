document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("mainBtn");
  let assetChart = null;
  let expenseChart = null;

  // 1. 방문자 통계 로직 (localStorage 활용 가상 통계)
  const initVisitorStats = () => {
    let today = parseInt(localStorage.getItem('fire_today_visit') || "0");
    let total = parseInt(localStorage.getItem('fire_total_visit') || "1240"); // 기본값 1240

    // 오늘 첫 방문이면 오늘 카운트 초기화 (간단한 구현을 위해 세션 기준)
    if(!sessionStorage.getItem('visited')) {
      today++;
      total++;
      sessionStorage.setItem('visited', 'true');
      localStorage.setItem('fire_today_visit', today);
      localStorage.setItem('fire_total_visit', total);
    }

    document.getElementById('todayCount').innerText = today.toLocaleString();
    document.getElementById('totalCount').innerText = total.toLocaleString();
  };
  initVisitorStats();

  // 🌟 핵심 기능: '만원' 단위를 'X억 X000' 형태로 예쁘게 변환하는 함수 (유지)
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

  // 2. 계산하기 클릭 시 광고 및 대기 로직
  btn.addEventListener("click", () => {
    // 쿠팡 파트너스 링크 열기
    window.open("https://link.coupang.com/a/d2Gw7t", "_blank");

    // 버튼 상태 변경
    btn.disabled = true;
    let seconds = 5;
    btn.innerText = `분석 중... (${seconds}초)`;

    const timer = setInterval(() => {
      seconds--;
      if (seconds > 0) {
        btn.innerText = `분석 중... (${seconds}초)`;
      } else {
        clearInterval(timer);
        btn.disabled = false;
        btn.innerText = "시뮬레이션 시작";
        // 5초 대기 완료 후 실제 계산 로직 실행
        runSimulation();
      }
    }, 1000);
  });

  // 3. 실제 계산 및 결과 출력 로직 (기존 로직 그대로)
  function runSimulation() {
    const val = (id) => parseFloat(document.getElementById(id).value) || 0;

    const data = {
      asset: val("assetTotal"), incS: val("incomeSelf"), incP: val("incomePartner"),
      exp: val("expenseTotal"), rate: val("interestRate") / 100,
      incInf: val("incomeInflation") / 100, expInf: val("expenseInflation") / 100,
      retS: val("retireSelf"), retP: val("retirePartner"),
      ageS: val("ageSelf"), ageP: val("agePartner"),
      childC: val("childCount"), childY: val("childYears"), childE: val("childExpense")
    };

    const tableBody = document.querySelector("#resultTable tbody");
    tableBody.innerHTML = "";
    let labels = [], assetNormalData = [], assetFIREData = [];
    let incomeData = [], expBaseData = [], expChildData = [];

    let isFIRE = false;
    let fireAge = null;
    let assetNormal = data.asset;
    let assetFIRE = data.asset;

    for (let i = 0; i <= (100 - data.ageS); i++) {
      const curAgeS = data.ageS + i;
      const curAgeP = data.ageP + i;
      const curIncS = curAgeS < data.retS ? data.incS * Math.pow(1 + data.incInf, i) : 0;
      const curIncP = curAgeP < data.retP ? data.incP * Math.pow(1 + data.incInf, i) : 0;
      const incNormal = curIncS + curIncP;
      const incFIRE = isFIRE ? 0 : incNormal;
      const baseExp = data.exp * Math.pow(1 + data.expInf, i);
      const childExp = (data.childC > 0 && i < data.childY) ? (data.childC * data.childE * Math.pow(1 + data.expInf, i)) : 0;
      const totalExp = baseExp + childExp;

      assetNormal = assetNormal + (assetNormal * data.rate) + incNormal - totalExp;
      assetFIRE = assetFIRE + (assetFIRE * data.rate) + incFIRE - totalExp;

      if (!isFIRE && assetNormal >= totalExp * 25 && assetNormal > 0) {
        isFIRE = true;
        fireAge = curAgeS;
      }

      labels.push(`${curAgeS}세`);
      assetNormalData.push(assetNormal);
      assetFIREData.push(assetFIRE);
      incomeData.push(incNormal);
      expBaseData.push(baseExp);
      expChildData.push(childExp);

      tableBody.insertAdjacentHTML("beforeend", `<tr>
        <td>${curAgeS}세</td>
        <td style="color:${assetNormal < 0 ? '#f04452' : '#333d4b'}">${formatKrw(assetNormal)}</td>
        <td style="color:${assetFIRE < 0 ? '#f04452' : '#00c64b'}">${formatKrw(assetFIRE)}</td>
        <td>${formatKrw(incNormal)}</td>
        <td>${formatKrw(totalExp)}</td>
      </tr>`);
    }

    // 결과 UI 업데이트
    document.getElementById("resultArea").classList.remove("hidden");
    const headline = document.getElementById("resultHeadline");
    const summary = document.getElementById("summaryText");

    if (fireAge) {
      headline.innerText = `${fireAge}세에 파이어(FIRE) 달성 가능!`;
      headline.style.color = "#00c64b";
      summary.innerHTML = `<strong>목표 연령: ${fireAge}세</strong><br>파이어 시점부터 근로소득이 없어도 자산 수익만으로 생활이 가능합니다.`;
    } else {
      headline.innerText = `자산 고갈 위험이 있습니다.`;
      headline.style.color = "#f04452";
      summary.innerHTML = `지출을 줄이거나 투자 수익률을 높여보세요.`;
    }

    renderCharts(labels, assetNormalData, assetFIREData, incomeData, expBaseData, expChildData);

    setTimeout(() => {
      window.scrollTo({ top: document.getElementById("resultArea").offsetTop - 20, behavior: "smooth" });
    }, 100);
  }

  // 4. 차트 렌더링 함수 (기존 로직 유지)
  function renderCharts(labels, assetNormalData, assetFIREData, incomeData, expBaseData, expChildData) {
    const yAxisFormat = { callback: (val) => formatKrw(val) };
    const tooltipFormat = { callbacks: { label: (c) => `${c.dataset.label}: ${formatKrw(c.raw)}` } };

    if (assetChart) assetChart.destroy();
    assetChart = new Chart(document.getElementById("assetChart").getContext("2d"), {
      data: {
        labels: labels,
        datasets: [
          { type: 'line', label: '총 자산 (일반)', data: assetNormalData, borderColor: '#8b95a1', borderDash: [5,5], tension: 0.3 },
          { type: 'line', label: '총 자산 (FIRE)', data: assetFIREData, borderColor: '#3182f6', backgroundColor: 'rgba(49,130,246,0.1)', borderWidth: 3, fill: true, tension: 0.3 }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { tooltip: tooltipFormat }, scales: { y: { ticks: yAxisFormat } } }
    });

    if (expenseChart) expenseChart.destroy();
    expenseChart = new Chart(document.getElementById("expenseChart").getContext("2d"), {
      data: {
        labels: labels,
        datasets: [
          { type: 'line', label: '연 수입', data: incomeData, borderColor: '#00c64b', tension: 0.3 },
          { type: 'bar', label: '기본 지출', data: expBaseData, backgroundColor: '#f04452', stacked: true },
          { type: 'bar', label: '자녀 지출', data: expChildData, backgroundColor: '#ffb020', stacked: true }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { tooltip: tooltipFormat }, scales: { y: { stacked: true, ticks: yAxisFormat }, x: { stacked: true } } }
    });
  }
});
