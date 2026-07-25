/*
=========================================================
Introspect - Archive Engine
Version : RC-2 v1.0
Purpose : Archive Inactive Members
=========================================================
*/

const ArchiveEngine = (() => {

    const STORAGE_KEY = "introspect_archived_members";

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

    function archive(member) {

        const data = load();

        member.archivedAt = new Date().toISOString();

        data[member.username] = member;

        save(data);

    }

    function get(username) {

        const data = load();

        return data[username] || null;

    }

    function getAll() {

        return Object.values(load());

    }

    function restore(username) {

        const data = load();

        const member = data[username];

        if (!member) return null;

        delete data[username];

        save(data);

        return member;

    }

    function remove(username) {

        const data = load();

        delete data[username];

        save(data);

    }

    return {

        archive,
        get,
        getAll,
        restore,
        remove

    };

})();