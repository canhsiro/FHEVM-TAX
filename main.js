import { createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = "0x11408744D57DfC18a170789B28F6F2d6F58A37d1";
const CONTRACT_ABI = [
  "function declare(externalEuint32 input, bytes proof)",
  "function getDeclaration() view returns (euint32)",
  "event Declared(address indexed user)"
];

let provider, signer, contract, userAddress, fhe;

async function init() {
  try {
    fhe = await createInstance(SepoliaConfig);
    document.getElementById("result").textContent = "FHE sẵn sàng! Kết nối ví để tiếp tục.";
  } catch (e) {
    document.getElementById("error").textContent = "Lỗi FHE: " + e.message;
  }
}
init();

window.connectWallet = async () => {
  if (!window.ethereum) return alert("Cài MetaMask!");
  try {
    await ethereum.request({ method: 'eth_requestAccounts' });
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    document.getElementById("walletInfo").innerHTML = `<strong>Đã kết nối:</strong> ${userAddress.slice(0,6)}...${userAddress.slice(-4)}`;
    document.getElementById("connectBtn").textContent = "NGẮT KẾT NỐI";
    document.getElementById("connectBtn").classList.add("connected");
    document.getElementById("declareBtn").disabled = false;
    loadData();
  } catch (e) { document.getElementById("error").textContent = e.message; }
};

async function loadData() {
  try {
    const enc = await contract.getDeclaration();
    if (enc !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
      const val = await fhe.decryptEuint32(enc, userAddress);
      document.getElementById("amount").value = (val / 100).toFixed(2);
    }
  } catch (e) { console.log("Chưa có dữ liệu"); }
}

window.declareOnChain = async () => {
  const amount = Math.round(parseFloat(document.getElementById("amount").value) * 100);
  if (!amount) return;

  document.getElementById("result").innerHTML = `<span class="loading">Đang mã hóa & gửi tx...</span>`;

  try {
    const input = fhe.createEncryptedInput(CONTRACT_ADDRESS, userAddress);
    input.add32(amount);
    const { handles, inputProof } = await input.encrypt();

    const tx = await contract.declare(handles[0], inputProof);
    await tx.wait();

    document.getElementById("result").textContent = "Đã ghi thành công! Bạn là tỷ phú rồi";
    fireConfetti();
  } catch (e) {
    document.getElementById("error").textContent = e.message.includes("rejected") ? "Bạn từ chối tx" : e.message;
  }
};

function fireConfetti() {
  const duration = 5 * 1000;
  const end = Date.now() + duration;
  (function frame() {
    confetti({ particleCount: 10, spread: 70, origin: { x: 0 } });
    confetti({ particleCount: 10, spread: 70, origin: { x: 1 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  }());
}

document.getElementById("connectBtn").onclick = () => {
  if (document.getElementById("connectBtn").classList.contains("connected")) location.reload();
  else connectWallet();
};

document.getElementById("declareBtn").onclick = declareOnChain;
