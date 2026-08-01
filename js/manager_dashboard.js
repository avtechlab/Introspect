document.addEventListener("DOMContentLoaded", function () {

    console.log("manager_dashboard.js loaded");

    initializePage();

    loadDashboard();

});



function initializePage() {

    const usernameElement =
        document.getElementById("usernameDisplay");

    if (usernameElement) {

        usernameElement.innerText =
            Session.getUsername();

    }

    const roleElement =
        document.getElementById("roleDisplay");

    if (roleElement) {

        roleElement.innerText =
            "Manager";

    }

    const logoutButton =
        document.getElementById("logoutBtn");

    if (logoutButton) {

        logoutButton.addEventListener(

            "click",

            function () {

                Session.logout();

            }

        );

    }

}



function loadDashboard() {

    loadStatistics();

    logDashboardVisit();

}



function loadStatistics() {

    const cards =
        document.querySelectorAll(".dashboard-card");

    if (cards.length < 3) {

        return;

    }

    cards[0].querySelector("p").innerText =
        "Total Reflections : " +
        Data.getTotalReflections();

    cards[1].querySelector("p").innerText =
        "Most Active Member : " +
        Data.getMostActiveMember();

    cards[2].querySelector("p").innerText =
        "Average Completion : " +
        Data.getAverageProfileCompletion() +
        "%";

}



function logDashboardVisit() {

    if (window.Activity) {

        Activity.log(

            "Manager Dashboard",

            "Dashboard Opened"

        );

    }

}