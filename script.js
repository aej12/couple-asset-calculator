document.addEventListener("DOMContentLoaded", function() {
  const button = document.querySelector(".calculate-btn");
  const summarySection = document.getElementById("summarySection");
  const resultSection = document.getElementById("resultSection");
  const summaryText = document.getElementById("summaryText");
  const yearlyTable = document.getElementById("yearlyTable");
  const chartCanvas = document.getElementById("assetChart");
  let chart;

  // 천 단위 콤마 포맷 함수 (.0 제거)
  function formatNum(num) {
    return Math.round(num).toLocaleString();
  }

  button.addEventListener("click", function() {
    // 1. 입력값 가져오기
    const ageSelf = parseInt(document.getElementById("ageSelf").value);
    const agePartner = parseInt(document.getElementById("agePartner").value);
    let currentAsset = parseFloat(document.getElementById("assetTotal").value);
    const incomeSelf = parseFloat(document.getElementById("incomeSelf").value);
    const incomePartner = parseFloat(document.getElementById("incomePartner").value);
    const incomeGrowth = parseFloat(document.getElementById("incomeGrowth").value) / 100;
    const expenseTotal = parseFloat(document.getElementById("expenseTotal").value);
    const interestRate = parseFloat(document.getElementById("interestRate").value) / 100;
    const expenseInflation = parseFloat(document.getElementById("expenseInflation").value) / 100;
    const retireSelf = parseInt(document.getElementById("retireSelf").value);
    const retirePartner = parseInt(document.getElementById("retirePartner").value);
    
    const childCount = parseInt(document.getElementById("childCount").value);
    const childYearsRemaining = parseInt(document.getElementById("childYearsRemaining").value);
    const childAnnualExpense = parseFloat(document.getElementById("childAnnualExpense").value);

    const maxAge = 100;
    const years = maxAge - ageSelf; // 본인 나이 기준 100세까지 계산

    // 데이터 배열 초기화
    let labels = [];
    let assetData = [];
    let incomeData = [];
    let expenseData = [];
    let childExpenseData = [];

    yearlyTable.innerHTML = "";
    
    let bankruptAge = null;
    let fireAge = null; // 경제적 자유 달성 나이

    // 2. 연도별 계산 루프
    for (let i = 0; i < years; i++) {
      let currentAgeSelf = ageSelf + i;
      let currentAgePartner = agePartner + i;

      // 수입 계산 (물가상승률 반영, 은퇴 나이 전까지만)
      let currentIncomeSelf = currentAgeSelf < retireSelf ? incomeSelf * Math.pow(1 + incomeGrowth, i) : 0;
      let currentIncomePartner = currentAgePartner < retirePartner ? incomePartner * Math.pow(1 + incomeGrowth, i) : 0;
      let annualIncome = currentIncomeSelf + currentIncomePartner;

      // 지출 계산 (물가상승률 반영)
      let adjustedExpense = expenseTotal * Math.pow(1 + expenseInflation, i);
      
      // 자녀 지출 (입력한 '남은 년수'까지만 적용)
      let childExpense = 0;
      if (childCount > 0 && i < childYearsRemaining) {
        childExpense = childCount * childAnnualExpense * Math.pow(1 + expenseInflation, i);
      }
      
      let totalExpense = adjustedExpense + childExpense;

      // 경제적 자유 조건 체크 (금융소득이 총 지출을 넘어서는 시점)
      let passiveIncome = currentAsset > 0 ? currentAsset * interestRate : 0;
      if (fireAge === null && passiveIncome >= totalExpense && currentAsset > 0) {
        fireAge = currentAgeSelf;
      }

      // 순자산 계산: 이전 자산 + 이자수익 + 근로소득 - 총지출
      currentAsset = currentAsset * (1 + interestRate) + annualIncome - totalExpense;

      // 파산 시점 체크
      if (currentAsset < 0 && bankruptAge === null) {
        bankruptAge = currentAgeSelf;
      }

      // 테이블 행 생성
      let tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${currentAgeSelf}(${currentAgePartner})세</td>
        <td>${formatNum(currentAsset)}</td>
        <td>${formatNum(annualIncome)}</td>
        <td>${formatNum(adjustedExpense)}</td>
        <td>${formatNum(childExpense)}</td>
      `;
      yearlyTable.appendChild(tr);

      // 그래프용 데이터 푸시
      labels.push(`${currentAgeSelf}세`);
      assetData.push(Math.round(currentAsset));
      incomeData.push(Math.round(annualIncome));
      expenseData.push(Math.round(totalExpense));
      childExpenseData.push(Math.round(childExpense));
    }

    // 3. 요약 텍스트 작성
    let initialMonthlyIncome = Math.round((incomeSelf + incomePartner) / 12);
    let initialMonthlyExpense = Math.round(expenseTotal / 12);
    
    let resultMessage = "";
    if (bankruptAge !== null) {
      resultMessage = `이대로 계산하면 당신은 <span class="highlight-red">${bankruptAge}세에 파산</span>하게 됩니다. 😢`;
    } else if (fireAge !== null) {
      resultMessage = `축하합니다! 이대로면 당신은 <span class="highlight-blue">${fireAge}세에 경제적 자유(은퇴)</span>를 달성할 수 있습니다. 🎉`;
    } else {
      resultMessage = `100세까지 파산하지는 않지만, 완전히 일하지 않고 살 수 있는 경제적 자유 시점에는 도달하지 못했습니다. 투자를 늘리거나 지출을 줄여보세요!`;
    }

    summaryText.innerHTML = `
      <p>${resultMessage}</p>
      <p>1. <strong>${ageSelf}세</strong>부터 월 <strong>${formatNum(initialMonthlyIncome)}만 원</strong>을 벌고, 월 <strong>${formatNum(initialMonthlyExpense)}만 원</strong>씩 기본 지출하는 것을 기준으로 계산했습니다.</p>
      <p>2. 매년 소비와 수입이 <strong>${(expenseInflation * 100).toFixed(1)}%, ${(incomeGrowth * 100).toFixed(1)}%</strong>씩 늘어나는 것으로 가정하며, 자녀 독립 후에는 자녀 지출이 자동으로 차감됩니다.</p>
      <p>3. 매년 순자산(그 해 쓰고 남은 돈 + 이전 년도 순자산)을 기준으로, 다음 해 연 <strong>${(interestRate * 100).toFixed(1)}%</strong>의 금융 소득을 낸다고 가정했습니다.</p>
    `;

    // 4. 그래프 그리기 (Chart.js 다중 라인)
    summarySection.style.display = "block";
    resultSection.style.display = "block";

    const ctx = chartCanvas.getContext('2d');
    if (chart) chart.destroy();
    
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: '누적 순자산',
            data: assetData,
            borderColor: '#3182f6',
            backgroundColor: 'rgba(49, 130, 246, 0.1)',
            fill: true,
            tension: 0.3,
            yAxisID: 'y'
          },
          {
            label: '총 수입',
            data: incomeData,
            borderColor: '#20c997',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            tension: 0.3,
            yAxisID: 'y1'
          },
          {
            label: '총 지출 (기본+자녀)',
            data: expenseData,
            borderColor: '#f04452',
            backgroundColor: 'transparent',
            tension: 0.3,
            yAxisID: 'y1'
          },
          {
            label: '자녀 지출',
            data: childExpenseData,
            borderColor: '#ff9800',
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0.3,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: { display: true, text: '순자산 (만원)' }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: { display: true, text: '수입/지출 (만원)' },
            grid: { drawOnChartArea: false }
          }
        }
      }
    });
  });
});
