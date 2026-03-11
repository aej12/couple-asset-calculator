document.getElementById("calcBtn").addEventListener("click",calculate);

let chart;

function format(num){
return Math.round(num).toLocaleString();
}

function calculate(){

let age = Number(document.getElementById("age").value);
let asset = Number(document.getElementById("asset").value);

let income = Number(document.getElementById("income").value)*12;
let expense = Number(document.getElementById("expense").value)*12;

let incomeGrowth = Number(document.getElementById("incomeGrowth").value)/100;
let expenseGrowth = Number(document.getElementById("expenseGrowth").value)/100;
let returnRate = Number(document.getElementById("returnRate").value)/100;

let labels=[];
let assets=[];

let fireAge=null;
let bankruptAge=null;

for(let i=0;i<80;i++){

let financialIncome = asset * returnRate;

if(financialIncome >= income*1.5 && fireAge===null){
fireAge=age+i;
}

asset = asset*(1+returnRate) + income - expense;

if(asset<=0 && bankruptAge===null){
bankruptAge=age+i;
}

labels.push(age+i);
assets.push(asset);

income *= (1+incomeGrowth);
expense *= (1+expenseGrowth);

}

let result="";

if(bankruptAge){
result += `<b>${bankruptAge}세에 자산이 고갈됩니다.</b><br><br>`;
}else if(fireAge){
result += `<b>${fireAge}세에 FIRE가 가능합니다!</b><br><br>`;
}else{
result += `100세까지 자산 고갈 없이 유지됩니다.<br><br>`;
}

result += `
계산 가정 설명<br>
현재 기준 월 ${format(income/12)}원 수입 / 월 ${format(expense/12)}원 지출<br>
근로소득 증가율 ${(incomeGrowth*100)}% / 지출 상승률 ${(expenseGrowth*100)}% 가정<br>
투자 수익률 연 ${(returnRate*100)}% 가정
`;

document.getElementById("resultText").innerHTML=result;

drawChart(labels,assets);

}

function drawChart(labels,data){

const ctx=document.getElementById("assetChart");

if(chart){
chart.destroy();
}

chart=new Chart(ctx,{
type:'line',
data:{
labels:labels,
datasets:[{
label:'순자산',
data:data,
borderWidth:3,
fill:false
}]
},
options:{
responsive:true,
plugins:{
legend:{display:false}
}
}
});

}
