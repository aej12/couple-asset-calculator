document.addEventListener("DOMContentLoaded", () => {
    const btn = document.querySelector(".btn-calculate");
    const adModal = document.getElementById("adModal");
    const coupangLink = document.getElementById("coupangLink");
    const finalRunBtn = document.getElementById("finalRunBtn");
    const resultArea = document.getElementById("resultArea");
    
    let assetChart = null, flowChart = null;

    // [단위 변환] 1억 미만은 '만', 이상은 '0억 0000만' 표기
    function formatKRW(val) {
        const num = Math.round(val);
        const absNum = Math.abs(num);
        const sign = num < 0 ? "-" : "";

        if (absNum < 10000) return sign + absNum.toLocaleString() + "만";
        
        const eok = Math.floor(absNum / 10000);
        const man = absNum % 10000;
        
        if (man === 0) return `${sign}${eok}억`;
        return `${sign}${eok}억 ${man.toLocaleString()}만`;
    }

    // 쿠팡 방문 로직
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
        
        // 입력값 읽기
        const initialAsset = val("assetTotal");
        const incomeS = val("incomeSelf"), incomeP = val("incomePartner");
        const expenseBase = val("expenseTotal");
        const rate = val("interestRate") / 100;
        const incInf = val("incomeInflation") / 100;
        const expInf = val("expenseInflation") / 100;
        const retS = val("retireSelf"), retP = val("retirePartner");
        const ageS = val("ageSelf"), ageP = val("agePartner");
        
        const childCount = val("childCount"), childExitAge = val("childExitAge"), childExpense = val("childExpense");
        const pensionYearlyBase = val("pensionMonthly") * 12;

        let asset = initialAsset;
        const tableBody = document.querySelector("#resultTable tbody");
        tableBody.innerHTML = "";
        
        let labels = [], assetData = [], targetData = [], incData = [], expData = [];
        let fireAge = null, bankruptAge = null;

        // 100세까지 시뮬레이션
        for (let i = 0; i <= (100 - ageS); i++) {
            let curAgeS = ageS + i;
            let curAgeP = ageP + i;

            // 1. 수입 계산
            let curInc = 0;
            // 근로 소득 (매년 소득상승률 반영)
            if (curAgeS < retS) curInc += incomeS * Math.pow(1 + incInf, i);
            if (curAgeP < retP) curInc += incomeP * Math.pow(1 + incInf, i);
            
            // [최종 로직] 국민연금: 65세부터 수령, 5년에 한 번 2% 고정 상승 (물가상승 미반영)
            if (curAgeS >= 65) {
                let upgradeCount = Math.floor((curAgeS - 65) / 5);
                curInc += pensionYearlyBase * Math.pow(1 + 0.02, upgradeCount);
            }
            
            // 2. 지출 계산
            let curExp = expenseBase * Math.pow(1 + expInf, i);
            // 자녀 양육비: 독립 나이 전까지만 합산
            if (curAgeS < childExitAge) {
                curExp += (childCount * childExpense) * Math.pow(1 + expInf, i);
            }
            
            // 3. 자산 업데이트
            asset = (asset * (1 + rate)) + curInc - curExp;

            // 4. 판정
            let target = curExp * 25; // FIRE 목표선 (지출의 25배)
            if (fireAge === null && asset >= target && asset > 0) fireAge = curAgeS;
            if (bankruptAge === null && asset < 0) bankruptAge = curAgeS;

            // 데이터 차트용 저장
            labels.push(curAgeS + "세");
            assetData.push(Math.round(asset));
            targetData.push(Math.round(target));
            incData.push(Math.round(curInc));
            expData.push(Math.round(curExp));

            // 표(Table) 행 추가
            tableBody.insertAdjacentHTML('beforeend', `
                <tr>
                    <td>${curAgeS}세</td><td>${curAgeP}세</td>
                    <td style="color:${asset < 0 ? '#f04452' : '#333'}; font-weight:bold;">${formatKRW(asset)}</td>
                    <td style="color:#3182f6;">${formatKRW(curInc)}</td>
                    <td>${formatKRW(curExp)}</td>
                </tr>
            `);
            if (asset < -5000000) break; // 자산이 너무 심각하게 마이너스면 중단
        }

        resultArea.classList.remove("hidden");
        
        // 결과 문구 출력
        const headline = document.getElementById("resultHeadline");
        const summary = document.getElementById("summaryText");

        if (bankruptAge !== null) {
            headline.innerHTML = `⚠️ ${bankruptAge}세에 자산이 고갈될 것으로 보입니다`;
            headline.style.color = "#f04452";
            summary.innerHTML = `현재 지출 규모가 자산 성장보다 큽니다. <strong>${bankruptAge}세</strong> 무렵 자산이 고갈될 위험이 있으니 계획 수정이 필요합니다.`;
        } else if (fireAge) {
            headline.innerHTML = `💡 ${fireAge}세에 파이어 가능합니다`;
            headline.style.color = "#191f28";
            summary.innerHTML = `
                현재 순자산 <strong>${formatKRW(initialAsset)}</strong> 기준, 자녀 양육 및 보수적 연금 설정을 반영했을 때<br>
                <strong>${fireAge}세</strong>에 경제적 자립이 가능한 것으로 분석되었습니다.
            `;
        }

        renderCharts(labels, assetData, targetData, incData, expData);
        window.scrollTo({ top: resultArea.offsetTop - 20, behavior: 'smooth' });
    }

    function renderCharts(labels, assetData, targetData, incData, expData) {
        const yLabelFormat = (v) => {
            if (Math.abs(v) >= 10000) return (v / 10000).toFixed(1) + '억';
            return v.toLocaleString();
        };

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
            options: { 
                responsive: true, maintainAspectRatio: false,
                scales: { y: { ticks: { callback: yLabelFormat } } }
            }
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
            options: { 
                responsive: true, maintainAspectRatio: false,
                scales: { y: { ticks: { callback: yLabelFormat } } }
            }
        });
    }
});
