// ==========================================
// TradeTrack Pro - Dashboard
// ==========================================

// Load Trades
// ==============================
// Apply Saved Theme
// ==============================

if(localStorage.getItem("isLoggedIn") !== "true"){

    window.location.href = "index.html";

}

let trades = JSON.parse(localStorage.getItem("trades")) || [];

// ================= Welcome =================

const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
const userName = currentUser.fullName || "Trader";
const currencySymbol = localStorage.getItem("currency") || "₹";

document.getElementById("welcomeText").innerHTML =
`Welcome, ${userName} 👋`;


// ================= Date =================

const today = new Date();

document.getElementById("todayDate").innerHTML =
today.toDateString();


// ================= Variables =================

let totalTrades = trades.length;

let totalProfit = 0;

let wins = 0;

let losses = 0;

let todayProfit = 0;

let biggestProfit = 0;

let biggestLoss = 0;

let bestStock = "-";

let bestStrategy = "-";

let stockProfit = {};

let strategyProfit = {};


// ================= Loop =================

trades.forEach(trade=>{

    totalProfit += trade.pnl;

    if(trade.pnl >= 0){

        wins++;

    }

    else{

        losses++;

    }

    if(trade.pnl > biggestProfit){

        biggestProfit = trade.pnl;

    }

    if(trade.pnl < biggestLoss){

        biggestLoss = trade.pnl;

    }

    // Today's Profit

    if(trade.date === today.toISOString().split("T")[0]){

        todayProfit += trade.pnl;

    }

    // Stock Wise

    if(!stockProfit[trade.stock]){

        stockProfit[trade.stock]=0;

    }

    stockProfit[trade.stock]+=trade.pnl;

    // Strategy Wise

    if(!strategyProfit[trade.strategy]){

        strategyProfit[trade.strategy]=0;

    }

    strategyProfit[trade.strategy]+=trade.pnl;

});


// ================= Best Stock =================

let maxStock = -Infinity;

for(let stock in stockProfit){

    if(stockProfit[stock] > maxStock){

        maxStock = stockProfit[stock];

        bestStock = stock;

    }

}


// ================= Best Strategy =================

let maxStrategy = -Infinity;

for(let strategy in strategyProfit){

    if(strategyProfit[strategy] > maxStrategy){

        maxStrategy = strategyProfit[strategy];

        bestStrategy = strategy;

    }

}


// ================= Cards =================

document.getElementById("totalTrades").innerHTML = totalTrades;

document.getElementById("netProfit").innerHTML =
currencySymbol+totalProfit.toFixed(2);

document.getElementById("todayProfit").innerHTML =
currencySymbol+todayProfit.toFixed(2);

let winRate = totalTrades==0 ? 0 :
((wins/totalTrades)*100).toFixed(1);

document.getElementById("winRate").innerHTML =
winRate+"%";


// ================= Stats =================

document.getElementById("bestStock").innerHTML =
bestStock;

document.getElementById("bestStrategy").innerHTML =
bestStrategy;

document.getElementById("bigProfit").innerHTML =
currencySymbol+biggestProfit.toFixed(2);

document.getElementById("bigLoss").innerHTML =
currencySymbol+biggestLoss.toFixed(2);


// ================= Recent Trades =================

const table =
document.getElementById("recentTrades");

table.innerHTML="";

let recent =
trades.slice(-5).reverse();

recent.forEach(trade=>{

table.innerHTML +=`

<tr>

<td>${trade.stock}</td>

<td>${trade.type}</td>

<td style="color:${trade.pnl>=0?"green":"red"}">

${currencySymbol}${trade.pnl.toFixed(2)}

</td>

<td>${trade.date}</td>

</tr>

`;

});


// ================= Weekly Chart =================

const weekly = [0,0,0,0,0,0,0];

trades.forEach(trade=>{

let d = new Date(trade.date).getDay();

weekly[d]+=trade.pnl;

});

new Chart(

document.getElementById("weeklyChart"),

{

type:"bar",

data:{

labels:[
"Sun",
"Mon",
"Tue",
"Wed",
"Thu",
"Fri",
"Sat"
],

datasets:[{

label:"Profit / Loss",

data:weekly,

borderWidth:1

}]

},

options:{

responsive:true,

plugins:{

legend:{
display:false
}

}

}

}

);


// ================= Random Trading Tip =================

const tips=[

"Always use Stop Loss.",

"Never risk more than 2% capital.",

"Follow Risk Reward 1:2.",

"Quality Trades > Quantity Trades.",

"Avoid Revenge Trading.",

"Discipline creates consistency.",

"Protect your capital first.",

"Don't trade emotionally.",

"Journal every trade.",

"Patience is also a position."

];

let random =
Math.floor(Math.random()*tips.length);

document.getElementById("tradingTip").innerHTML =
tips[random];