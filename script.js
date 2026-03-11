let chart;

function calculate(){

const husband = Number(document.getElementById("husband").value);
const wife = Number(document.getElementById("wife").value);
const saveRate = Number(document.getElementById("saveRate").value)/100;
const returnRate = Number(document.getElementById("returnRate").value)/100;

const income = husband + wife;
const yearlySave = income * saveRate;

let asset = 0;
let data = [];
let labels = [];

for(let i=1;i<=20;i++){

asset = asset*(1+returnRate) + yearlySave;

data.push(Math.round(asset));
labels.push(i+"년");

}

document.getElementById("result10").innerText =
"10년 후 자산: " + data[9].toLocaleString()+"만원";

document.getElementById("result20").innerText =
"20년 후 자산: " + data[19].toLocaleString()+"만원";


const ctx = document.getElementById("assetChart");

if(chart) chart.destroy();

chart = new Chart(ctx, {

type:"line",

data:{
labels:labels,

datasets:[{
label:"자산 성장",
data:data,
borderWidth:2
}]
}

});

}
