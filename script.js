const btn = document.getElementById("calcBtn")

let assetChart
let flowChart

function formatNumber(n){
return Math.round(n).toLocaleString()
}

btn.onclick = function(){

const ageSelf = Number(document.getElementById("ageSelf").value) || 0
const agePartner = Number(document.getElementById("agePartner").value) || 0

let asset = (Number(document.getElementById("asset").value) || 0) * 10000
const investRate = (Number(document.getElementById("rate").value) || 0) / 100

let incomeSelf = (Number(document.getElementById("incomeSelf").value) || 0) * 10000
let incomePartner = (Number(document.getElementById("incomePartner").value) || 0) * 10000
const incomeGrowth = (Number(document.getElementById("incomeGrowth").value) || 0) / 100

let expenseBase = (Number(document.getElementById("expense").value) || 0) * 10000
const expenseGrowth = (Number(document.getElementById("inflation").value) || 0) / 100

const retireSelf = Number(document.getElementById("retireSelf").value) || 100
const retirePartner = Number(document.getElementById("retirePartner").value) || 100

const childCount = Number(document.getElementById("childCount").value) || 0
const childIndep = Number(document.getElementById("childIndep").value) || 0
const childCost = (Number(document.getElementById("childCost").value) || 0) * 10000

const labels = []
const assetData = []
const fireLine = []

const incomeData = []
const expenseData = []
const childData = []

let fireAge = null
let bankruptAge = null

const tableBody = document.querySelector("#resultTable tbody")
tableBody.innerHTML = ""

for(let i=0;i<80;i++){

const currentAge = ageSelf + i
const partnerAge = agePartner + i

let income = 0

if(currentAge < retireSelf){
income += incomeSelf * Math.pow(1+incomeGrowth,i)
}

if(partnerAge < retirePartner){
income += incomePartner * Math.pow(1+incomeGrowth,i)
}

let expense = expenseBase * Math.pow(1+expenseGrowth,i)

let childExpense = 0

if(currentAge < childIndep){
childExpense = childCost * childCount * Math.pow(1+expenseGrowth,i)
}

expense += childExpense

asset = asset * (1+investRate) + income - expense

const fireTarget = expense * 25

if(asset <= 0 && bankruptAge === null){
bankruptAge = currentAge
}

if(asset * investRate >= expense && fireAge === null){
fireAge = currentAge
}

labels.push(currentAge)
assetData.push(asset)
fireLine.push(fireTarget)

incomeData.push(income)
expenseData.push(expense)
childData.push(childExpense)

const row = document.createElement("tr")

row.innerHTML = `
<td>${currentAge}/${partnerAge}</td>
<td>${formatNumber(asset)}</td>
<td>${formatNumber(income)}</td>
<td>${formatNumber(expense)}</td>
`

tableBody.appendChild(row)

}

document.getElementById("resultBox").style.display = "block"

const resultText = document.getElementById("mainResult")

if(bankruptAge){
resultText.innerText = bankruptAge + "세에 자산이 고갈됩니다."
}else if(fireAge){
resultText.innerText = fireAge + "세에 경제적 자유(FIRE)에 도달합니다."
}else{
resultText.innerText = "100세까지 자산이 유지됩니다."
}

document.getElementById("assumption1").innerText =
"현재 기준 월 " + formatNumber((incomeSelf+incomePartner)/12) +
"원 수입 / 월 " + formatNumber(expenseBase/12) + "원 지출"

document.getElementById("assumption2").innerText =
"근로소득 증가율 " + (incomeGrowth*100) +
"% / 지출 상승률 " + (expenseGrowth*100) + "% 가정"

document.getElementById("assumption3").innerText =
"투자 수익률 연 " + (investRate*100) + "% 가정"

if(assetChart){
assetChart.destroy()
}

assetChart = new Chart(document.getElementById("assetChart"),{
type:"line",
data:{
labels:labels,
datasets:[
{
label:"순자산",
data:assetData
},
{
label:"FIRE 목표자산",
data:fireLine
}
]
}
})

if(flowChart){
flowChart.destroy()
}

flowChart = new Chart(document.getElementById("flowChart"),{
type:"line",
data:{
labels:labels,
datasets:[
{
label:"수입",
data:incomeData
},
{
label:"지출",
data:expenseData
},
{
label:"자녀지출",
data:childData
}
]
}
})

}
