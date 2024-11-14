import { NextPage } from "next";
import { ChangeEvent, useEffect, useState } from "react";
import Wallet from "../components/Wallet";
import { useListen } from "../hooks/useListen";
import { useMetamask } from "../hooks/useMetamask";

interface ActionConfirmModal {
    action: "edit" | "delete" | "create";
    id: string;
    name: string;
    address: string;
    health: number;
    strength: number;
    rank: number;
}

interface ModalProps {
    data: ActionConfirmModal;
    title: string;
    message: string;
    onCancel: () => void;
    onConfirm: (params: ActionConfirmModal) => void;
}

type Player = {
    id: string;
    name: string;
    address: string;
    health: number;
    strength: number;
    rank: number;
};

const Home: NextPage = () => {
    const listen = useListen();
    const { dispatch } = useMetamask();

    const [players, setPlayers] = useState<Player[]>([]);
    const [dataAddPlayer, setDataAddPlayer] = useState<Omit<Player, "id" | "rank">>({
        name: "",
        address: "",
        health: 0,
        strength: 0,
    });
    const [showModal, setShowModal] = useState<ActionConfirmModal | null>(null);

    useEffect(() => {
        const dataPlayers = localStorage.getItem("data-players");
        if (!dataPlayers) {
            const defaultPlayers: Player[] = [
                {
                    id: "1",
                    name: "Lê Minh Phú",
                    address: "0xb16E68F8d0C735f97baE59F4Fc6548F00f3f8a71",
                    health: 100,
                    strength: 79,
                    rank: 1,
                },
                {
                    id: "2",
                    name: "Hồ Đức Quyến",
                    address: "0x2dF17Fc0F4090b58Db66EaD328d1B002FA6af452",
                    health: 100,
                    strength: 80,
                    rank: 2,
                },
                {
                    id: "3",
                    name: "Ngô Văn Nhớ",
                    address: "0xe7038f51a90",
                    health: 65,
                    strength: 55,
                    rank: 3,
                },
            ];
            localStorage.setItem("data-players", JSON.stringify(defaultPlayers));
            setPlayers(defaultPlayers);
        } else {
            setPlayers(JSON.parse(dataPlayers) || []);
        }

        if (typeof window !== undefined) {
            const ethereumProviderInjected =
                typeof window.ethereum !== "undefined";

            const isMetamaskInstalled =
                ethereumProviderInjected && Boolean(window.ethereum.isMetaMask);

            const local = window.localStorage.getItem("metamaskState");

            if (local) {
                listen();
            }

            const { wallet, balance } = local
                ? JSON.parse(local)
                : { wallet: null, balance: null };

            dispatch({
                type: "pageLoaded",
                isMetamaskInstalled,
                wallet,
                balance,
            });
        }
    }, []);

    const handleActionPlayer = (data: ActionConfirmModal) => {
        let updatedPlayers = [...players];
        const { action, ...dataAction } = data;

        if (action === "edit") {
            updatedPlayers = players.map((player) =>
                player.id === data.id ? { ...player, ...dataAction } : player
            );
        } else if (action === "delete") {
            updatedPlayers = players.filter((player) => player.id !== data.id);
        } else if (action === "create") {
            updatedPlayers = [
                ...players,
                {
                    id: String(players.length + 1),
                    ...dataAddPlayer,
                    rank: players.length + 1, // Xếp hạng mặc định khi thêm người chơi
                },
            ];
            setDataAddPlayer({
                name: "",
                address: "",
                health: 0,
                strength: 0,
            });
        }


        setShowModal(null);
        setPlayers(updatedPlayers);
        localStorage.setItem("data-players", JSON.stringify(updatedPlayers));
    };

    const handleChangeDataAdd = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDataAddPlayer((prevData) => ({ ...prevData, [name]: value }));
    };

    // Sắp xếp người chơi theo sức mạnh để tạo thứ hạng
    const rankedPlayers = [...players].sort((a, b) => b.strength - a.strength);

    return (
        <div className="py-16 bg-gradient-to-r from-teal-400 to-cyan-600">
            <Wallet>
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
                    <h1 className="text-4xl font-bold mb-8 text-center text-white">
                        Danh sách Player
                    </h1>

                    <div className="bg-white p-8 rounded-xl shadow-2xl mb-10">
                        <h2 className="text-2xl font-semibold text-teal-800 mb-6">
                            Thêm Player
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="mb-6">
                                <label
                                    htmlFor="name"
                                    className="block mb-3 text-base font-medium text-gray-700"
                                >
                                    Tên Player
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={dataAddPlayer.name}
                                    placeholder="Tên Player"
                                    className="border-2 border-teal-300 p-4 rounded-lg w-full bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    onChange={handleChangeDataAdd}
                                />
                            </div>

                            <div className="mb-6">
                                <label
                                    htmlFor="address"
                                    className="block mb-3 text-base font-medium text-gray-700"
                                >
                                    Địa chỉ Player
                                </label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={dataAddPlayer.address}
                                    placeholder="Địa chỉ Player"
                                    className="border-2 border-teal-300 p-4 rounded-lg w-full bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    onChange={handleChangeDataAdd}
                                />
                            </div>

                            <div className="mb-6">
                                <label
                                    htmlFor="health"
                                    className="block mb-3 text-base font-medium text-gray-700"
                                >
                                    Sức khỏe
                                </label>
                                <input
                                    type="number"
                                    id="health"
                                    name="health"
                                    value={dataAddPlayer.health}
                                    placeholder="Sức khỏe"
                                    className="border-2 border-teal-300 p-4 rounded-lg w-full bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    onChange={handleChangeDataAdd}
                                />
                            </div>

                            <div className="mb-6">
                                <label
                                    htmlFor="strength"
                                    className="block mb-3 text-base font-medium text-gray-700"
                                >
                                    Sức mạnh
                                </label>
                                <input
                                    type="number"
                                    id="strength"
                                    name="strength"
                                    value={dataAddPlayer.strength}
                                    placeholder="Sức mạnh"
                                    className="border-2 border-teal-300 p-4 rounded-lg w-full bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    onChange={handleChangeDataAdd}
                                />
                            </div>
                            //xếp hạng//
                            <div className="mb-6">
                                <label
                                    htmlFor="strength"
                                    className="block mb-3 text-base font-medium text-gray-700"
                                >
                                    xếp hạng
                                </label>
                                <input
                                    type="number"
                                    id="strength"
                                    name="strength"
                                    value={dataAddPlayer.strength}
                                    placeholder="Sức mạnh"
                                    className="border-2 border-teal-300 p-4 rounded-lg w-full bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    onChange={handleChangeDataAdd}
                                />
                            </div>

                            <div className="col-span-2 mt-6">
                                <button
                                    onClick={() =>
                                        handleActionPlayer({
                                            action: "create",
                                            ...dataAddPlayer,
                                            id: "",
                                            rank: 0, // Bạn có thể tính toán lại xếp hạng sau khi thêm
                                        })
                                    }
                                    className="w-full bg-teal-600 text-white p-4 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                >
                                    Thêm Player
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto shadow-2xl rounded-lg">
                        <table className="min-w-full table-auto bg-white border-collapse">
                            <thead className="bg-teal-700 text-white">
                                <tr>
                                <th className="px-6 py-3 text-center">Id</th>
                                    <th className="px-6 py-3 text-center">Xếp hạng</th>
                                    <th className="px-6 py-3 text-center">Tên Player</th>
                                    <th className="px-6 py-3 text-center">Địa chỉ</th>
                                    <th className="px-6 py-3 text-center">Sức khỏe</th>
                                    <th className="px-6 py-3 text-center">Sức mạnh</th>
                                    <th className="px-6 py-3 text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rankedPlayers.map((player, index) => (
                                    <tr key={player.id} className="bg-white border-b">
                                       <td className="px-6 py-3 text-center">{player.id}</td>
                                        <td className="px-6 py-3 text-center">{player.rank}</td>
                                        <td className="px-6 py-3 text-center">{player.name}</td>
                                        <td className="px-6 py-3 text-center">{player.address}</td>
                                        <td className="px-6 py-3 text-center">{player.health}</td>
                                        <td className="px-6 py-3 text-center">{player.strength}</td>
                                        <td className="px-6 py-3 text-center">
                                            <button
                                                onClick={() =>
                                                    setShowModal({
                                                        action: "edit",
                                                        ...player,
                                                    })
                                                }
                                                className="text-teal-600 hover:text-teal-800 mx-2"
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setShowModal({
                                                        action: "delete",
                                                        ...player,
                                                    })
                                                }
                                                className="text-red-600 hover:text-red-800 mx-2"
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Wallet>
        </div>
    );
};

export default Home;
