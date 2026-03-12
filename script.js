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
        const incomeS = val("incomeSelf"), incomeP = val("incomePartner");
        const expenseBase = val("expenseTotal");
        const rate = val("interestRate")/100;
        const incInf = val("incomeInflation")/100; // 소득 상승률 복구
        const expInf = val("expenseInflation")/100;
        const retS = val("retireSelf"), retP = val("retirePartner");
        const ageS = val("ageSelf"), ageP = val("agePartner");

        let asset = initialAsset;
        const tableBody = document.querySelector("#resultTable tbody");
        tableBody.innerHTML = "";
        
        let labels = [], assetData = [], targetData = [], incData = [], expData = [];
        let fireAge = null, depleteAge = null;

        for (let i = 0; i <= (100 - ageS); i++) {
            let curAgeS = ageS + i;
            let curAgeP = ageP + i;

            // 소득 계산 (상승률 반영)
            let curInc = 0;
            if (curAgeS < retS) curInc += incomeS * Math.pow(1 + incInf, i);
            if (curAgeP < retP) curInc += incomeP * Math.pow(1 + incInf, i);
            
            // 지출 계산
            let curExp = expenseBase * Math.pow(1 + expInf, i);
            
            // 자산 갱신
            asset = (asset * (1 + rate)) + curInc - curExp;

            let target = curExp * 25;
            if (fireAge === null && asset >= target && asset > 0) fireAge = curAgeS;
            if (depleteAge === null && asset < 0) depleteAge = curAgeS;

            labels.push(curAgeS + "세");
            assetData.push(Math.round(asset));
            targetData.push(Math.round(target));
            incData.push(Math.round(curInc));
            expData.push(Math.round(curExp));

            tableBody.insertAdjacentHTML('beforeend', `<tr><td>${curAgeS}세</td><td>${curAgeP}세</td><td>${Math.round(asset).toLocaleString()}</td><td>${Math.round(curInc).toLocaleString()}</td><td>${Math.round(curExp).toLocaleString()}</td></tr>`);
            if (asset < -100000) break;
        }

        resultArea.classList.remove("hidden");
        
        // 결과 문구 작성
        const headline = document.getElementById("resultHeadline");
        const summary = document.getElementById("summaryText");

        if (fireAge) {
            headline.innerHTML = `💡 ${fireAge}세에 파이어 가능합니다`;
            summary.innerHTML = `
                현재 순자산 ${initialAsset.toLocaleString()}만 원과 연간 지출 ${expenseBase.toLocaleString()}만 원 기준<br>
                연간 투자 수익률 ${(rate*100).toFixed(1)}%, 소득·지출 상승률 반영 시<br>
                매년 순자산 증가 추세에 따라 <strong>${fireAge}세</strong>에 자산 수익만으로 생활 가능합니다.
            `;
        } else if (depleteAge) {
            headline.innerHTML = `⚠️ ${depleteAge}세에 파산할 것입니다`;
            summary.innerHTML = `
                현재 지출 속도가 자산 증식보다 빠릅니다.<br>
                투자 수익률을 높이거나 은퇴 시기를 조정하는 것을 권장합니다.
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
                    { label: '연 소득', data: incData, backgroundColor: 'rgba(49,130,246,0.5)' },
                    { label: '연 지출', data: expData, backgroundColor: 'rgba(240,68,82,0.4)' }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
});
