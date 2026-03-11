document.addEventListener("DOMContentLoaded",function(){

const btn=document.getElementById("calcBtn");

const summary=document.getElementById("summarySection");
const result=document.getElementById("resultSection");

const table=document.getElementById("yearlyTable");
const summaryText=document.getElementById("summaryText");

let assetChart;
let cashChart;

function money(x){
return Math.round(x).toLocaleString();
}

function toEok(x){
return (x/100000000).toFixed(1);
}

btn.addEventListener("click",function(){

let ageSelf=+document.getElementById("ageSelf").value;
let agePartner=+document.getElementById("agePartner").value;

let asset=+document.getElementById("assetTotal").value;

let incomeSelf=+document.getElementById("incomeSelf").value;
let incomePartner=+document.getElementById("incomePartner").value;

let incomeGrowth=document.getElementById("incomeGrowth").value/100;

let expense=+document.getElementById("expenseTotal").value;
let inflation=document.getElementById("expenseInflation").value/100;

let rate=document.getElementById("interestRate").value/100;

let retireSelf=+document.getElementById("retireSelf").value;
let retirePartner=+document.getElementById("retirePartner").value;

let childCount=+document.getElementById("childCount").value;
let childYears=+document.getElementById("childYearsRemaining").value;
let childCost=+document.getElementById("childAnnualExpense").value;

let labels=[];
let assetData=[];
let incomeData=[];
let expenseData=[];
let childData=[];
let fireLine=[];

table.innerHTML="";

let fireAge=null;

for(let i=0;i<100-ageSelf;i++){

let age=ageSelf+i;
let ageP=agePartner+i;

let inc1=age<retireSelf?incomeSelf*Math.pow(1+incomeGrowth,i):0;
let inc2=ageP<retirePartner?incomePartner*Math.pow(1+incomeGrowth,i):0;

let income=inc1+inc2;

let baseExpense=expense*Math.pow(1+inflation,i);

let childExpense=0;

if(i<childYears){
childExpense=childCost*childCount*Math.pow(1+inflation,i);
}

let totalExpense=baseExpense+childExpense;

let fireTarget=totalExpense*25;

let passive=asset*0.04;

if(!fireAge && passive>=totalExpense){
fireAge=age;
}

asset=asset*(1+rate)+income-totalExpense;

labels.push(age+"("+ageP+")");

assetData.push(asset);
incomeData.push(income);
expenseData.push(baseExpense);
childData.push(childExpense);
fireLine.push(fireTarget);

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

summaryText.innerHTML=
fireAge
? `<b>${fireAge}세 FIRE 가능</b>`
: `100세까지 FIRE 도달 못함`;

if(assetChart) assetChart.destroy();
if(cashChart) cashChart.destroy();

assetChart=new Chart(document.getElementById("assetChart"),{

type:"line",

data:{
labels:labels,

datasets:[

{
label:"순자산",
data:assetData,
borderColor:"#3182f6",
borderWidth:5,
tension:0.35,
pointRadius:0
},

{
label:"FIRE 목표자산",
data:fireLine,
borderColor:"#f04452",
borderDash:[8,8],
borderWidth:4,
pointRadius:0
}

]

},

options:{
scales:{
y:{
ticks:{
callback:function(value){
return toEok(value)+"억";
}
}
}
}

});

cashChart=new Chart(document.getElementById("cashChart"),{

type:"line",

data:{
labels:labels,

datasets:[

{
label:"수입",
data:incomeData,
borderColor:"#20c997",
borderWidth:4,
pointRadius:0
},

{
label:"기본지출",
data:expenseData,
borderColor:"#f04452",
borderWidth:4,
pointRadius:0
},

{
label:"자녀지출",
data:childData,
borderColor:"#ff9800",
borderWidth:4,
pointRadius:0
}

]

},

options:{
scales:{
y:{
ticks:{
callback:function(value){
return toEok(value)+"억";
}
}
}
}

});

});

});
