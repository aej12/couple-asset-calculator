document.addEventListener("DOMContentLoaded", function () {

const btn = document.getElementById("calcBtn");

const summary = document.getElementById("summarySection");
const result = document.getElementById("resultSection");

const table = document.getElementById("yearlyTable");
const summaryText = document.getElementById("summaryText");

let chart;

function money(x){
return Math.round(x).toLocaleString();
}

btn.addEventListener("click", function(){

let ageSelf = +ageSelf.value;
let agePartner = +agePartner.value;

let asset = +assetTotal.value;

let incomeSelfStart = +incomeSelf.value;
let incomePartnerStart = +incomePartner.value;

let incomeGrowth = incomeGrowth.value/100;

let expense = +expenseTotal.value;
let inflation = expenseInflation.value/100;

let rate = interestRate.value/100;

let retireSelfAge = +retireSelf.value;
let retirePartnerAge = +retirePartner.value;

let childCountN = +childCount.value;
let childYears = +childYearsRemaining.value;
let childCost = +childAnnualExpense.value;

let labels=[];
let assetData=[];
let incomeData=[];
let expenseData=[];
let childData=[];

table.innerHTML="";

let fireAge=null;

for(let i=0;i<100-ageSelf;i++){

let age=ageSelf+i;
let ageP=agePartner+i;

let inc1 = age<retireSelfAge
? incomeSelfStart*Math.pow(1+incomeGrowth,i)
:0;

let inc2 = ageP<retirePartnerAge
? incomePartnerStart*Math.pow(1+incomeGrowth,i)
:0;

let income=inc1+inc2;

let baseExpense=expense*Math.pow(1+inflation,i);

let childExpense=0;

if(i<childYears){
childExpense=childCost*childCountN*Math.pow(1+inflation,i);
}

let totalExpense=baseExpense+childExpense;

let passive=asset*rate;

if(!fireAge && passive>totalExpense){
fireAge=age;
}

asset = asset*(1+rate)+income-totalExpense;

labels.push(age+"("+ageP+")");
assetData.push(asset);
incomeData.push(income);
expenseData.push(totalExpense);
childData.push(childExpense);

let tr=document.createElement("tr");

tr.innerHTML=`
<td>${age}(${ageP})</td>
<td>${money(asset)}</td>
<td>${money(income)}</td>
<td>${money(baseExpense)}</td>
<td>${money(childExpense)}</td>
`;

table.appendChild(tr);

}

summary.style.display="block";
result.style.display="block";

summaryText.innerHTML =
fireAge
? `<b>${fireAge}세 경제적 자유 예상</b>`
: `100세까지 FIRE 도달하지 못함`;

const ctx=document.getElementById("assetChart");

if(chart) chart.destroy();

chart=new Chart(ctx,{
type:"line",

data:{
labels:labels,

datasets:[
{
label:"순자산",
data:assetData,
borderWidth:5,
borderColor:"#3182f6",
tension:0.3
},
{
label:"수입",
data:incomeData,
borderWidth:3,
borderColor:"#20c997",
tension:0.3
},
{
label:"지출",
data:expenseData,
borderWidth:3,
borderColor:"#f04452",
tension:0.3
},
{
label:"자녀지출",
data:childData,
borderWidth:3,
borderColor:"#ff9800",
tension:0.3
}
]
},

options:{

responsive:true,

scales:{
y:{
ticks:{
callback:function(value){

let eok=value/10000;

if(eok>=1){
return eok+"억";
}

return value;
}
}
}
}

}

});

});

});
