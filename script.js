document.addEventListener("DOMContentLoaded", function() {
  const summaryDiv = document.getElementById("summary");
  const yearlyTable = document.getElementById("yearlyTable");
  const button = document.querySelector(".calculate-btn");
  const chartCanvas = document.getElementById("assetChart");
  let chart;

  function formatNumber(num){
    return Number(num.toFixed(0)).toLocaleString();
  }

  button.addEventListener("click", function() {
    const ageSelf = parseInt(document.getElementById("ageSelf").value);
    const agePartner = parseInt(document.getElementById("agePartner").value);
    let currentAsset = parseFloat(document.getElementById("assetTotal").value);
    const incomeSelf = parseFloat(document.getElementById("incomeSelf").value);
    const incomePartner = parseFloat(document.getElementById("incomePartner").value);
    const incomeIncrease = parseFloat(document.getElementById("incomeIncrease").value)/100;
    const expenseTotal = parseFloat(document.getElementById("expenseTotal").value);
    const expenseInflation = parseFloat(document.getElementById("expenseInflation").value)/100;
    const retireSelf = parseInt(document.getElementById("retireSelf").value);
    const retirePartner = parseInt(document.getElementById("retirePartner").value);

    const childCount = parseInt(document.getElementById("childCount").value);
    const childIndependenceAge = parseInt(document.getElementById("childIndependenceAge").value);
    const childAnnualExpense = parseFloat(document.getElementById("childAnnualExpense").value);

    const maxAge = 100;
    const years = maxAge - Math.min(ageSelf, agePartner);

    yearlyTable.innerHTML = "";
    let labels = [];
    let assetData = [];
    let childSaveData = [];

    const childYearsRemaining = childIndependenceAge;

    for(let i=0;i<years;i++){
      let currentAgeSelf = ageSelf + i;
      let currentAgePartner = agePartner + i;

      // 연 수입 증가율 적용
      let annualIncome = 0;
      if(currentAgeSelf < retireSelf) annualIncome += incomeSelf * Math.pow(1 + incomeIncrease, i);
      if(currentAgePartner < retirePartner) annualIncome += incomePartner * Math.pow(1 + incomeIncrease, i);

      // 연 지출 및 자녀 지출
      let adjustedExpense = expenseTotal * Math.pow(1+expenseInflation, i);
      let childExpense = 0;
      if(childCount > 0 && i < childYearsRemaining){
        childExpense = childCount * childAnnualExpense * Math.pow(1 + expenseInflation, i);
      }

      let totalExpense = adjustedExpense + childExpense;
      currentAsset = currentAsset*(1+0.03) + annualIncome - totalExpense; // 금융자산 증가율 3% 고정 예시
      // 혹은 interestRate 변수로 변경 가능

      // 테이블
      let tr = document.createElement("tr");
      tr.innerHTML = `<td>${currentAgeSelf}</td><td>${currentAgePartner}</td><td>${formatNumber(currentAsset)}</td><td>${formatNumber(annualIncome)}</td><td>${formatNumber(totalExpense)}</td>`;
      yearlyTable.appendChild(tr);

      labels.push(currentAgeSelf);
      assetData.push(currentAsset);
      childSaveData.push(childCount > 0 && i >= childYearsRemaining ? childCount * childAnnualExpense * Math.pow(1 + expenseInflation, i) : 0);
    }

    summaryDiv.innerHTML = `
      계산기간: ${ageSelf}세부터 ${maxAge}세까지<br>
      연 수입 증가율: ${(incomeIncrease*100).toFixed(1)}%, 연 소비 증가율: ${(expenseInflation*100).toFixed(1)}%<br>
      자녀 수: ${childCount}, 자녀 독립 나이: ${childIndependenceAge}, 자녀 1인당 연 소비: ${childAnnualExpense}만원
    `;

    const ctx = chartCanvas.getContext('2d');
    if(chart) chart.destroy();
    chart = new Chart(ctx,{
      type:'line',
      data:{
        labels: labels.map(a=>`${a}세`),
        datasets:[
          {
            label:'누적 순자산 (만원)',
            data: assetData,
            borderColor:'#4CAF50',
            backgroundColor:'rgba(76,175,80,0.2)',
            fill:true,
            tension:0.2
          },
          {
            label:'자녀 지출 절감금액 (만원)',
            data: childSaveData,
            borderColor:'#FF5722',
            backgroundColor:'rgba(255,87,34,0.2)',
            fill:true,
            tension:0.2
          }
        ]
      },
      options:{
        responsive:true,
        plugins:{legend:{display:true}},
        scales:{y:{beginAtZero:true}}
      }
    });
  });
});
