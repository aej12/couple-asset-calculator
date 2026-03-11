const btn = document.getElementById("calcBtn");
const shareBtn = document.getElementById("shareBtn");

let chart;

function format(num){
return Math.round(num).toLocaleString();
}

btn.onclick=function(){

let age = +ageSelf.value
let ageP = +agePartner.value

let asset = +asset.value *10000

let r = returnRate.value/100
let inc1 = incomeSelf.value*10000
let inc2 = incomePartner.value*10000

let g = incomeGrowth.value/100

let expenseBase = expense.value*10000
let infl = inflation.value/100

let retire1 = retireSelf.value
let retire2 = retirePartner.value

let childN = childCount.value
let childAge = childIndepAge.value
let childCost = childCost.value*10000

let labels=[]
let assets=[]

let fireAge=null

for(let i=0;i<80;i++){

let ageNow=age+i
let agePNow=ageP+i

let income=0

if(ageNow<retire1) income+=inc1*Math.pow(1+g,i)
if(agePNow<retire2) income+=inc2*Math.pow(1+g,i)

let expense=expenseBase*Math.pow(1+infl,i)

if(ageNow<childAge){

expense+=childCost*childN*Math.pow(1+infl,i)

}

asset=asset*(1+r)+income-expense

labels.push(ageNow)

assets.push(asset)

let passive=asset*r

if(!fireAge && passive>=expense){

fireAge=ageNow

}

}

resultBox.style.display="block"

summary.innerHTML=
fireAge
? `이대로라면 <b>${fireAge}세</b>에 경제적 자유에 도달합니다.`
: `이 조건에서는 경제적 자유에 도달하지 못합니다.`

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
}
]
}

})

}

shareBtn.onclick=function(){

const url = location.href

navigator.clipboard.writeText(url)

alert("URL이 복사되었습니다. 공유해보세요!")

}
