/*
=========================================================
Introspect - Role History Storage
Version : RC-2 v1.0
Purpose : Preserve Role History
=========================================================
*/

const RoleHistoryStorage = (() => {

    const STORAGE_KEY = "introspect_role_history";

    function load() {

        return JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "{}"
        );

    }

    function save(data) {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(data)
        );

    }

    function add(username, role) {

        const data = load();

        if (!data[username]) {

            data[username] = [];

        }

        data[username].push({

            role,

            assignedAt: new Date().toISOString()

        });

        save(data);

    }

    function get(username) {

        const data = load();

        return data[username] || [];

    }

    function getAll() {

        return load();

    }

    return {

        add,
        get,
        getAll

    };

})();