function calculate(){


let age = Number(document.getElementById("age").value)

let retireAge = Number(document.getElementById("retireAge").value)

let asset = Number(document.getElementById("asset").value)


let returnRate = Number(document.getElementById("returnRate").value)/100


let income = Number(document.getElementById("income").value)

let incomeGrowth = Number(document.getElementById("incomeGrowth").value)/100


let expense = Number(document.getElementById("expense").value)

let inflation = Number(document.getElementById("inflation").value)/100



let labels=[]

let assets=[]


let fireAge=null

let bankruptAge=null


for(let i=0;i<80;i++){


let currentAge = age+i


let incomeNow = currentAge < retireAge
? income*Math.pow(1+incomeGrowth,i)
:0


let expenseNow = expense*Math.pow(1+inflation,i)


let fireTarget = expenseNow*25


asset = asset*(1+returnRate) + incomeNow - expenseNow


if(asset >= fireTarget && fireAge==null){

fireAge=currentAge

}


if(asset<=0 && bankruptAge==null){

bankruptAge=currentAge

}


labels.push(currentAge)

assets.push(asset)


}



let text=""



if(fireAge){

text+= fireAge + "세에 FIRE가 가능합니다!<br>"

}


if(bankruptAge){

text+= bankruptAge + "세에 자산이 고갈됩니다.<br>"

}



text+=`

<br>
<b>계산 가정</b><br><br>

현재 기준 월 ${Math.round(income*10000/12).toLocaleString()}원 수입 /
월 ${Math.round(expense*10000/12).toLocaleString()}원 지출<br>

근로소득 증가율 ${(incomeGrowth*100)}% /
지출 상승률 ${(inflation*100)}% 가정<br>

투자 수익률 연 ${(returnRate*100)}% 가정

`


document.getElementById("result").innerHTML=text



new Chart(document.getElementById("chart"),{

type:"line",

data:{

labels:labels,

datasets:[

{

label:"순자산",

data:assets,

borderColor:"green",

fill:false

}

]

}

})


}
