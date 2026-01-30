"use client";

import {
  RiShieldCheckLine,
  RiTimeLine,
  RiCustomerService2Line,
  RiLightbulbFlashLine,
  RiLightbulbLine,
  RiHeartLine,
  RiStarLine,
  RiTruckLine,
  RiSecurePaymentLine,
  RiCustomerServiceLine,
  RiAwardLine,
  RiCheckLine,
  RiHome4Line,
  RiUserLine,
  RiSettings4Line,
  RiSearchLine,
  RiShoppingBagLine,
  RiPriceTag3Line,
  RiFlashlightLine,
  RiFireLine,
  RiLeafLine,
  RiGlobalLine,
  RiMapPin2Line,
  RiPhoneLine,
  RiMailLine,
  RiMessage2Line,
  RiThumbUpLine,
  RiFlagLine,
  RiBookmarkLine,
  RiCalendarLine,
  RiNotification3Line,
  RiVolumeUpLine,
  RiCameraLine,
  RiImageLine,
  RiFileTextLine,
  RiFolderLine,
  RiCloudLine,
  RiLink,
  RiShareLine,
  RiAddLine,
  RiSubtractLine,
  RiCloseLine,
  RiErrorWarningLine,
  RiQuestionLine,
  RiEdit2Line,
  RiDeleteBin6Line,
  RiSaveLine,
  RiPlayLine,
  RiWifiLine,
  RiBattery2Line,
  RiLockLine,
  RiEyeLine,
  RiFingerprintLine,
  RiCpuLine,
  RiDatabase2Line,
  RiServerLine,
  RiTerminalBoxLine,
  RiCodeSSlashLine,
  RiLayoutMasonryLine,
  RiListCheck,
  RiDashboardLine,
  RiMenuLine,
  RiApps2Line,
} from "react-icons/ri";

const iconMap = {
  RiShieldCheckLine,
  RiTimeLine,
  RiCustomerService2Line,
  RiLightbulbFlashLine,
  RiLightbulbLine,
  RiHeartLine,
  RiStarLine,
  RiTruckLine,
  RiSecurePaymentLine,
  RiCustomerServiceLine,
  RiAwardLine,
  RiCheckLine,
  RiHome4Line,
  RiUserLine,
  RiSettings4Line,
  RiSearchLine,
  RiShoppingBagLine,
  RiPriceTag3Line,
  RiFlashlightLine,
  RiFireLine,
  RiLeafLine,
  RiGlobalLine,
  RiMapPin2Line,
  RiPhoneLine,
  RiMailLine,
  RiMessage2Line,
  RiThumbUpLine,
  RiFlagLine,
  RiBookmarkLine,
  RiCalendarLine,
  RiNotification3Line,
  RiVolumeUpLine,
  RiCameraLine,
  RiImageLine,
  RiFileTextLine,
  RiFolderLine,
  RiCloudLine,
  RiLink,
  RiShareLine,
  RiAddLine,
  RiSubtractLine,
  RiCloseLine,
  RiErrorWarningLine,
  RiQuestionLine,
  RiEdit2Line,
  RiDeleteBin6Line,
  RiSaveLine,
  RiPlayLine,
  RiWifiLine,
  RiBattery2Line,
  RiLockLine,
  RiEyeLine,
  RiFingerprintLine,
  RiCpuLine,
  RiDatabase2Line,
  RiServerLine,
  RiTerminalBoxLine,
  RiCodeSSlashLine,
  RiLayoutMasonryLine,
  RiListCheck,
  RiDashboardLine,
  RiMenuLine,
  RiApps2Line,
};

const defaultIcon = RiShieldCheckLine;

export function getIconComponent(name) {
  if (!name || typeof name !== "string") return defaultIcon;
  const Icon = iconMap[name];
  return Icon || defaultIcon;
}

export function getIconOptions() {
  return Object.keys(iconMap).map((key) => {
    const Icon = iconMap[key];
    const labelText = key
      .replace(/^Ri/, "")
      .replace(/([A-Z])/g, " $1")
      .trim();
    return {
      value: key,
      label: (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Icon />
          <span>{labelText}</span>
        </div>
      ),
      searchLabel: labelText, // For filtering
    };
  });
}

export default iconMap;
