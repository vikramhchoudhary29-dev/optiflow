import { NavLink, useNavigate } from "react-router-dom";
import BrandLogo from "../common/BrandLogo";

const Icon=({type})=><span className="platform-nav-icon" aria-hidden="true">{{shops:"▦",payments:"▣",plans:"◇",reminders:"♢"}[type]}</span>;
const links = [["Shops", "/platform","shops"], ["Payments", "/platform/payments","payments"], ["Plan controls", "/platform/plans","plans"], ["Reminders", "/platform/reminders","reminders"]];
export default function PlatformHeader() {
  const navigate = useNavigate();
  return <header className="platform-header"><div className="platform-header-inner"><BrandLogo dark className="platform-logo"/><nav className="platform-nav" aria-label="Platform navigation">{links.map(([label,path,icon])=><NavLink key={path} end={path==="/platform"} to={path} className={({isActive})=>`platform-nav-link ${isActive?"active":""}`}><Icon type={icon}/>{label}</NavLink>)}</nav><button className="platform-logout" onClick={()=>{localStorage.removeItem("platformToken");navigate("/platform/login")}}><span aria-hidden="true">↪</span> Logout</button></div></header>;
}
