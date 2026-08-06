/*
=========================================================
Introspect - Family Service Module
Version : RC-2 v1.0 (Phase 1)
Role : The designated coordination layer for coordinating dual-writes to keep storage engines in sync.
=========================================================
*/

const FamilyService = (() => {

    /**
     * Updates the status of a member in both storages.
     */
    function updateMemberStatus(familyId, username, newStatus) {
        MemberStorage.update(username, { status: newStatus });
        FamilyStorage.updateMember(familyId, username, { status: newStatus });
    }

    /**
     * Sets the specified user as the Head of Family, 
     * removing the designation from all other members.
     */
    function setHeadOfFamily(familyId, username) {
        try {
            // 1. Verify that the target username exists inside MemberStorage.
            const targetMember = MemberStorage.get(username);
            if (!targetMember) {
                return {
                    success: false,
                    message: "Member does not exist."
                };
            }

            // 2. Verify that the member status is Active. Inactive members cannot become Head of Family.
            if (targetMember.status !== "active") {
                return {
                    success: false,
                    message: "Inactive member cannot become Head of Family."
                };
            }

            // 3. Verify that the target username belongs to the supplied familyId.
            const familyMembers = FamilyStorage.getFamily(familyId);
            const existsInFamily = familyMembers.some(function(member) {
                return member.username === username;
            });
            if (!existsInFamily) {
                return {
                    success: false,
                    message: "Selected member does not belong to this family."
                };
            }

            // 1. Remove Head designation from everyone else
            familyMembers.forEach(function(member) {
                const memberUsername = member.username;
                if (memberUsername === username) return;

                const memberRecord = MemberStorage.get(memberUsername);
                if (memberRecord && memberRecord.isHead === true) {
                    MemberStorage.update(memberUsername, { isHead: false });
                }
                // Keep FamilyStorage synchronized
                FamilyStorage.updateMember(familyId, memberUsername, { isHead: false });
            });

            // 2. Set new Head
            MemberStorage.update(username, { isHead: true });
            FamilyStorage.updateMember(familyId, username, { isHead: true });

            return {
                success: true
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * Updates a member's profile data in both storages.
     */
    function updateMemberProfile(familyId, username, updates) {
        MemberStorage.update(username, updates);
        FamilyStorage.updateMember(familyId, username, updates);
    }

    /**
     * Adds a new member to both storages.
     */
    function addMember(familyId, member) {
        // Ensure member is tied to this family
        member.familyId = familyId;
        
        MemberStorage.add(member);
        FamilyStorage.addMember(familyId, member);
        return member;
    }

    /**
     * Ensures the current user exists in the family, adding them if they don't,
     * or synchronizing their ID if they do.
     */
    function ensureCurrentUserInFamily(familyId, username, currentMember) {
        let familyMembers = FamilyStorage.getFamily(familyId);
        
        const currentUserInFamily = familyMembers.some(function (member) {
            return member.username === username;
        });

        if (!currentUserInFamily) {
            const existingHead = FamilyStorage.getHeadOfFamily(familyId);
            const shouldBeHead = !existingHead;

            MemberStorage.update(username, {
                familyId: familyId,
                isHead: shouldBeHead
            });

            FamilyStorage.addMember(familyId, {
                username: username,
                systemId: currentMember.systemId,
                name: currentMember.name || username,
                relationship: currentMember.relationship || "Head",
                isHead: shouldBeHead,
                status: currentMember.status || "active",
                familyId: familyId,
                joinedAt: new Date().toISOString()
            });
        } else {
            // Synchronize the permanent System ID.
            FamilyStorage.updateMember(familyId, username, {
                systemId: currentMember.systemId
            });
        }
    }

    return {
        updateMemberStatus,
        setHeadOfFamily,
        updateMemberProfile,
        addMember,
        ensureCurrentUserInFamily
    };

})();
