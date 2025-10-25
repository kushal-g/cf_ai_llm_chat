import type { User } from '../db';
import AVATAR from "../assets/Male_Avatar.jpg"
interface AppBarProps {
    user: User | null;
}

export default function AppBar({ user }: AppBarProps) {

    return (
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 20px", borderBottom: "1px solid #ffffff30" }}>
            <div style={{ fontWeight: "bold", fontSize: "20px" }}>
                YapLM
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <img src={AVATAR} style={{ width: "20px", height: "20px", borderRadius: "50%" }} />
                {user?.firstName} {user?.lastName}
            </div>
        </div>
    )
}
