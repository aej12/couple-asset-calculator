document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".btn-calculate");
  let assetChart = null;
  let expenseChart = null;

  // 🌟 핵심 기능: '만원' 단위를 'X억 X000' 형태로 예쁘게 변환하는 함수
  const formatKrw = (num) => {
    if (num === 0) return "0";
    let isNegative = num < 0;
    let absN = Math.abs(Math.round(num));
    let result = "";
    
    if (absN >= 10000) {
      let uk = Math.floor(absN / 10000); // 억 단위
      let man = absN % 10000;            // 만 단위
      result = `${uk}억`;
      if (man > 0) result += ` ${man.toLocaleString()}`; // 예: 1억 5000
    } else {
      result = `${absN.toLocaleString()}`; // 1억 미만은 콤마만
    }
    
    return isNegative ? `-${result}` : result;
  };

  btn.addEventListener("click", () => {
    const val = (id) => parseFloat(document.getElementById(id).value) || 0;

    const data = {
      asset: val("assetTotal"),
      incS: val("incomeSelf"),
      incP: val("incomePartner"),
      exp: val("expenseTotal"),
      rate: val("interestRate") / 100,
      incInf: val("incomeInflation") / 100,
      expInf: val("expenseInflation") / 100,
      retS: val("retireSelf"),
      retP: val("retirePartner"),
      ageS: val("ageSelf"),
      ageP: val("agePartner"),
      childC: val("childCount"),
      childY: val("childYears"),
      childE: val("childExpense")
    };

    const tableBody = document.querySelector("#resultTable tbody");
    tableBody.innerHTML = "";
    
    let labels = [];
    let assetNormalData = [], assetFIREData = [];
    let incomeData = [], expBaseData = [], expChildData = [];

    let isFIRE = false;
    let fireAge = null;
    let deadAgeNormal = null, deadAgeFIRE = null;
    
    let assetNormal = data.asset;
    let assetFIRE = data.asset;

    // 시뮬레이션 (최대 100세)
    for (let i = 0; i <= (100 - data.ageS); i++) {
      const curAgeS = data.ageS + i;
      const curAgeP = data.ageP + i;

      // 1. 소득 계산
      const curIncS = curAgeS < data.retS ? data.incS * Math.pow(1 + data.incInf, i) : 0;
      const curIncP = curAgeP < data.retP ? data.incP * Math.pow(1 + data.incInf, i) : 0;
      const incNormal = curIncS + curIncP;
      
      // 파이어 달성 시 소득 0원으로 계산 (달성한 '다음 해'부터 적용)
      const incFIRE = isFIRE ? 0 : incNormal;

      // 2. 지출 계산
      const baseExp = data.exp * Math.pow(1 + data.expInf, i);
      const childExp = (data.childC > 0 && i < data.childY) ? (data.childC * data.childE * Math.pow(1 + data.expInf, i)) : 0;
      const totalExp = baseExp + childExp;

      // 3. 자산 증식 및 지출 차감
      const finIncNormal = assetNormal * data.rate;
      const finIncFIRE = assetFIRE * data.rate;

      assetNormal = assetNormal + finIncNormal + incNormal - totalExp;
      assetFIRE = assetFIRE + finIncFIRE + incFIRE - totalExp;

      // 4. FIRE 조건 (순자산 >= 연지출 * 25)
      if (!isFIRE && assetNormal >= totalExp * 25 && assetNormal > 0) {
        isFIRE = true;
        fireAge = curAgeS;
      }

      if (!deadAgeNormal && assetNormal < 0) deadAgeNormal = curAgeS;
      if (!deadAgeFIRE && assetFIRE < 0) deadAgeFIRE = curAgeS;

      labels.push(`${curAgeS}세`);
      assetNormalData.push(assetNormal);
      assetFIREData.push(assetFIRE);
      incomeData.push(incNormal);
      expBaseData.push(baseExp);
      expChildData.push(childExp);

      // 테이블 작성 (formatKrw 사용)
      const row = `<tr>
        <td>${curAgeS}세</td>
        <td style="color:${assetNormal < 0 ? '#f04452' : '#333d4b'}">${formatKrw(assetNormal)}</td>
        <td style="color:${assetFIRE < 0 ? '#f04452' : '#00c64b'}">${formatKrw(assetFIRE)}</td>
        <td>${formatKrw(incNormal)}</td>
        <td>${formatKrw(totalExp)}</td>
      </tr>`;
      tableBody.insertAdjacentHTML("beforeend", row);
    }

    document.getElementById("resultArea").classList.remove("hidden");
    const headline = document.getElementById("resultHeadline");
    const icon = document.getElementById("statusIcon");
    const summary = document.getElementById("summaryText");

    if (fireAge) {
      icon.innerText = "🎉";
      headline.innerText = `${fireAge}세에 파이어(FIRE) 달성 가능!`;
      headline.style.color = "#00c64b";
      summary.innerHTML = `
        <strong>목표 연령: ${fireAge}세</strong><br>
        파이어 시점부터 근로소득이 0원이 되어도, 자산 수익만으로 생활비를 충당할 수 있습니다.<br>
        <span style="font-size:12px; color:#8b95a1;">(투자 수익률 연 ${data.rate*100}% 유지 기준)</span>
      `;
    } else {
      icon.innerText = "⚠️";
      headline.innerText = `자산 고갈 위험이 있습니다.`;
      headline.style.color = "#f04452";
      summary.innerHTML = `현재 설정으로는 목표 달성 전에 자산이 감소합니다.<br>지출을 줄이거나 투자 수익률을 높여보세요.`;
    }

    // 공통 툴팁 포맷 (억 단위 변환)
    const tooltipFormat = {
      callbacks: { label: (c) => `${c.dataset.label}: ${formatKrw(c.raw)}` }
    };
    
    // Y축 단위 포맷 (억 단위 변환)
    const yAxisFormat = {
      callback: function(value) { return formatKrw(value); }
    };

    // --- 차트 1: 자산 & 소득 추이 ---
    const ctx1 = document.getElementById("assetChart").getContext("2d");
    if (assetChart) assetChart.destroy();
    assetChart = new Chart(ctx1, {
      data: {
        labels: labels,
        datasets: [
          {
            type: 'line', label: '총 자산 (일반 은퇴)', data: assetNormalData,
            borderColor: '#8b95a1', backgroundColor: 'transparent',
            borderWidth: 2, borderDash: [5, 5], tension: 0.3, yAxisID: 'y'
          },
          {
            type: 'line', label: '총 자산 (파이어 시)', data: assetFIREData,
            borderColor: '#3182f6', backgroundColor: 'rgba(49,130,246,0.1)',
            borderWidth: 3, fill: true, tension: 0.3, yAxisID: 'y'
          },
          {
            type: 'bar', label: '연 소득 (일반)', data: incomeData,
            backgroundColor: 'rgba(233, 236, 240, 0.6)', yAxisID: 'y1', borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // 🌟 높이 고정을 위해 필수
        interaction: { mode: 'index', intersect: false },
        plugins: { tooltip: tooltipFormat },
        scales: {
          y: { type: 'linear', position: 'left', title: { display: true, text: '총 자산' }, ticks: yAxisFormat },
          y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: '연 소득' }, ticks: yAxisFormat }
        }
      }
    });

    // --- 차트 2: 지출 & 수입 비교 ---
    const ctx2 = document.getElementById("expenseChart").getContext("2d");
    if (expenseChart) expenseChart.destroy();
    expenseChart = new Chart(ctx2, {
      data: {
        labels: labels,
        datasets: [
          {
            type: 'line', label: '연 수입 흐름', data: incomeData,
            borderColor: '#00c64b', backgroundColor: 'transparent',
            borderWidth: 3, tension: 0.3
          },
          {
            type: 'bar', label: '기본 연 지출', data: expBaseData,
            backgroundColor: '#f04452', stacked: true, borderRadius: 4
          },
          {
            type: 'bar', label: '자녀 지출', data: expChildData,
            backgroundColor: '#ffb020', stacked: true, borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // 🌟 높이 고정을 위해 필수
        interaction: { mode: 'index', intersect: false },
        plugins: { tooltip: tooltipFormat },
        scales: {
          x: { stacked: true },
          y: { stacked: true, title: { display: true, text: '금액' }, ticks: yAxisFormat }
        }
      }
    });

    // 스크롤 이동
    setTimeout(() => {
      window.scrollTo({ top: document.getElementById("resultArea").offsetTop - 20, behavior: "smooth" });
    }, 100);
  });
});
