console.log("team_members.js loaded");

document.addEventListener("DOMContentLoaded", function () {

    loadPage();

});



function loadPage() {

    loadHeader();

    bindLogout();

    loadStatistics();

    loadMembers();

    bindSearch();

    Activity.log(
        "Team Members",
        "Opened Team Members Page"
    );

}



function loadHeader() {

    document.getElementById("usernameDisplay").innerText =
        Session.getUsername();

    document.getElementById("roleDisplay").innerText =
        Session.getRole();

}



function bindLogout() {

    const logoutButton =
        document.getElementById("logoutBtn");

    if (!logoutButton) {

        return;

    }

    logoutButton.addEventListener("click", function () {

        Activity.log(
            "Authentication",
            "Manager Logged Out"
        );

        Session.logout();

    });

}



function loadStatistics() {

    const reflections =
    Data.getAllReflections();

    const profiles =
    MemberStorage.getAll();

    document.getElementById("totalMembers").innerText =
        profiles.length;

    document.getElementById("activeMembers").innerText =
        profiles.length;

    document.getElementById("totalReflections").innerText =
        reflections.length;

    let completionTotal = 0;

    profiles.forEach(function (profile) {

        let completed = 0;

        if (profile.name) completed++;

        if (profile.email) completed++;

        if (profile.bio) completed++;

        if (profile.goals) completed++;

        completionTotal +=
            Math.round((completed / 4) * 100);

    });

    let average = 0;

    if (profiles.length > 0) {

        average =
            Math.round(
                completionTotal /
                profiles.length
            );

    }

    document.getElementById("averageCompletion").innerText =
        average + "%";

}



function loadMembers() {

    const body =
        document.getElementById("membersTableBody");

    body.innerHTML = "";

    const reflections =
        Data.getAllReflections();

    const profiles =
        MemberStorage.getAll();

    profiles.forEach(function (profile) {

        let completed = 0;

        if (profile.name) completed++;
        if (profile.age) completed++;
        if (profile.gender) completed++;
        if (profile.relationship) completed++;

        const completion =
            Math.round((completed / 4) * 100);

        const reflectionCount =
            reflections.filter(function (item) {

                return item.username ===
                    profile.username;

            }).length;

        body.innerHTML += `

<tr>

<td>${profile.systemId || profile.username}</td>

<td>${profile.name || "-"}</td>

<td>${reflectionCount}</td>

<td>${completion}%</td>

<td>${profile.status || "active"}</td>

</tr>

`;

    });

}



function bindSearch() {

    const search =
        document.getElementById("searchMember");

    if (!search) {

        return;

    }

    search.addEventListener("keyup", function () {

        const value =
            search.value.toLowerCase();

        const rows =
            document.querySelectorAll(
                "#membersTableBody tr"
            );

        rows.forEach(function (row) {

            const username =
                row.children[0]
                .innerText
                .toLowerCase();

            if (username.includes(value)) {

                row.style.display = "";

            }

            else {

                row.style.display = "none";

            }

        });

    });

}