import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import AVATAR from "../assets/Male_Avatar.jpg"


export default function AppBar() {
    const { logout, username } = useAuth();

    return (
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 20px", borderBottom: "1px solid #ffffff30" }}>
            <div style={{ fontWeight: "bold", fontSize: "20px" }}>
                YapLM
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <img src={AVATAR} style={{ width: "20px", height: "20px", borderRadius: "50%" }} />
                    {username}
                </div>
                <button
                    onClick={logout}
                    style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "1px solid #ffffff30",
                        background: "transparent",
                        color: "white",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#ffffff20";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                    }}
                >
                    <FontAwesomeIcon icon={faSignOutAlt} />
                    Logout
                </button>
            </div>
        </div>
    )
}
