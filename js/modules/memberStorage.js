/*
=========================================================
Introspect - Member Storage Module
Version : RC-2 v1.0
Purpose : Manage Member Profiles
Canonical Owner: Member Profile Subsystem (Canonical owner of individual profile records)
=========================================================
*/

const MemberStorage = (() => {

    const STORAGE_KEY = "introspect_members";

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

    /**
     * Adds a canonical member profile record.
     * @canonical
     * @owned Fields: username, systemId, name, age, gender, isHead, status, createdAt
     */
    function add(member) {

    const data = load();

    if (!member || !member.username) {
        return null;
    }

    // Preserve existing System ID
    // Generate only for a new member
    if (!member.systemId) {
        member.systemId = SystemIdGenerator.generate();
    }

    data[member.username] = member;

    save(data);

    return member;

}

    function get(username) {

        const data = load();

        return data[username] || null;

    }

    function getAll() {

        return Object.values(load());

    }

    /**
     * Updates a canonical member profile record.
     * @canonical
     * @owned Fields: name, age, gender, isHead, status, systemId
     */
    function update(username, updates) {

        const data = load();

        if (!data[username]) return;

        data[username] = {

            ...data[username],

            ...updates

        };

        save(data);

    }

    function remove(username) {

        const data = load();

        delete data[username];

        save(data);

    }

    function exists(username) {

        return get(username) !== null;

    }

    function migrateLegacyIds() {

    const data = load();

    const members = Object.values(data);

    const existingIds = new Set();

    let maxId = 0;

        // Collect existing RC-2 IDs
        members.forEach(member => {

        const systemId =
            member.systemId ||
            member.username;

        const match =
            String(systemId)
                .match(/^SK(\d+)$/);

        if (match) {

            const id =
                Number(match[1]);

            existingIds.add(id);

            if (id > maxId) {
                maxId = id;
            }

        }

    });

    let nextId = 1;

    let migratedCount = 0;

        members.forEach(member => {

        const currentId =
            member.systemId ||
            member.username;

        // Already migrated
        if (
            String(currentId)
                .match(/^SK\d+$/)
        ) {
            return;
        }

        // Find next available ID
        while (existingIds.has(nextId)) {
            nextId++;
        }

        const newId =
            "SK" +
            String(nextId).padStart(6, "0");

        const oldUsername =
            member.username;

        // Create updated member
        const updatedMember = {

            ...member,

            username: newId,

            systemId: newId

        };

        // Remove old key
        delete data[oldUsername];

        // Save under new ID
        data[newId] = updatedMember;

        existingIds.add(nextId);

        migratedCount++;

        nextId++;

    });

    save(data);

    return migratedCount;

}

    return {

    add,
    get,
    getAll,
    update,
    remove,
    exists,
    migrateLegacyIds

    };

})();