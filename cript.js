let chart;

function calculate(){

let age = Number(document.getElementById("husbandAge").value)

let asset = Number(document.getElementById("asset").value)

let incomeH = Number(document.getElementById("husbandIncome").value)

let incomeW = Number(document.getElementById("wifeIncome").value)

let expense = Number(document.getElementById("expense").value)

let incomeGrowth = Number(document.getElementById("incomeGrowth").value)/100

let inflation = Number(document.getElementById("inflation").value)/100

let returnRate = Number(document.getElementById("returnRate").value)/100

let retireH = Number(document.getElementById("husbandRetire").value)

let retireW = Number(document.getElementById("wifeRetire").value)

let labels=[]
let data=[]

let bankruptAge=null

for(let i=0;i<100-age;i++){

let currentAge=age+i

let income=0

if(currentAge<retireH) income+=incomeH
if(currentAge<retireW) income+=incomeW

let investIncome=asset*returnRate

let saving=income+investIncome-expense

asset+=saving

if(asset<0 && bankruptAge==null){
bankruptAge=currentAge
}

labels.push(currentAge)
data.push(asset)

incomeH*=1+incomeGrowth
incomeW*=1+incomeGrowth
expense*=1+inflation
}

drawChart(labels,data)

let result=document.getElementById("result")

if(bankruptAge){
result.innerHTML="이대로라면 <b>"+bankruptAge+"세에 파산합니다.</b>"
}else{
result.innerHTML="100세까지 자산이 유지됩니다."
}

}

function drawChart(labels,data){

let ctx=document.getElementById("chart")

if(chart) chart.destroy()

chart=new Chart(ctx,{
type:'line',
data:{
labels:labels,
datasets:[{
label:"순자산",
data:data,
borderColor:"#0064ff",
tension:0.2
}]
}
})

}
