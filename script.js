const form = document.getElementById("inputForm");
const summaryDiv = document.getElementById("summary");
const assetTable = document.getElementById("assetTable");
const yearlyTable = document.getElementById("yearlyTable");
const tabs = document.querySelectorAll(".tablink");
const tabContents = document.querySelectorAll(".tabcontent");

let chart;

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    tabContents.forEach(c => c.style.display = "none");
    document.getElementById(tab.dataset.tab).style.display = "block";
  });
});

form.addEventListener("submit", function(e){
  e.preventDefault();
  calculateAssets();
});

function calculateAssets(){
  // 입력값 가져오기
  const ageSelf = parseInt(document.getElementById("ageSelf").value);
  const agePartner = parseInt(document.getElementById("agePartner").value);
  const assetTotal = parseFloat(document.getElementById("assetTotal").value);
  const incomeSelf = parseFloat(document.getElementById("incomeSelf").value);
  const incomePartner = parseFloat(document.getElementById("incomePartner").value);
  const expenseTotal = parseFloat(document.getElementById("expenseTotal").value);
  const interestRate = parseFloat(document.getElementById("interestRate").value) / 100;
  const retireSelf = parseInt(document.getElementById("retireSelf").value);
  const retirePartner = parseInt(document.getElementById("retirePartner").value);

  const maxAge = 100;
  const months = (maxAge - Math.min(ageSelf, agePartner)) * 12;

  let monthlyAssets = [];
  let yearlyAssets = [];
  let currentAsset = assetTotal;
  let year = Math.min(ageSelf, agePartner);
  let monthCount = 0;
  let annualIncome = 0, annualExpense = 0;

  assetTable.innerHTML = "";
  yearlyTable.innerHTML = "";

  for(let i = 0; i < months; i++){
    let currentAgeSelf = ageSelf + Math.floor(i / 12);
    let currentAgePartner = agePartner + Math.floor(i / 12);
    let monthlyIncome = 0;

    if(currentAgeSelf < retireSelf) monthlyIncome += incomeSelf;
    if(currentAgePartner < retirePartner) monthlyIncome += incomePartner;

    currentAsset = currentAsset * (1 + interestRate/12) + monthlyIncome - expenseTotal;
    monthlyAssets.push({age: Math.min(currentAgeSelf,currentAgePartner), month: (i%12)+1, asset: currentAsset, expense: expenseTotal, income: monthlyIncome});

    // 월별 테이블
    let tr = document.createElement("tr");
    tr.innerHTML = `<td>${Math.min(currentAgeSelf,currentAgePartner)}</td><td>${(i%12)+1}</td><td>${currentAsset.toFixed(1)}</td><td>${expenseTotal}</td><td>${monthlyIncome}</td>`;
    assetTable.appendChild(tr);

    // 연 단위 집계
    annualIncome += monthlyIncome;
    annualExpense += expenseTotal;
    monthCount++;
    if(monthCount === 12 || i === months-1){
      yearlyAssets.push({age: Math.min(currentAgeSelf,currentAgePartner), asset: currentAsset, income: annualIncome, expense: annualExpense});
      let ytr = document.createElement("tr");
      ytr.innerHTML = `<td>${Math.min(currentAgeSelf,currentAgePartner)}</td><td>${currentAsset.toFixed(1)}</td><td>${annualExpense.toFixed(1)}</td><td>${annualIncome.toFixed(1)}</td>`;
      yearlyTable.appendChild(ytr);
      monthCount = 0;
      annualIncome = 0;
      annualExpense = 0;
    }
  }

  summaryDiv.innerHTML = `
    1. ${ageSelf}세부터 ${incomeSelf}만원, ${agePartner}세부터 ${incomePartner}만원 수입으로 계산했습니다.<br>
    2. 월 지출 ${expenseTotal}만원, 금융자산 증가율 ${interestRate*100}% 적용<br>
    3. 100세까지 누적 순자산 기준
  `;

  // 그래프 그리기
  const ctx = document.getElementById('assetChart').getContext('2d');
  if(chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: monthlyAssets.map(m => `${m.age}세-${m.month}월`),
      datasets: [{
        label: '누적 순자산 (만원)',
        data: monthlyAssets.map(m => m.asset.toFixed(1)),
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80,0.2)',
        fill: true,
        tension: 0.2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { display: false },
        y: { beginAtZero: true }
      }
    }
  });
}
