window.Data = {

    getCurrentUser: function () {

        return Session.getUsername() || "User";

    },



    getUserProfile: function () {

        const key =
            "introspect_profile_" +
            this.getCurrentUser();

        const profile =
            localStorage.getItem(key);

        return profile
            ? JSON.parse(profile)
            : null;

    },



    getUserReflections: function () {

        const reflections =
            JSON.parse(
                localStorage.getItem(
                    "introspect_reflections"
                )
            ) || [];

        return reflections.filter(

            item =>

            item.username ===
            this.getCurrentUser()

        );

    },



    getReflectionCount: function () {

        return this.getUserReflections().length;

    },



    getLatestReflection: function () {

        const reflections =
            this.getUserReflections();

        if (reflections.length === 0) {

            return null;

        }

        return reflections[
            reflections.length - 1
        ];

    },



    getProfileCompletion: function () {

        const profile =
            this.getUserProfile();

        if (!profile) {

            return 0;

        }

        const fields = [

            profile.name,
            profile.email,
            profile.bio,
            profile.goals

        ];

        let completed = 0;

        fields.forEach(function (field) {

            if (

                field &&

                field.trim() !== ""

            ) {

                completed++;

            }

        });

        return Math.round(

            (completed / fields.length) * 100

        );

    },



    // ===========================
    // TEAM FUNCTIONS
    // ===========================

    getAllReflections: function () {

        return JSON.parse(

            localStorage.getItem(
                "introspect_reflections"
            )

        ) || [];

    },



    getAllProfiles: function () {

    if (
        typeof MemberStorage !== "undefined" &&
        MemberStorage.getAll
    ) {

        return MemberStorage.getAll();

    }

    return [];

},


    getTotalMembers: function () {

    if (
        typeof MemberStorage !== "undefined" &&
        MemberStorage.getAll
    ) {

        return MemberStorage.getAll().length;

    }

    return 0;

},



    getTotalReflections: function () {

        return this.getAllReflections().length;

    },



    getAverageProfileCompletion: function () {

    const profiles =
        this.getAllProfiles();

    if (profiles.length === 0) {

        return 0;

    }

    let total = 0;

    profiles.forEach(function (profile) {

        let completed = 0;

        if (profile.name) completed++;
        if (profile.age) completed++;
        if (profile.gender) completed++;
        if (profile.relationship) completed++;

        total +=
            Math.round((completed / 4) * 100);

    });

    return Math.round(

        total / profiles.length

    );

},



    getMostActiveMember: function () {

    const reflections =
        this.getAllReflections();

    if (reflections.length === 0) {

        return "--";

    }

    const counter = {};

    reflections.forEach(function (item) {

        if (!counter[item.username]) {

            counter[item.username] = 0;

        }

        counter[item.username]++;

    });

    let winner = "--";
    let highest = 0;

    for (let username in counter) {

        if (counter[username] > highest) {

            highest = counter[username];

            winner = username;

        }

    }

    const member =
        MemberStorage.get(winner);

    if (member) {

        return member.name;

    }

    return winner;

},

// ===========================
// NIVEDAN FUNCTIONS
// ===========================

saveNivedan: function (nivedan) {

    const key = "introspect_nivedan";

    let records =
        JSON.parse(
            localStorage.getItem(key)
        ) || [];

    records.push(nivedan);

    localStorage.setItem(
        key,
        JSON.stringify(records)
    );

},


getUserNivedan: function () {

    const key = "introspect_nivedan";

    const username =
        this.getCurrentUser();

    const records =
        JSON.parse(
            localStorage.getItem(key)
        ) || [];

    return records.filter(

        item =>

        item.username === username

    );

},


getTodayNivedan: function () {

    const today =
        new Date().toLocaleDateString();

    const records =
        this.getUserNivedan();

    return records.find(

        item =>

        item.date === today

    ) || null;

},

};