document.addEventListener("DOMContentLoaded", function() {
  const btn = document.querySelector(".calculate-btn");
  let chart;

  function formatNum(num) { return Math.round(num).toLocaleString(); }

  btn.addEventListener("click", function() {
    const ageS = parseInt(document.getElementById("ageSelf").value);
    const ageP = parseInt(document.getElementById("agePartner").value);
    const rS = parseInt(document.getElementById("retireSelf").value);
    const rP = parseInt(document.getElementById("retirePartner").value);
    let asset = parseFloat(document.getElementById("assetTotal").value);
    const iRate = parseFloat(document.getElementById("interestRate").value) / 100;
    const incS = parseFloat(document.getElementById("incomeSelf").value);
    const incP = parseFloat(document.getElementById("incomePartner").value);
    const incG = parseFloat(document.getElementById("incomeGrowth").value) / 100;
    const expT = parseFloat(document.getElementById("expenseTotal").value);
    const expI = parseFloat(document.getElementById("expenseInflation").value) / 100;
    const cCount = parseInt(document.getElementById("childCount").value);
    const cYears = parseInt(document.getElementById("childYearsRemaining").value);
    const cExp = parseFloat(document.getElementById("childAnnualExpense").value);

    let labels = [], assetD = [], incomeD = [], expenseD = [], childD = [];
    let fireAge = null, bankruptAge = null;
    const yearlyTable = document.getElementById("yearlyTable");
    yearlyTable.innerHTML = "";

    for (let i = 0; i <= (100 - ageS); i++) {
      let curAgeS = ageS + i;
      let curAgeP = ageP + i;

      let curInc = (curAgeS < rS ? incS * Math.pow(1+incG, i) : 0) + (curAgeP < rP ? incP * Math.pow(1+incG, i) : 0);
      let curExp = expT * Math.pow(1+expI, i);
      let curChild = (i < cYears) ? cCount * cExp * Math.pow(1+expI, i) : 0;
      let totalExp = curExp + curChild;

      let passiveIncome = asset > 0 ? asset * iRate : 0;
      if (fireAge === null && passiveIncome >= totalExp && asset > 0) fireAge = curAgeS;

      asset = asset * (1 + iRate) + curInc - totalExp;
      if (bankruptAge === null && asset < 0) bankruptAge = curAgeS;

      labels.push(`${curAgeS}(${curAgeP})`);
      assetD.push(asset);
      incomeD.push(curInc);
      expenseD.push(totalExp);
      childD.push(curChild);

      let tr = document.createElement("tr");
      tr.innerHTML = `<td>${curAgeS}/${curAgeP}</td><td>${formatNum(asset)}</td><td>${formatNum(curInc)}</td><td>${formatNum(totalExp)}</td>`;
      yearlyTable.appendChild(tr);
    }

    // 요약 텍스트
    document.getElementById("summarySection").style.display = "block";
    document.getElementById("resultSection").style.display = "block";
    let resMsg = bankruptAge ? `<span class="red">${bankruptAge}세에 파산</span>할 위험이 있습니다.` : 
                 fireAge ? `<span class="highlight">${fireAge}세</span>에 경제적 자유가 가능합니다.` : "100세까지 안정적이나 완전한 자유는 더 많은 자산이 필요합니다.";

    document.getElementById("summaryText").innerHTML = `
      <p>💡 <strong>${resMsg}</strong></p>
      <p>✅ 본인 은퇴: <span class="highlight">${rS}세</span> / 배우자 은퇴: <span class="highlight">${rP}세</span> 기준</p>
      <p>✅ 금융 수익률 연 <strong>${(iRate*100).toFixed(1)}%</strong> 가정</p>
    `;

    // 그래프 (왼쪽 단일 축, 억 단위 라벨)
    const ctx = document.getElementById("assetChart").getContext('2d');
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          { label: '순자산', data: assetD, borderColor: '#3182f6', borderWidth: 4, pointRadius: 0, fill: false },
          { label: '수입', data: incomeD, borderColor: '#20c997', borderWidth: 2, borderDash: [5,5], pointRadius: 0 },
          {
