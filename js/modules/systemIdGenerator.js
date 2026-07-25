/*
=========================================================
Introspect - System ID Generator
Version : RC-2 v1.0
Purpose : Generate Unique Member IDs
=========================================================
*/

const SystemIdGenerator = (() => {

    const STORAGE_KEY = "introspect_last_system_id";

    function getLastId() {

        return Number(
            localStorage.getItem(STORAGE_KEY) || 0
        );

    }

    function saveLastId(id) {

        localStorage.setItem(
            STORAGE_KEY,
            id
        );

    }

    function generate() {

        let lastId = getLastId();

        lastId++;

        saveLastId(lastId);

        return "SK" + String(lastId).padStart(6, "0");

    }

    function syncCounter() {

        let maxId = 0;

        if (typeof MemberStorage !== "undefined") {

            const members = MemberStorage.getAll();

            members.forEach(member => {

                if (!member.systemId) return;

                const match =
                    String(member.systemId)
                        .match(/^SK(\d+)$/);

                if (match) {

                    const id =
                        Number(match[1]);

                    if (id > maxId) {
                        maxId = id;
                    }

                }

            });

        }

        if (getLastId() < maxId) {

            saveLastId(maxId);

        }

        return maxId;

    }

    function reset() {

        localStorage.removeItem(STORAGE_KEY);

    }

    return {

        generate,

        getLastId,

        syncCounter,

        reset

    };

})();