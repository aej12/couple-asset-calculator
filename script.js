const btn=document.getElementById("calcBtn")

let chart1
let chart2

function format(n){

return Math.round(n).toLocaleString()

}

btn.onclick=function(){

let age=+ageSelf.value
let ageP=+agePartner.value

let asset=+asset.value*10000
let r=rate.value/100

let inc1=incomeSelf.value*10000
let inc2=incomePartner.value*10000

let g=incomeGrowth.value/100

let expenseBase=expense.value*10000
let infl=inflation.value/100

let retire1=retireSelf.value
let retire2=retirePartner.value

let childN=childCount.value
let childIndep=childIndep.value
let childCost=childCost.value*10000


let labels=[]
let assets=[]
let fireLine=[]

let incomeArr=[]
let expenseArr=[]
let childArr=[]

let fireAge=null
let bankruptAge=null


let tableBody=document.querySelector("#resultTable tbody")

tableBody.innerHTML=""


for(let i=0;i<80;i++){

let ageNow=age+i

let income=0

if(ageNow<retire1) income+=inc1*Math.pow(1+g,i)
if(ageP+i<retire2) income+=inc2*Math.pow(1+g,i)

let expense=expenseBase*Math.pow(1+infl,i)

let childExpense=0

if(ageNow<childIndep){

childExpense=childCost*childN*Math.pow(1+infl,i)

}

expense+=childExpense


asset=asset*(1+r)+income-expense

let fireTarget=expense*25


if(asset<=0 && !bankruptAge) bankruptAge=ageNow

if(asset*r>=expense && !fireAge) fireAge=ageNow


labels.push(ageNow)

assets.push(asset)

fireLine.push(fireTarget)

incomeArr.push(income)

expenseArr.push(expense)

childArr.push(childExpense)


tableBody.innerHTML+=`

<tr>
<td>${ageNow}/${ageP+i}</td>
<td>${format(asset)}</td>
<td>${format(income)}</td>
<td>${format(expense)}</td>
</tr>

`

}


resultBox.style.display="block"


if(bankruptAge){

mainResult.innerHTML=`${bankruptAge}세에 자산이 고갈됩니다.`

}else{

mainResult.innerHTML=`${fireAge}세에 경제적 자유(FIRE)에 도달합니다.`

}


assumption1.innerText=`현재 기준 월 ${(inc1+inc2)/12/10000}만원 수입 / 월 ${expenseBase/12/10000}만원 지출`

assumption2.innerText=`소득 증가율 ${incomeGrowth.value}% / 지출 증가율 ${inflation.value}%`

assumption3.innerText=`투자수익률 ${rate.value}% 가정`


if(chart1) chart1.destroy()

chart1=new Chart(assetChart,{

type:"line",

data:{
labels:labels,
datasets:[
{
label:"순자산",
data:assets
},
{
label:"FIRE 목표자산",
data:fireLine
}
]
}

})


if(chart2) chart2.destroy()

chart2=new Chart(flowChart,{

type:"line",

data:{
labels:labels,
datasets:[
{
label:"수입",
data:incomeArr
},
{
label:"지출",
data:expenseArr
},
{
label:"자녀지출",
data:childArr
}
]
}

})

}
