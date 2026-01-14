const connectBtn = document.getElementById("connectBtn");
const statusEl = document.getElementById("status");
const addressEl = document.getElementById("address");
const networkEl = document.getElementById("network");
const balanceEl = document.getElementById("balance");
const namaEl = document.getElementById("nama");
const nimEl = document.getElementById("nim");


let userAddress = null;
// simpan data address

let isConnected = false;
// mengetahui wallet sudah terkoneksi atau belum

const namaLengkap = "Owen Adriansyah";
const nim = "251011401279";

const AVALANCHE_FUJI_CHAIN_ID = "0xa869";


function formatAvaxBalance(balanceWei) {
    const blnc = parseInt(balanceWei, 16);
    console.log({ blnc });
    return (blnc / 1e18).toFixed(4);
}

// memendekan addres 
function shortenAddress(address) {
    return address.slice(0, 6) + "..." + address.slice(-4);
}

if (window.ethereum) {
    window.ethereum.on("accountsChanged", async (accounts) => {
    if(!isConnected) return;
    // cegah agar event tidak jalan kalau user belum connect

    console.log("accountsChanged:", accounts);

    if (accounts.length === 0) {
    statusEl.textContent = "Wallet disconnected ❌";
    statusEl.style.color = "#e84118";
    addressEl.textContent = "-";
    balanceEl.textContent = "-";
    networkEl.textContent = "-";
    namaEl.textContent = "-";
    nimEl.textContent = "-";
    connectBtn.disabled = false;
    connectBtn.textContent = "Connect Wallet";
    return;
    }

    // kalau ganti akun
    const address = accounts[0];
    addressEl.textContent = shortenAddress(address);
    namaEl.textContent = namaLengkap;
    nimEl.textContent = nim;
    userAddress = address; // update state


    console.log("Account Swicth to :", accounts[0]);
    console.log({userAddress});


    // ambil balance akun baru
    const balanceWei = await window.ethereum.request({
    method: "eth_getBalance",
    params: [address, "latest"],
    });

    balanceEl.textContent = formatAvaxBalance(balanceWei);
});
}


if (window.ethereum) {
    window.ethereum.on("chainChanged", (chainId) => {
    console.log("chainChanged:", chainId);
    // reload halaman agar state dan provider sinkron
    window.location.reload();
});
}


async function connectWallet() {
    if (typeof window.ethereum === "undefined") {
    alert("Core Wallet tidak terdeteksi. Silakan install Core Wallet.");
    return;
}
console.log("window.ethereum", window.ethereum);

try {
    statusEl.textContent = "Connecting...";

    // Request wallet accounts
    const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
    });

    const address = accounts[0];
    addressEl.textContent = shortenAddress(address);
    namaEl.textContent = namaLengkap;
    nimEl.textContent = nim;

    console.log({ address });

    // Get chainId
    const chainId = await window.ethereum.request({
        method: "eth_chainId",
    });

    // validasi network apakah avalanche fuji
    networkEl.textContent = chainId === AVALANCHE_FUJI_CHAIN_ID ? "Avalanche Fuji Testnet" : "Wrong Network ❌";
    
    console.log({ chainId });

    if (chainId === AVALANCHE_FUJI_CHAIN_ID) {
        isConnected = true; // set state jika network benar
        connectBtn.disabled = true; // cegah klik connect berkali-kali
        connectBtn.textContent = "Connected";
        networkEl.textContent = "Avalanche Fuji Testnet";
        statusEl.textContent = "Connected ✅";
        statusEl.style.color = "#4cd137";

      // Get AVAX balance
        const balanceWei = await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
    });
    
    console.log({ balanceWei });

    balanceEl.textContent = formatAvaxBalance(balanceWei);
    } else {
        networkEl.textContent = "Wrong Network ❌";
        statusEl.textContent = "Please switch to Avalanche Fuji";
        statusEl.style.color = "#fbc531";
        balanceEl.textContent = "-";
    }
} catch (error) {
    if (error.code === 4001) {
        statusEl.textContent = "Connection rejected by user ❌";
    } else {
        statusEl.textContent = "Connection failed ❌";
    }
    statusEl.style.color = "#e84118";
}
}

connectBtn.addEventListener("click", connectWallet);