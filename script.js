document.addEventListener("DOMContentLoaded", () => {
    const btn = document.querySelector(".btn-calculate");
    const adModal = document.getElementById("adModal");
    const coupangLink = document.getElementById("coupangLink");
    const finalRunBtn = document.getElementById("finalRunBtn");
    const verifyMsg = document.getElementById("verifyMsg");
    const resultArea = document.getElementById("resultArea");
    
    let assetChart = null, flowChart = null;

    btn.addEventListener("click", () => {
        adModal.classList.remove("hidden");
        finalRunBtn.classList.add("hidden");
        verifyMsg.innerText = "방문 확인 대기 중...";
    });

    coupangLink.addEventListener("click", () => {
        setTimeout(() => {
            verifyMsg.innerText = "방문 확인 완료! ✅";
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
        const incomeS = val("incomeSelf");
        const incomeP = val("incomePartner");
        const expenseBase = val("expenseTotal");
        const rate = val("interestRate") / 100;
        const incInf = val("incomeInflation") / 100; // 소득 상승률
        const expInf = val("expenseInflation") / 100; // 물가 상승률
        const retS = val("retireSelf");
        const retP = val("retirePartner");
        const ageS = val("ageSelf");
        const ageP = val("agePartner");

        let asset = initialAsset;
        const tableBody = document.querySelector("#resultTable tbody");
        tableBody.innerHTML = "";
        
        let labels = [], assetData = [], targetData = [], incData = [], expData = [];
        let fireAge = null;

        // 시뮬레이션 루프 (100세까지)
        for (let i = 0; i <= (100 - ageS); i++) {
            let curAgeS = ageS + i;
            let curAgeP = ageP + i;

            // 핵심 수정: 본인과 배우자 각각 소득 상승률을 복리로 적용
            let curIncS = (curAgeS < retS) ? (incomeS * Math.pow(1 + incInf, i)) : 0;
            let curIncP = (curAgeP < retP) ? (incomeP * Math.pow(1 + incInf, i)) : 0;
            let curInc = curIncS + curIncP;
            
            // 지출도 물가상승률에 따라 복리 증가
            let curExp = expenseBase * Math.pow(1 + expInf, i);
            
            // 자산 갱신: (기존자산 * 투자수익) + 현재소득 - 현재지출
            asset = (asset * (1 + rate)) + curInc - curExp;

            let target = curExp * 25;
            if (fireAge === null && asset >= target && asset > 0) fireAge = curAgeS;

            labels.push(curAgeS + "세");
            assetData.push(Math.round(asset));
            targetData.push(Math.round(target));
            incData.push(Math.round(curInc));
            expData.push(Math.round(curExp));

            // 표에 한 줄씩 추가
            tableBody.insertAdjacentHTML('beforeend', `
                <tr>
                    <td>${curAgeS}세</td>
                    <td>${curAgeP}세</td>
                    <td style="color:${asset < 0 ? '#f04452' : 'inherit'}">${Math.round(asset).toLocaleString()}</td>
                    <td style="font-weight:600; color:#3182f6;">${Math.round(curInc).toLocaleString()}</td>
                    <td>${Math.round(curExp).toLocaleString()}</td>
                </tr>
            `);
            if (asset < -200000) break;
        }

        resultArea.classList.remove("hidden");
        
        // 결과 문구 업데이트
        const headline = document.getElementById("resultHeadline");
        const summary = document.getElementById("summaryText");
        if (fireAge) {
            headline.innerHTML = `💡 ${fireAge}세에 파이어 가능합니다`;
            summary.innerHTML = `현재 순자산 ${initialAsset.toLocaleString()}만 원과 연간 지출 ${expenseBase.toLocaleString()}만 원 기준<br>연간 투자 수익률 ${(rate*100).toFixed(1)}%, <strong>소득 상승률 ${(incInf*100).toFixed(1)}%</strong> 반영 시<br>매년 자산 증가 추세에 따라 <strong>${fireAge}세</strong>에 경제적 자립이 가능합니다.`;
        } else {
            headline.innerHTML = `⚠️ 자산 관리가 필요합니다`;
            summary.innerHTML = `현재 조건으로는 FIRE 달성이 어렵습니다. 지출을 줄이거나 소득 상승률을 높여보세요.`;
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
                    { label: '연 소득', data: incData, backgroundColor: 'rgba(49,130,246,0.7)' },
                    { label: '연 지출', data: expData, backgroundColor: 'rgba(240,68,82,0.4)' }
                ]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: false } } // 변화 폭이 더 잘 보이게 설정
            }
        });
    }
});
