let totalElectoralVotes = 538
let trumpElectoralVotes = 0
let harrisElectoralVotes = 0
let trumpTotalVotes = 0
let harrisTotalVotes = 0

const sheetName = encodeURIComponent("Sheet1")
const sheetId = '17tVILGOy5Nk0l4MvxnC1r7vSzAnnBlvSfXQylnVORes'; // Replace with your spreadsheet ID
const sheetURL = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`; // Replace with your sheet name

model_data = {}

fetch(sheetURL)
    .then(response => response.text())
    .then(data => handleResponse(data))
    .catch(error => console.error('Error:', error));

function handleResponse(data) {
    let sheetObjects = csvToObject(data);

    for (i in sheetObjects) {
        console.log(sheetObjects[i])
        model_data[sheetObjects[i]['"State"']] = {
            "state_abbreviation": sheetObjects[i]['"State Abbreviation"'],
            "electoral_votes": parseInt(sheetObjects[i]['"Electoral Votes"']),
            "expected_turnout": parseInt(sheetObjects[i]['"2024 Expected Turnout"']),
            "r_percent": parseFloat(sheetObjects[i]['"R %"']),
            "d_percent": parseFloat(sheetObjects[i]['"D %"']),
            "3rd_percent": parseFloat(sheetObjects[i]['"3rd Party %"'])
        }

        console.log(model_data[i])
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
    popup.style.backgroundColor = 'white';
    popup.style.boxShadow = '5px 5px 5px rgb(0 0 0 / 20%)'
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

        console.log(info.d_percent)

        // Apply color based on winner
        if (margin < 0) {
            margin *= -1;
            statePath.classList.add(calculateStateRating(margin) + 'democrat');

            if (statePathRect) {
                statePathRect.classList.add(calculateStateRating(margin) + 'democrat');
            }

            harrisElectoralVotes += info.electoral_votes
        } else if (margin > 0) {
            statePath.classList.add(calculateStateRating(margin) + 'republican');

            if (statePathRect) {
                statePathRect.classList.add(calculateStateRating(margin) + 'republican');
            }

            trumpElectoralVotes += info.electoral_votes
        } else {
            statePath.classList.add('tossup');

            if (statePathRect) {
                statePathRect.classList.add(calculateStateRating(margin) + 'tossup');
            }
        }

        requestAnimationFrame(() => {
            stateLink.addEventListener("click", () => {
                getStateData(state, info.electoral_votes, info.expected_turnout, info.r_percent, info.d_percent);
            });

            let trumpPercentage = (trumpElectoralVotes / totalElectoralVotes) * 100;
            let harrisPercentage = (harrisElectoralVotes / totalElectoralVotes) * 100;

            // Update bar widths and text
            document.getElementById('trumpBar').style.width = trumpPercentage + '%';
            document.getElementById('harrisBar').style.width = harrisPercentage + '%';

            document.getElementById('trumpElectoralVotes').textContent = trumpElectoralVotes + " ";
            document.getElementById('harrisElectoralVotes').textContent = harrisElectoralVotes + " ";

            console.log(trumpTotalVotes)

            document.getElementById("trump-vote-totals").innerHTML = `
                <h1>Trump</h1><br />
                <h4 id="harrisTotalVotes">${Math.round(trumpTotalVotes/100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}&nbsp;</h4>
                <h4>(${(trumpTotalVotes / (trumpTotalVotes + harrisTotalVotes) * 100).toFixed(2) + "%)"}</h4>
            `
            document.getElementById("harris-vote-totals").innerHTML = `
                <h1>Harris</h1><br />
                <h4 id="harrisTotalVotes">&nbsp;${Math.round(harrisTotalVotes/100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h4>
                <h4>(${(harrisTotalVotes / (trumpTotalVotes + harrisTotalVotes) * 100).toFixed(2) + "%) "}</h4>
            `

            // Add hover event to show popup
            stateLink.addEventListener('mouseenter', (event) => {
                const popupHTML = `
                    <div class='popup-wrapper'>
                        <div class='popup-header'>
                            <h2>${state} - ${info.electoral_votes} EV</h2>
                        </div>
                        <div class='trump' style='width:${info.r_percent}%;'>
                            <p>${(info.r_percent).toFixed(2)}%</p>
                            <p>Trump</p>
                        </div>
                        <div class='harris' style='width:${info.d_percent}%;'>
                            <p>${(info.d_percent).toFixed(2)}%</p>
                            <p>Harris</p>
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
function calculateStateRating(margin) {
    if (margin < .12 && margin >= .08) {
        return "likely_";
    } else if (margin < .08 && margin >= .03) {
        return "leans_";
    } else if (margin < .03) {
        return "tilt_";
    } else {
        return "safe_";
    }
}

function getStateData(state, electoral_votes, expected_turnout, r_percent, d_percent) {
    popup = document.getElementById("state-data-inner");

    const popupHTML = `
        <h1>${state} - ${electoral_votes} Electoral Votes</h1>
        <h3>Expected Turnout: ${Math.round(expected_turnout).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h3>
        <p>Trump Votes: ${Math.round(expected_turnout * r_percent).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
        <p>Harris Votes: ${Math.round(expected_turnout * d_percent).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
    `;

    popup.innerHTML = popupHTML;
}

function csvToObject(csv) {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');

    console.log(headers)
    console.log(lines)
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
                console.log(tempValue)
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
