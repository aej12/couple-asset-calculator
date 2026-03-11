document.getElementById('inputForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const ageSelf = Number(document.getElementById('ageSelf').value);
    const agePartner = Number(document.getElementById('agePartner').value);
    const assetTotal = Number(document.getElementById('assetTotal').value);
    const incomeSelf = Number(document.getElementById('incomeSelf').value);
    const incomePartner = Number(document.getElementById('incomePartner').value);
    const expenseTotal = Number(document.getElementById('expenseTotal').value);
    const interestRate = Number(document.getElementById('interestRate').value);
    const retireSelf = Number(document.getElementById('retireSelf').value);
    const retirePartner = Number(document.getElementById('retirePartner').value);

    const netAssets=[];
    let asset = assetTotal;
    const monthlyInterest = interestRate/100/12;
    const startAge = Math.min(ageSelf, agePartner);

    for(let age=startAge; age<=100; age++){
        for(let month=1; month<=12; month++){
            const monthlyIncomeSelf = age>=retireSelf ? 0 : incomeSelf;
            const monthlyIncomePartner = age>=retirePartner ? 0 : incomePartner;
            const totalIncome = monthlyIncomeSelf + monthlyIncomePartner;

            asset = asset + totalIncome - expenseTotal + asset*monthlyInterest;
            netAssets.push({age, month, asset, income: totalIncome, expense: expenseTotal});
        }
    }

    // 요약 표시
    document.getElementById('summary').innerHTML=
`${startAge}세부터 누적 순자산 계산.<br>월 수입: ${incomeSelf+incomePartner}만원, 월 지출: ${expenseTotal}만원.<br>금융자산 증가율: ${interestRate}% 적용.`;

    // 그래프
    const labels = netAssets.map(d=>`${d.age}세 ${d.month}월`);
    const data={ labels, datasets:[{ label:'누적 순자산', data:netAssets.map(d=>d.asset), borderColor:netAssets.map(d=>d.asset>=0?'blue':'red'), backgroundColor:netAssets.map(d=>d.asset>=0?'rgba(0,0,255,0.1)':'rgba(255,0,0,0.1)'), fill:true, tension:0.2 }]};
    if(window.assetChartInstance) window.assetChartInstance.destroy();
    window.assetChartInstance = new Chart(document.getElementById('assetChart'), {type:'line', data, options:{plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}}}});

    // 월별 테이블
    const tableBody=document.getElementById('assetTable'); tableBody.innerHTML='';
    netAssets.forEach(d=>{
        const tr=document.createElement('tr');
        const assetClass=d.asset>=0?'asset-positive':'asset-negative';
        tr.innerHTML=`<td>${d.age}</td><td>${d.month}</td><td class="${assetClass}">${Math.round(d.asset).toLocaleString()}</td><td>${Math.round(d.expense).toLocaleString()}</td><td>${Math.round(d.income).toLocaleString()}</td>`;
        tableBody.appendChild(tr);
    });

    // 연 단위 테이블
    const yearlyTable = document.getElementById('yearlyTable'); yearlyTable.innerHTML='';
    let yearAsset=0, yearIncome=0, yearExpense=0, currentYear=netAssets[0].age;
    netAssets.forEach(d=>{
        if(d.age !== currentYear){
            const tr=document.createElement('tr');
            tr.innerHTML=`<td>${currentYear}</td><td>${Math.round(yearAsset).toLocaleString()}</td><td>${Math.round(yearExpense).toLocaleString()}</td><td>${Math.round(yearIncome).toLocaleString()}</td>`;
            yearlyTable.appendChild(tr);
            currentYear = d.age;
            yearAsset=0; yearIncome=0; yearExpense=0;
        }
        yearAsset=d.asset;
        yearIncome+=d.income;
        yearExpense+=d.expense;
    });
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${currentYear}</td><td>${Math.round(yearAsset).toLocaleString()}</td><td>${Math.round(yearExpense).toLocaleString()}</td><td>${Math.round(yearIncome).toLocaleString()}</td>`;
    yearlyTable.appendChild(tr);

    // 탭 기능
    document.querySelectorAll('.tablink').forEach(btn=>{
        btn.classList.remove('active');
        btn.addEventListener('click', ()=>{
            document.querySelectorAll('.tablink').forEach(b=>b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.tabcontent').forEach(tc=>tc.style.display='none');
            document.getElementById(btn.dataset.tab).style.display='block';
        });
    });
    document.querySelector('.tablink[data-tab="monthly"]').click();
});
