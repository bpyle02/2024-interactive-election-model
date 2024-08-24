let totalElectoralVotes = 538
let trumpElectoralVotes = 10
let harrisElectoralVotes = 0

// Function to color the states and add hover effect
function colorStates(data) {

    // Create a popup div
    const popup = document.createElement('div');
    popup.id = 'state-popup';
    popup.style.position = 'absolute';
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
            let trumpPercentage = (trumpElectoralVotes / totalElectoralVotes) * 100;
            let harrisPercentage = (harrisElectoralVotes / totalElectoralVotes) * 100;
    
            // Update bar widths and text
            document.getElementById('trumpBar').style.width = trumpPercentage + '%';
            document.getElementById('harrisBar').style.width = harrisPercentage + '%';
    
            document.getElementById('trumpVotes').textContent = trumpElectoralVotes + " ";
            document.getElementById('harrisVotes').textContent = harrisElectoralVotes + " ";

            // Add hover event to show popup
            stateLink.addEventListener('mouseenter', (event) => {
                const popupHTML = `
                    <div class='popup-wrapper'>
                        <div class='popup-header'>
                            <p>${info.electoral_votes} Electoral Votes</p>
                        </div>
                        <div class='trump' style='width:${info.r_percent * 100}%;'>
                            <p>${(info.r_percent * 100).toFixed(2)}%</p>
                            <p>Trump</p>
                        </div>
                        <div class='harris' style='width:${info.d_percent * 100}%;'>
                            <p>${(info.d_percent * 100).toFixed(2)}%</p>
                            <p>Harris</p>
                        </div>
                    </div>
                `;

                popup.innerHTML = popupHTML;
                popup.style.display = 'block';
                popup.style.left = event.pageX + 10 + 'px';
                popup.style.top = event.pageY + 10 + 'px';
            });

            // Add event to update popup position as the mouse moves
            statePath.addEventListener('mousemove', (event) => {
                popup.style.left = event.pageX + 10 + 'px';
                popup.style.top = event.pageY + 10 + 'px';
            });

            // Add event to hide popup when mouse leaves the state
            statePath.addEventListener('mouseleave', () => {
                popup.style.display = 'none';
            });
        });
    }
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

fetch('/api/data')
    .then(response => response.json())
    .then(data => {
        colorStates(data);  // Call the function to color states and add hover
    })
    .catch(error => console.error('Error fetching data:', error));
