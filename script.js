document.addEventListener("DOMContentLoaded", () => {

const btn = document.querySelector(".btn-calculate");
const adModal = document.getElementById("adModal");
const countNum = document.getElementById("countNum");

btn.addEventListener("click", () => {

adModal.classList.remove("hidden");

let count = 5;
countNum.innerText = count;

const timer = setInterval(()=>{

count--;
countNum.innerText = count;

if(count === 0){

clearInterval(timer);
adModal.classList.add("hidden");

runSimulation();

}

},1000);

});


function runSimulation(){

/* ⭐ 여기 안에 기존 script.js 계산 코드 전체 그대로 */

}

});
