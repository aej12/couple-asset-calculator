let chart

function simulate(){

let hAge=Number(document.getElementById("hAge").value)
let wAge=Number(document.getElementById("wAge").value)

let age=Math.min(hAge,wAge)

let hIncome=Number(document.getElementById("hIncome").value)*12
let wIncome=Number(document.getElementById("wIncome").value)*12

let hRetire=Number(document.getElementById("hRetire").value)
let wRetire=Number(document.getElementById("wRetire").value)

let asset=Number(document.getElementById("asset").value)

let consume=Number(document.getElementById("consume").value)/100
let r=Number(document.getElementById("returnRate").value)/100
let inflation=Number(document.getElementById("inflation").value)/100

let income=hIncome+wIncome
let expense=income*consume

let labels=[]
let data=[]

let bankrupt=null

for(let a=age;a<=100;a++){

if(a>=hRetire) income-=hIncome
if(a>=wRetire) income-=wIncome

let cash=income-expense

asset=asset*(1+r)+cash

if(asset<0 && bankrupt==null){
bankrupt=a
}

labels.push(a)
data.push(asset)

income*=1+inflation
expense*=1+inflation

}

if(bankrupt){
document.getElementById("summary").innerHTML=
bankrupt+"세에 파산합니다."
}else{
document.getElementById("summary").innerHTML=
"100세까지 파산하지 않습니다."
}

if(chart) chart.destroy()

chart=new Chart(document.getElementById("chart"),{

type:"line",

data:{
labels:labels,

datasets:[{

label:"순자산",

data:data,

segment:{
borderColor:ctx=>ctx.p0.parsed.y>=0?"blue":"red"
}

}]

}

})

}
