document.addEventListener("DOMContentLoaded", function() {
  const summaryDiv = document.getElementById("summary");
  const yearlyTable = document.getElementById("yearlyTable");
  const button = document.querySelector(".calculate-btn");
  const chartCanvas = document.getElementById("assetChart");
  let chart;

  button.addEventListener("click", function() {
    calculateAssets();
  });

  function calculateAssets() {
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

    const childCount = parseInt(document.getElementById("childCount").value);
    const childIndependenceAge = parseInt(document.getElementById("childIndependenceAge").value);
    const childAnnualExpense = parseFloat(document.getElementById("childAnnualExpense").value);

    const maxAge = 100;
    const years = maxAge - Math.min(ageSelf, agePartner);

    yearlyTable.innerHTML = "";
    let labels = [];
    let assetData = [];

    for(let i=0;i<years;i++){
      let currentAgeSelf = ageSelf + i;
      let currentAgePartner = agePartner + i;

      let annualIncome = 0;
      if(currentAgeSelf < retireSelf) annualIncome += incomeSelf;
      if(currentAgePartner < retirePartner) annualIncome += incomePartner;

      let adjustedExpense = expenseTotal * Math.pow(1+expenseInflation, i);

      let childExpense = 0;
      if(childCount>0 && currentAgeSelf < childIndependenceAge){
        childExpense = childCount * childAnnualExpense;
      }

      let totalExpense = adjustedExpense + childExpense;

      currentAsset = currentAsset*(1+interestRate) + annualIncome - totalExpense;

      let tr = document.createElement("tr");
      tr.innerHTML = `<td>${currentAgeSelf}</td><td>${currentAgePartner}</td><td>${currentAsset.toFixed(1)}</td><td>${annualIncome}</td><td>${adjustedExpense.toFixed(1)}</td><td>${childExpense}</td>`;
      yearlyTable.appendChild(tr);

      labels.push(currentAgeSelf);
      assetData.push(currentAsset.toFixed(1));
    }

    summaryDiv.innerHTML = `
      계산기간: ${ageSelf}세부터 ${maxAge}세까지<br>
      금융자산 증가율: ${(interestRate*100).toFixed(2)}%, 연 소비 증가율: ${(expenseInflation*100).toFixed(2)}%<br>
      자녀 수: ${childCount}, 자녀 독립 나이: ${childIndependenceAge}, 자녀 1인당 연 소비: ${childAnnualExpense}만원
    `;

    const ctx = chartCanvas.getContext('2d');
    if(chart) chart.destroy();
    chart = new Chart(ctx,{
      type:'line',
      data:{
        labels: labels.map(a=>`${a}세`),
        datasets:[{
          label:'누적 순자산 (만원)',
          data: assetData,
          borderColor:'#4CAF50',
          backgroundColor:'rgba(76,175,80,0.2)',
          fill:true,
          tension:0.2
        }]
      },
      options:{
        responsive:true,
        plugins:{legend:{display:true}},
        scales:{y:{beginAtZero:true}}
      }
    });
  }
});
