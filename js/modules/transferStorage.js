/*
=========================================================
Introspect - Transfer Storage Module
Version : RC-2 v1.0
Purpose : Preserve Member Transfer History
=========================================================
*/

const TransferStorage = (() => {

    const STORAGE_KEY = "introspect_transfer_history";

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

    function addTransfer(username, transferData) {

        const data = load();

        if (!data[username]) {

            data[username] = [];

        }

        data[username].push({

            ...transferData,

            transferredAt: new Date().toISOString()

        });

        save(data);

    }

    function getTransfers(username) {

        const data = load();

        return data[username] || [];

    }

    function getLatestTransfer(username) {

        const transfers = getTransfers(username);

        if (transfers.length === 0) {

            return null;

        }

        return transfers[transfers.length - 1];

    }

    function getAllTransfers() {

        return load();

    }

    function clearTransfers(username) {

        const data = load();

        delete data[username];

        save(data);

    }

    return {

        addTransfer,
        getTransfers,
        getLatestTransfer,
        getAllTransfers,
        clearTransfers

    };

})();