/*
------------------------------------------------------------
Introspect RC-2
Relationship Storage Engine v1.0
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


    getReverseRelationship(type) {

        const reverse = {

            spouse: "spouse",

            father: "child",

            mother: "child",

            child: "parent",

            parent: "child",

            son: "parent",

            daughter: "parent"

        };

        return reverse[type] || null;

    },


    isValidRelationship(type) {

        const valid = [

            "spouse",

            "father",

            "mother",

            "parent",

            "child",

            "son",

            "daughter"

        ];

        return valid.includes(type);

    },

        addRelationship(data) {

        if (!this.isValidRelationship(
            data.relationshipType
        )) {

            return {

                success: false,

                message:
                    "Invalid Relationship Type"

            };

        }


        if (

            this.isSameMember(

                data.memberId,

                data.relatedMemberId

            )

        ) {

            return {

                success: false,

                message:
                    "Member cannot relate to self"

            };

        }


        if (

            this.relationshipExists(

                data.memberId,

                data.relatedMemberId,

                data.relationshipType

            )

        ) {

            return {

                success: false,

                message:
                    "Relationship already exists"

            };

        }


        const relationships =
            this.load();


        const relationship = {

            id:
                this.generateId(),

            familyId:
                data.familyId,

            memberId:
                data.memberId,

            relatedMemberId:
                data.relatedMemberId,

            relationshipType:
                data.relationshipType,

            createdAt:
                new Date().toISOString()

        };


        relationships.push(
            relationship
        );


        const reverseType =

            this.getReverseRelationship(

                data.relationshipType

            );


        if (

            reverseType &&

            !this.relationshipExists(

                data.relatedMemberId,

                data.memberId,

                reverseType

            )

        ) {

            relationships.push({

                id:
                    this.generateId(),

                familyId:
                    data.familyId,

                memberId:
                    data.relatedMemberId,

                relatedMemberId:
                    data.memberId,

                relationshipType:
                    reverseType,

                createdAt:
                    new Date().toISOString()

            });

        }


        this.save(

            relationships

        );


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