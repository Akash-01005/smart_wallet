import { create } from "zustand";
import axiosInstance from "../libs/axios";
import toast from "react-hot-toast";

const useAuthStore = create((set)=>({
       user:null,
       isLoading: false,
       error:null,
       message: null,

       logIn: async(data)=>{
        try{
            set({isLoading:true});
            const response = await axiosInstance.post('/auth/login',data);
            toast.success(response.data?.message)
            set({user:response.data?.user});
        }catch(err){
            set({error:err.response?.data?.message});
        }finally{
            set({isLoading:false});
        }
       },
       checkAuth: async()=>{
        try{
            set({isLoading:true});
            const response = await axiosInstance.get('/auth/checkuser');
            set({message:response.data?.message,user:response.data?.user});
        }catch(err){
            set({error:err.response?.data?.message});
        }finally{
            set({isLoading:false});
        }
       },
       signUp: async(data)=>{
        try{
            set({isLoading:true});
            const response = await axiosInstance.post('/auth/signup',data);
            toast.success(response.data?.message || "Signup successful!");
            set({message:response.data?.message});
            return true;
        }catch(err){
            set({error:err.response?.data?.message});
            return false;
        }finally{
            set({isLoading:false});
        }
       },
       logOut: async()=>{
        try {
          set({isLoading:true});
          const response = await axiosInstance.delete('/auth/logout');
          set({message:response.data?.message,user:response.data?.user});  
        }catch(err){
            set({error:err.response?.data?.message});   
        }
        finally{
           set({isLoading:false});
        }
       }
}));

export default useAuthStore;