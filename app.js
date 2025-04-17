'use client';

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const contractABI = [

    {
        "inputs": [
            {
                "internalType": "address",
                "name": "friend_key",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "name",
                "type": "string"
            }
        ],
        "name": "addFriend",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "pubkey",
                "type": "address"
            }
        ],
        "name": "checkUserExists",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "name",
                "type": "string"
            }
        ],
        "name": "createAccount",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getMyFriendList",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "pubkey",
                        "type": "address"
                    },
                    {
                        "internalType": "string",
                        "name": "name",
                        "type": "string"
                    }
                ],
                "internalType": "struct Database.friend[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "pubkey",
                "type": "address"
            }
        ],
        "name": "getUsername",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "friend_key",
                "type": "address"
            }
        ],
        "name": "readMessage",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "sender",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "timestamp",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "msg",
                        "type": "string"
                    }
                ],
                "internalType": "struct Database.message[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "friend_key",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "_msg",
                "type": "string"
            }
        ],
        "name": "sendMessage",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

let web3;
let contract;
let accounts;

window.onload = async () => {
    if (window.ethereum) {
        try {
            web3 = new Web3(window.ethereum);
            await window.ethereum.request({ method: "eth_requestAccounts" });
            accounts = await web3.eth.getAccounts();
            contract = new web3.eth.Contract(contractABI, contractAddress);

            console.log("Connected to account:", accounts[0]);

            // Detect account changes in MetaMask
            window.ethereum.on("accountsChanged", async (newAccounts) => {
                accounts = newAccounts;
                console.log("Switched to account:", accounts[0]);
                alert("Account switched to: " + accounts[0]);
            });

        } catch (error) {
            console.error("Error initializing Web3:", error);
            alert("Failed to connect to MetaMask.");
        }
    } else {
        alert("Please install MetaMask!");
    }
};


// Create Account
async function createAccount() {
    const username = prompt("Enter your username:");
    if (!username) {
        alert("Username cannot be empty!");
        return;
    }

    try {
        await contract.methods.createAccount(username).send({ from: accounts[0] });
        alert("Account created successfully!");

        // Display the registered address on the page
        document.getElementById("accountAddress").innerText = "Your Address: " + accounts[0];

    } catch (error) {
        console.error("Error creating account:", error);
        alert("Failed to create account.");
    }
}


// Get Username
async function getUsername() {
    if (!contract || !accounts || accounts.length === 0) {
        alert("Contract not initialized. Please refresh the page.");
        return;
    }

    try {
        const username = await contract.methods.getUsername(accounts[0]).call();
        alert("Your username: " + username);
    } catch (error) {
        console.error("Error fetching username:", error);
        alert("Failed to fetch username. Check console for details.");
    }
}

// Add Friend
async function addFriend() {
    if (!contract || !accounts || accounts.length === 0) {
        alert("Contract not initialized. Please refresh the page.");
        return;
    }

    const friendAddress = document.getElementById("friendAddress").value;
    const friendName = document.getElementById("friendName").value;

    if (!friendAddress || !friendName) {
        alert("Please enter both fields.");
        return;
    }

    try {
        const isUserRegistered = await contract.methods.checkUserExists(accounts[0]).call();
        if (!isUserRegistered) {
            alert("You must create an account first!");
            return;
        }

        const isFriendRegistered = await contract.methods.checkUserExists(friendAddress).call();
        if (!isFriendRegistered) {
            alert("The user you're trying to add is not registered.");
            return;
        }

        await contract.methods.addFriend(friendAddress, friendName).send({ from: accounts[0] });
        alert("Friend added successfully!");
    } catch (error) {
        console.error("Error adding friend:", error);
        alert("Transaction failed. Check console for details.");
    }
}

// Send Message
async function sendMessage() {
    if (!contract || !accounts || accounts.length === 0) {
        alert("Contract not initialized. Please refresh the page.");
        return;
    }

    const friendAddress = document.getElementById("chatFriendAddress").value;
    const message = document.getElementById("messageInput").value;

    if (!friendAddress || !message) {
        alert("Please enter both fields.");
        return;
    }

    try {
        const isUserRegistered = await contract.methods.checkUserExists(accounts[0]).call();
        if (!isUserRegistered) {
            alert("You must create an account first!");
            return;
        }

        const isFriendRegistered = await contract.methods.checkUserExists(friendAddress).call();
        if (!isFriendRegistered) {
            alert("The user you're trying to message is not registered.");
            return;
        }

        await contract.methods.sendMessage(friendAddress, message).send({ from: accounts[0] });
        document.getElementById("messageInput").value = "";
        alert("Message sent successfully!");
        setTimeout(readMessages, 1500); // wait 1.5 seconds
        await readMessages();
    } catch (error) {
        console.error("Error sending message:", error);
        alert("Transaction failed. Check console for details.");
    }
}

// Read Messages
async function readMessages() {
    if (!contract || !accounts || accounts.length === 0) {
        alert("Contract not initialized. Please refresh the page.");
        return;
    }

    const friendAddress = document.getElementById("chatFriendAddress").value;
    if (!friendAddress) {
        alert("Enter friend's address to load messages.");
        return;
    }

    try {
        const isUserRegistered = await contract.methods.checkUserExists(accounts[0]).call();
        if (!isUserRegistered) {
            alert("You must create an account first!");
            return;
        }

        const isFriendRegistered = await contract.methods.checkUserExists(friendAddress).call();
        if (!isFriendRegistered) {
            alert("The user you're trying to message is not registered.");
            return;
        }


        //console.log("Sending message from:", accounts[0], "to:", friendAddress, "Message:", messages);

        const messages = await contract.methods.readMessage(friendAddress).call({ from: accounts[0] });
        //console.log("Messages:", messages);


        const messageBox = document.getElementById("messageBox"); // or whatever your container is called
        messageBox.innerHTML = ""; // Clear old messages if needed

        messages.forEach((msg) => {
            const sender = msg[0];
            const timestamp = parseInt(msg[1]);
            const text = msg[2];

            const messageElement = document.createElement("div");
            messageElement.className = sender.toLowerCase() === accounts[0].toLowerCase() ? "message sender" : "message receiver";

            messageElement.innerHTML = `
    <strong>${sender.substring(0, 6)}</strong>: ${text} <br/>
    <small>${new Date(timestamp * 1000).toLocaleString()}</small>
  `;

            messageBox.appendChild(messageElement);
        });
    } catch (error) {
        console.error("Error reading messages:", error);
        alert("Could not load messages. Check console for details.");
    }
}

async function displayMessages() {
    const friendAddress = "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097";
    const myAddress = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";

    const messages = await contract.methods.readMessage(friendAddress).call({ from: myAddress });

    const container = document.getElementById("messageBox");
    container.innerHTML = "";

    if (messages.length === 0) {
        container.innerText = "No messages.";
        return;
    }

    messages.forEach(m => {
        const sender = m.sender || m[0];
        const timestamp = m.timestamp || m[1];
        const text = m.msg || m[2];

        const div = document.createElement("div");
        div.innerHTML = `<strong>${sender}</strong> <br><small>${new Date(timestamp * 1000).toLocaleString()}</small><br>${text}<hr>`;
        container.appendChild(div);
    });
}

//jesna  : 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
//harsh  : 0xdf3e18d64bc6a983f673ab319ccae4f1a57c7097
