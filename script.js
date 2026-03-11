let chart;

function calculate(){

let age = parseInt(document.getElementById("husbandAge").value);
let asset = parseFloat(document.getElementById("asset").value);

let incomeH = parseFloat(document.getElementById("husbandIncome").value);
let incomeW = parseFloat(document.getElementById("wifeIncome").value);

let expense = parseFloat(document.getElementById("expense").value);

let incomeGrowth = parseFloat(document.getElementById("incomeGrowth").value)/100;
let inflation = parseFloat(document.getElementById("inflation").value)/100;
let returnRate = parseFloat(document.getElementById("returnRate").value)/100;

let retireH = parseInt(document.getElementById("husbandRetire").value);
let retireW = parseInt(document.getElementById("wifeRetire").value);

let labels=[]
let data=[]

let bankruptAge=null

for(let i=0;i<=100-age;i++){

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

let ctx=document.getElementById("chart").getContext("2d")

if(chart) chart.destroy()

chart=new Chart(ctx,{
type:'line',
data:{
labels:labels,
datasets:[{
label:"순자산",
data:data,
borderWidth:3,
tension:0.2
}]
},
options:{
responsive:true
}
})

}
