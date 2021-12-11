$(document).ready(function() {
    $.ajaxSetup({
        cache: false
    });
});

/**
 * Initialize Result Table
 */
function createTeam(teamId) {
    let teamData = document.createElement('tr');
    teamData.setAttribute('data-team', teamId);

    let teamDataNumberElement = document.createElement('td');
    teamDataNumberElement.innerText = teamId;
    teamData.appendChild(teamDataNumberElement);

    for (let i = 0; i < 7; i += 1) {
        teamData.appendChild(document.createElement('td'));
    }

    return teamData;
}

async function updateTeams(data) {
    let indexes = {
        1: 'best',
        2: 'r1',
        3: 'r2',
        4: 'r3',
        5: 'r4',
        6: 'r5',
        7: 'rank'
    };

    Object.keys(data['teams']).forEach(teamId => {
        let children = $('tr[data-team=' + teamId + ']').first().children();
        for (let index = 1; index < 8; index += 1) {
            children[index].innerText = data['teams'][teamId][indexes[index]];
        }
    });
}

function formatTime(number) {
    return number.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false
    });
}

async function updateTime(timeData) {
    let remaining = parseInt(timeData['endTime']) - Math.round(Date.now() / 1000);
    let element = document.getElementById('time-remaining');

    if (remaining <= 0) {
        element.innerText = "00:00";
    } else {
        let seconds = (remaining) % 60;
        let minutes = ((remaining - seconds) % 3600) / 60;
        let hours = (remaining - seconds - minutes * 60) / 3600;

        let hoursFormatted = formatTime(hours);
        let secondsFormatted = formatTime(seconds);
        let minutesFormatted = formatTime(minutes);

        element.innerText = (hours > 0 ? hoursFormatted + ':' : '') + minutesFormatted + ':' + secondsFormatted;
    }
}

function createUpNextItem(text) {
    let newItem = document.createElement('div');
    newItem.classList.add('up-next-item');
    newItem.innerText = text;
    return newItem;
}

async function updateUpNext(upNextData) {
    let itemList = document.getElementById('up-next-list');
    let editId = itemList.getAttribute('data-last-edit-id');

    if (parseInt(editId) !== editId['editNumber']) {
        // Delete Existing Up Next Entries
        while (itemList.firstChild) {
            itemList.removeChild(itemList.firstChild);
        }

        // Update Last Edit ID
        itemList.setAttribute('data-last-edit-id', upNextData['editNumber']);

        // Add new Up Next
        upNextData['items'].forEach(item => {
            itemList.appendChild(createUpNextItem(item));
        });
    }
}

$('#endpoint-url').keypress(function(e){ return e.which !== 13; });

let endpointUrlElement = document.getElementById('endpoint-url');
let endpointUpdateButton = document.getElementById('endpoint-update-button');

let latestTimerData = {
    "endTime": 0
};
endpointUpdateButton.addEventListener('click', () => {
    const serviceUrl = endpointUrlElement.innerText;
    let rankingData = document.getElementById('ranking-data');

    $('#endpoint').remove();

    $.getJSON(serviceUrl, function(data) {
        Object.keys(data['teams']).forEach(teamId => {
            rankingData.appendChild(createTeam(teamId));
        });
    });

    /**
     * Data Update Service
     */
    setInterval(function () {
        updateTime(latestTimerData);
    }, 1000);

    setInterval(function () {
        $.ajax({
            cache: false,
            url: serviceUrl,
            dataType: 'json',
            "crossDomain": true,
            "headers": {
                "accept": "application/json",
                "Access-Control-Allow-Origin":"*"
            },
            success: function(data) {
                latestTimerData['endTime'] = data['timer']['endTime'];
                updateTeams(data);
                updateUpNext(data['upNext']);
            }
        });
    },1000);
});
