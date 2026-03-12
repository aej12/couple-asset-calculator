document.addEventListener("DOMContentLoaded", () => {
    const btn = document.querySelector(".btn-calculate");
    const adModal = document.getElementById("adModal");
    const countNum = document.getElementById("countNum");
    const resultArea = document.getElementById("resultArea");
    let fireChart = null;

    const fmt = (n) => Math.round(n).toLocaleString();

    btn.addEventListener("click", () => {
        // 1. 광고 모달 띄우기
        adModal.classList.remove("hidden");
        let count = 5;
        countNum.innerText = count;

        const timer = setInterval(() => {
            count--;
            countNum.innerText = count;
            if (count === 0) {
                clearInterval(timer);
                adModal.classList.add("hidden");
                runSimulation(); // 5초 뒤 실제 계산 함수 호출
            }
        }, 1000);
    });

    function runSimulation() {
        const val = (id) => parseFloat(document.getElementById(id).value) || 0;

        // 데이터 수집
        let asset = val("assetTotal");
        const incomeS = val("incomeSelf");
        const incomeP = val("incomePartner");
        const expenseBase = val("expenseTotal");
        const rate = val("interestRate") / 100;
        const incInf = val("incomeInflation") / 100;
        const expInf = val("expenseInflation") / 100;
        const retS = val("retireSelf");
        const retP = val("retirePartner");
        const ageS = val("ageSelf");
        const ageP = val("agePartner");
        const childC = val("childCount");
        const childY = val("childYears");
        const childE = val("childExpense");

        const tableBody = document.querySelector("#resultTable tbody");
        tableBody.innerHTML = "";

        let labels = [], assetData = [], expData = [];
        let fireAge = null;
        let isDepleted = false;

        // 100세까지 시뮬레이션
        for (let i = 0; i <= (100 - ageS); i++) {
            let curAgeS = ageS + i;
            let curAgeP = ageP + i;

            // 수입 (은퇴 전까지만)
            let curInc = 0;
            if (curAgeS < retS) curInc += incomeS * Math.pow(1 + incInf, i);
            if (curAgeP < retP) curInc += incomeP * Math.pow(1 + incInf, i);

            // 지출 (물가상승 및 자녀 독립 반영)
            let curExp = expenseBase * Math.pow(1 + expInf, i);
            if (i < childY) {
                curExp += (childC * childE) * Math.pow(1 + expInf, i);
            }

            // 자산 증식 로직
            asset = (asset * (1 + rate)) + curInc - curExp;

            // 파이어 조건 (순자산 >= 연지출 * 25)
            if (fireAge === null && asset >= curExp * 25 && asset > 0) {
                fireAge = curAgeS;
            }
            if (asset < 0) isDepleted = true;

            // 데이터 기록
            labels.push(curAgeS + "세");
            assetData.push(Math.round(asset));
            expData.push(Math.round(curExp));

            // 테이블 추가
            const row = `<tr>
                <td>${curAgeS}</td><td>${curAgeP}</td>
                <td style="color:${asset < 0 ? '#f04452' : 'inherit'}">${fmt(asset)}</td>
                <td>${fmt(curInc)}</td><td>${fmt(curExp)}</td>
            </tr>`;
            tableBody.insertAdjacentHTML('beforeend', row);
            
            if (asset < -50000) break; // 과도한 고갈 시 중단
        }

        // 결과 표시
        resultArea.classList.remove("hidden");
        const summaryText = document.getElementById("summaryText");
        if (fireAge) {
            document.getElementById("statusIcon").innerText = "🚀";
            summaryText.innerHTML = `🎉 <strong>${fireAge}세</strong>에 경제적 자유 달성이 가능합니다!<br>현재의 투자 수익률과 지출 습관을 유지하신다면 목표를 이룰 수 있습니다.`;
        } else {
            document.getElementById("statusIcon").innerText = "📉";
            summaryText.innerHTML = `⚠️ 현재 조건으로는 FIRE 달성이 어렵습니다.<br>수익률을 높이거나 연간 지출을 조정해보는 것을 추천합니다.`;
        }

        // 차트 렌더링
        const ctx = document.getElementById('mainChart').getContext('2d');
        if (fireChart) fireChart.destroy();
        fireChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '순자산', data: assetData, borderColor: '#3182f6', fill: false, tension: 0.3
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        window.scrollTo({ top: resultArea.offsetTop - 20, behavior: 'smooth' });
    }
});
