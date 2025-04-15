import { create } from "zustand";
import axiosInstance from "../libs/axios";
import toast from "react-hot-toast";

const useWalletStore = create((set, get) => ({
    wallet: null,
    balance: 0,
    currency: "INR",
    transactions: [],
    isLoading: false,
    error: null,

    createWallet: async (userId) => {
        try {
            set({ isLoading: true, error: null });
            const response = await axiosInstance.post('/wallet/create', { userId });
            set({ 
                wallet: response.data.wallet,
                balance: response.data.wallet.balance,
                currency: response.data.wallet.currency
            });
            toast.success(response.data.message);
            return true;
        } catch (err) {
            set({ error: err.response?.data?.message || "Failed to create wallet" });
            toast.error(err.response?.data?.message || "Failed to create wallet");
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    addMoney: async (userId, amount, description = "") => {
        try {
            set({ isLoading: true, error: null });
            const response = await axiosInstance.post('/wallet/deposit', { 
                userId, 
                amount: Number(amount), 
                description 
            });
            set({ 
                balance: response.data.balance,
                transactions: [...get().transactions, response.data.transaction]
            });
            toast.success(response.data.message);
            return true;
        } catch (err) {
            set({ error: err.response?.data?.message || "Failed to add money" });
            toast.error(err.response?.data?.message || "Failed to add money");
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    withdrawMoney: async (userId, amount, description = "") => {
        try {
            set({ isLoading: true, error: null });
            const response = await axiosInstance.post('/wallet/withdraw', { 
                userId, 
                amount: Number(amount), 
                description 
            });
            set({ 
                balance: response.data.balance,
                transactions: [...get().transactions, response.data.transaction]
            });
            toast.success(response.data.message);
            return true;
        } catch (err) {
            set({ error: err.response?.data?.message || "Failed to withdraw money" });
            toast.error(err.response?.data?.message || "Failed to withdraw money");
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    getWalletBalance: async (userId) => {
        try {
            set({ isLoading: true, error: null });
            const response = await axiosInstance.get(`/wallet/balance/${userId}`);
            set({ 
                balance: response.data.balance,
                currency: response.data.currency
            });
            return response.data;
        } catch (err) {
            set({ error: err.response?.data?.message || "Failed to get balance" });
            toast.error(err.response?.data?.message || "Failed to get balance");
            return null;
        } finally {
            set({ isLoading: false });
        }
    },

    getTransactions: async (userId) => {
        try {
            set({ isLoading: true, error: null });
            const response = await axiosInstance.get(`/wallet/transactions/${userId}`);
            set({ 
                balance: response.data.balance,
                currency: response.data.currency,
                transactions: response.data.transactions
            });
            return response.data.transactions;
        } catch (err) {
            set({ error: err.response?.data?.message || "Failed to get transactions" });
            toast.error(err.response?.data?.message || "Failed to get transactions");
            return [];
        } finally {
            set({ isLoading: false });
        }
    },

    resetWalletStore: () => {
        set({
            wallet: null,
            balance: 0,
            currency: "INR",
            transactions: [],
            error: null
        });
    }
}));

export default useWalletStore;
