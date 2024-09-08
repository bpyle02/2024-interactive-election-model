let totalElectoralVotes = 538

let trumpTotalVotes = 0
let trumpElectoralVotes = 0
let trumpTilt = 0
let trumpLean = 0
let trumpLikely = 0
let trumpSafe = 0

let harrisTotalVotes = 0
let harrisElectoralVotes = 0
let harrisTilt = 0
let harrisLean = 0
let harrisLikely = 0
let harrisSafe = 0

const sheetName = encodeURIComponent("Sheet1")
const sheetId = '17tVILGOy5Nk0l4MvxnC1r7vSzAnnBlvSfXQylnVORes'; // Replace with your spreadsheet ID
const sheetURL = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`; // Replace with your sheet name
const sheetName2 = encodeURIComponent("Sheet2")
const sheetURL2 = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName2}`; // Replace with your sheet name

model_data = {}
timeline_data = {}

fetch(sheetURL2)
    .then(response => response.text())
    .then(data => handleTimelineResponse(data))
    .catch(error => console.error('Error:', error));

function handleTimelineResponse(data) {
    timeline_data = csvToObject(data);
    chartIt(getChartData(timeline_data['National']))
}

fetch(sheetURL)
.then(response => response.text())
.then(data => handleResponse(data))
.catch(error => console.error('Error:', error));


function handleResponse(data) {
    let sheetObjects = csvToObject(data);
    
    for (i in sheetObjects) {
        // console.log(sheetObjects[i])
        model_data[sheetObjects[i]['"State"']] = {
            "state_abbreviation": sheetObjects[i]['"State Abbreviation"'],
            "electoral_votes": parseInt(sheetObjects[i]['"Electoral Votes"']),
            "expected_turnout": parseInt(sheetObjects[i]['"2024 Expected Turnout"']),
            "r_percent": parseFloat(sheetObjects[i]['"R %"']),
            "d_percent": parseFloat(sheetObjects[i]['"D %"']),
            "3rd_percent": parseFloat(sheetObjects[i]['"3rd Party %"'])
        }
        
        // console.log(model_data[i])
    }
    
    colorStates(model_data)
}

// Function to color the states and add hover effect
function colorStates(data) {
    // Create a popup div
    const popup = document.createElement('div');
    popup.id = 'state-popup';
    popup.style.position = 'absolute';
    popup.style.width = '18rem';
    popup.style.padding = '10px';
    popup.style.backgroundColor = '#2c3f4f';
    popup.style.color = '#e0e0e0';
    popup.style.boxShadow = '5px 5px 5px rgb(255 255 255 / 20%)'
    popup.style.borderRadius = '7.5px';
    popup.style.display = 'none'; // Initially hidden
    popup.style.pointerEvents = 'none'; // Make sure it doesn't interfere with mouse events
    document.body.appendChild(popup);
    

    // Loop through each state in the data
    for (const [state, info] of Object.entries(data)) {
        const statePath = document.getElementById(info.state_abbreviation + "_Path");
        const statePathRect = document.getElementById(info.state_abbreviation + "_Path_Rect");
        const stateLink = document.getElementById(info.state_abbreviation + "_Link");
        
        margin = info.r_percent - info.d_percent;
        harrisTotalVotes += info.expected_turnout * info.d_percent
        trumpTotalVotes += info.expected_turnout * info.r_percent
        
        // Apply color based on winner
        if (margin < 0) {
            statePath.classList.add(calculateStateRating(margin, info.electoral_votes) + 'democrat');
            
            if (statePathRect) {
                statePathRect.classList.add(calculateStateRating(margin, 0) + 'democrat');
            }

            harrisElectoralVotes += info.electoral_votes
        } else if (margin > 0) {
            statePath.classList.add(calculateStateRating(margin, info.electoral_votes) + 'republican');

            if (statePathRect) {
                statePathRect.classList.add(calculateStateRating(margin, 0) + 'republican');
            }

            trumpElectoralVotes += info.electoral_votes
        } else {
            statePath.classList.add('tossup');

            if (statePathRect) {
                statePathRect.classList.add('tossup');
            }
        }

        requestAnimationFrame(() => {

            chartHeaderText = document.getElementById('graph-title');

            headerArea = document.getElementById('header-wrapper');
            headerArea.addEventListener("click", () => {
                chartHeaderText.textContent = 'National Advanced Polling Average Graph'
                chartIt(getChartData(timeline_data['National']));
            });

            stateLink.addEventListener("click", () => {
                chartHeaderText.textContent = state + ' Advanced Polling Average Graph'
                chartIt(getChartData(timeline_data[state]));
                getStateData(state, info.electoral_votes, info.expected_turnout, info.r_percent, info.d_percent);
            });

            harrisSafePct = harrisSafe / harrisElectoralVotes * 100
            harrisLikelyPct = harrisLikely / harrisElectoralVotes * 100
            harrisLeanPct = harrisLean / harrisElectoralVotes * 100
            harrisTiltPct = harrisTilt / harrisElectoralVotes * 100
            trumpSafePct = trumpSafe / trumpElectoralVotes * 100
            trumpLikelyPct = trumpLikely / trumpElectoralVotes * 100
            trumpLeanPct = trumpLean / trumpElectoralVotes * 100
            trumpTiltPct = trumpTilt / trumpElectoralVotes * 100

            // Update bar widths and text
            document.getElementById('trumpBar').style.width = (trumpElectoralVotes / totalElectoralVotes) * 100 + '%';
            document.getElementById('trumpEV').style.width = (trumpElectoralVotes / totalElectoralVotes) * 100 + '%';

            document.getElementById('trumpTilt').style.width = trumpTiltPct + '%';
            document.getElementById('trumpLean').style.width = trumpLeanPct + '%';
            document.getElementById('trumpLikely').style.width = trumpLikelyPct + '%';
            document.getElementById('trumpSafe').style.width = trumpSafePct + '%';

            if (trumpTilt > 0) {
                document.getElementById('trumpTilt').textContent = trumpTilt;
                document.getElementById('harrisTilt').style.zIndex = 50;
            }

            if (trumpLean > 0) {
                document.getElementById('trumpLean').textContent = trumpLean;
                document.getElementById('harrisLean').style.zIndex = 50;
            }

            if (trumpLikely > 0) {
                document.getElementById('trumpLikely').textContent = trumpLikely;
                document.getElementById('trumpLikely').style.zIndex = 50;
            }

            if (trumpSafe > 0) {
                document.getElementById('trumpSafe').textContent = trumpSafe;
                document.getElementById('trumpSafe').style.zIndex = 50;
            }

            document.getElementById('harrisBar').style.width = (harrisElectoralVotes / totalElectoralVotes) * 100 + '%';
            document.getElementById('harrisEV').style.width = (harrisElectoralVotes / totalElectoralVotes) * 100 + '%';

            document.getElementById('harrisTilt').style.width = harrisTiltPct + '%';
            document.getElementById('harrisLean').style.width = harrisLeanPct + '%';
            document.getElementById('harrisLikely').style.width = harrisLikelyPct + '%';
            document.getElementById('harrisSafe').style.width = harrisSafePct + '%';

            if (harrisTilt > 0) {
                document.getElementById('harrisTilt').textContent = harrisTilt;
                document.getElementById('harrisTilt').style.zIndex = 60;
            }

            if (harrisLean > 0) {
                document.getElementById('harrisLean').textContent = harrisLean;
                document.getElementById('harrisLean').style.zIndex = 50;
            }

            if (harrisLikely > 0) {
                document.getElementById('harrisLikely').textContent = harrisLikely;
                document.getElementById('harrisLikely').style.zIndex = 50;
            }

            if (harrisSafe > 0) {
                document.getElementById('harrisSafe').textContent = harrisSafe;
                document.getElementById('harrisSafe').style.zIndex = 50;
            }

            document.getElementById('trumpElectoralVotes').textContent = trumpElectoralVotes + " ";
            document.getElementById('harrisElectoralVotes').textContent = harrisElectoralVotes + " ";

            document.getElementById("trump-vote-totals").innerHTML = `
                <span class="trump-odds">${(trumpTotalVotes / (trumpTotalVotes + harrisTotalVotes) * 100).toFixed(0) + "%"}</span>
            `

            if (window.innerWidth < 900) {
                document.getElementById("harris-section").innerHTML = `
                    <div class='harris-profile'>
                        <img src="https://raw.githubusercontent.com/bpyle02/2024-interactive-election-model/main/images/harris-square.png" />
                        <span class="harris-header-text">Harris</span>
                    </div>
                    <div id="harris-vote-totals">
                        <span clss="harris-odds">${(harrisTotalVotes / (trumpTotalVotes + harrisTotalVotes) * 100).toFixed(0) + "%"}</span>
                    </div>
                `
            }
            else {
                document.getElementById("harris-section").innerHTML = `
                    <div id="harris-vote-totals">
                        <span="harris-odds">${(harrisTotalVotes / (trumpTotalVotes + harrisTotalVotes) * 100).toFixed(0) + "%"}</span>
                    </div>
                    <div class='harris-profile'>
                        <img src="https://raw.githubusercontent.com/bpyle02/2024-interactive-election-model/main/images/harris-square.png" />
                        <span class="harris-header-text">Harris</span>
                    </div>
                `
            }

            // Add hover event to show popup
            stateLink.addEventListener('mouseenter', (event) => {

                console.log(info.r_percent);

                const popupHTML = `
                    <div class='popup-wrapper'>
                        <div class='popup-header'>
                            <h2>${state} - ${info.electoral_votes} EV</h2>
                        </div>
                        <div class='trump ${calculateStateRating(info.final_margin, info.electoral_votes)}republican' style='width:${info.r_percent}%;'>
                            <p style='white-space: nowrap'>Trump ${(info.r_percent).toFixed(2)}%</p>
                        </div>
                        <div class='harris ${calculateStateRating(info.final_margin, info.electoral_votes)}democrat' style='width:${info.d_percent}%;'>
                            <p style='white-space: nowrap'>Harris ${(info.d_percent).toFixed(2)}%</p>
                        </div>
                    </div>
                `;

                popup.innerHTML = popupHTML;
                popup.style.display = 'block';
                updatePopupPosition(event, popup)
            });

            // Add event to update popup position as the mouse moves
            statePath.addEventListener('mousemove', (event) => {
                updatePopupPosition(event, popup)
            });

            // Add event to hide popup when mouse leaves the state
            statePath.addEventListener('mouseleave', () => {
                popup.style.display = 'none';
            });
        });
    }
}

// Function to update popup position
function updatePopupPosition(event, popup) {
    if (event.pageX > (window.innerWidth * 0.70)) {
        // Position popup to the left of the mouse
        popup.style.left = event.pageX - popup.offsetWidth - 10 + 'px';
    } else {
        // Position popup to the right of the mouse
        popup.style.left = event.pageX + 10 + 'px';
    }
    popup.style.top = event.pageY + 10 + 'px';
}

// Function to calculate state rating based on margin
function calculateStateRating(margin, electoral_votes) {
    winner = "trump"
    
    if (margin < 0) {
        winner = "harris"
    }
    
    if (margin < 0) {
        margin *= -1
    }

    if (margin < 15 && margin >= 5) {

        if (winner == "trump") {
            trumpLikely += electoral_votes
        } else {
            harrisLikely += electoral_votes
        }

        return "likely_";
    } else if (margin < 5 && margin >= 1) {

        if (winner == "trump") {
            trumpLean += electoral_votes
        } else {
            harrisLean += electoral_votes
        }

        return "leans_";
    } else if (margin < 1) {

        if (winner == "trump") {
            trumpTilt += electoral_votes
        } else {
            harrisTilt += electoral_votes
        }

        return "tilt_";
    } else {

        if (winner == "trump") {
            trumpSafe += electoral_votes
        } else {
            harrisSafe += electoral_votes
        }

        return "safe_";
    }
}

function getStateData(state, electoral_votes, expected_turnout, r_percent, d_percent) {
    popup = document.getElementById("state-data-inner");

    const popupHTML = `
        <h1>${state} - ${electoral_votes} Electoral Votes</h1>
        <h3>Expected Turnout: ${Math.round(expected_turnout).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h3>
        <p>Trump Votes: ${Math.round(expected_turnout * r_percent / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
        <p>Harris Votes: ${Math.round(expected_turnout * d_percent / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
    `;

    popup.innerHTML = popupHTML;
}

function csvToObject(csv) {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');

    const result = {};

    for (let i = 1; i < lines.length; i++) {
        const currentLine = lines[i].split(',');
        const stateData = {};

        for (let j = 0; j < headers.length; j++) {
            const header = headers[j].trim();
            const value = currentLine[j].trim();

            isNumber = false

            tempValue = value

            tempValue = tempValue.replace(/"/g, '')
            tempValue = tempValue.replace(/\\/g, '')

            if (value.includes("%")) {
                tempValue = tempValue.replace("%", "")
                isNumber = true
            }

            if (value.includes(",")) {
                tempValue = tempValue.replace(",", "")
                isNumber = true
            }

            if (value.includes(".")) {
                tempValue = parseFloat(tempValue.replace(".", "")) / 100
                isNumber = true
            }

            stateData[header] = tempValue;
        }

        // Use the first column as the key for the state
        result[stateData[headers[0]]] = stateData;
    }

    return result;
}

function isCanvasBlank(canvas) {
    return !canvas.getContext('2d')
        .getImageData(0, 0, canvas.width, canvas.height).data
        .some(channel => channel !== 0);
}

function getChartData(data) {
    normalized_data = []

    for (const [key, value] of Object.entries(data)) {
        if (value != '' && key != '"Averages"') {
            normalized_data.push({x: key.replace(/"/g, ''), y: value})
        }
    }

    return normalized_data;
}

function chartIt(data) {
    console.log(data)

    trump_averages = []
    harris_averages = []
    dates = []

    for (const [key, value] of Object.entries(data)) {
        trump_averages.push({x: value.x, y: (50 + (value.y / 2))});
        harris_averages.push({x: value.x, y: (50 - (value.y / 2))});
        console.log(value.x)
        dates.push(value.x)
    }

    let myChart = document.getElementById('election-timeline-data');
    const ctx = myChart.getContext('2d');

    if (myChart.chart_instance) {
        if (!isCanvasBlank(myChart)) {
            myChart.chart_instance.data.datasets[0].data = trump_averages;
            myChart.chart_instance.data.datasets[1].data = harris_averages;
            myChart.chart_instance.update();
        }
    } else {
        myChart.chart_instance = new Chart(ctx, {
            type: 'line',
            data: {
            labels: dates,
            datasets: [{
                    label: 'Trump',
                    data: trump_averages,
                    fill: false,
                    borderColor: '#981f1f',
                    tension: 0.1
                },
                {
                    label: 'Harris',
                    data: harris_averages,
                    fill: false,
                    borderColor: '#1f4aa8',
                    tension: 0.1
                }]
            },
            options: {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        },
                        grid: {
                            color: '#a0a0a0' // Change x-axis gridline color
                        },
                        ticks: {
                            color: '#e0e0e0', // X-axis label color
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: '% Popular Vote'
                        },
                        grid: {
                            color: '#a0a0a0' // Change y-axis gridline color
                        },
                        ticks: {
                            color: '#e0e0e0' // Y-axis label color
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#e0e0e0' // Change the color of legend text
                        }
                    },
                    tooltip: {
                        bodyColor: '#e0e0e0', // Change the color of tooltip text
                        titleColor: '#e0e0e0' // Change the color of tooltip title
                    }
                }
            }
        });
    }

    
}

addEventListener("resize", () => {
    if (window.innerWidth < 900) {
        document.getElementById("harris-section").innerHTML = `
            <div class='harris-profile'>
                <img src="https://raw.githubusercontent.com/bpyle02/2024-interactive-election-model/main/images/harris-square.png" />
                <span class="harris-header-text">Harris</span>
            </div>
            <div id="harris-vote-totals">
                <span class="harris-odds">${(harrisTotalVotes / (trumpTotalVotes + harrisTotalVotes) * 100).toFixed(0) + "%"}</span>
            </div>
        `
    }
    else {
        document.getElementById("harris-section").innerHTML = `
            <div id="harris-vote-totals">
                <span class="harris-odds">${(harrisTotalVotes / (trumpTotalVotes + harrisTotalVotes) * 100).toFixed(0) + "%"}</span>
            </div>
            <div class='harris-profile'>
                <img src="https://raw.githubusercontent.com/bpyle02/2024-interactive-election-model/main/images/harris-square.png" />
                <span class="harris-header-text">Harris</span>
            </div>
        `
    }
})