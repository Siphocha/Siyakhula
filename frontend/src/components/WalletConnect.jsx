import { useState } from "react";
import { ethers } from "ethers";

function WalletConnect() {

    const [wallet, setWallet] = useState("");
    const [balance, setBalance] = useState("");

    async function connect() {

        try {

            if (!window.ethereum)
                return alert("Please install MetaMask");

            const provider =
                new ethers.BrowserProvider(window.ethereum);

            await provider.send(
                "eth_requestAccounts",
                []
            );

            const signer =
                await provider.getSigner();

            const address =
                await signer.getAddress();

            const ethBalance =
                await provider.getBalance(address);

            setWallet(address);

            localStorage.setItem(
                "walletAddress",
                address
            );

            setBalance(
                ethers.formatEther(ethBalance)
            );

        } catch (err) {

            console.log(err);

            alert("Connection failed");
        }
    }

    return (

        <div className="bg-white p-6 rounded-xl shadow">

            <h2 className="text-xl font-bold mb-4">

                Wallet

            </h2>

            {!wallet ? (

                <button
                    onClick={connect}
                    className="bg-yellow-500 px-6 py-3 rounded-lg"
                >
                    Connect MetaMask
                </button>

            ) : (

                <div className="space-y-3">

                    <div>

                        <p className="font-semibold">
                            Address
                        </p>

                        <p className="text-sm break-all">
                            {wallet}
                        </p>

                    </div>

                    <div>

                        <p className="font-semibold">
                            ETH Balance
                        </p>

                        <p>
                            {balance}
                        </p>

                    </div>

                </div>

            )}

        </div>

    );
}

export default WalletConnect;