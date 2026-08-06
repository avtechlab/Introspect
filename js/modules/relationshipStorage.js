/*
------------------------------------------------------------
Introspect RC-2
Relationship Storage Engine v1.0
Authoritative Owner: Relationship Intelligence Subsystem (Owns graph relationship entries)
Status : RC-2 Foundation
------------------------------------------------------------
*/

const RelationshipStorage = {

    storageKey: "introspect_relationships",


    load() {

        return JSON.parse(

            localStorage.getItem(

                this.storageKey

            )

        ) || [];

    },


    save(data) {

        localStorage.setItem(

            this.storageKey,

            JSON.stringify(data)

        );

    },


    generateId() {

        return (

            "REL-" +

            Date.now() +

            "-" +

            Math.floor(

                Math.random() * 100000

            )

        );

    },


    relationshipExists(

        memberId,

        relatedMemberId,

        relationshipType

    ) {

        return this.load().some(

            relationship =>

                relationship.memberId === memberId &&

                relationship.relatedMemberId === relatedMemberId &&

                relationship.relationshipType === relationshipType

        );

    },


    isSameMember(

        memberId,

        relatedMemberId

    ) {

        return memberId === relatedMemberId;

    },


    relationshipMap: {
        spouse: { category: "spouse", priority: 1, reverseMale: "spouse", reverseFemale: "spouse", reverseUnknown: "spouse", allowMultiple: false, allowSelf: false },
        father: { category: "parent", priority: 2, reverseMale: "son", reverseFemale: "daughter", reverseUnknown: "child", allowMultiple: false, allowSelf: false },
        mother: { category: "parent", priority: 3, reverseMale: "son", reverseFemale: "daughter", reverseUnknown: "child", allowMultiple: false, allowSelf: false },
        parent: { category: "parent", priority: 4, reverseMale: "son", reverseFemale: "daughter", reverseUnknown: "child", allowMultiple: true, allowSelf: false },
        child: { category: "child", priority: 5, reverseMale: "father", reverseFemale: "mother", reverseUnknown: "parent", allowMultiple: true, allowSelf: false },
        son: { category: "child", priority: 6, reverseMale: "father", reverseFemale: "mother", reverseUnknown: "parent", allowMultiple: true, allowSelf: false },
        daughter: { category: "child", priority: 7, reverseMale: "father", reverseFemale: "mother", reverseUnknown: "parent", allowMultiple: true, allowSelf: false },
        brother: { category: "sibling", priority: 8, reverseMale: "brother", reverseFemale: "sister", reverseUnknown: "brother", allowMultiple: true, allowSelf: false },
        sister: { category: "sibling", priority: 9, reverseMale: "brother", reverseFemale: "sister", reverseUnknown: "brother", allowMultiple: true, allowSelf: false },
        grandfather: { category: "extended", priority: 10, reverseMale: "grandson", reverseFemale: "granddaughter", reverseUnknown: "grandson", allowMultiple: true, allowSelf: false },
        grandmother: { category: "extended", priority: 11, reverseMale: "grandson", reverseFemale: "granddaughter", reverseUnknown: "grandson", allowMultiple: true, allowSelf: false },
        grandson: { category: "extended", priority: 12, reverseMale: "grandfather", reverseFemale: "grandmother", reverseUnknown: "grandfather", allowMultiple: true, allowSelf: false },
        granddaughter: { category: "extended", priority: 13, reverseMale: "grandfather", reverseFemale: "grandmother", reverseUnknown: "grandfather", allowMultiple: true, allowSelf: false },
        uncle: { category: "extended", priority: 14, reverseMale: "nephew", reverseFemale: "niece", reverseUnknown: "nephew", allowMultiple: true, allowSelf: false },
        aunt: { category: "extended", priority: 15, reverseMale: "nephew", reverseFemale: "niece", reverseUnknown: "nephew", allowMultiple: true, allowSelf: false },
        nephew: { category: "extended", priority: 16, reverseMale: "uncle", reverseFemale: "aunt", reverseUnknown: "uncle", allowMultiple: true, allowSelf: false },
        niece: { category: "extended", priority: 17, reverseMale: "uncle", reverseFemale: "aunt", reverseUnknown: "uncle", allowMultiple: true, allowSelf: false }
    },

    getReverseRelationship(type, targetGender) {
        const gender = targetGender ? targetGender.toLowerCase() : "unknown";
        const keyMap = {
            male: "reverseMale",
            female: "reverseFemale",
            unknown: "reverseUnknown"
        };
        const key = keyMap[gender] || "reverseUnknown";
        const entry = this.relationshipMap[type];
        return entry ? entry[key] : null;
    },

    isValidRelationship(type) {
        return Object.prototype.hasOwnProperty.call(this.relationshipMap, type);
    },

    addRelationship(data) {
        const rule = this.relationshipMap[data.relationshipType];
        if (!rule) {
            return {
                success: false,
                message: "Invalid Relationship Type"
            };
        }

        if (data.memberId === data.relatedMemberId && !rule.allowSelf) {
            return {
                success: false,
                message: "Member cannot relate to self"
            };
        }

        // Metadata-driven single relationship check
        if (!rule.allowMultiple) {
            const hasExistingSrc = this.load().some(r => r.memberId === data.memberId && r.relationshipType === data.relationshipType);
            const hasExistingTgt = this.load().some(r => r.memberId === data.relatedMemberId && r.relationshipType === data.relationshipType);
            if (hasExistingSrc || hasExistingTgt) {
                return {
                    success: false,
                    message: "A member can only have one " + data.relationshipType + "."
                };
            }
        }

        if (this.relationshipExists(data.memberId, data.relatedMemberId, data.relationshipType)) {
            return {
                success: false,
                message: "Relationship already exists"
            };
        }

        const relationships = this.load();
        const relationship = {
            id: this.generateId(),
            familyId: data.familyId,
            memberId: data.memberId,
            relatedMemberId: data.relatedMemberId,
            relationshipType: data.relationshipType,
            createdAt: new Date().toISOString()
        };

        relationships.push(relationship);

        // Auto-create reverse relationship
        const targetMember = typeof MemberStorage !== "undefined" ? MemberStorage.get(data.relatedMemberId) : null;
        const targetGender = targetMember ? targetMember.gender : null;
        const reverseType = this.getReverseRelationship(data.relationshipType, targetGender);

        if (
            reverseType &&
            !this.relationshipExists(
                data.relatedMemberId,
                data.memberId,
                reverseType
            )
        ) {
            relationships.push({
                id: this.generateId(),
                familyId: data.familyId,
                memberId: data.relatedMemberId,
                relatedMemberId: data.memberId,
                relationshipType: reverseType,
                createdAt: new Date().toISOString()
            });
        }

        this.save(relationships);

        return {
            success: true,
            relationship
        };
    },


    updateRelationship(

        id,

        updates

    ) {

        const relationships =
            this.load();


        const index =

            relationships.findIndex(

                relationship =>

                    relationship.id === id

            );


        if (

            index === -1

        ) {

            return false;

        }


        relationships[index] = {

            ...relationships[index],

            ...updates

        };


        this.save(

            relationships

        );


        return true;

    },


    deleteRelationship(id) {

        const relationships =

            this.load().filter(

                relationship =>

                    relationship.id !== id

            );


        this.save(

            relationships

        );


        return true;

    },

        getRelationships() {

        return this.load();

    },


    getMemberRelationships(memberId) {

        return this.load().filter(

            relationship =>

                relationship.memberId === memberId ||

                relationship.relatedMemberId === memberId

        );

    },


    getRelationship(

        memberId,

        relationshipType

    ) {

        return this.load().find(

            relationship =>

                relationship.memberId === memberId &&

                relationship.relationshipType === relationshipType

        ) || null;

    },


    getSpouse(memberId) {

        return this.getRelationship(

            memberId,

            "spouse"

        );

    },


    getFather(memberId) {

        return this.getRelationship(

            memberId,

            "father"

        );

    },


    getMother(memberId) {

        return this.getRelationship(

            memberId,

            "mother"

        );

    },


    getChildren(memberId) {

        return this.load().filter(

            relationship =>

                relationship.memberId === memberId &&

                (

                    relationship.relationshipType === "child" ||

                    relationship.relationshipType === "son" ||

                    relationship.relationshipType === "daughter"

                )

        );

    },


    getFamilyRelationships(familyId) {

        return this.load().filter(

            relationship =>

                relationship.familyId === familyId

        );

    },

        removeAllRelationships(memberId) {

        const relationships = this.load().filter(

            relationship =>

                relationship.memberId !== memberId &&

                relationship.relatedMemberId !== memberId

        );

        this.save(relationships);

    },


    relationshipCount(memberId) {

        return this.getMemberRelationships(

            memberId

        ).length;

    },


    familyRelationshipCount(familyId) {

        return this.getFamilyRelationships(

            familyId

        ).length;

    },

getParents(memberId) {

    return this.load().filter(

        relationship =>

            relationship.relatedMemberId === memberId &&

            (

                relationship.relationshipType === "father" ||

                relationship.relationshipType === "mother" ||

                relationship.relationshipType === "parent"

            )

    );

},


getSpouseId(memberId) {

    const spouse =

        this.getSpouse(memberId);

    return spouse ?

        spouse.relatedMemberId :

        null;

},


hasRelationship(

    memberId,

    relationshipType

) {

    return this.getRelationship(

        memberId,

        relationshipType

    ) !== null;

},

    clearAll() {

        localStorage.removeItem(

            this.storageKey

        );

    }

};