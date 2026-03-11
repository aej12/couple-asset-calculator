document.addEventListener("DOMContentLoaded", function() {
  const summaryDiv = document.getElementById("summary");
  const yearlyTable = document.getElementById("yearlyTable");
  const button = document.querySelector(".calculate-btn");
  const chartCanvas = document.getElementById("assetChart");
  const resultContainer = document.getElementById("resultContainer");
  const resultTitle = document.getElementById("resultTitle");
  let chart;

  // 천 단위 콤마 포맷 (.0 제거 및 반올림)
  function formatNumber(num) {
    return Math.round(num).toLocaleString();
  }

  button.addEventListener("click", function() {
    // 입력값 가져오기
    const ageSelf = parseInt(document.getElementById("ageSelf").value);
    const agePartner = parseInt(document.getElementById("agePartner").value);
    let currentAsset = parseFloat(document.getElementById("assetTotal").value);
    
    const incomeSelfInitial = parseFloat(document.getElementById("incomeSelf").value);
    const incomePartnerInitial = parseFloat(document.getElementById("incomePartner").value);
    const expenseTotalInitial = parseFloat(document.getElementById("expenseTotal").value);
    
    const interestRate = parseFloat(document.getElementById("interestRate").value) / 100;
    const incomeInflation = parseFloat(document.getElementById("incomeInflation").value) / 100;
    const expenseInflation = parseFloat(document.getElementById("expenseInflation").value) / 100;
    
    const retireSelf = parseInt(document.getElementById("retireSelf").value);
    const retirePartner = parseInt(document.getElementById("retirePartner").value);

    const childCount = parseInt(document.getElementById("childCount").value);
    const childIndependenceYears = parseInt(document.getElementById("childIndependenceYears").value);
    const childAnnualExpense = parseFloat(document.getElementById("childAnnualExpense").value);

    // 계산 기간 (100세 기준)
    const maxAge = 100;
    const years = maxAge - Math.min(ageSelf, agePartner);

    yearlyTable.innerHTML = "";
    let labels = [];
    let assetData = [];
    let childExpenseData = []; // 자녀 지출 시각화용 (원하시면 차트에 추가 가능)

    let fireAgeSelf = null;
    let depleteAgeSelf = null;

    // 시뮬레이션 시작
    for (let i = 0; i < years; i++) {
      let currentAgeSelf = ageSelf + i;
      let currentAgePartner = agePartner + i;

      // 1. 근로 소득 계산 (은퇴 전까지만 발생, 근로소득 상승률 적용)
      let currentIncomeSelf = (currentAgeSelf < retireSelf) ? incomeSelfInitial * Math.pow(1 + incomeInflation, i) : 0;
      let currentIncomePartner = (currentAgePartner < retirePartner) ? incomePartnerInitial * Math.pow(1 + incomeInflation, i) : 0;
      let totalEarnedIncome = currentIncomeSelf + currentIncomePartner;

      // 2. 지출 계산 (물가상승률 적용)
      let baseExpense = expenseTotalInitial * Math.pow(1 + expenseInflation, i);
      
      // 자녀 지출 (현재 입력 기준에서 남은 년수 i가 childIndependenceYears 보다 작을 때만 적용)
      let childExpense = 0;
      if (childCount > 0 && i < childIndependenceYears) {
        childExpense = childCount * childAnnualExpense * Math.pow(1 + expenseInflation, i);
      }
      
      let totalExpense = baseExpense + childExpense;

      // 3. 금융 소득 (현재 자산 * 이자율)
      let financialIncome = currentAsset * interestRate;

      // 4. 자산 업데이트 (기존자산 + 금융소득 + 근로소득 - 총지출)
      currentAsset = currentAsset + financialIncome + totalEarnedIncome - totalExpense;

      // [파이어(FIRE) 달성 조건 체크]
      // 금융소득이 근로소득의 1.5배 이상이 되는 최초 시점
      // (근로소득이 0원 초과일 때를 기준으로 계산)
      if (fireAgeSelf === null && totalEarnedIncome > 0 && financialIncome >= (totalEarnedIncome * 1.5)) {
        fireAgeSelf = currentAgeSelf;
      }

      // [자산 고갈 조건 체크]
      if (depleteAgeSelf === null && currentAsset < 0) {
        depleteAgeSelf = currentAgeSelf;
      }

      // 테이블 행 추가
      let tr = document.createElement("tr");
      // 자산이 마이너스일 경우 빨간색으로 표시
      let assetColor = currentAsset < 0 ? 'color: var(--danger-color); font-weight: bold;' : '';
      
      tr.innerHTML = `
        <td>${currentAgeSelf}</td>
        <td>${currentAgePartner}</td>
        <td style="${assetColor}">${formatNumber(currentAsset)}</td>
        <td>${formatNumber(totalEarnedIncome)}</td>
        <td>${formatNumber(totalExpense)}</td>
      `;
      yearlyTable.appendChild(tr);

      labels.push(currentAgeSelf);
      assetData.push(currentAsset);
      childExpenseData.push(childExpense);
      
      // 고갈 후 5년까지만 그리고 중단하여 그래프 가독성 확보
      if (currentAsset < -50000) { 
          break;
      }
    }

    // 결과 텍스트 생성
    let resultMessage = "";
    if (depleteAgeSelf !== null) {
      resultMessage = `<div class="result-highlight result-danger">⚠️ ${depleteAgeSelf}세에 자산이 고갈됩니다.</div>`;
    } else if (fireAgeSelf !== null) {
      resultMessage = `<div class="result-highlight result-success">🎉 ${fireAgeSelf}세에 파이어(FIRE)가 가능합니다!</div>`;
    } else {
      resultMessage = `<div class="result-highlight" style="color:var(--primary-color);">100세까지 자산이 고갈되지 않으나, 파이어 조건에는 도달하지 못했습니다.</div>`;
    }

    // 월 단위 수입/지출 계산 (초기값 기준, 만원 단위 -> 원 단위 변환)
    const initialMonthlyIncomeWon = Math.round(((incomeSelfInitial + incomePartnerInitial) * 10000) / 12);
    const initialMonthlyExpenseWon = Math.round((expenseTotalInitial * 10000) / 12);

    summaryDiv.innerHTML = `
      ${resultMessage}
      <div class="summary-box">
        <div class="summary-text">
          <strong>📌 계산 가정 설명</strong><br>
          • <b>현재 기준:</b> 월 ${initialMonthlyIncomeWon.toLocaleString()}원 수입 / 월 ${initialMonthlyExpenseWon.toLocaleString()}원 지출<br>
          • <b>상승률 가정:</b> 근로소득 증가율 ${(incomeInflation*100).toFixed(1)}% / 지출 상승률 ${(expenseInflation*100).toFixed(1)}%<br>
          • <b>투자 가정:</b> 투자 수익률 연 ${(interestRate*100).toFixed(1)}%<br>
          • <b>자녀 지출:</b> 향후 ${childIndependenceYears}년간 총 지출에 자동 합산 (이후 자동 제외)<br>
          <span class="hint-text" style="margin-top:8px;">* 파이어(FIRE) 조건: 해당 연도의 금융 소득이 근로 소득의 1.5배를 초과하는 시점</span>
        </div>
      </div>
    `;

    // 결과 섹션 노출
    resultContainer.style.display = "block";
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // 차트 그리기
    const ctx = chartCanvas.getContext('2d');
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels.map(a => `${a}세`),
        datasets: [{
          label: '누적 순자산 (만원)',
          data: assetData,
          borderColor: '#3182f6',
          backgroundColor: 'rgba(49, 130, 246, 0.15)',
          borderWidth: 3,
          pointRadius: 0,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `순자산: ${formatNumber(context.parsed.y)}만원`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#e5e8eb' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  });
});
