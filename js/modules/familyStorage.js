/*
=========================================================
Introspect - Family Storage Module
Version : RC-2 v1.0
Purpose : Manage Family Relationships
Responsibility: Maintains family aggregate data and synchronized member snapshots.
=========================================================
*/

const FamilyStorage = (() => {

    const STORAGE_KEY = "introspect_family_relationships";
    const METADATA_STORAGE_KEY = "introspect_family_metadata";

    function load() {

        try {

            return JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "{}"
            );

        } catch (error) {

            console.error(
                "FamilyStorage load error:",
                error
            );

            return {};

        }

    }

    function save(data) {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(data)
        );

    }

    function loadMetadata() {

    try {

        return JSON.parse(
            localStorage.getItem(
                METADATA_STORAGE_KEY
            ) || "{}"
        );

    } catch (error) {

        console.error(
            "FamilyStorage metadata load error:",
            error
        );

        return {};

    }

}


function saveMetadata(data) {

    localStorage.setItem(
        METADATA_STORAGE_KEY,
        JSON.stringify(data)
    );

}


function createFamilyMetadata(familyId) {

    const data =
        loadMetadata();

    if (!data[familyId]) {

        data[familyId] = {

            familyName: "",

            village: "",

            status: "active",

            createdAt:
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()

        };

        saveMetadata(data);

    }

    return data[familyId];

}


function getFamilyMetadata(familyId) {

    const data =
        loadMetadata();

    return data[familyId] || null;

}


function updateFamilyMetadata(
    familyId,
    updates
) {

    const data =
        loadMetadata();


    if (!data[familyId]) {

        data[familyId] = {

            familyName: "",

            village: "",

            status: "active",

            createdAt:
                new Date().toISOString()

        };

    }


    data[familyId] = {

        ...data[familyId],

        ...updates,

        updatedAt:
            new Date().toISOString()

    };


    saveMetadata(data);


    return data[familyId];

}

    function createFamily(familyId) {

    const data = load();

    if (!data[familyId]) {

        data[familyId] = [];

        save(data);

    }

    createFamilyMetadata(familyId);

}

    /**
     * Adds a member snapshot to the family array.
     * @private
     * @internal This method is for internal synchronization only and must be invoked solely by the FamilyService coordination layer.
     */
    function addMember(familyId, member) {

        const data = load();

        if (!data[familyId]) {

            data[familyId] = [];

        }

        data[familyId].push(member);

        save(data);

    }

    function getFamily(familyId) {

        const data = load();

        return data[familyId] || [];

    }

    function getAllFamilies() {

        return load();

    }

    /**
     * Removes a member snapshot from the family array.
     * @private
     * @internal This method is for internal synchronization only and must be invoked solely by the FamilyService coordination layer.
     */
    function removeMember(familyId, username) {

        const data = load();

        if (!data[familyId]) return;

        data[familyId] = data[familyId].filter(
            member => member.username !== username
        );

        save(data);

    }

    /**
     * Updates a member snapshot within the family array.
     * @private
     * @internal This method is for internal synchronization only and must be invoked solely by the FamilyService coordination layer.
     */
    function updateMember(
        familyId,
        username,
        updatedData
    ) {

        const data = load();

        if (!data[familyId]) return;

        data[familyId] = data[familyId].map(
            member => {

                if (member.username === username) {

                    return {
                        ...member,
                        ...updatedData
                    };

                }

                return member;

            }
        );

        save(data);

    }

    function findMember(username) {

        const data = load();

        for (const familyId in data) {

            const member = data[familyId].find(
                member => member.username === username
            );

            if (member) {

                return {
                    familyId,
                    member
                };

            }

        }

        return null;

    }

    /**
     * Retrieves spouse.
     * @deprecated Deprecated in RC-2. Direct relationship properties on member snapshots are legacy; use RelationshipStorage graph queries instead.
     */
    function getSpouse(username) {

        const result = findMember(username);

        if (!result) return null;

        const family = getFamily(result.familyId);

        return family.find(member =>
            member.relationship === "Spouse" &&
            member.username !== username
        ) || null;

    }

    /**
     * Retrieves children.
     * @deprecated Deprecated in RC-2. Direct relationship properties on member snapshots are legacy; use RelationshipStorage graph queries instead.
     */
    function getChildren(username) {

        const result = findMember(username);

        if (!result) return [];

        const family = getFamily(result.familyId);

        return family.filter(
            member => member.parentUsername === username
        );

    }

    function getHeadOfFamily(familyId) {

        const family = getFamily(familyId);

        return family.find(
            member => member.isHead === true
        ) || null;

    }

    function isFamilyMember(username) {

        return findMember(username) !== null;

    }

    function migrateLegacyMemberIds(idMap) {

    const data = load();

        Object.keys(data).forEach(familyId => {

        data[familyId] =
            data[familyId].map(member => {

                const oldUsername =
                    member.username;

                if (!idMap[oldUsername]) {
                    return member;
                }

                const newId =
                    idMap[oldUsername];

                return {

                    ...member,

                    username: newId,

                    systemId: newId

                };

            });

        });

        save(data);

    }

    return {

    createFamily,

    addMember,

    getFamily,

    getAllFamilies,

    removeMember,

    updateMember,

    findMember,

    // Relationship Intelligence
    getSpouse,

    getChildren,

    getHeadOfFamily,

    isFamilyMember,

    // Family Metadata
    createFamilyMetadata,

    getFamilyMetadata,

    updateFamilyMetadata

};

})();