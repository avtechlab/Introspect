document.addEventListener("DOMContentLoaded", function () {

    // Display Username
    const usernameElement = document.getElementById("usernameDisplay");

    if (usernameElement) {
        usernameElement.textContent = Session.getUsername();
    }

    // Display Role
    const roleElement = document.getElementById("roleDisplay");

    if (roleElement) {
        roleElement.textContent = Session.getRole();
    }

    // Logout Button
    const logoutButton = document.getElementById("logoutBtn");

    if (logoutButton) {

        logoutButton.addEventListener("click", function () {

            Session.logout();

        });

    }

    console.log("progress.js loaded");

    loadStatistics();

});



function loadStatistics() {
    const username = Session.getUsername();

const historyObject = JSON.parse(
    localStorage.getItem("introspect_nivedan_history") || "{}"
);

const history = Object.values(historyObject);

const userEntries = history.filter(item => item.user === username);

    // Last 7 days
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 6);

    const weeklyEntries = userEntries.filter(item => {
        const d = new Date(item.date);
        return d >= weekAgo && d <= today;
    });

    // Bhaavferi count
    const bhaavferiDays = weeklyEntries.filter(item => item.bhaavferi === "yes").length;

    // Total Hours (Weekly)
    const weeklyHours = weeklyEntries.reduce((sum, item) => {
         return sum + Number(item.bhaavferiHours || 0);
    }, 0);

    // Reading count
    const readingDays = weeklyEntries.filter(item => item.reading === "yes").length;

    // Prayer count
    const prayerDays = weeklyEntries.filter(item => item.prayer === "yes").length;

    // Meeting count
    const meetingDays = weeklyEntries.filter(item => item.meeting === "yes").length;


    // Pravachan count
    const pravachanDays = weeklyEntries.filter(item => item.pravachan === "yes").length;

    // Kendra count
    const kendraDays = weeklyEntries.filter(item => item.kendra === "yes").length;

    // Vrati count
    const vratiDays = weeklyEntries.filter(item => item.vrati === "yes").length;

    // Update UI

const weeklyBhaavferi = document.getElementById("weekly-bhaavferi");
if (weeklyBhaavferi) {
    weeklyBhaavferi.textContent = bhaavferiDays;
}

const weeklyHoursElement = document.getElementById("weekly-hours");
if (weeklyHoursElement) {
    weeklyHoursElement.textContent =
        weeklyHours.toFixed(2) + " Hrs";
}

const weeklyReading = document.getElementById("weekly-reading");
if (weeklyReading) {
    weeklyReading.textContent = readingDays;
}

const weeklyPrayer = document.getElementById("weekly-prayer");
if (weeklyPrayer) {
    weeklyPrayer.textContent = prayerDays;
}

const weeklyMeeting = document.getElementById("weekly-meeting");
if (weeklyMeeting) {
    weeklyMeeting.textContent = meetingDays;
}

const weeklyPravachan = document.getElementById("weekly-pravachan");
if (weeklyPravachan) {
    weeklyPravachan.textContent = pravachanDays;
}

const weeklyKendra = document.getElementById("weekly-kendra");
if (weeklyKendra) {
    weeklyKendra.textContent = kendraDays;
}

const weeklyVrati = document.getElementById("weekly-vrati");
if (weeklyVrati) {
    weeklyVrati.textContent = vratiDays;
}

    // Temporary placeholders for next step
const commitmentHistory = JSON.parse(
    localStorage.getItem("introspect_nivedan_commitments") || "{}"
);

const commitments = Object.values(commitmentHistory);

const planned = commitments.length;

const completed = commitments.filter(item => {
    return new Date(item.date) < new Date();
}).length;

const remaining = planned - completed;

const sankalpPlanned = document.getElementById("sankalp-planned");
if (sankalpPlanned) {
    sankalpPlanned.textContent = planned;
}

const sankalpCompleted = document.getElementById("sankalp-completed");
if (sankalpCompleted) {
    sankalpCompleted.textContent = completed;
}

const sankalpRemaining = document.getElementById("sankalp-remaining");
if (sankalpRemaining) {
    sankalpRemaining.textContent = remaining;
}

    const totalHours = userEntries.reduce((sum, item) => {
    return sum + Number(item.bhaavferiHours || 0);
}, 0);

// Previous Week Hours
const previousWeekStart = new Date();
previousWeekStart.setDate(today.getDate() - 13);

const previousWeekEnd = new Date();
previousWeekEnd.setDate(today.getDate() - 7);

const previousWeekEntries = userEntries.filter(item => {
    const d = new Date(item.date);
    return d >= previousWeekStart && d <= previousWeekEnd;
});

const lastWeekHours = previousWeekEntries.reduce((sum, item) => {
    return sum + Number(item.bhaavferiHours || 0);
}, 0);

const thisWeekElement = document.getElementById("this-week");
if (thisWeekElement) {
    thisWeekElement.textContent =
        weeklyHours.toFixed(2) + " Hrs";
}

const lastWeekElement = document.getElementById("last-week");
if (lastWeekElement) {
    lastWeekElement.textContent =
        lastWeekHours.toFixed(2) + " Hrs";
}

let growth = 0;

if (lastWeekHours > 0) {
    growth =
        ((weeklyHours - lastWeekHours) / lastWeekHours) * 100;
}

const consistency = userEntries.length;

let message = "Let's begin today's Nivedan.";

if (weeklyHours >= 10) {
    message = "Excellent! Your regularity is inspiring.";
}
else if (weeklyHours >= 5) {
    message = "Very good! Keep moving forward.";
}
else if (weeklyHours > 0) {
    message = "Good start. Maintain your Sankalp.";
}

const growthElement = document.getElementById("growth-percent");
if (growthElement) {
    growthElement.textContent =
        growth.toFixed(0) + "%";
}

const consistencyElement = document.getElementById("consistency-weeks");
if (consistencyElement) {
    consistencyElement.textContent = consistency;
}

const motivationElement = document.getElementById("motivation-message");
if (motivationElement) {
    motivationElement.textContent = message;
}
}



function loadTotalReflections() {

    document.getElementById("totalReflections").innerText =
        Data.getReflectionCount();

}



function loadLatestReflection() {

    const latest = Data.getLatestReflection();

    if (!latest) {

        document.getElementById("latestReflection").innerText =
            "No Reflections";

        return;

    }

    document.getElementById("latestReflection").innerText =
        latest.date;

}



function loadProfileCompletion() {

    document.getElementById("profileCompletion").innerText =
        Data.getProfileCompletion() + "%";

}



function loadApplicationVersion() {

    const versionElement =
        document.getElementById("appVersion");

    if (versionElement) {

        versionElement.innerText = "v0.01";

    }

}