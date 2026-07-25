/**
 * Introspect - Ek Prerna
 * Daily Nivedan Module Controller
 * Production Grade Vanilla JavaScript Implementation
 */

document.addEventListener("DOMContentLoaded", () => {
    // --------------------------------------------------------
    // 1. Initializations & Session Protection
    // --------------------------------------------------------
    initSessionDisplay();
    initMobileNavigation();
    initCurrentDateDisplay();
    initMotivationCard();
    initFormInteractions();
    loadYesterdayCommitment();
    loadTodayNivedanIfSaved();

    // --------------------------------------------------------
    // 2. Session Header Information
    // --------------------------------------------------------
    function initSessionDisplay() {
        const usernameDisplay = document.getElementById("usernameDisplay");
        const roleDisplay = document.getElementById("roleDisplay");
        const logoutBtn = document.getElementById("logoutBtn");

        if (typeof Session !== "undefined") {
            if (usernameDisplay) {
                usernameDisplay.textContent = Session.getUsername() || "User";
            }
            if (roleDisplay) {
                const role = Session.getRole() || "user";
                roleDisplay.textContent = role.charAt(0).toUpperCase() + role.slice(1);
            }
        }

        if (logoutBtn && typeof Session !== "undefined") {
            logoutBtn.addEventListener("click", () => {
                Session.logout();
            });
        }
    }

    // --------------------------------------------------------
    // 3. Mobile Navigation Toggle
    // --------------------------------------------------------
    function initMobileNavigation() {
        const menuToggleBtn = document.querySelector(".menu-toggle");
        const sidebar = document.querySelector(".dashboard-sidebar");

        if (menuToggleBtn && sidebar) {
            menuToggleBtn.addEventListener("click", () => {
                const isActive = sidebar.classList.toggle("active");
                menuToggleBtn.setAttribute("aria-expanded", isActive ? "true" : "false");
            });
        }
    }

    // --------------------------------------------------------
    // 4. Current Date Display
    // --------------------------------------------------------
    function initCurrentDateDisplay() {
        const dateContainer = document.getElementById("currentDateDisplay");
        if (dateContainer) {
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
            dateContainer.textContent = "📆 " + now.toLocaleDateString('en-US', options);
        }
    }

    // --------------------------------------------------------
    // 5. Today's Motivation Quotes Engine
    // --------------------------------------------------------
    function initMotivationCard() {
        const quotes = [
            { text: "Har chhota satkarya bhi Prabhu karya ki disha me ek bada kadam hai.", author: " Swadhyay Prem" },
            { text: "Atmachintan hi atmavikas ki pratham chabi hai.", author: " Swadhyay Chintan" },
            { text: "Satkarya se man shuddh hota hai, aur shuddh man se prerna janmati hai.", author: " Prerna Vichar" },
            { text: "Nishkam bhaav se kiya gaya karya prabhu ko prarthana jaisa swikaar hai.", author: " Ek Prerna" },
            { text: "Niyamit sadhana aur bhaavferi se vyaktitva me divyata aati hai.", author: " Introspect Prerna" }
        ];

        const quoteElem = document.getElementById("motivationMessage");
        const authorElem = document.getElementById("quoteAuthor");
        const refreshBtn = document.getElementById("refreshQuoteBtn");

        let currentIdx = 0;

        function setQuote(idx) {
            if (quoteElem && authorElem) {
                quoteElem.style.opacity = '0';
                setTimeout(() => {
                    quoteElem.textContent = `"${quotes[idx].text}"`;
                    authorElem.textContent = `—${quotes[idx].author}`;
                    quoteElem.style.opacity = '1';
                }, 200);
            }
        }

        if (refreshBtn) {
            refreshBtn.addEventListener("click", () => {
                currentIdx = (currentIdx + 1) % quotes.length;
                setQuote(currentIdx);
            });
        }
    }

    // --------------------------------------------------------
    // 6. Dynamic Form Field Visibility & Interactions
    // --------------------------------------------------------
    function initFormInteractions() {
        // Bhaavferi Toggles
        const bhaavferiRadios = document.querySelectorAll('input[name="bhaavferi"]');
        const bhaavferiHoursGroup = document.getElementById("bhaavferiHoursGroup");
        const bhaavferiReasonGroup = document.getElementById("bhaavferiReasonGroup");
        const bhaavferiHoursInput = document.getElementById("bhaavferiHours");

        bhaavferiRadios.forEach(radio => {
            radio.addEventListener("change", (e) => {
                if (e.target.value === "yes") {
                    bhaavferiHoursGroup.classList.remove("hidden");
                    bhaavferiReasonGroup.classList.add("hidden");
                    bhaavferiHoursInput.setAttribute("required", "required");
                } else {
                    bhaavferiHoursGroup.classList.add("hidden");
                    bhaavferiReasonGroup.classList.remove("hidden");
                    bhaavferiHoursInput.removeAttribute("required");
                }
            });
        });

        // Reading Toggles
        setupSectionToggle('input[name="reading"]', "readingDurationGroup");

        // Pravachan Toggles
        setupSectionToggle('input[name="pravachan"]', "pravachanNotesGroup");

        // Meeting Toggles
        setupSectionToggle('input[name="meeting"]', "meetingNotesGroup");

        // Kendra Toggles
        setupSectionToggle('input[name="kendra"]', "kendraNotesGroup");

        // Vrati Toggles
        setupSectionToggle('input[name="vrati"]', "vratiNotesGroup");

        // Prayer Toggles
        setupSectionToggle('input[name="prayer"]', "prayerDetailsGroup");

        // Default Future Planning Date setup (Tomorrow's Date as default)
        const nextBhaavferiDateInput = document.getElementById("nextBhaavferiDate");
        if (nextBhaavferiDateInput && !nextBhaavferiDateInput.value) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const formattedDate = tomorrow.toISOString().split('T')[0];
            nextBhaavferiDateInput.value = formattedDate;
            nextBhaavferiDateInput.setAttribute("min", new Date().toISOString().split('T')[0]);
        }

        // Form Submit Handler
        const nivedanForm = document.getElementById("nivedanForm");
        if (nivedanForm) {
            nivedanForm.addEventListener("submit", handleFormSubmission);
        }
    }

    function setupSectionToggle(radioSelector, groupTargetId) {
        const radios = document.querySelectorAll(radioSelector);
        const groupElem = document.getElementById(groupTargetId);

        radios.forEach(radio => {
            radio.addEventListener("change", (e) => {
                if (groupElem) {
                    if (e.target.value === "yes") {
                        groupElem.classList.remove("hidden");
                    } else {
                        groupElem.classList.add("hidden");
                    }
                }
            });
        });
    }

    // --------------------------------------------------------
    // 7. Yesterday's Commitment Card Loader
    // --------------------------------------------------------
    function loadYesterdayCommitment() {
        const statusText = document.getElementById("planningStatus");
        const statusBadge = document.getElementById("commitmentStatusBadge");
        const metaInfo = document.getElementById("commitmentMeta");
        const dateVal = document.getElementById("commitmentDateVal");
        const hoursVal = document.getElementById("commitmentHoursVal");

        const storedCommitments = getLocalStorageItem("introspect_nivedan_commitments");
        const todayStr = getTodayDateString();
        const yesterdayStr = getYesterdayDateString();

        if (!storedCommitments || Object.keys(storedCommitments).length === 0) {
            if (statusText) statusText.textContent = "No previous planning commitment recorded.";
            if (statusBadge) {
                statusBadge.textContent = "No Commitment";
                statusBadge.className = "status-pill status-info";
            }
            if (metaInfo) metaInfo.classList.add("hidden");
            return;
        }

        // Check if there is a commitment targeting yesterday or today
        let activeCommitment = storedCommitments[yesterdayStr] || storedCommitments[todayStr] || getLatestCommitment(storedCommitments);

        if (activeCommitment) {
            if (metaInfo) metaInfo.classList.remove("hidden");
            if (dateVal) dateVal.textContent = activeCommitment.date;
            if (hoursVal) hoursVal.textContent = `${activeCommitment.hours} Hrs`;

            // Check if today's log already fulfilled it
            const todayLog = getTodaySavedNivedan();
            if (todayLog && todayLog.bhaavferi === "yes" && parseFloat(todayLog.bhaavferiHours) >= parseFloat(activeCommitment.hours)) {
                if (statusText) statusText.textContent = `Achieved your goal of ${activeCommitment.hours} hours of Bhaavferi! Excellent effort!`;
                if (statusBadge) {
                    statusBadge.textContent = "Achieved";
                    statusBadge.className = "status-pill status-achieved";
                }
            } else if (todayLog && todayLog.bhaavferi === "yes") {
                if (statusText) statusText.textContent = `Completed ${todayLog.bhaavferiHours} hrs out of planned ${activeCommitment.hours} hrs. Keep striving!`;
                if (statusBadge) {
                    statusBadge.textContent = "Partial";
                    statusBadge.className = "status-pill status-pending";
                }
            } else if (todayLog && todayLog.bhaavferi === "no") {
                if (statusText) statusText.textContent = `Planned ${activeCommitment.hours} hrs for Bhaavferi, but was unable to complete. Reset for tomorrow!`;
                if (statusBadge) {
                    statusBadge.textContent = "Missed";
                    statusBadge.className = "status-pill status-missed";
                }
            } else {
                if (statusText) statusText.textContent = `Planned ${activeCommitment.hours} hrs for Bhaavferi on ${activeCommitment.date}. Fill today's record to update status.`;
                if (statusBadge) {
                    statusBadge.textContent = "Pending";
                    statusBadge.className = "status-pill status-pending";
                }
            }
        } else {
            if (statusText) statusText.textContent = "No previous planning commitment set.";
            if (statusBadge) {
                statusBadge.textContent = "None";
                statusBadge.className = "status-pill status-info";
            }
            if (metaInfo) metaInfo.classList.add("hidden");
        }
    }

    function getLatestCommitment(commitmentsObj) {
        const dates = Object.keys(commitmentsObj).sort();
        return dates.length > 0 ? commitmentsObj[dates[dates.length - 1]] : null;
    }

    // --------------------------------------------------------
    // 8. Pre-fill Today's Nivedan If Saved
    // --------------------------------------------------------
    function loadTodayNivedanIfSaved() {
        const todayData = getTodaySavedNivedan();
        if (!todayData) return;

        // Bhaavferi
        if (todayData.bhaavferi) {
            const radio = document.querySelector(`input[name="bhaavferi"][value="${todayData.bhaavferi}"]`);
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event("change"));
            }
        }
        if (todayData.bhaavferiHours) {
            const hrsInput = document.getElementById("bhaavferiHours");
            if (hrsInput) hrsInput.value = todayData.bhaavferiHours;
        }
        if (todayData.bhaavferiReason) {
            const reasonInput = document.getElementById("bhaavferiReason");
            if (reasonInput) reasonInput.value = todayData.bhaavferiReason;
        }
        if (todayData.nextBhaavferiDate) {
            const nextDate = document.getElementById("nextBhaavferiDate");
            if (nextDate) nextDate.value = todayData.nextBhaavferiDate;
        }
        if (todayData.nextBhaavferiHours) {
            const nextHours = document.getElementById("nextBhaavferiHours");
            if (nextHours) nextHours.value = todayData.nextBhaavferiHours;
        }

        // Reading
        setRadioAndGroup("reading", todayData.reading, "readingMinutes", todayData.readingMinutes);

        // Pravachan
        setRadioAndGroup("pravachan", todayData.pravachan, "pravachanNotes", todayData.pravachanNotes);

        // Meeting
        setRadioAndGroup("meeting", todayData.meeting, "meetingNotes", todayData.meetingNotes);

        // Kendra
        setRadioAndGroup("kendra", todayData.kendra, "kendraNotes", todayData.kendraNotes);

        // Vrati
        setRadioAndGroup("vrati", todayData.vrati, "vratiNotes", todayData.vratiNotes);

        // Prayer
        setRadioAndGroup("prayer", todayData.prayer, "prayerNotes", todayData.prayerNotes);

            if (todayData.prayerMode) {
                document.getElementById("prayerMode").value = todayData.prayerMode;
            }

        // Daily Reflection
        if (todayData.dailyReflection) {
            const refl = document.getElementById("dailyReflection");
            if (refl) refl.value = todayData.dailyReflection;
        }

            checkWeeklySelections();
        checkMonthlySelections();
    }

    function setRadioAndGroup(radioName, value, targetInputId, targetValue) {
        if (value) {
            const radio = document.querySelector(`input[name="${radioName}"][value="${value}"]`);
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event("change"));
            }
        }
        if (targetValue && targetInputId) {
            const elem = document.getElementById(targetInputId);
            if (elem) elem.value = targetValue;
        }
    }

    // --------------------------------------------------------
    // 9. Form Submission & Validation Logic
    // --------------------------------------------------------
    function handleFormSubmission(e) {
        e.preventDefault();

        // Required Sections Check
        const bhaavferiVal = getRadioValue("bhaavferi");
        const readingVal = getRadioValue("reading");
        const pravachanVal = getRadioValue("pravachan");
        const meetingVal = getRadioValue("meeting");
        const kendraVal = getRadioValue("kendra");
        const vratiVal = getRadioValue("vrati");
        const prayerVal = getRadioValue("prayer");

        if (
          !bhaavferiVal ||
          !readingVal ||
          !pravachanVal ||
          !meetingVal ||
          !kendraVal ||
          !vratiVal ||
          !prayerVal
           ) {
            showToast("Please answer all required Yes/No activity questions.", "error");
            return;
        }

        // Validate Bhaavferi hours if yes
        const bhaavferiHours = document.getElementById("bhaavferiHours")?.value;
        if (bhaavferiVal === "yes" && (!bhaavferiHours || parseFloat(bhaavferiHours) <= 0)) {
            showToast("Please enter valid hours for Bhaavferi.", "error");
            document.getElementById("bhaavferiHours")?.focus();
            return;
        }

        if (prayerVal === "yes") {

           const prayerMode = document.getElementById("prayerMode");

           if (!prayerMode.value) {

           showToast("Please select Prayer participation.", "error");

           prayerMode.focus();

           return;

         }

        }

        // Build Payload
        const nivedanPayload = {
            date: getTodayDateString(),
            timestamp: new Date().toISOString(),
            user: typeof Session !== "undefined" ? Session.getUsername() : "Guest",
            bhaavferi: bhaavferiVal,
            bhaavferiHours: bhaavferiVal === "yes" ? bhaavferiHours : "0",
            bhaavferiReason: document.getElementById("bhaavferiReason")?.value || "",
            nextBhaavferiDate: document.getElementById("nextBhaavferiDate")?.value || "",
            nextBhaavferiHours: document.getElementById("nextBhaavferiHours")?.value || "",
            reading: readingVal,
            readingMinutes: readingVal === "yes" ? (document.getElementById("readingMinutes")?.value || "0") : "0",
            pravachan: pravachanVal,
            pravachanNotes: document.getElementById("pravachanNotes")?.value || "",
            meeting: meetingVal,
            meetingNotes: document.getElementById("meetingNotes")?.value || "",
            kendra: kendraVal,
            kendraNotes: document.getElementById("kendraNotes")?.value || "",
            vrati: vratiVal,
            vratiNotes: document.getElementById("vratiNotes")?.value || "",
            prayer: prayerVal,
            prayerMode:  prayerVal === "yes"  ? document.getElementById("prayerMode")?.value || "" : "",
            prayerNotes: prayerVal === "yes"  ? document.getElementById("prayerNotes")?.value || "" : "",
            dailyReflection: document.getElementById("dailyReflection")?.value || ""
        };

        // Save Today's Nivedan
        saveTodayNivedan(nivedanPayload);

        // Save Future Commitment if set
        if (nivedanPayload.nextBhaavferiDate && nivedanPayload.nextBhaavferiHours) {
            saveFutureCommitment(nivedanPayload.nextBhaavferiDate, nivedanPayload.nextBhaavferiHours);
        }

        // Re-check yesterday's commitment status card
        loadYesterdayCommitment();

        // Toast Feedback & Smooth Scroll
        showToast("🙏 Nivedan saved successfully!", "success");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function getRadioValue(name) {
        const checkedRadio = document.querySelector(`input[name="${name}"]:checked`);
        return checkedRadio ? checkedRadio.value : null;
    }

    // --------------------------------------------------------
    // 10. LocalStorage Data Utilities
    // --------------------------------------------------------
    function saveTodayNivedan(data) {
        // Save using NivedanStorage module if available
        if (typeof NivedanStorage !== "undefined") {
            NivedanStorage.save(data);
        } else {
            localStorage.setItem("introspect_nivedan", JSON.stringify(data));
        }

        // Also append to history map
        let history = getLocalStorageItem("introspect_nivedan_history") || {};
        history[data.date] = data;
        localStorage.setItem("introspect_nivedan_history", JSON.stringify(history));
    }

    function saveFutureCommitment(targetDate, targetHours) {
        let commitments = getLocalStorageItem("introspect_nivedan_commitments") || {};
        commitments[targetDate] = {
            date: targetDate,
            hours: targetHours,
            createdAt: new Date().toISOString()
        };
        localStorage.setItem("introspect_nivedan_commitments", JSON.stringify(commitments));
    }

    function getTodaySavedNivedan() {
        const todayStr = getTodayDateString();
        const history = getLocalStorageItem("introspect_nivedan_history") || {};
        if (history[todayStr]) return history[todayStr];

        if (typeof NivedanStorage !== "undefined") {
            const latest = NivedanStorage.load();
            if (latest && latest.date === todayStr) return latest;
        }

        const fallback = getLocalStorageItem("introspect_nivedan");
        if (fallback && fallback.date === todayStr) return fallback;

        return null;
    }

    function getLocalStorageItem(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error("LocalStorage Parse Error for key:", key, e);
            return null;
        }
    }

    function getTodayDateString() {
        return new Date().toISOString().split('T')[0];
    }

    function getYesterdayDateString() {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d.toISOString().split('T')[0];
    }

    // --------------------------------------------------------
    // 11. Accessible Toast Notification System
    // --------------------------------------------------------
    function showToast(message, type = "success") {
        const toast = document.getElementById("toastNotification");
        const toastMessage = document.getElementById("toastMessage");
        const toastIcon = document.getElementById("toastIcon");

        if (!toast || !toastMessage) return;

        toastMessage.textContent = message;
        if (toastIcon) {
            toastIcon.textContent = type === "success" ? "✓" : "✕";
        }

        toast.className = `toast-notification toast-${type}`;
        
        setTimeout(() => {
            toast.classList.add("hidden");
        }, 4000);
    }

    function checkWeeklySelections() {

    const history = JSON.parse(
        localStorage.getItem("introspect_nivedan_history") || "{}"
    );

    const username = Session.getUsername();

    const today = new Date();

const weekStart = new Date(today);

weekStart.setHours(0, 0, 0, 0);
today.setHours(0, 0, 0, 0);

weekStart.setDate(today.getDate() - today.getDay());

    let pravachanDone = false;
    let kendraDone = false;

    Object.values(history).forEach(item => {
        console.log(item.date, item.kendra);

        if (item.user !== username) return;

        const d = new Date(item.date);
d.setHours(0, 0, 0, 0);

if (d >= weekStart && d <= today) {

    if (item.pravachan === "yes") {
        pravachanDone = true;
    }

    if (item.kendra === "yes") {
        kendraDone = true;
    }

}

    });

    if (pravachanDone) {

        document.getElementById("pravachanYes").checked = true;

        document.getElementById("pravachanYes").disabled = true;
        document.getElementById("pravachanNo").disabled = true;

    }

    if (kendraDone) {

        document.getElementById("kendraYes").checked = true;

        document.getElementById("kendraYes").disabled = true;
        document.getElementById("kendraNo").disabled = true;

    }

}

    function checkMonthlySelections() {

    const history = JSON.parse(
        localStorage.getItem("introspect_nivedan_history") || "{}"
    );

    const username = Session.getUsername();

    const today = new Date();

    const month = today.getMonth();
    const year = today.getFullYear();

    let vratiDone = false;

    Object.values(history).forEach(item => {

        if (item.user !== username) return;

        const d = new Date(item.date);

        if (
            d.getMonth() === month &&
            d.getFullYear() === year &&
            item.vrati === "yes"
        ) {
            vratiDone = true;
        }

    });

    if (vratiDone) {

        document.getElementById("vratiYes").checked = true;

        document.getElementById("vratiYes").disabled = true;
        document.getElementById("vratiNo").disabled = true;

        }

}
});