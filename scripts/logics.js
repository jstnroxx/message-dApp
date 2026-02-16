const messageUpdateForm = document.getElementById("update-message-form");
const messageInput = document.getElementById("message-input");
const messageUpdateButton = document.getElementById("message-update-button");
const messageHolder = document.getElementById("current-message");
const connectWalletButton = document.getElementById("connect-wallet");
const connectedWalletLabel = document.getElementById("marked");

const CONTRACT_ADDRESS = "0xC7E8869f1925aa3F300F5CaCA892f989a0AAb68F";
const CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_newMessage",
				"type": "string"
			}
		],
		"name": "setMessage",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_initialMessage",
				"type": "string"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "myMessage",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

let userAccount;
let contract;

// Connect wallet button logic
connectWalletButton.addEventListener("click", async () => {
    if (!window.ethereum) {
        alert("Please, install MetaMask!");

        return;
    } 

    if (userAccount) {
        return;
    }
    else {
        let _userAccounts; 

        try {
            _userAccounts = await window.ethereum.request({ method : "eth_requestAccounts" });
        } catch(error) {
            if (error.code == 4001) {
                console.log("User has rejected the connection request.");
            } else {
                console.log(error);
            }

            return;
        }
        
        location.reload();
    }
});

// Submit the message update form
messageUpdateForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    if (!window.ethereum) return;

    if (userAccount) {
		messageUpdateButton.disabled = true;
		messageUpdateButton.textContent = "Sending...";
		messageUpdateButton.style.opacity = 0.5;
		messageUpdateButton.style.cursor = "default";
		
		try {
			const _newMessage = messageInput.value;
			const _transaction = await contract.setMessage(_newMessage);
			await _transaction.wait();
		} catch(error) {
			console.log(error);
			return;
		}
    }
    else {
        alert("Connect the MetaMask first!");
    }

	location.reload();
});

// Update values and variables upon page refresh
window.addEventListener("load", async () => {
    if (!window.ethereum) return;

    const _userAccounts = await window.ethereum.request({ method : "eth_accounts" });

    if (_userAccounts.length > 0) {
        userAccount = _userAccounts[0];

		connectedWalletLabel.textContent = userAccount;
		connectWalletButton.disabled = true;

		const _provider = new ethers.providers.Web3Provider(window.ethereum);
		const _signer = _provider.getSigner();

		contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, _signer);
		
        let _messageReceived;

		try {
			_messageReceived = await contract.myMessage();
		} catch(error) {
			console.log(error);
			return;
		}

		messageHolder.textContent = _messageReceived;
    }
});

// Listen for wallet disconnection
window.ethereum.on("accountsChanged", () => {
    location.reload();
});