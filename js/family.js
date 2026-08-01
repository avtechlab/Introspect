/**
 * Introspect - Ek Prerna
 * Family Management Controller
 * RC-2
 */

document.addEventListener("DOMContentLoaded", function () {

    // --------------------------------------------------------
    // 1. Session
    // --------------------------------------------------------

    const username =
        typeof Session !== "undefined"
            ? Session.getUsername()
            : null;

    const usernameDisplay =
        document.getElementById("usernameDisplay");

    const roleDisplay =
        document.getElementById("roleDisplay");

    if (usernameDisplay) {
        usernameDisplay.textContent = username || "User";
    }

    if (roleDisplay && typeof Session !== "undefined") {
        roleDisplay.textContent =
            Session.getRole() || "User";
    }


    // --------------------------------------------------------
    // 2. Logout
    // --------------------------------------------------------

    const logoutBtn =
        document.getElementById("logoutBtn");

    if (logoutBtn && typeof Session !== "undefined") {

        logoutBtn.addEventListener("click", function () {

            Session.logout();

        });

    }


    // --------------------------------------------------------
    // 3. Mobile Navigation
    // --------------------------------------------------------

    const menuToggle =
        document.querySelector(".menu-toggle");

    const sidebar =
        document.querySelector(".dashboard-sidebar");

    if (menuToggle && sidebar) {

        menuToggle.addEventListener("click", function () {

            const active =
                sidebar.classList.toggle("active");

            menuToggle.setAttribute(
                "aria-expanded",
                active ? "true" : "false"
            );

        });

    }


    // --------------------------------------------------------
    // 4. Storage Availability
    // --------------------------------------------------------

    if (
        typeof FamilyStorage === "undefined" ||
        typeof MemberStorage === "undefined"
    ) {

        console.error(
            "FamilyStorage or MemberStorage is not loaded."
        );

        showMessage(
            "Family storage modules could not be loaded.",
            "error"
        );

        return;

    }


    // --------------------------------------------------------
    // 5. Current User
    // --------------------------------------------------------

    if (!username) {

        showMessage(
            "Unable to identify current user.",
            "error"
        );

        return;

    }


    // --------------------------------------------------------
// 6. Get / Create Current User Profile
// --------------------------------------------------------

let currentMember =
    MemberStorage.get(username);


if (!currentMember) {

    currentMember = {

        username: username,

        name: username,

        relationship: "Head",

        isHead: true,

        status: "active",

        createdAt:
            new Date().toISOString()

    };

    /*
     * MemberStorage.add() will generate
     * a permanent System ID for a new member.
     */

    currentMember =
        MemberStorage.add(currentMember);

}


if (!currentMember) {

    showMessage(
        "Unable to create current member profile.",
        "error"
    );

    return;

}


/*
 * Existing user records may not have a System ID.
 *
 * Generate one only when missing.
 *
 * Existing System ID is NEVER replaced.
 */

if (!currentMember.systemId) {

    const systemId =
        SystemIdGenerator.generate();

    MemberStorage.update(
        username,
        {
            systemId: systemId
        }
    );

    currentMember =
        MemberStorage.get(username);

}


    // --------------------------------------------------------
    // 7. Family ID
    // --------------------------------------------------------

    let familyId =
        currentMember.familyId || null;


    if (!familyId) {

        familyId =
            "FAM-" +
            username
                .replace(/[^a-zA-Z0-9]/g, "")
                .toUpperCase();

        MemberStorage.update(
            username,
            {
                familyId: familyId
            }
        );

    }


    // --------------------------------------------------------
    // 8. Create Family If Needed
    // --------------------------------------------------------

    FamilyStorage.createFamily(familyId);


    // --------------------------------------------------------
    // 9. Ensure Current User Exists In Family
    // --------------------------------------------------------

let familyMembers =
    FamilyStorage.getFamily(familyId);


const currentUserInFamily =
    familyMembers.some(function (member) {

        return member.username === username;

    });


if (!currentUserInFamily) {

    const existingHead =
        FamilyStorage.getHeadOfFamily(familyId);


    const shouldBeHead =
        !existingHead;


    MemberStorage.update(
        username,
        {
            familyId: familyId,
            isHead: shouldBeHead
        }
    );


    FamilyStorage.addMember(
        familyId,
        {
            username: username,

            systemId:
                currentMember.systemId,

            name:
                currentMember.name ||
                username,

            relationship:
                currentMember.relationship ||
                "Head",

            isHead:
                shouldBeHead,

            status:
                currentMember.status ||
                "active",

            familyId:
                familyId,

            joinedAt:
                new Date().toISOString()

        }
    );

}
else {

    /*
     * Existing family record may have been created
     * before System ID normalization.
     *
     * Synchronize the permanent System ID.
     */

    FamilyStorage.updateMember(
        familyId,
        username,
        {
            systemId:
                currentMember.systemId
        }
    );

}

    // --------------------------------------------------------
    // 10. Load Family
    // --------------------------------------------------------

    loadFamily();


    // --------------------------------------------------------
    // 11. Family Form
    // --------------------------------------------------------

    const familyForm =
        document.getElementById("familyForm");


    if (familyForm) {

        familyForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                saveFamilyInformation();

            }
        );

    }


    // --------------------------------------------------------
    // 12. Add Member Button
    // --------------------------------------------------------

    const addMemberBtn =
    document.getElementById("addMemberBtn");

if (addMemberBtn) {

    addMemberBtn.addEventListener(
        "click",
        function () {

            const formContainer =
                document.getElementById(
                    "memberFormContainer"
                );

            if (formContainer) {

                formContainer.classList.remove(
                    "hidden"
                );

            }

            populateRelationshipMembers();

        }
    );

}


    // --------------------------------------------------------
    // 13. Cancel Member
    // --------------------------------------------------------

    const cancelMemberBtn =
        document.getElementById("cancelMemberBtn");


    if (cancelMemberBtn && memberFormContainer) {

        cancelMemberBtn.addEventListener(
            "click",
            function () {

                memberFormContainer.classList.add(
                    "hidden"
                );

                resetMemberForm();

            }
        );

    }


    // --------------------------------------------------------
    // 14. Member Form
    // --------------------------------------------------------

    const memberForm =
        document.getElementById("memberForm");


    if (memberForm) {

        memberForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                addFamilyMember();

            }
        );

    }


    // --------------------------------------------------------
    // 15. Load Family
    // --------------------------------------------------------

    function loadFamily() {

    const family =
        FamilyStorage.getFamily(
            familyId
        );


    const metadata =
        FamilyStorage.getFamilyMetadata(
            familyId
        );


    const familyNameDisplay =
        document.getElementById(
            "familyNameDisplay"
        );

    const familyCodeDisplay =
        document.getElementById(
            "familyCodeDisplay"
        );

    const familyVillageDisplay =
        document.getElementById(
            "familyVillageDisplay"
        );

    const memberCount =
        document.getElementById(
            "familyMemberCount"
        );


    // ----------------------------------------------------
    // Family Summary
    // ----------------------------------------------------

    if (familyCodeDisplay) {

        familyCodeDisplay.textContent =
            familyId;

    }


    if (familyNameDisplay) {

        familyNameDisplay.textContent =
            metadata &&
            metadata.familyName
                ? metadata.familyName
                : "Not Set";

    }


    if (familyVillageDisplay) {

        familyVillageDisplay.textContent =
            metadata &&
            metadata.village
                ? metadata.village
                : "Not Set";

    }


    if (memberCount) {

        memberCount.textContent =
            family.length;

    }


    // ----------------------------------------------------
    // Family Form
    // ----------------------------------------------------

    const familyNameInput =
        document.getElementById(
            "familyName"
        );

    const familyVillageInput =
        document.getElementById(
            "familyVillage"
        );

    const familyHeadInput =
        document.getElementById(
            "familyHead"
        );

    const familyStatusInput =
        document.getElementById(
            "familyStatus"
        );


    if (familyNameInput) {

        familyNameInput.value =
            metadata &&
            metadata.familyName
                ? metadata.familyName
                : "";

    }


    if (familyVillageInput) {

        familyVillageInput.value =
            metadata &&
            metadata.village
                ? metadata.village
                : "";

    }


    if (familyStatusInput) {

        familyStatusInput.value =
            metadata &&
            metadata.status
                ? metadata.status
                : "active";

    }


    // ----------------------------------------------------
    // Head-of-Family
    //
    // Source of truth:
    // Member.isHead
    // ----------------------------------------------------

    const headOfFamily =
        FamilyStorage.getHeadOfFamily(
            familyId
        );


    if (familyHeadInput) {

        familyHeadInput.value =
            headOfFamily
                ? (
                    headOfFamily.name ||
                    headOfFamily.systemId ||
                    headOfFamily.username ||
                    ""
                )
                : "Not Assigned";

    }


    renderMembers(family);
    renderRelationshipIntelligence();

}


    // --------------------------------------------------------
    // 16. Render Members
    // --------------------------------------------------------

    function renderMembers(members) {

    const tbody =
        document.getElementById(
            "membersTableBody"
        );

    if (!tbody) return;

    tbody.innerHTML = "";

    if (!members.length) {

        tbody.innerHTML = `

            <tr>

                <td colspan="8"
                    style="padding:20px;text-align:center;">

                    No family members added yet.

                </td>

            </tr>

        `;

        return;

    }

    members.forEach(function (member) {

        const row =
            document.createElement("tr");

        const currentStatus =
            member.status || "active";

        const isActive =
            currentStatus === "active";

        const statusText =
            isActive
                ? "Active"
                : "Inactive";

        const statusActionText =
            isActive
                ? "Deactivate"
                : "Activate";

        /*
         * Head-of-Family source of truth:
         *
         * member.isHead
         *
         * Role is derived from the member record.
         */

        const isHead =
            member.isHead === true;

        const roleText =
            isHead
                ? "Head of Family"
                : "Family Member";

        const headActionHtml =
            isHead
                ? `
                    <span
                        class="status-pill status-achieved"
                        style="display:inline-block;margin-top:8px;">

                        Head

                    </span>
                  `
                : `
                    <button
                        type="button"
                        class="primary-btn family-head-btn"
                        data-username="${escapeHtml(
                            member.username
                        )}"
                        style="margin-top:8px;">

                        Set as Head

                    </button>
                  `;


        row.innerHTML = `

            <td>
    ${escapeHtml(
        member.systemId ||
        member.username ||
        "—"
    )}
</td>

            <td>
                ${escapeHtml(
                    member.name || "—"
                )}
            </td>

            <td>
                ${escapeHtml(
                    member.age !== undefined
                        ? member.age
                        : "—"
                )}
            </td>

            <td>
                ${escapeHtml(
                    member.gender || "—"
                )}
            </td>

            <td>

    ${escapeHtml(
        member.relationship || "—"
    )}

    <br>

    <button
        type="button"
        class="primary-btn relationship-add-btn"
        data-systemid="${escapeHtml(
            member.systemId
        )}"
        style="margin-top:8px;">

        Add

    </button>


    <div
        id="relationships-${escapeHtml(
            member.systemId
        )}"
        style="margin-top:8px;">

    </div>

</td>

            <td>

                <span
                    class="status-pill ${
                        isHead
                            ? "status-achieved"
                            : "status-missed"
                    }">

                    ${roleText}

                </span>

                <br>

                ${headActionHtml}

            </td>

            <td>

                <span
                    class="status-pill ${
                        isActive
                            ? "status-achieved"
                            : "status-missed"
                    }">

                    ${statusText}

                </span>

            </td>

            <td>

                <button
                    type="button"
                    class="primary-btn family-edit-btn"
                    data-username="${escapeHtml(
                        member.username
                    )}">

                    Edit

                </button>


                <button
                    type="button"
                    class="login-submit family-status-btn"
                    data-username="${escapeHtml(
                        member.username
                    )}"
                    style="width:auto;margin-left:8px;">

                    ${statusActionText}

                </button>

            </td>

        `;

        tbody.appendChild(row);

        loadMemberRelationships(member.systemId);

    });


    // ----------------------------------------------------
// Edit Button Events
// ----------------------------------------------------

tbody.querySelectorAll(".family-edit-btn")
.forEach(function (button) {

    button.onclick = function () {

        editFamilyMember(
            button.dataset.username
        );

    };

});


// ----------------------------------------------------
// Status Button Events
// ----------------------------------------------------

tbody.querySelectorAll(".family-status-btn")
.forEach(function (button) {

    button.onclick = function () {

        toggleMemberStatus(
            button.dataset.username
        );

    };

});


// ----------------------------------------------------
// Head-of-Family Button Events
// ----------------------------------------------------

tbody.querySelectorAll(".family-head-btn")
.forEach(function (button) {

    button.onclick = function () {

        setHeadOfFamily(
            button.dataset.username
        );

    };

});


// ----------------------------------------------------
// Relationship Button Events
// ----------------------------------------------------

tbody.querySelectorAll(".relationship-add-btn")
.forEach(function (button) {

    button.onclick = function () {

        openRelationshipForm(
            button.dataset.systemid
        );

    };

});

}

    function openRelationshipForm(memberId) {

    console.log("Opening Relationship Modal :", memberId);

    const modal =
        document.getElementById(
            "relationshipModal"
        );

    if (!modal) {

        console.error(
            "relationshipModal not found"
        );

        return;

    }

    document.getElementById(
        "relationshipMemberId"
    ).value = memberId;

    loadRelationshipMembers(memberId);

    modal.classList.remove("hidden");

    modal.style.display = "flex";

    modal.style.visibility = "visible";

    modal.style.opacity = "1";

}

    function loadMemberRelationships(memberId){

    const container =
        document.getElementById(
            "relationships-" + memberId
        );


    if(!container) return;


    const relationships =
        RelationshipStorage.getMemberRelationships(
            memberId
        );


    if(!relationships.length){

        container.innerHTML =
            "";

        return;

    }


    container.innerHTML =
        relationships.map(function(r){

            return `
            <small>
            ${r.relationshipType}
            :
            ${r.relatedMemberId}
            </small>
            `;

        }).join("<br>");

}

    function renderRelationshipIntelligence() {

    const container =
        document.getElementById(
            "relationshipIntelligenceContent"
        );

    if (!container) return;

    const members =
        FamilyStorage.getFamily(familyId);

    const relationships =
        RelationshipStorage.getFamilyRelationships(
            familyId
        );

    if (!members.length) {

        container.innerHTML = `
            <p>No family members available.</p>
        `;

        return;

    }

    if (!relationships.length) {

        container.innerHTML = `
            <p>No family relationships defined yet.</p>
        `;

        return;

    }

    let html = "";

    const renderedSpousePairs =
        new Set();

    // ----------------------------------------------------
    // Spouse Relationships
    // ----------------------------------------------------

    relationships.forEach(function (relationship) {

        if (
            relationship.relationshipType !==
            "spouse"
        ) {
            return;
        }

        const member =
            members.find(function (item) {

                return (
                    item.systemId ===
                    relationship.memberId
                );

            });

        const spouse =
            members.find(function (item) {

                return (
                    item.systemId ===
                    relationship.relatedMemberId
                );

            });

        if (!member || !spouse) {
            return;
        }

        const pairKey =
            [
                member.systemId,
                spouse.systemId
            ]
                .sort()
                .join("|");

        if (
            renderedSpousePairs.has(pairKey)
        ) {
            return;
        }

        renderedSpousePairs.add(pairKey);

        html += `

            <div
                style="
                    padding:15px;
                    margin-bottom:12px;
                    border:1px solid rgba(255,255,255,0.08);
                    border-radius:10px;
                ">

                <strong>
                    ${escapeHtml(member.name)}
                </strong>

                <span style="margin:0 10px;">
                    ↔
                </span>

                <strong>
                    ${escapeHtml(spouse.name)}
                </strong>

                <span style="margin-left:10px;">
                    (Spouse)
                </span>

            </div>

        `;

    });

    // ----------------------------------------------------
    // Parent / Child Relationships
    // ----------------------------------------------------

    relationships.forEach(function (relationship) {

        if (
            relationship.relationshipType !==
            "child"
        ) {
            return;
        }

        const parent =
            members.find(function (member) {

                return (
                    member.systemId ===
                    relationship.relatedMemberId
                );

            });

        const child =
            members.find(function (member) {

                return (
                    member.systemId ===
                    relationship.memberId
                );

            });

        if (!parent || !child) {
            return;
        }

        html += `

            <div
                style="
                    padding:15px;
                    margin-bottom:12px;
                    border:1px solid rgba(255,255,255,0.08);
                    border-radius:10px;
                ">

                <strong>
                    ${escapeHtml(parent.name)}
                </strong>

                <span style="margin:0 10px;">
                    →
                </span>

                <strong>
                    ${escapeHtml(child.name)}
                </strong>

                <span style="margin-left:10px;">
                    (Child)
                </span>

            </div>

        `;

    });

    container.innerHTML =
        html ||
        `
            <p>
                No relationships found.
            </p>
        `;

}

    function toggleMemberStatus(username) {

    const member =
        MemberStorage.get(username);


    if (!member) {

        showMessage(
            "Member record not found.",
            "error"
        );

        return;

    }


    const currentStatus =
        member.status || "active";


    const newStatus =
        currentStatus === "active"
            ? "inactive"
            : "active";


    const actionText =
        newStatus === "inactive"
            ? "deactivated"
            : "activated";


    // ----------------------------------------------------
    // Relationship Button Events
    // ----------------------------------------------------

        const relationshipButtons =
            tbody.querySelectorAll(
                ".relationship-add-btn"
            );


        relationshipButtons.forEach(function(button){

            button.addEventListener(
                "click",
                function(){

                    const systemId =
                        button.dataset.systemid;

                    openRelationshipForm(systemId);

                }
            );

        });


    // ----------------------------------------------------
    // Update MemberStorage
    // ----------------------------------------------------

    MemberStorage.update(
        username,
        {
            status: newStatus
        }
    );


    // ----------------------------------------------------
    // Update FamilyStorage
    // ----------------------------------------------------

    FamilyStorage.updateMember(
        familyId,
        username,
        {
            status: newStatus
        }
    );


    // ----------------------------------------------------
    // Refresh Family UI
    // ----------------------------------------------------

    loadFamily();


    showMessage(
        `${username} ${actionText} successfully.`,
        "success"
    );

}

    function setHeadOfFamily(username) {

    const selectedMember =
        MemberStorage.get(username);

    if (!selectedMember) {

        showMessage(
            "Member record not found.",
            "error"
        );

        return;

    }


    // ----------------------------------------------------
    // Already Head
    // ----------------------------------------------------

    if (selectedMember.isHead === true) {

        showMessage(
            `${username} is already Head of Family.`,
            "success"
        );

        return;

    }


    // ----------------------------------------------------
    // Get Current Family
    // ----------------------------------------------------

    const familyMembers =
        FamilyStorage.getFamily(familyId);


    if (!familyMembers.length) {

        showMessage(
            "No family members found.",
            "error"
        );

        return;

    }


    // ----------------------------------------------------
    // IMPORTANT:
    // MemberStorage is the source of truth.
    //
    // First remove Head designation from all
    // family members.
    // ----------------------------------------------------

    familyMembers.forEach(function (member) {

        const memberUsername =
            member.username;

        if (memberUsername === username) {

            return;

        }


        const memberRecord =
            MemberStorage.get(memberUsername);


        if (
            memberRecord &&
            memberRecord.isHead === true
        ) {

            MemberStorage.update(
                memberUsername,
                {
                    isHead: false
                }
            );

        }


        // Keep FamilyStorage synchronized

        FamilyStorage.updateMember(
            familyId,
            memberUsername,
            {
                isHead: false
            }
        );

    });


    // ----------------------------------------------------
    // Set New Head
    // ----------------------------------------------------

    MemberStorage.update(
        username,
        {
            isHead: true
        }
    );


    // ----------------------------------------------------
    // Keep FamilyStorage synchronized
    // ----------------------------------------------------

    FamilyStorage.updateMember(
        familyId,
        username,
        {
            isHead: true
        }
    );


    // ----------------------------------------------------
    // Refresh UI
    // ----------------------------------------------------

    loadFamily();


    showMessage(
        `${username} is now Head of Family.`,
        "success"
    );

}

    function editFamilyMember(username) {

    const member =
        MemberStorage.get(username);


    if (!member) {

        showMessage(
            "Member record not found.",
            "error"
        );

        return;

    }


    const memberName =
        document.getElementById("memberName");

    const memberAge =
        document.getElementById("memberAge");

    const memberGender =
        document.getElementById("memberGender");

    const memberRelation =
        document.getElementById("memberRelation");

    const memberParent =
        document.getElementById("memberParent");

    const editingMemberId =
        document.getElementById("editingMemberId");

    const submitBtn =
        document.getElementById("memberSubmitBtn");

    const formContainer =
        document.getElementById(
            "memberFormContainer"
        );


    if (memberName) {
        memberName.value = member.name || "";
    }

    if (memberAge) {
        memberAge.value =
            member.age !== undefined
                ? member.age
                : "";
    }

    if (memberGender) {
        memberGender.value =
            member.gender || "";
    }

    if (memberRelation) {
        memberRelation.value =
            member.relationship || "";
    }

    if (memberParent) {

        populateRelationshipMembers(
        member.username
        );

        memberParent.value =
            member.parentUsername || "";
    }


    if (editingMemberId) {
        editingMemberId.value =
            member.username;
    }


    if (submitBtn) {
        submitBtn.textContent =
            "Update Member";
    }


    if (formContainer) {

        formContainer.classList.remove(
            "hidden"
        );

    }

}

    function populateRelationshipMembers(currentUsername = "") {

    const select =
        document.getElementById("memberParent");

    if (!select) return;

    const members =
        FamilyStorage.getFamily(familyId);

    select.innerHTML = `
        <option value="">
            Select Relationship Link
        </option>
    `;

    members.forEach(function (member) {

        if (
            member.username === currentUsername
        ) {
            return;
        }

        if (
            member.status &&
            member.status !== "active"
        ) {
            return;
        }

        const option =
            document.createElement("option");

        option.value =
            member.username;

        option.textContent =
            `${member.name || member.username} (${member.relationship || "Member"})`;

        select.appendChild(option);

    });

}

    // --------------------------------------------------------
    // 17. Add Member
    // --------------------------------------------------------

    function addFamilyMember() {

    const name =
        document.getElementById("memberName")?.value.trim();

    const age =
        document.getElementById("memberAge")?.value;

    const gender =
        document.getElementById("memberGender")?.value;

    const relationship =
        document.getElementById("memberRelation")?.value.trim();
    
    const parentUsername =
        document.getElementById("memberParent")?.value || "";

    const editingMemberId =
        document.getElementById("editingMemberId")?.value.trim();

    const relationshipLink =
        document.getElementById("memberParent")?.value.trim();


    // ----------------------------------------------------
    // Validation
    // ----------------------------------------------------

    if (!name) {

        showMessage(
            "Please enter member name.",
            "error"
        );

        return;
    }


    if (!relationship) {

        showMessage(
            "Please enter member relation.",
            "error"
        );

        return;
    }


    // ----------------------------------------------------
    // EDIT MODE
    // ----------------------------------------------------

    if (editingMemberId) {

        const existingMember =
            MemberStorage.get(editingMemberId);


        if (!existingMember) {

            showMessage(
                "Member record not found.",
                "error"
            );

            return;
        }


        const updatedMember = {

    name: name,

    age:
        age
            ? Number(age)
            : "",

    gender: gender,

    relationship: relationship

};


        // Update MemberStorage
        MemberStorage.update(
            editingMemberId,
            updatedMember
        );


        // Update FamilyStorage
        FamilyStorage.updateMember(
            familyId,
            editingMemberId,
            updatedMember
        );

        RelationshipStorage.removeAllRelationships(
    editingMemberId
);

if (relationshipLink) {

    RelationshipStorage.addRelationship({

        familyId: familyId,

        memberId: editingMemberId,

        relatedMemberId: relationshipLink,

        relationshipType:
            relationship.toLowerCase()

    });

}

        // Reset edit state
        const editingInput =
            document.getElementById("editingMemberId");

        if (editingInput) {
            editingInput.value = "";
        }


        const submitBtn =
            document.getElementById("memberSubmitBtn");

        if (submitBtn) {
            submitBtn.textContent = "Add Member";
        }


        resetMemberForm();


        const memberFormContainer =
            document.getElementById(
                "memberFormContainer"
            );

        if (memberFormContainer) {

            memberFormContainer.classList.add(
                "hidden"
            );

        }


        loadFamily();


        showMessage(
            `${editingMemberId} updated successfully.`,
            "success"
        );


        return;
    }


    // ----------------------------------------------------
    // ADD MODE
    // ----------------------------------------------------

    const systemId =
        SystemIdGenerator.generate();


    const member = {

    username: systemId,

    systemId: systemId,

    name: name,

    age:
        age
            ? Number(age)
            : "",

    gender: gender,

    relationship: relationship,

    familyId: familyId,

    isHead: false,

    status: "active",

    createdAt:
        new Date().toISOString()

};


    // Save Member Profile
    MemberStorage.add(member);


    // Add Member to Family
    FamilyStorage.addMember(
        familyId,
        member
    );

    if (relationshipLink) {

    RelationshipStorage.addRelationship({

        familyId: familyId,

        memberId: systemId,

        relatedMemberId: relationshipLink,

        relationshipType:
            relationship.toLowerCase()

    });

}

    // Reset UI
    resetMemberForm();


    const memberFormContainer =
        document.getElementById(
            "memberFormContainer"
        );

    if (memberFormContainer) {

        memberFormContainer.classList.add(
            "hidden"
        );

    }


    loadFamily();


    showMessage(
        `${systemId} added successfully.`,
        "success"
    );

}


    // --------------------------------------------------------
    // 18. Family Information
    // --------------------------------------------------------

    function saveFamilyInformation() {

    const familyName =
        document
            .getElementById("familyName")
            ?.value
            .trim() || "";

    const village =
        document
            .getElementById("familyVillage")
            ?.value
            .trim() || "";

    const familyStatus =
        document
            .getElementById("familyStatus")
            ?.value || "active";


    // ----------------------------------------------------
    // Validation
    // ----------------------------------------------------

    if (!familyName) {

        showMessage(
            "Please enter family name.",
            "error"
        );

        return;

    }


    if (!village) {

        showMessage(
            "Please enter village name.",
            "error"
        );

        return;

    }


    if (
        familyStatus !== "active" &&
        familyStatus !== "inactive"
    ) {

        showMessage(
            "Invalid family status.",
            "error"
        );

        return;

    }


    // ----------------------------------------------------
    // Save Family Metadata
    // ----------------------------------------------------

    FamilyStorage.updateFamilyMetadata(
        familyId,
        {

            familyName:
                familyName,

            village:
                village,

            status:
                familyStatus

        }
    );


    // ----------------------------------------------------
    // Refresh UI
    // ----------------------------------------------------

    loadFamily();


    showMessage(
        "Family information saved successfully.",
        "success"
    );

}


    // --------------------------------------------------------
    // 19. Reset Member Form
    // --------------------------------------------------------

    function resetMemberForm() {

        const form =
            document.getElementById(
                "memberForm"
            );


        if (form) {

            form.reset();

        }

    }


    // --------------------------------------------------------
    // 20. Message
    // --------------------------------------------------------

    function showMessage(message, type) {

        const box =
            document.getElementById(
                "familyMessage"
            );

        const text =
            document.getElementById(
                "familyMessageText"
            );


        if (!box || !text) {

            if (type === "error") {

                console.error(message);

            } else {

                console.log(message);

            }

            return;

        }


        text.textContent = message;

        box.classList.remove("hidden");


        setTimeout(function () {

            box.classList.add("hidden");

        }, 4000);

    }


    // --------------------------------------------------------
    // 21. HTML Safety
    // --------------------------------------------------------

    function escapeHtml(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }

    initRelationshipEvents();
    console.log(
        "family.js loaded successfully"
    );

});


function loadMemberRelationships(memberId) {


    const relationships =
        RelationshipStorage.getMemberRelationships(memberId);


    const container =
        document.getElementById(
            `relationships-${memberId}`
        );


    if(!container) return;


    if(relationships.length === 0){

        container.innerHTML =
        "No relationships added";

        return;

    }


    container.innerHTML =
        relationships.map(r => {

            return `
            <div>
            ${r.relationshipType}
            : ${r.relatedMemberId}
            </div>
            `;

        }).join("");

}

function loadRelationshipMembers(currentSystemId) {

    const select =
        document.getElementById(
            "relatedMemberSelect"
        );

    if (!select) return;

    select.innerHTML = "";

    const members =
        FamilyStorage.getFamily(familyId);

    members.forEach(function (member) {

        if (
            member.systemId === currentSystemId
        ) {
            return;
        }

        if (
            member.status &&
            member.status !== "active"
        ) {
            return;
        }

        const option =
            document.createElement("option");

        option.value =
            member.systemId;

        option.textContent =
            `${member.name} (${member.systemId})`;

        select.appendChild(option);

    });

}

function initRelationshipEvents() {

    const saveBtn =
        document.getElementById(
            "saveRelationshipBtn"
        );

    if (saveBtn) {

        saveBtn.onclick = function () {

            const memberId =
                document.getElementById(
                    "relationshipMemberId"
                ).value;

            const relatedMemberId =
                document.getElementById(
                    "relatedMemberSelect"
                ).value;

            const relationshipType =
                document.getElementById(
                    "relationshipType"
                ).value;

            if (!relatedMemberId) {

                alert(
                    "Please select related member."
                );

                return;

            }

            if (!relationshipType) {

                alert(
                    "Please select relationship."
                );

                return;

            }

            const result =
                RelationshipStorage.addRelationship({

                    familyId:
                        familyId,

                    memberId:
                        memberId,

                    relatedMemberId:
                        relatedMemberId,

                    relationshipType:
                        relationshipType

                });

            if (!result.success) {

                alert(result.message);

                return;

            }

            document.getElementById(
                "relationshipModal"
            ).style.display = "none";

            loadFamily();

        };

    }

    const closeBtn =
        document.getElementById(
            "closeRelationshipBtn"
        );

    if (closeBtn) {

        closeBtn.onclick = function () {

            document.getElementById(
                "relationshipModal"
            ).style.display = "none";

        };

    }

}