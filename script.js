document.addEventListener("DOMContentLoaded", function() {
  const summaryDiv = document.getElementById("summary");
  const yearlyTable = document.getElementById("yearlyTable");
  const button = document.querySelector(".calculate-btn");
  const chartCanvas = document.getElementById("assetChart");
  let chart;

  function formatNumber(num){
    if(num >= 10000) return (num/10000).toFixed(2).replace(/\.0+$/,'') + '억';
    return Number(num.toFixed(0)).toLocaleString();
  }

  button.addEventListener("click", function() {
    const ageSelf = parseInt(document.getElementById("ageSelf").value);
    const agePartner = parseInt(document.getElementById("agePartner").value);
    let currentAsset = parseFloat(document.getElementById("assetTotal").value);
    const incomeSelf = parseFloat(document.getElementById("incomeSelf").value);
    const incomePartner = parseFloat(document.getElementById("incomePartner").value);
    const expenseTotal = parseFloat(document.getElementById("expenseTotal").value);
    const interestRate = parseFloat(document.getElementById("interestRate").value)/100;
    const expenseInflation = parseFloat(document.getElementById("expenseInflation").value)/100;
    const retireSelf = parseInt(document.getElementById("retireSelf").value);
    const retirePartner = parseInt(document.getElementById("retirePartner").value);
    const incomeInflation = parseFloat(document.getElementById("incomeInflation").value)/100;

    const childCount = parseInt(document.getElementById("childCount").value);
    const childIndependenceAge = parseInt(document.getElementById("childIndependenceAge").value);
    const childAnnualExpense = parseFloat(document.getElementById("childAnnualExpense").value);

    const maxAge = 100;
    const years = maxAge - Math.min(ageSelf, agePartner);

    yearlyTable.innerHTML = "";
    let labels = [];
    let assetData = [];
    let childExpenseData = [];

    let adjustedIncomeSelf = incomeSelf;
    let adjustedIncomePartner = incomePartner;
    let adjustedExpenseBase = expenseTotal;

    for(let i=0;i<years;i++){
      let currentAgeSelf = ageSelf + i;
      let currentAgePartner = agePartner + i;

      // 연 수입 적용
      let annualIncome = 0;
      if(currentAgeSelf < retireSelf) annualIncome += adjustedIncomeSelf;
      if(currentAgePartner < retirePartner) annualIncome += adjustedIncomePartner;

      // 기본 가계 지출 상승
      let adjustedExpense = adjustedExpenseBase * Math.pow(1+expenseInflation, i);

      // 자녀 지출 계산
      let childExpense = 0;
      if(childCount > 0 && currentAgeSelf < childIndependenceAge){
        childExpense = childCount * childAnnualExpense * Math.pow(1+expenseInflation, i);
      }

      let totalExpense = adjustedExpense + childExpense;

      currentAsset = currentAsset*(1+interestRate) + annualIncome - totalExpense;

      let tr = document.createElement("tr");
      tr.innerHTML = `<td>${currentAgeSelf}</td>
                      <td>${currentAgePartner}</td>
                      <td>${formatNumber(currentAsset)}</td>
                      <td>${formatNumber(annualIncome)}</td>
                      <td>${formatNumber(totalExpense)}</td>
                      <td>${formatNumber(childExpense)}</td>`;
      yearlyTable.appendChild(tr);

      labels.push(currentAgeSelf + "세");
      assetData.push(currentAsset);
      childExpenseData.push(childExpense);

      // 다음 해 수입 상승
      adjustedIncomeSelf *= (1 + incomeInflation);
      adjustedIncomePartner *= (1 + incomeInflation);
    }

    summaryDiv.innerHTML = `
      계산기간: ${ageSelf}세부터 ${maxAge}세까지<br>
      금융자산 증가율: ${(interestRate*100).toFixed(1)}%, 연 소비 증가율: ${(expenseInflation*100).toFixed(1)}%, 연 수입 증가율: ${(incomeInflation*100).toFixed(1)}%<br>
      자녀 수: ${childCount}, 자녀 독립 나이: ${childIndependenceAge}, 자녀 1인당 연 소비: ${childAnnualExpense}만원
    `;

    const ctx = chartCanvas.getContext('2d');
    if(chart) chart.destroy();
    chart = new Chart(ctx,{
      type:'line',
      data:{
        labels: labels,
        datasets:[
          {
            label:'누적 순자산 (만원)',
            data: assetData,
            borderColor:'#4CAF50',
            backgroundColor:'rgba(76,175,80,0.2)',
            fill:true,
            tension:0.2,
            yAxisID: 'y1'
          },
          {
            label:'자녀 지출 (만원)',
            data: childExpenseData,
            borderColor:'#FF9800',
            backgroundColor:'rgba(255,152,0,0.2)',
            fill:true,
            tension:0.2,
            yAxisID: 'y1'
          }
        ]
      },
      options:{
        responsive:true,
        plugins:{legend:{display:true}},
        scales:{
          y1:{
            beginAtZero:true,
            ticks:{
              callback: function(value){
                if(value >= 10000) return (value/10000).toFixed(1) + '억';
                return value.toLocaleString();
              }
            }
          }
        }
      }
    });
  });
});
