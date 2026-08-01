window.Session = {

    save: function (role, username, remember = false) {

        if (!role) {

            console.error("Role missing");
            return;

        }

        if (!username) {

            username = "Guest";

        }

        const storage = remember
            ? localStorage
            : sessionStorage;

        localStorage.removeItem("introspect_logged_in");
        localStorage.removeItem("introspect_role");
        localStorage.removeItem("introspect_username");

        sessionStorage.removeItem("introspect_logged_in");
        sessionStorage.removeItem("introspect_role");
        sessionStorage.removeItem("introspect_username");

        storage.setItem(
            "introspect_logged_in",
            "true"
        );

        storage.setItem(
            "introspect_role",
            role.toLowerCase()
        );

        storage.setItem(
            "introspect_username",
            username
        );

    },



    isLoggedIn: function () {

        return (

            localStorage.getItem(
                "introspect_logged_in"
            ) === "true"

            ||

            sessionStorage.getItem(
                "introspect_logged_in"
            ) === "true"

        );

    },



    getRole: function () {

        return (

            localStorage.getItem(
                "introspect_role"
            )

            ||

            sessionStorage.getItem(
                "introspect_role"
            )

        );

    },



    getUsername: function () {

        return (

            localStorage.getItem(
                "introspect_username"
            )

            ||

            sessionStorage.getItem(
                "introspect_username"
            )

            ||

            "Guest"

        );

    },



    logout: function () {

        localStorage.removeItem(
            "introspect_logged_in"
        );

        localStorage.removeItem(
            "introspect_role"
        );

        localStorage.removeItem(
            "introspect_username"
        );

        sessionStorage.removeItem(
            "introspect_logged_in"
        );

        sessionStorage.removeItem(
            "introspect_role"
        );

        sessionStorage.removeItem(
            "introspect_username"
        );

        window.location.href =
            "login.html";

    }

};