import { createContext, useContext, useEffect, useState } from "react";
import { ID, Models } from "react-native-appwrite";
import { account } from "./appwrite";

type AuthContextType ={
    user: Models.User<Models.Preferences> | null;
    isLoadingUser: boolean;
    signIn: (email: string, password: string)=> Promise<string | null >;
    signUp: (email: string, password: string)=> Promise<string | null >;
    logOut: ()=> Promise<void>;
}

const AuthContext = createContext<AuthContextType| undefined>(undefined);

export function AuthContextProvider({children}: {children: React.ReactNode}){
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);

    useEffect(()=>{
        getUser();
    },[])
    const getUser = async ()=>{
        try {
            const session = await account.get()
            setUser(session);
        } catch (error) {
            setUser(null)
        }finally{
            setIsLoadingUser(false)
        }
    }
    const signUp = async (email:string, password:string)=>{
        try{
            await account.create(ID.unique(), email, password)
            await signIn(email, password)
            return null;
        }catch(error){
            if(error instanceof Error){
               return error.message
            }
            return "Something went wrong while signing up"
        }
    }

    const signIn = async (email: string, password: string)=>{
        try {
            await account.createEmailPasswordSession(email, password);
            getUser();
            return null;
        } catch (error) {
            if (error instanceof Error){
                return error.message;
            }
            return "Something went wrong while logging in"
        }
    }

    const logOut = async ()=>{
        try {
            await account.deleteSession('current');
            setUser(null);
        } catch (error) {
            console.log(error)
        }
    }
    return <AuthContext.Provider value={{user, isLoadingUser, signUp, signIn, logOut}}>{children}</AuthContext.Provider>
}

export const useAuth = ()=>{
    const context = useContext(AuthContext);
    if (!context){
        throw new Error("Use Auth must be inside of the auth provider!!")
    }
    return context;
}