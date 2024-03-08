(() => {
    const selectAllDays = document.getElementById('modal-instant-days-all');

    selectAllDays.addEventListener('change', (e) => {
        const days = document.querySelectorAll('.modal-instant-checkbox');
        if (e.currentTarget.checked) {
            days.forEach((day) => {
                if (day.id !== 'modal-instant-days-all') {
                    day.checked = false;
                    day.disabled = true;
                }
            });
        } else {
            days.forEach((day) => {
                day.disabled = false;
            });
        }
    });
})();
(() => {
    const selectAllDays = document.getElementById('modal-range-days-all');

    selectAllDays.addEventListener('change', (e) => {
        const days = document.querySelectorAll('.modal-range-checkbox');
        if (e.currentTarget.checked) {
            days.forEach((day) => {
                if (day.id !== 'modal-range-days-all') {
                    day.checked = true;
                    day.disabled = true;
                }
            });
        } else {
            days.forEach((day) => {
                day.checked = false;
                day.disabled = false;
            });
        }
    });
})();

document.addEventListener('DOMContentLoaded', function () {
    // Hide the link section by default
    var linksSection = document.getElementsByClassName('link-tab-section');
    if (linksSection) {
        for(var i = 0; i < linksSection.length; i++) {
            linksSection[i].style.display = 'none';
        }
    }
    var defaultButton = document.getElementById('media');
    if (defaultButton) {
        defaultButton.classList.add('active');
    }
});


var selectedValue = "media";

const timeSlotValues = (value) => {


    var showClassParam
    var hideClassParam
    if(value === 'media') {
        showClassParam = 'media-tab-section'
        hideClassParam = 'link-tab-section'
    } else {
        showClassParam = 'link-tab-section'
        hideClassParam = 'media-tab-section'
    }

    var sectionsToShow = document.getElementsByClassName(showClassParam);
    var sectionsToHide = document.getElementsByClassName(hideClassParam);

    var buttons = document.getElementsByClassName('tab-switch');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('active');
    }

    var activeButton = document.getElementById(value);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    for (var i = 0; i < sectionsToShow.length; i++) {
        sectionsToShow[i].style.display = 'block';
    }

    // Show the selected section
    if (sectionsToHide) {
        for (var i = 0; i < sectionsToHide.length; i++) {
            sectionsToHide[i].style.display = 'none';
        }
    }
    selectedValue = value;
}

const createInstantTimeslots = async () => {    
    const apiEndpoint = api.timesheet.instant;

    const allDays = document.getElementById('modal-instant-days-all');
    
    let checkedDays = [];

    if (allDays.checked) {
        checkedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    } else {
        const daysChecked = document.querySelectorAll('.modal-instant-checkbox:checked');

        for (let i = 0; i < daysChecked.length; i++) {
            const dayChecked = daysChecked[i];

            checkedDays.push(dayChecked.value);
        }
    }

    const time = document.getElementById('modal-instant-time').value;

    const timesheet = { days: checkedDays, time, type: selectedValue,  };
    const resp = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(timesheet),
    });
    const { success, error } = await resp.json();

    if (!success) return handleError('There was an error when creating the timeslots in the database.', error);

    if (success && error) return handleError('There was an error when creating the timeslots in the database.', error);

    window.location.href = '/timesheet';
};
function calculateTimeSlots(start, end, gap) {
    // Convert start and end time to Date objects
    var startTime = new Date("01/01/2024 " + start);
    var endTime = new Date("01/01/2024 " + end);

    // Calculate the duration in milliseconds
    var duration = endTime - startTime;

    // Convert gap to milliseconds
    var gapMilliseconds = gap * 60000; // 1 minute = 60000 milliseconds

    // Calculate the number of time slots
    var numberOfTimeSlots = Math.floor(duration / gapMilliseconds);

    return numberOfTimeSlots;
}
const detemineMaximumSlots = () => {
    const timeFrom = document.getElementById('modal-range-time-from').value;
    const timeTo = document.getElementById('modal-range-time-to').value;
    if(timeFrom && timeTo){
        const maximumSlots = calculateTimeSlots(timeFrom, timeTo, 5)    //5 mins gap 
        document.getElementById('modal-range-count').disabled = false;
        document.getElementById('modal-range-count').max = maximumSlots
        document.getElementById('modal-range-count-hidden').value = maximumSlots
        document.getElementById('maxNotice').style.display = 'block'
        document.getElementById('maxCount').textContent = maximumSlots
    }else{
        document.getElementById('modal-range-count').disabled = false;
        document.getElementById('modal-range-count-hidden').value = 999999999
        document.getElementById('maxNotice').style.display = 'none'
    }

}
document.getElementById("modal-range-time-from").addEventListener("change", detemineMaximumSlots);
document.getElementById("modal-range-time-to").addEventListener("change", detemineMaximumSlots);

const createInstantBulkTimeslots = async () => {    
    const apiEndpoint = api.timesheet.instantBulk;

    const allDays = document.getElementById('modal-range-days-all');
    
    let checkedDays = [];

    if (allDays.checked) {
        checkedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    } else {
        const daysChecked = document.querySelectorAll('.modal-range-checkbox:checked');

        for (let i = 0; i < daysChecked.length; i++) {
            const dayChecked = daysChecked[i];

            checkedDays.push(dayChecked.value);
        }
    }

    const timeFrom = document.getElementById('modal-range-time-from').value;
    const timeTo = document.getElementById('modal-range-time-to').value;

    const count = document.getElementById('modal-range-count').value;
    const timesheet = { days: checkedDays, timeFrom, timeTo, type: selectedValue, count: count };
    showLoadingAnimation();
    const resp = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(timesheet),
    });
    const { success, error } = await resp.json();
    hideLoadingAnimation();
    if (!success) return handleError('There was an error when creating the timeslots in the database.', error);

    if (success && error) return handleError('There was an error when creating the timeslots in the database.', error);

    window.location.href = '/timesheet';
};

const createTimeslot = async (route) => {
    const apiEndpoint = route === 'create' ? api.timesheet.create : api.timesheet.update;
    const idInput = document.getElementById('modal-update-id');
    const dayInput = document.getElementById(`modal-${route}-day`);
    const timeInput = document.getElementById(`modal-${route}-time`);
    const timeslot = {
        id: idInput.value,
        day: dayInput.value,
        time: timeInput.value,
        type : selectedValue
    };

    const resp = await fetch(apiEndpoint, {
        method: route === 'create' ? 'POST' : 'PUT',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(timeslot),
    });
    const { success, error } = await resp.json();

    if (!success) return handleError('There was an error when publishing the timeslot to the database.', error);

    window.location.href = '/timesheet';
};