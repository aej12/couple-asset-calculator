document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".btn-calculate");
  let chart = null;

  const fmt = (n) => Math.round(n).toLocaleString();

  btn.addEventListener("click", () => {
    const val = (id) => parseFloat(document.getElementById(id).value) || 0;

    // 데이터 바인딩
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
    
    let labels = [], assetHistory = [], expenseHistory = [];
    let fireAge = null, deadAge = null;
    let currentAsset = data.asset;

    // 시뮬레이션 루프 (최대 100세까지)
    for (let i = 0; i <= (100 - data.ageS); i++) {
      const curAgeS = data.ageS + i;
      const curAgeP = data.ageP + i;

      // 1. 수입 계산
      const inc = ((curAgeS < data.retS ? data.incS : 0) + 
                   (curAgeP < data.retP ? data.incP : 0)) * Math.pow(1 + data.incInf, i);
      
      // 2. 지출 계산 (자녀 포함)
      const cExp = (data.childC > 0 && i < data.childY) ? 
                   (data.childC * data.childE * Math.pow(1 + data.expInf, i)) : 0;
      const totalExp = (data.exp * Math.pow(1 + data.expInf, i)) + cExp;

      // 3. 자산 업데이트
      const finInc = currentAsset * data.rate;
      currentAsset = currentAsset + finInc + inc - totalExp;

      // 4. FIRE 타겟 체크 (순자산 >= 연지출 * 25)
      if (!fireAge && currentAsset >= totalExp * 25 && currentAsset > 0) fireAge = curAgeS;
      if (!deadAge && currentAsset < 0) deadAge = curAgeS;

      // 데이터 저장
      labels.push(`${curAgeS}세`);
      assetHistory.push(currentAsset);
      expenseHistory.push(totalExp);

      // 테이블 작성
      const row = `<tr>
        <td>${curAgeS}</td><td>${curAgeP}</td>
        <td style="color:${currentAsset < 0 ? '#f04452' : '#333d4b'}">${fmt(currentAsset)}</td>
        <td>${fmt(inc)}</td><td>${fmt(totalExp)}</td>
      </tr>`;
      tableBody.insertAdjacentHTML("beforeend", row);

      if (currentAsset < -100000) break;
    }

    // 결과 표시
    document.getElementById("resultArea").classList.remove("hidden");
    const headline = document.getElementById("resultHeadline");
    const icon = document.getElementById("statusIcon");
    const summary = document.getElementById("summaryText");

    if (deadAge) {
      icon.innerText = "⚠️";
      headline.innerText = `${deadAge}세에 자산 고갈 위험`;
      headline.style.color = "#f04452";
    } else if (fireAge) {
      icon.innerText = "🚀";
      headline.innerText = `${fireAge}세에 경제적 자유 달성!`;
      headline.style.color = "#00c64b";
    }

    summary.innerHTML = `
      분석 결과, <b>${fireAge ? fireAge + '세' : '은퇴 전'}</b>에 목표 자산에 도달합니다.<br><br>
      • 목표 자산: 연 지출의 25배 기준<br>
      • 평균 수익률: 연 ${val("interestRate")}%<br>
      • 예상 고갈: ${deadAge ? deadAge + '세' : '없음(안전)'}
    `;

    // 차트
    const ctx = document.getElementById("mainChart").getContext("2d");
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
      data: {
        labels: labels,
        datasets: [{
          type: 'line', label: '순자산', data: assetHistory,
          borderColor: '#3182f6', backgroundColor: 'rgba(49,130,246,0.1)',
          fill: true, tension: 0.3, yAxisID: 'y'
        }, {
          type: 'bar', label: '연 지출', data: expenseHistory,
          backgroundColor: 'rgba(240,68,82,0.3)', yAxisID: 'y1'
        }]
      },
      options: {
        scales: {
          y: { position: 'left', title: { display: true, text: '자산 (만원)' } },
          y1: { position: 'right', grid: { display: false }, title: { display: true, text: '지출 (만원)' } }
        }
      }
    });

    window.scrollTo({ top: document.getElementById("resultArea").offsetTop - 20, behavior: "smooth" });
  });
});
