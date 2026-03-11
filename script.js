const btn=document.getElementById("calcBtn")

let chart

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

let fireAge=null
let bankruptAge=null

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

asset=asset*(1+r)+income-expense

if(asset<=0 && !bankruptAge){

bankruptAge=ageNow

}

let passive=asset*r

if(!fireAge && passive>=expense){

fireAge=ageNow

}

labels.push(ageNow+" / "+agePNow)
assets.push(asset)
fireLine.push(fireTarget)

}

resultBox.style.display="block"

if(bankruptAge){

resultText.innerHTML=`이대로라면 <b>${bankruptAge}세</b>에 자산이 고갈됩니다.`

}else if(fireAge){

resultText.innerHTML=`이대로라면 <b>${fireAge}세</b>에 경제적 자유에 도달합니다.`

}else{

resultText.innerHTML=`100세까지 경제적 자유에 도달하지 못합니다.`

}

if(chart) chart.destroy()

chart=new Chart(assetChart,{

type:"line",

data:{
labels:labels,
datasets:[

{
label:"순자산",
data:assets,
borderWidth:4
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
