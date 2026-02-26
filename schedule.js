const scheduleData = [
    { time: "9:30 AM", events: ["Videography/Photography"] },
    { time: "10:00 AM", events: ["IT Quiz"] },
    { time: "10:30 AM", events: ["Coding & Debugging"] },
    { time: "11:00 AM", events: ["IT Dumb Charades", "Logo Design"] },
    { time: "1:00 PM", events: ["Lunch"] },
    { time: "1:30 PM", events: ["BGMI"] },
    { time: "2:00 PM", events: ["FIFA"] }
];

function loadSchedule() {
    const tableBody = document.querySelector("#scheduleTable tbody");
    
    scheduleData.forEach(item => {
        const row = document.createElement("tr");
        
        // Time Cell
        const timeCell = document.createElement("td");
        timeCell.textContent = item.time;
        timeCell.style.fontWeight = "bold";
        
        // Events Cell
        const eventCell = document.createElement("td");
        item.events.forEach(evt => {
            const span = document.createElement("span");
            span.className = "event-tag";
            span.textContent = evt;
            eventCell.appendChild(span);
        });
        
        row.appendChild(timeCell);
        row.appendChild(eventCell);
        tableBody.appendChild(row);
    });
}

document.addEventListener("DOMContentLoaded", loadSchedule);