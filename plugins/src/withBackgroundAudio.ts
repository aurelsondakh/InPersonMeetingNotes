import {
  ConfigPlugin,
  withAndroidManifest,
  withInfoPlist,
} from "expo/config-plugins";

const withBackgroundAudio: ConfigPlugin = (config) => {
  /**
   * =====================
   * iOS
   * =====================
   */
  config = withInfoPlist(config, (config) => {
    const infoPlist = config.modResults;

    // Enable background audio
    infoPlist.UIBackgroundModes = Array.from(
      new Set([...(infoPlist.UIBackgroundModes ?? []), "audio"]),
    );

    // Microphone permission
    infoPlist.NSMicrophoneUsageDescription =
      infoPlist.NSMicrophoneUsageDescription ??
      "This app records meetings to generate transcripts.";

    return config;
  });

  /**
   * =====================
   * Android
   * =====================
   */
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    /**
     * Permissions
     */
    const permissions = manifest["uses-permission"] ?? [];

    const ensurePermission = (name: string) => {
      if (!permissions.find((p: any) => p.$["android:name"] === name)) {
        permissions.push({
          $: { "android:name": name },
        });
      }
    };

    ensurePermission("android.permission.RECORD_AUDIO");
    ensurePermission("android.permission.FOREGROUND_SERVICE");
    ensurePermission("android.permission.FOREGROUND_SERVICE_MICROPHONE");
    ensurePermission("android.permission.WAKE_LOCK");

    manifest["uses-permission"] = permissions;

    /**
     * Foreground service
     */
    const application = manifest.application?.[0];
    if (!application) return config;

    application.service = application.service ?? [];

    const hasService = application.service.find(
      (s: any) =>
        s.$["android:name"] === "expo.modules.av.AudioRecordingService",
    );

    if (!hasService) {
      application.service.push({
        $: {
          "android:name": "expo.modules.av.AudioRecordingService",
          "android:foregroundServiceType": "microphone",
          "android:exported": "false",
        },
      });
    }

    return config;
  });

  return config;
};

export default withBackgroundAudio;
