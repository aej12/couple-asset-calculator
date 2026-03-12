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
        const childCount = val("childCount"), childExitAge = val("childExitAge"), childExpense = val("childExpense");
        const pensionYearly = val("pensionMonthly") * 12;

        let asset = initialAsset;
        const tableBody = document.querySelector("#resultTable tbody");
        tableBody.innerHTML = "";
        
        let labels = [], assetData = [], targetData = [], incData = [], expData = [];
        let fireAge = null;
        let bankruptAge = null; // 파산 나이 변수 추가

        for (let i = 0; i <= (100 - ageS); i++) {
            let curAgeS = ageS + i;
            let curAgeP = ageP + i;

            // 1. 수입 계산
            let curInc = 0;
            if (curAgeS < retS) curInc += incomeS * Math.pow(1 + incInf, i);
            if (curAgeP < retP) curInc += incomeP * Math.pow(1 + incInf, i);
            if (curAgeS >= 65) curInc += pensionYearly * Math.pow(1 + expInf, i);
            
            // 2. 지출 계산
            let curExp = expenseBase * Math.pow(1 + expInf, i);
            if (curAgeS < childExitAge) {
                curExp += (childCount * childExpense) * Math.pow(1 + expInf, i);
            }
            
            // 3. 자산 갱신
            asset = (asset * (1 + rate)) + curInc - curExp;

            // 4. 상태 판정
            let target = curExp * 25;
            if (fireAge === null && asset >= target && asset > 0) fireAge = curAgeS;
            
            // 핵심: 자산이 0 미만으로 떨어지는 첫 순간을 기록
            if (bankruptAge === null && asset < 0) bankruptAge = curAgeS;

            labels.push(curAgeS + "세");
            assetData.push(Math.round(asset));
            targetData.push(Math.round(target));
            incData.push(Math.round(curInc));
            expData.push(Math.round(curExp));

            tableBody.insertAdjacentHTML('beforeend', `
                <tr>
                    <td>${curAgeS}세</td><td>${curAgeP}세</td>
                    <td style="color:${asset < 0 ? '#f04452' : 'inherit'}">${Math.round(asset).toLocaleString()}</td>
                    <td>${Math.round(curInc).toLocaleString()}</td>
                    <td>${Math.round(curExp).toLocaleString()}</td>
                </tr>
            `);

            // 자산이 너무 크게 마이너스면 루프 종료 (성능 최적화)
            if (asset < -500000) break;
        }

        resultArea.classList.remove("hidden");
        
        const headline = document.getElementById("resultHeadline");
        const summary = document.getElementById("summaryText");

        // 출력 로직 수정
        if (bankruptAge !== null && (fireAge === null || bankruptAge < fireAge)) {
            // 파산 케이스 (파이어 전 혹은 파이어 못하고 파산할 때)
            headline.innerHTML = `⚠️ ${bankruptAge}세에 자산이 고갈될 것으로 보입니다`;
            headline.style.color = "#f04452"; // 빨간색 강조
            summary.innerHTML = `
                현재 지출 및 양육비 규모가 자산 성장 속도보다 빠릅니다.<br>
                <strong>${bankruptAge}세</strong> 무렵 순자산이 마이너스로 전환될 가능성이 높으므로,<br>
                지출을 줄이거나 투자 수익률을 높이는 전략이 필요합니다.
            `;
        } else if (fireAge) {
            // 성공 케이스
            headline.innerHTML = `💡 ${fireAge}세에 파이어 가능합니다`;
            headline.style.color = "#191f28";
            summary.innerHTML = `
                현재 순자산 ${initialAsset.toLocaleString()}만 원과 기본 지출 ${expenseBase.toLocaleString()}만 원 기준<br>
                자녀 ${childCount}명 양육 및 65세 국민연금 수령을 모두 반영했을 때,<br>
                <strong>${fireAge}세</strong>에 경제적 자립이 가능한 것으로 분석되었습니다.
            `;
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
