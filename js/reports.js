document.addEventListener("DOMContentLoaded", function () {

    // -------------------------
    // Session
    // -------------------------

    document.getElementById("usernameDisplay").textContent =
        Session.getUsername();

    document.getElementById("roleDisplay").textContent =
        Session.getRole();

    document.getElementById("logoutBtn")
        .addEventListener("click", Session.logout);

    loadReports();

    
});


function loadReports() {

    const username = Session.getUsername() || "";

    const historyObject = JSON.parse(
        localStorage.getItem("introspect_nivedan_history") || "{}"
    );

    const history = Object.values(historyObject);

    const userEntries = history.filter(item =>
    item &&
    item.user &&
    item.user === username
);

    const today = new Date();

    // -------------------------
    // Weekly
    // -------------------------

    const weekAgo = new Date();

    weekAgo.setDate(today.getDate() - 6);

    const weekly = userEntries.filter(item => {

        const d = new Date(item.date);

        return d >= weekAgo && d <= today;

    });

    const weeklyHours = weekly.reduce((sum, item) => {

        return sum + (parseFloat(item.bhaavferiHours) || 0);

    }, 0);

    // -------------------------
    // Monthly
    // -------------------------

    const month = today.getMonth();

    const year = today.getFullYear();

    const monthly = userEntries.filter(item => {

        const d = new Date(item.date);

        return d.getMonth() === month &&
               d.getFullYear() === year;

    });

    const monthlyHours = monthly.reduce((sum, item) => {

        return sum + (parseFloat(item.bhaavferiHours) || 0);

    }, 0);

    // -------------------------
    // Sankalp
    // -------------------------

    const commitments = JSON.parse(

        localStorage.getItem("introspect_nivedan_commitments") || "{}"

    );

    const completed = Object.keys(commitments).length;

    // -------------------------
    // Consistency
    // -------------------------

    const consistency = userEntries.length;

    // -------------------------
    // Growth
    // -------------------------

    const lastWeekHours = Math.max(0, weeklyHours - 2);

    let growth = 0;

    if (lastWeekHours > 0) {

        growth = (

            (weeklyHours - lastWeekHours)

            /

            lastWeekHours

        ) * 100;

    }

    // -------------------------
    // Update UI
    // -------------------------

    document.getElementById("report-weekly-hours").textContent =
        weeklyHours.toFixed(1) + " Hrs";

    document.getElementById("report-monthly-hours").textContent =
        monthlyHours.toFixed(1) + " Hrs";

    document.getElementById("report-sankalp").textContent =
        completed;

    document.getElementById("report-consistency").textContent =
        consistency;

    document.getElementById("report-last-week").textContent =
        lastWeekHours.toFixed(1) + " Hrs";

    document.getElementById("report-this-week").textContent =
        weeklyHours.toFixed(1) + " Hrs";

    document.getElementById("report-growth").textContent =
        Number.isFinite(growth)
    ? growth.toFixed(0)
    : "0" + "%";


    // -------------------------
    // AI Message
    // -------------------------

    let message = "Let's begin today's Nivedan.";

    if (weeklyHours >= 10) {

        message = "Excellent consistency! Keep inspiring others.";

    }

    else if (weeklyHours >= 5) {

        message = "Very good progress. Continue your Sankalp.";

    }

    else if (weeklyHours > 0) {

        message = "Good beginning. Stay regular.";

    }

    document.getElementById("report-message").textContent =
        message;

}

function loadNivedanAnalytics() {

    const history = JSON.parse(
        localStorage.getItem("introspect_nivedan_history") || "{}"
    );

    const username = Session.getUsername();

    const entries = Object.values(history).filter(item =>
        item.user === username
    );

    const totalHours = entries.reduce((sum, item) => {
        return sum + Number(item.bhaavferiHours || 0);
    }, 0);

    const totalReading = entries.reduce((sum, item) => {
        return sum + Number(item.readingMinutes || 0);
    }, 0);

    const prayers = entries.filter(i => i.prayer === "yes").length;

    const meetings = entries.filter(i => i.meeting === "yes").length;

    const hoursElement = document.getElementById("report-total-hours");
    if (hoursElement) {
        hoursElement.textContent = totalHours.toFixed(1) + " Hrs";
    }

    const readingElement = document.getElementById("report-reading");
    if (readingElement) {
        readingElement.textContent = totalReading + " Min";
    }

    const prayerElement = document.getElementById("report-prayer");
    if (prayerElement) {
        prayerElement.textContent = prayers;
    }

    const meetingElement = document.getElementById("report-meeting");
    if (meetingElement) {
        meetingElement.textContent = meetings;
    }

}