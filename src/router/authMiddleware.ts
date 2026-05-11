import { redirect } from "react-router"
import useAuthStore from "../store/auth"
import { AccountService } from "../services/account";

export default async function authMiddleware() {
    const { user } = useAuthStore.getState();

    if(!user) {
        try {
            const result = await AccountService.getMe()
            useAuthStore.getState().setUser(result.data!)
        } catch {
            throw redirect("/login");
        }
    }
}