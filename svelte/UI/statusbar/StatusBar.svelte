<script>
import LucideIcon from "../design/WLucideIcon.svelte";

//
let signal = navigator.onLine ? (navigator?.connection?.effectiveType || "4g") : "offline";
let battery = "battery-full";

//
const date = new Date();
let timeMinutes = `${date.getMinutes()}`.padStart(2,"0");
let timeHours = `${date.getUTCHours()}`.padStart(2,"0");

//
setInterval(()=>{
    const date = new Date();
    timeMinutes = `${date.getMinutes()}`.padStart(2,"0");
    timeHours = `${date.getUTCHours()}`.padStart(2,"0");
}, 500);

//
const changeSignal = ()=>{
    if (navigator.onLine) {
        signal = navigator?.connection?.effectiveType || "4g";
    } else {
        signal = "offline";
    }
}

//
const batteryIcons = new Map([
    [0, "battery-warning"],
    [25, "battery"],
    [50, " battery-low"],
    [75, "battery-medium"],
    [100, "battery-full"],
]);

//
const byLevel = (lv = 1.0)=>{
    return batteryIcons.get(Math.ceil(lv / 0.25) * 25);
}

//
const batteryStatus = navigator.getBattery?.();

//
const changeBatteryStatus = ()=>{
    batteryStatus?.then?.((btr)=>{
        if (btr.charging) 
            { battery = "battery-charging"; }  else
            { battery = byLevel(btr.level); };
    }).catch(console.warn.bind(console));
}

//
batteryStatus?.then?.((btr)=>{
    btr.addEventListener("chargingchange", changeBatteryStatus);
    btr.addEventListener("levelchange", changeBatteryStatus);
});

//
navigator.connection?.addEventListener("change", changeSignal);

//
changeBatteryStatus();
changeSignal();

//
const signalIcons = {
    "offline": "wifi-off",
    "4g": "wifi",
    "3g": "wifi-high",
    "2g": "wifi-low",
    "slow-2g": "wifi-zero"
}

document.documentElement.addEventListener("contextmenu", (ev)=>{
	const target = ev.target;
	if ((target?.matches?.(".ux-status-bar") || target?.closest?.(".ux-status-bar"))) {
		ev.stopPropagation();
		ev.stopImmediatePropagation();
		ev.preventDefault();
	}
}, {capture: true});

</script>

<!-- -->
<div class="ux-status-bar">
    <div class="left"></div>
    <div class="center"></div>
    <div class="right">
        <div class="icon-wrap"><LucideIcon name={signalIcons[signal]||"wifi"}></LucideIcon></div>
        <div class="icon-wrap"><LucideIcon name={battery || "battery-full"}></LucideIcon></div>
        <div class="time"><span class="hours">{timeHours}</span>:<span class="minutes">{timeMinutes}</span></div>
    </div>
</div>
