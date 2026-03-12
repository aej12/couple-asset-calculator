document.addEventListener("DOMContentLoaded", () => {
  const mainBtn = document.getElementById("mainBtn");
  let isAdClicked = false; // 광고 클릭 여부 확인

  // 1. 방문자 통계 로직 (localStorage 활용 가상 통계)
  const initVisitors = () => {
    let total = parseInt(localStorage.getItem("total_v") || 3852);
    let today = parseInt(localStorage.getItem("today_v") || 124);
    
    // 방문할 때마다 조금씩 증가 (데모용)
    total += 1;
    today += 1;
    
    localStorage.setItem("total_v", total);
    localStorage.setItem("today_v", today);
    
    document.getElementById("totalVisit").innerText = total.toLocaleString();
    document.getElementById("todayVisit").innerText = today.toLocaleString();
  };
  initVisitors();

  // 2. 억 단위 한글 변환 함수
  const formatKrw = (num) => {
    let absN = Math.abs(Math.round(num));
    if (absN >= 10000) {
      let uk = Math.floor(absN / 10000);
      let man = absN % 10000;
      return (num < 0 ? "-" : "") + `${uk}억 ${man > 0 ? man.toLocaleString() : ""}`;
    }
    return (num < 0 ? "-" : "") + absN.toLocaleString();
  };

  // 3. 메인 버튼 클릭 핸들러 (광고 게이트웨이)
  mainBtn.addEventListener("click", () => {
    if (!isAdClicked) {
      // 쿠팡 파트너스 링크 열기
      window.open("https://link.coupang.com/a/d2Gw7t", "_blank");
      
      isAdClicked = true;
      let count = 5;
      mainBtn.disabled = true;
      
      const timer = setInterval(() => {
        mainBtn.innerText = `분석 준비 중... ${count}초`;
        count--;
        
        if (count < 0) {
          clearInterval(timer);
          mainBtn.disabled = false;
          mainBtn.innerText = "분석 결과 보기";
          mainBtn.style.background = "#00c64b"; // 완료 시 초록색으로 변경
        }
      }, 1000);
    } else {
      // 5초 후 다시 눌렀을 때 실제 계산 실행
      runSimulation();
    }
  });

  // 4. 시뮬레이션 로직
  function runSimulation() {
    const val = (id) => parseFloat(document.getElementById(id).value) || 0;
    // ... (기존의 데이터 수집 및 시뮬레이션 계산 로직 동일) ...
    // ... (Chart.js 생성 로직 동일) ...
    
    // 결과창 보여주기
    document.getElementById("resultArea").classList.remove("hidden");
    window.scrollTo({ top: document.getElementById("resultArea").offsetTop - 20, behavior: "smooth" });
  }
});
