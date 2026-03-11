// ===== 계산 함수 =====
function calculateNetAssets(inputs) {
    const {ageSelf, currentAsset, monthlyIncome, monthlyExpense, interestRate} = inputs;
    const netAssets = [];
    let asset = currentAsset;
    const monthlyInterest = interestRate / 100 / 12;
    for(let age = ageSelf; age <= 100; age++){
        for(let month=1; month<=12; month++){
            asset = asset + monthlyIncome - monthlyExpense + asset * monthlyInterest;
            netAssets.push({age, month, asset, income: monthlyIncome, expense: monthlyExpense});
        }
    }
    return netAssets;
}

// ===== 이벤트 처리 =====
document.getElementById('inputForm').addEventListener('submit', function(e){
    e.preventDefault();
    const inputs = {
        ageSelf: Number(document.getElementById('ageSelf').value),
        agePartner: Number(document.getElementById('agePartner').value),
        currentAsset: Number(document.getElementById('currentAsset').value),
        monthlyIncome: Number(document.getElementById('monthlyIncome').value),
        monthlyExpense: Number(document.getElementById('monthlyExpense').value),
        interestRate: Number(document.getElementById('interestRate').value),
    };

    const netAssets = calculateNetAssets(inputs);

    // ===== 요약 3줄 =====
    const summaryDiv = document.getElementById('summary');
    summaryDiv.innerHTML = `
1. ${inputs.ageSelf}세부터 월 ${inputs.monthlyIncome}만원 수입, ${inputs.monthlyExpense}만원 지출 계산.<br>
2. 금융자산 증가율 ${inputs.interestRate}% 적용, 월 단위 누적 순자산 계산.<br>
3. 총 ${netAssets.length}개월 동안 계산되었습니다.
`;

    // ===== 그래프 =====
    const labels = netAssets.map(d => `${d.age}세 ${d.month}월`);
    const data = {
        labels: labels,
        datasets: [{
            label: '누적 순자산',
            data: netAssets.map(d => d.asset),
            borderColor: netAssets.map(d => d.asset >=0 ? 'blue' : 'red'),
            backgroundColor: netAssets.map(d => d.asset >=0 ? 'rgba(0,0,255,0.1)' : 'rgba(255,0,0,0.1)'),
            fill: true,
            tension: 0.2
        }]
    };
    if(window.assetChartInstance) window.assetChartInstance.destroy();
    window.assetChartInstance = new Chart(document.getElementById('assetChart'), {
        type: 'line',
        data: data,
        options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });

    // ===== 테이블 =====
    const tableBody = document.getElementById('assetTable');
    tableBody.innerHTML = '';
    netAssets.forEach(d=>{
        const tr = document.createElement('tr');
        const assetClass = d.asset >=0 ? 'asset-positive' : 'asset-negative';
        tr.innerHTML = `
            <td>${d.age}</td>
            <td>${d.month}</td>
            <td class="${assetClass}">${Math.round(d.asset).toLocaleString()}</td>
            <td>${Math.round(d.expense).toLocaleString()}</td>
            <td>${Math.round(d.income).toLocaleString()}</td>
        `;
        tableBody.appendChild(tr);
    });
});
