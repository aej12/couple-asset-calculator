let chart;

function simulate(){

const age = Number(ageInput.value);
let asset = Number(assetInput.value);

const hIncome = Number(hIncomeInput.value)*12;
const wIncome = Number(wIncomeInput.value)*12;

const hRetire = Number(hRetireInput.value);
const wRetire = Number(wRetireInput.value);

const consumeRate = Number(consumeInput.value)/100;
const r = Number(returnRateInput.value)/100;
const inflation = Number(inflationInput.value)/100;

let labels=[]
let data=[]
let table=""

let bankruptAge=null;

let income=hIncome+wIncome
let expense=income*consumeRate

for(let a=age; a<=100; a++){

if(a>=hRetire) income-=hIncome
if(a>=wRetire) income-=wIncome

let cashFlow=income-expense

asset=asset*(1+r)+cashFlow

if(asset<0 && bankruptAge===null){
bankruptAge=a
}

labels.push(a)
data.push(asset)

table+=`
<tr>
<td>${a}</td>
<td>${Math.round(income)}</td>
<td>${Math.round(expense)}</td>
<td>${Math.round(asset)}</td>
</tr>
`

income*=1+inflation
expense*=1+inflation

}

document.querySelector("#cashTable tbody").innerHTML=table

if(bankruptAge){
summary.innerHTML=
`이대로 계산하면 당신은 <b>${bankruptAge}세</b>에 파산하게 됩니다.`
}else{
summary.innerHTML=
`100세까지 파산하지 않습니다.`
}

drawChart(labels,data)

}
