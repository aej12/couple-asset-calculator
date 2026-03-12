document.addEventListener("DOMContentLoaded", () => {
    const btn = document.querySelector(".btn-calculate");
    const adModal = document.getElementById("adModal");
    const coupangLink = document.getElementById("coupangLink");
    const finalRunBtn = document.getElementById("finalRunBtn");
    const resultArea = document.getElementById("resultArea");
    
    let assetChart = null, flowChart = null;

    btn.addEventListener("click", () => {
        adModal.classList.remove("hidden");
        finalRunBtn.classList.add("hidden");
    });

    coupangLink.addEventListener("click", () => {
        setTimeout(() => {
            document.getElementById("verifyMsg").innerText = "방문 확인 완료! ✅";
            finalRunBtn.classList.remove("hidden");
            coupangLink.style.display = "none";
        }, 1500);
    });

    finalRunBtn.addEventListener("click", () => {
        adModal.classList.add("hidden");
        runSimulation();
    });

    function runSimulation() {
        const val = (id) => parseFloat(document.getElementById(id).value) || 0;
        
        const initialAsset = val("assetTotal");
        const incomeS = val("incomeSelf"), incomeP = val("incomePartner");
        const expenseBase = val("expenseTotal");
        const rate = val("interestRate") / 100;
        const incInf = val("incomeInflation") / 100;
        const expInf = val("expenseInflation") / 100;
        const retS = val("retireSelf"), retP = val("retirePartner");
        const ageS = val("ageSelf"), ageP = val("agePartner");
        
        // 추가 변수
        const childCount = val("childCount");
        const childExitAge = val("childExitAge");
        const childExpense = val("childExpense");
        const pensionYearly = val("pensionMonthly") * 12;

        let asset = initialAsset;
        const tableBody = document.querySelector("#resultTable tbody");
        tableBody.innerHTML = "";
        
        let labels = [], assetData = [], targetData = [], incData = [], expData = [];
        let fireAge = null;

        for (let i = 0; i <= (100 - ageS); i++) {
            let curAgeS = ageS + i;
            let curAgeP = ageP + i;

            // 1. 수입 계산 (근로소득 + 국민연금)
            let curInc = 0;
            if (curAgeS < retS) curInc += incomeS * Math.pow(1 + incInf, i);
            if (curAgeP < retP) curInc += incomeP * Math.pow(1 + incInf, i);
            
            // 국민연금: 65세부터 수령 (물가상승률만큼 연금액도 보전된다고 가정)
            if (curAgeS >= 65) curInc += pensionYearly * Math.pow(1 + expInf, i);
            
            // 2. 지출 계산 (생활비 + 자녀 양육비)
            let curExp = expenseBase * Math.pow(1 + expInf, i);
            
            // 자녀 양육비: 본인 나이가 독립 나이보다 적을 때만 합산
            if (curAgeS < childExitAge) {
                curExp += (childCount * childExpense) * Math.pow(1 + expInf, i);
            }
            
            // 3. 자산 갱신
            asset = (asset * (1 + rate)) + curInc - curExp;

            let target = curExp * 25;
            if (fireAge === null && asset >= target && asset > 0) fireAge = curAgeS;

            labels.push(curAgeS + "세");
            assetData.push(Math.round(asset));
            targetData.push(Math.round(target));
            incData.push(Math.round(curInc));
            expData.push(Math.round(curExp));

            tableBody.insertAdjacentHTML('beforeend', `
                <tr>
                    <td>${curAgeS}세</td><td>${curAgeP}세</td>
                    <td style="color:${asset < 0 ? '#f04452' : 'inherit'}">${Math.round(asset).toLocaleString()}</td>
                    <td style="color:#3182f6;">${Math.round(curInc).toLocaleString()}</td>
                    <td>${Math.round(curExp).toLocaleString()}</td>
                </tr>
            `);
            if (asset < -300000) break;
        }

        resultArea.classList.remove("hidden");
        
        const headline = document.getElementById("resultHeadline");
        const summary = document.getElementById("summaryText");

        if (fireAge) {
            headline.innerHTML = `💡 ${fireAge}세에 파이어 가능합니다`;
            summary.innerHTML = `
                현재 순자산 ${initialAsset.toLocaleString()}만 원과 기본 지출 ${expenseBase.toLocaleString()}만 원 기준<br>
                자녀 ${childCount}명 양육(${childExitAge}세 독립) 및 65세 국민연금 수령 반영 시<br>
                연간 투자 수익률 ${(rate*100).toFixed(1)}% 하에 <strong>${fireAge}세</strong>에 경제적 자립이 가능합니다.
            `;
        } else {
            headline.innerHTML = `⚠️ 자산 관리가 필요합니다`;
            summary.innerHTML = `현재 지출 및 양육비 규모 대비 자산 증식이 부족합니다. 지출 조정이 필요합니다.`;
        }

        renderCharts(labels, assetData, targetData, incData, expData);
        window.scrollTo({ top: resultArea.offsetTop - 20, behavior: 'smooth' });
    }

    function renderCharts(labels, assetData, targetData, incData, expData) {
        const ctx1 = document.getElementById('assetChart').getContext('2d');
        if (assetChart) assetChart.destroy();
        assetChart = new Chart(ctx1, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    { label: '순자산', data: assetData, borderColor: '#3182f6', fill: true, backgroundColor: 'rgba(49,130,246,0.1)', pointRadius: 0 },
                    { label: 'FIRE 목표선', data: targetData, borderColor: '#f04452', borderDash: [5,5], pointRadius: 0 }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        const ctx2 = document.getElementById('flowChart').getContext('2d');
        if (flowChart) flowChart.destroy();
        flowChart = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { label: '연 수입(+연금)', data: incData, backgroundColor: 'rgba(49,130,246,0.7)' },
                    { label: '연 지출(양육비 포함)', data: expData, backgroundColor: 'rgba(240,68,82,0.4)' }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: false } } }
        });
    }
});
