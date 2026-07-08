// Cignal TV Troubleshooting Data

export const boxModels = [
  {
    id: "sd-box",
    name: "Cignal SD Box",
    image: "/images/sd-box.png",
    issues: [
      {
        id: "no-signal",
        shortTitle: "No Signal / Blank Screen",
        description: "TV shows no signal, blank or black screen",
        sections: [
          {
            title: "Step 1 — Check Your Cables",
            steps: [
              "Make sure the coaxial cable from the satellite dish is firmly plugged into the back of the Cignal box (labeled 'LNB IN' or 'SAT IN').",
              "Check the HDMI or AV cable connecting the Cignal box to your TV. Try unplugging and re-plugging it.",
              "Try a different HDMI port on your TV if available.",
            ],
          },
          {
            title: "Step 2 — Check TV Input",
            steps: [
              "Press the INPUT or SOURCE button on your TV remote.",
              "Select the correct input where the Cignal box is connected (e.g., HDMI 1, AV, etc.).",
              "Make sure the TV is set to the correct mode.",
            ],
          },
          {
            title: "Step 3 — Restart the Box",
            steps: [
              "Unplug the Cignal box power cable from the socket.",
              "Wait for 10 to 15 seconds.",
              "Plug it back in and wait 1–2 minutes for it to fully boot.",
              "Check if the channels appear after restarting.",
            ],
          },
        ],
        note: "If the problem persists after all steps, the issue may be with the satellite dish alignment or LNB. Please contact support for a technician visit.",
      },
      {
        id: "weak-signal",
        shortTitle: "Weak or Pixelated Signal",
        description: "Channels are pixelated, freezing, or breaking up",
        sections: [
          {
            title: "Check Signal Level",
            steps: [
              "Press MENU on your remote and go to Setup > Signal Info.",
              "A signal strength of at least 60% and quality of at least 70% is needed for clear viewing.",
              "If signal is low, check if there are any obstructions around the dish (tree branches, debris).",
            ],
          },
          {
            title: "Weather-Related Issues",
            steps: [
              "Pixelation during rain or storm is normal — this is called 'rain fade'.",
              "Wait for the weather to clear. Signal usually returns within minutes after rain stops.",
              "If pixelation happens on clear days, the dish may need realignment.",
            ],
          },
        ],
        note: "If signal strength is consistently low on clear weather, your dish may need professional realignment. Contact support.",
      },
      {
        id: "remote-not-working",
        shortTitle: "Remote Control Not Working",
        description: "Remote has no response or only works up close",
        sections: [
          {
            title: "Basic Remote Fixes",
            steps: [
              "Replace the batteries with new AA batteries (make sure polarity is correct).",
              "Remove any objects blocking the path between the remote and the receiver.",
              "Clean the IR sensor on the front of the Cignal box with a dry cloth.",
              "Try pressing buttons while pointing directly at the box from 1–2 meters away.",
            ],
          },
          {
            title: "Reset the Remote",
            steps: [
              "Remove the batteries from the remote.",
              "Press and hold any button for 5 seconds to drain residual charge.",
              "Reinsert the batteries and test.",
            ],
          },
        ],
        note: "If the remote still does not work after battery replacement, the remote may be damaged. Contact support for a replacement.",
      },
      {
        id: "missing-channels",
        shortTitle: "Missing or No Channels",
        description: "Some or all channels have disappeared",
        sections: [
          {
            title: "Run a Channel Scan",
            steps: [
              "Press MENU on your remote control.",
              "Navigate to Setup > Satellite/Channel Search.",
              "Select Auto Scan or Full Scan.",
              "Wait 5–10 minutes for the scan to complete.",
              "Save the channels and check if they appear.",
            ],
          },
          {
            title: "Check Subscription",
            steps: [
              "Verify that your Cignal prepaid subscription is still active.",
              "If expired, reload your account via the CignalCare+ app or ask your dealer.",
              "After reloading, wait 15 minutes and then restart the box.",
            ],
          },
        ],
        note: "If channels are still missing after a scan and your subscription is active, please contact support.",
      },
    ],
  },
  {
    id: "hd-box",
    name: "Cignal HD Box",
    image: "/images/hd-box.png",
    issues: [
      {
        id: "no-hd-signal",
        shortTitle: "No HD Signal",
        description: "HD channels are not showing or displaying in SD quality",
        sections: [
          {
            title: "Check HDMI Connection",
            steps: [
              "Make sure you are using an HDMI cable (not AV/composite cables) for HD quality.",
              "Check that the HDMI cable is firmly connected to both the HD box and your TV.",
              "Try a different HDMI cable if available.",
            ],
          },
          {
            title: "Set Output Resolution",
            steps: [
              "Press MENU > Setup > Video Settings.",
              "Set the output resolution to 1080p or 720p (match your TV's native resolution).",
              "Save the settings and restart the box.",
            ],
          },
          {
            title: "Run Channel Scan for HD",
            steps: [
              "Press MENU > Setup > Satellite Search.",
              "Select Full Scan and wait for completion.",
              "HD channels will appear after the scan if your subscription includes HD.",
            ],
          },
        ],
        note: "HD channels require an active HD subscription. Standard (SD) plans will not show HD channels.",
      },
      {
        id: "error-e4-e5",
        shortTitle: "Smartcard Error (E4/E5)",
        description: "Screen shows Error E4 or E5 — Smartcard not detected",
        sections: [
          {
            title: "Reseat the Smartcard",
            steps: [
              "Turn off the Cignal HD box.",
              "Remove the smartcard from its slot (golden chip side facing down).",
              "Clean the gold contacts gently with a dry, lint-free cloth.",
              "Reinsert the smartcard firmly with the gold chip facing down.",
              "Turn the box back on and wait 2 minutes.",
            ],
          },
          {
            title: "Check Subscription Status",
            steps: [
              "If the smartcard is properly inserted but error persists, your subscription may have expired.",
              "Reload your account and restart the box.",
              "Wait up to 30 minutes for the system to activate.",
            ],
          },
        ],
        note: "If the smartcard error persists after reseating and reloading, the smartcard may be damaged. Please visit our office or contact support.",
      },
      {
        id: "no-sound",
        shortTitle: "No Sound / Audio Issue",
        description: "Video works but there is no audio from the TV",
        sections: [
          {
            title: "Check Audio Settings",
            steps: [
              "Make sure your TV is not muted. Press the MUTE button on your TV remote.",
              "Increase the TV volume and check the Cignal box audio output level.",
              "Press MENU > Setup > Audio Settings and ensure audio output is set correctly (HDMI or Optical).",
            ],
          },
          {
            title: "Test with Different Channel",
            steps: [
              "Switch to a different channel to verify if the issue is on all channels or just one.",
              "If only specific channels have no sound, the broadcast may be the issue.",
              "Try pressing AUDIO or LANG button on the remote to change audio track.",
            ],
          },
        ],
        note: "If no channels have sound after checking all settings, restart the box and TV. If problem persists, contact support.",
      },
    ],
  },
  {
    id: "dvr-box",
    name: "Cignal DVR Box",
    image: "/images/dvr-box.png",
    issues: [
      {
        id: "recording-failed",
        shortTitle: "Recording Not Working",
        description: "Cannot record or scheduled recordings are not saving",
        sections: [
          {
            title: "Check Storage Space",
            steps: [
              "Press MENU > My DVR > Storage Info.",
              "If storage is full, delete old recordings to free up space.",
              "DVR needs at least 10% free space to record properly.",
            ],
          },
          {
            title: "Check Recording Schedule",
            steps: [
              "Press MENU > My DVR > Scheduled Recordings.",
              "Verify the recording time, channel, and date are set correctly.",
              "Make sure the box is in standby mode (not fully off) at recording time.",
            ],
          },
          {
            title: "Reset DVR Settings",
            steps: [
              "Press MENU > Setup > DVR Settings.",
              "Select Reset DVR Schedule and confirm.",
              "Re-schedule your recordings after the reset.",
            ],
          },
        ],
        note: "Ensure the DVR box remains plugged in and in standby during scheduled recording times. Unplugging the box will prevent recordings.",
      },
      {
        id: "playback-error",
        shortTitle: "Playback Error",
        description: "Cannot play back recorded content or getting errors",
        sections: [
          {
            title: "Restart and Try Again",
            steps: [
              "Press MENU > My DVR > Recordings.",
              "Select the problematic recording and try playing it again.",
              "If it fails, restart the DVR box and try playback again.",
            ],
          },
          {
            title: "Check HDD Health",
            steps: [
              "Press MENU > Setup > Storage > HDD Info.",
              "Check if the HDD status shows 'Good' or 'Warning'.",
              "If the HDD shows errors or bad sectors, the drive may need replacement.",
            ],
          },
        ],
        note: "Recordings may be corrupted if the box was powered off unexpectedly during recording. Contact support if HDD errors are detected.",
      },
      {
        id: "dvr-slow",
        shortTitle: "DVR Slow or Freezing",
        description: "The DVR is running slowly or freezes during playback",
        sections: [
          {
            title: "Free Up Storage",
            steps: [
              "Delete recordings you no longer need.",
              "Clear the DVR buffer by going to MENU > Setup > Clear Buffer.",
              "Keep at least 20% storage free for optimal performance.",
            ],
          },
          {
            title: "Perform Soft Reset",
            steps: [
              "Unplug the DVR power cable from the wall outlet.",
              "Wait 30 seconds.",
              "Plug it back in and allow 2–3 minutes to fully restart.",
              "Avoid pressing any buttons during the startup process.",
            ],
          },
        ],
        note: "If slowness persists even with ample storage space, the DVR hard drive may be failing. Contact support.",
      },
    ],
  },
];
