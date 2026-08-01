/*
 Introspect RC-2
 Relationship Controller
*/

const Relationship = {

    load(memberId) {

        const relationships =
            RelationshipStorage.getMemberRelationships(memberId);

        return relationships;
    },


    add(data) {

        return RelationshipStorage.addRelationship(data);

    },


    remove(id) {

        return RelationshipStorage.deleteRelationship(id);

    }

};