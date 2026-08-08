// ==========================================
// TradeTrack Pro - Analytics V3
// Part 1
// ==========================================
// ==============================
// Apply Saved Theme
// ==============================

if(localStorage.getItem("isLoggedIn") !== "true"){

    window.location.href = "index.html";

}

const trades = JSON.parse(localStorage.getItem("trades")) || [];

// Cards
const totalTrades = document.getElementById("totalTrades");
const winningTrades = document.getElementById("winningTrades");
const losingTrades = document.getElementById("losingTrades");
const winRate = document.getElementById("winRate");
const netProfit = document.getElementById("netProfit");
const avgProfit = document.getElementById("avgProfit");

// =========================
// Summary
// =========================

let wins = 0;
let losses = 0;
let totalProfit = 0;

trades.forEach(trade => {

    totalProfit += trade.pnl;

    if (trade.pnl >= 0)
        wins++;
    else
        losses++;

});

totalTrades.innerHTML = trades.length;
winningTrades.innerHTML = wins;
losingTrades.innerHTML = losses;

netProfit.innerHTML = "₹" + totalProfit.toFixed(2);

avgProfit.innerHTML =
trades.length ?
"₹" + (totalProfit / trades.length).toFixed(2)
: "₹0";

winRate.innerHTML =
trades.length ?
((wins / trades.length) * 100).toFixed(1) + "%"
: "0%";

// =========================
// Weekly Chart
// =========================

let week = [0,0,0,0,0,0,0];

trades.forEach(t=>{

let d = new Date(t.date);

week[d.getDay()] += t.pnl;

});

new Chart(document.getElementById("weeklyChart"),{

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

label:"Weekly Profit",

data:week,

backgroundColor:"#2563eb"

}]

}

});

// =========================
// Monthly Chart
// =========================

let month = new Array(12).fill(0);

trades.forEach(t=>{

let d = new Date(t.date);

month[d.getMonth()] += t.pnl;

});

new Chart(document.getElementById("monthlyChart"),{

type:"line",

data:{

labels:[

"Jan","Feb","Mar","Apr","May","Jun",

"Jul","Aug","Sep","Oct","Nov","Dec"

],

datasets:[{

label:"Monthly Profit",

data:month,

borderColor:"#16a34a",

fill:false,

tension:.3

}]

}

});

// =========================
// Win Loss Pie
// =========================

new Chart(document.getElementById("pieChart"),{

type:"pie",

data:{

labels:["Winning","Losing"],

datasets:[{

data:[wins,losses],

backgroundColor:[

"#16a34a",

"#dc2626"

]

}]

}

});
// ==========================================
// PART 2
// Stock, Strategy, Emotion Analysis
// ==========================================

let bestTrade = null;
let worstTrade = null;

let stockCount = {};
let strategyData = {};
let emotionData = {};
let dayData = {};

let biggestProfit = -Infinity;
let biggestLoss = Infinity;

let winStreak = 0;
let lossStreak = 0;
let currentWin = 0;
let currentLoss = 0;

trades.forEach(trade => {

    // -----------------------
    // Best & Worst Trade
    // -----------------------

    if(bestTrade == null || trade.pnl > bestTrade.pnl){

        bestTrade = trade;

    }

    if(worstTrade == null || trade.pnl < worstTrade.pnl){

        worstTrade = trade;

    }

    // -----------------------
    // Stock Count
    // -----------------------

    stockCount[trade.stock] = (stockCount[trade.stock] || 0) + 1;

    // -----------------------
    // Strategy Profit
    // -----------------------

    if(!strategyData[trade.strategy]){

        strategyData[trade.strategy] = 0;

    }

    strategyData[trade.strategy] += trade.pnl;

    // -----------------------
    // Emotion Count
    // -----------------------

    emotionData[trade.emotion] = (emotionData[trade.emotion] || 0) + 1;

    // -----------------------
    // Trading Day
    // -----------------------

    const day = new Date(trade.date).toLocaleDateString("en-US",{
        weekday:"long"
    });

    if(!dayData[day]){

        dayData[day]=0;

    }

    dayData[day]+=trade.pnl;

    // -----------------------
    // Biggest Profit Loss
    // -----------------------

    if(trade.pnl > biggestProfit){

        biggestProfit = trade.pnl;

    }

    if(trade.pnl < biggestLoss){

        biggestLoss = trade.pnl;

    }

    // -----------------------
    // Win/Loss Streak
    // -----------------------

    if(trade.pnl > 0){

        currentWin++;
        currentLoss=0;

    }else{

        currentLoss++;
        currentWin=0;

    }

    if(currentWin>winStreak){

        winStreak=currentWin;

    }

    if(currentLoss>lossStreak){

        lossStreak=currentLoss;

    }

});


// ==========================================
// Best Stock
// ==========================================

if(bestTrade){

document.getElementById("bestStock").innerHTML =
bestTrade.stock;

document.getElementById("bestStockProfit").innerHTML =
"₹"+bestTrade.pnl.toFixed(2);

}


// ==========================================
// Worst Stock
// ==========================================

if(worstTrade){

document.getElementById("worstStock").innerHTML =
worstTrade.stock;

document.getElementById("worstStockLoss").innerHTML =
"₹"+worstTrade.pnl.toFixed(2);

}


// ==========================================
// Most Traded Stock
// ==========================================

let mostStock="-";
let mostCount=0;

for(let stock in stockCount){

if(stockCount[stock]>mostCount){

mostCount=stockCount[stock];

mostStock=stock;

}

}

document.getElementById("mostTraded").innerHTML=mostStock;

document.getElementById("tradeCount").innerHTML=
mostCount+" Trades";


// ==========================================
// Best Trading Day
// ==========================================

let bestDay="-";
let bestProfit=-Infinity;

for(let day in dayData){

if(dayData[day]>bestProfit){

bestProfit=dayData[day];

bestDay=day;

}

}

document.getElementById("bestDay").innerHTML=bestDay;

document.getElementById("bestDayProfit").innerHTML=
"₹"+bestProfit.toFixed(2);


// ==========================================
// Best Strategy
// ==========================================

let bestStrategy="-";
let bestStrategyProfit=-Infinity;

let worstStrategy="-";
let worstStrategyLoss=Infinity;

for(let s in strategyData){

if(strategyData[s]>bestStrategyProfit){

bestStrategyProfit=strategyData[s];

bestStrategy=s;

}

if(strategyData[s]<worstStrategyLoss){

worstStrategyLoss=strategyData[s];

worstStrategy=s;

}

}

document.getElementById("bestStrategy").innerHTML=
bestStrategy;

document.getElementById("strategyProfit").innerHTML=
"₹"+bestStrategyProfit.toFixed(2);

document.getElementById("worstStrategy").innerHTML=
worstStrategy;

document.getElementById("worstStrategyLoss").innerHTML=
"₹"+worstStrategyLoss.toFixed(2);


// ==========================================
// Emotion
// ==========================================

let topEmotion="-";
let emotionCount=0;

for(let e in emotionData){

if(emotionData[e]>emotionCount){

emotionCount=emotionData[e];

topEmotion=e;

}

}

document.getElementById("topEmotion").innerHTML=
topEmotion;

document.getElementById("emotionCount").innerHTML=
emotionCount;


// ==========================================
// Biggest Profit/Loss
// ==========================================

document.getElementById("bigProfit").innerHTML=
"₹"+biggestProfit.toFixed(2);

document.getElementById("bigLoss").innerHTML=
"₹"+biggestLoss.toFixed(2);


// ==========================================
// Win Loss Streak
// ==========================================

document.getElementById("winStreak").innerHTML=
winStreak;

document.getElementById("lossStreak").innerHTML=
lossStreak;
// ==========================================
// PART 3
// Strategy Table, Emotion Table & AI Insights
// ==========================================

// ===============================
// Strategy Table
// ===============================

const strategyTable = document.getElementById("strategyTable");

if(strategyTable){

    strategyTable.innerHTML = "";

    for(let strategy in strategyData){

        strategyTable.innerHTML += `

        <tr>

            <td>${strategy}</td>

            <td>${strategyData[strategy].toFixed(2)}</td>

        </tr>

        `;

    }

}

// ===============================
// Emotion Table
// ===============================

const emotionTable = document.getElementById("emotionTable");

if(emotionTable){

    emotionTable.innerHTML = "";

    for(let emotion in emotionData){

        emotionTable.innerHTML += `

        <tr>

            <td>${emotion}</td>

            <td>${emotionData[emotion]}</td>

        </tr>

        `;

    }

}

// ===============================
// Smart AI Insights
// ===============================

const insightList = document.getElementById("insightList");

if(insightList){

    insightList.innerHTML = "";

    if(trades.length==0){

        insightList.innerHTML="<li>No Trades Available.</li>";

    }

    else{

        if(totalProfit>0){

            insightList.innerHTML +=
            "<li>✅ Overall Trading is Profitable.</li>";

        }

        else{

            insightList.innerHTML +=
            "<li>⚠ Overall Trading is in Loss.</li>";

        }

        if(wins>losses){

            insightList.innerHTML +=
            "<li>🏆 Winning trades are higher than losing trades.</li>";

        }

        else{

            insightList.innerHTML +=
            "<li>📉 Improve your win rate.</li>";

        }

        if(bestTrade){

            insightList.innerHTML +=
            `<li>🔥 Best Trade : ${bestTrade.stock} (₹${bestTrade.pnl.toFixed(2)})</li>`;

        }

        if(worstTrade){

            insightList.innerHTML +=
            `<li>❄ Worst Trade : ${worstTrade.stock} (₹${worstTrade.pnl.toFixed(2)})</li>`;

        }

        insightList.innerHTML +=
        `<li>📊 Most Traded Stock : ${mostStock}</li>`;

        insightList.innerHTML +=
        `<li>🎯 Best Strategy : ${bestStrategy}</li>`;

        insightList.innerHTML +=
        `<li>😊 Most Used Emotion : ${topEmotion}</li>`;

        insightList.innerHTML +=
        `<li>🔥 Longest Winning Streak : ${winStreak}</li>`;

        insightList.innerHTML +=
        `<li>❄ Longest Losing Streak : ${lossStreak}</li>`;

    }

}

console.log("Analytics Loaded Successfully ✅");