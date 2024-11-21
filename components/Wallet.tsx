import Link from "next/link";
import { useListen } from "../hooks/useListen";
import { useMetamask } from "../hooks/useMetamask";
import { Loading } from "./Loading";
import { ReactNode } from "react";

const Wallet = ({ children }: { children: ReactNode }) => {
    const {
        dispatch,
        state: { status, isMetamaskInstalled, wallet, balance },
    } = useMetamask();
    const listen = useListen();

    const showConnectButton =
        status !== "pageNotLoaded" && isMetamaskInstalled && !wallet;

    const isConnected =
        status !== "pageNotLoaded" && typeof wallet === "string";

    const handleConnect = async () => {
        dispatch({ type: "loading" });
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });

        if (accounts.length > 0) {
            const balance = await window.ethereum!.request({
                method: "eth_getBalance",
                params: [accounts[0], "latest"],
            });
            dispatch({ type: "connect", wallet: accounts[0], balance });

            listen();
        }
    };

    const handleDisconnect = () => {
        dispatch({ type: "disconnect" });
    };

    return (
        <div className="max-w-[1000px] bg-gray-100 rounded-lg shadow-sm mx-auto">
            <div className="mx-auto py-16 px-4 text-center sm:py-20 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    <span className="block">Metamask</span>
                </h2>

                {wallet && balance && (
                    <div className="py-4  text-center">
                        <h3 className="text-xl font-medium">
                            Address: <span>{wallet}</span>
                        </h3>
                        <p className="text-lg pt-2">
                            Balance:{" "}
                            <span>
                                {(
                                    parseInt(balance) /
                                    1000000000000000000
                                ).toFixed(4)}{" "}
                                ETH
                            </span>
                        </p>
                    </div>
                )}

                {showConnectButton && (
                    <button
                        onClick={handleConnect}
                        className="mt-8 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-ganache px-5 py-3 text-base font-medium sm:w-auto"
                    >
                        {status === "loading" ? <Loading /> : "Connect Wallet"}
                    </button>
                )}

                {isConnected && (
                    <>
                        <div className="flex w-full justify-center space-x-2">
                            <button
                                onClick={handleDisconnect}
                                className="mt-8 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-ganache px-5 py-3 text-base font-medium sm:w-auto"
                            >
                                Disconnect
                            </button>
                        </div>
                        <div className="py-4">{children}</div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Wallet;
