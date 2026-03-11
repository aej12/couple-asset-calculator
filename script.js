const btn = document.getElementById("calcBtn")

let assetChart
let flowChart

function moneyKR(v){

const eok = Math.floor(v/100000000)
const man = Math.floor((v%100000000)/10000)

if(eok>0 && man>0) return eok+"억 "+man.toLocaleString()+"만원"
if(eok>0) return eok+"억원"
return man.toLocaleString()+"만원"
}

btn.onclick = function(){

const ageSelf = Number(ageSelf.value)
const agePartner = Number(agePartner.value)

let asset = Number(asset.value)*10000
const invest = Number(rate.value)/100

let incomeSelfV = Number(incomeSelf.value)*10000
let incomePartnerV = Number(incomePartner.value)*10000
const incomeGrow = Number(incomeGrowth.value)/100

let expenseBase = Number(expense.value)*10000
const expenseGrow = Number(inflation.value)/100

const retireSelfV = Number(retireSelf.value)
const retirePartnerV = Number(retirePartner.value)

const childCountV = Number(childCount.value)
const childIndepV = Number(childIndep.value)
const childCostV = Number(childCost.value)*10000

const labels=[]
const assetData=[]
const fireLine=[]

const incomeData=[]
const expenseData=[]
const childData=[]

let fireAge=null
let bankruptAge=null

const tableBody=document.querySelector("#resultTable tbody")
tableBody.innerHTML=""

for(let i=0;i<=100-ageSelf;i++){

const age=ageSelf+i
const partnerAge=agePartner+i

let income=0

if(age<retireSelfV)
income+=incomeSelfV*Math.pow(1+incomeGrow,i)

if(partnerAge<retirePartnerV)
income+=incomePartnerV*Math.pow(1+incomeGrow,i)

let expense=expenseBase*Math.pow(1+expenseGrow,i)

let childExpense=0

if(age<childIndepV)
childExpense=childCostV*childCountV*Math.pow(1+expenseGrow,i)

expense+=childExpense

asset=asset*(1+invest)+income-expense

const fireTarget=expense*25

if(asset<=0 && !bankruptAge) bankruptAge=age
if(asset*invest>=expense && !fireAge) fireAge=age

labels.push(age)
assetData.push(asset)
fireLine.push(fireTarget)

incomeData.push(income)
expenseData.push(expense)
childData.push(childExpense)

const row=document.createElement("tr")

row.innerHTML=`
<td>${age}/${partnerAge}</td>
<td>${moneyKR(asset)}</td>
<td>${moneyKR(income)}</td>
<td>${moneyKR(expense)}</td>
`

tableBody.appendChild(row)

}

document.getElementById("resultBox").style.display="block"

if(bankruptAge)
mainResult.innerText=bankruptAge+"세에 자산이 고갈됩니다."
else if(fireAge)
mainResult.innerText=fireAge+"세에 FIRE 달성"
else
mainResult.innerText="100세까지 자산 유지"

fireAsset.innerText=moneyKR(expenseBase*25)

if(assetChart) assetChart.destroy()

assetChart=new Chart(assetChart,{
type:"line",
data:{
labels:labels,
datasets:[
{label:"순자산",data:assetData},
{label:"FIRE 목표자산",data:fireLine}
]
},
options:{
scales:{
y:{
ticks:{callback:v=>moneyKR(v)}
}
}
}
})

if(flowChart) flowChart.destroy()

flowChart=new Chart(flowChart,{
type:"line",
data:{
labels:labels,
datasets:[
{label:"수입",data:incomeData},
{label:"지출",data:expenseData},
{label:"자녀지출",data:childData}
]
},
options:{
scales:{
y:{
ticks:{callback:v=>moneyKR(v)}
}
}
}
})

}
