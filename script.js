const btn = document.getElementById("calcBtn")

let chart

function format(num){
return Math.round(num).toLocaleString()
}

btn.onclick = function(){

let age = +document.getElementById("ageSelf").value
let ageP = +document.getElementById("agePartner").value

let assetValue = +document.getElementById("asset").value * 10000
let r = document.getElementById("rate").value / 100

let inc1 = document.getElementById("incomeSelf").value * 10000
let inc2 = document.getElementById("incomePartner").value * 10000

let g = document.getElementById("incomeGrowth").value / 100

let expenseBase = document.getElementById("expense").value * 10000
let infl = document.getElementById("inflation").value / 100

let retire1 = document.getElementById("retireSelf").value
let retire2 = document.getElementById("retirePartner").value

let childN = document.getElementById("childCount").value
let childIndep = document.getElementById("childIndep").value
let childCost = document.getElementById("childCost").value * 10000

let labels=[]
let assets=[]
let fireLine=[]

let fireAge=null
let bankruptAge=null

let tableBody=document.querySelector("#resultTable tbody")
tableBody.innerHTML=""

for(let i=0;i<80;i++){

let ageNow=age+i
let agePNow=ageP+i

let income=0

if(ageNow<retire1) income+=inc1*Math.pow(1+g,i)
if(agePNow<retire2) income+=inc2*Math.pow(1+g,i)

let expense=expenseBase*Math.pow(1+infl,i)

if(ageNow<childIndep){
expense+=childCost*childN*Math.pow(1+infl,i)
}

let fireTarget=expense*25

assetValue=assetValue*(1+r)+income-expense

if(assetValue<=0 && !bankruptAge){
bankruptAge=ageNow
}

let passive=assetValue*r

if(!fireAge && passive>=expense){
fireAge=ageNow
}

labels.push(ageNow+" / "+agePNow)
assets.push(assetValue)
fireLine.push(fireTarget)

let row=`
<tr>
<td>${ageNow}</td>
<td>${agePNow}</td>
<td>${format(assetValue)}</td>
<td>${format(income)}</td>
<td>${format(expense)}</td>
</tr>
`

tableBody.innerHTML+=row
}

document.getElementById("resultBox").style.display="block"

if(bankruptAge){

document.getElementById("resultText").innerHTML=
`이대로라면 <b>${bankruptAge}세</b>에 자산이 고갈됩니다.`

}else if(fireAge){

document.getElementById("resultText").innerHTML=
`이대로라면 <b>${fireAge}세</b>에 경제적 자유에 도달합니다.`

}else{

document.getElementById("resultText").innerHTML=
`100세까지 경제적 자유에 도달하지 못합니다.`

}

if(chart) chart.destroy()

chart=new Chart(document.getElementById("assetChart"),{

type:"line",

data:{
labels:labels,
datasets:[
{
label:"순자산",
data:assets,
borderWidth:3
},
{
label:"FIRE 목표자산",
data:fireLine,
borderDash:[6,6],
borderWidth:3
}
]
}
})

}
