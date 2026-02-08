"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("expo/config-plugins");
const withBackgroundAudio = (config) => {
    /**
     * =====================
     * iOS
     * =====================
     */
    config = (0, config_plugins_1.withInfoPlist)(config, (config) => {
        var _a, _b;
        const infoPlist = config.modResults;
        // Enable background audio
        infoPlist.UIBackgroundModes = Array.from(new Set([...((_a = infoPlist.UIBackgroundModes) !== null && _a !== void 0 ? _a : []), "audio"]));
        // Microphone permission
        infoPlist.NSMicrophoneUsageDescription =
            (_b = infoPlist.NSMicrophoneUsageDescription) !== null && _b !== void 0 ? _b : "This app records meetings to generate transcripts.";
        return config;
    });
    /**
     * =====================
     * Android
     * =====================
     */
    config = (0, config_plugins_1.withAndroidManifest)(config, (config) => {
        var _a, _b, _c;
        const manifest = config.modResults.manifest;
        /**
         * Permissions
         */
        const permissions = (_a = manifest["uses-permission"]) !== null && _a !== void 0 ? _a : [];
        const ensurePermission = (name) => {
            if (!permissions.find((p) => p.$["android:name"] === name)) {
                permissions.push({
                    $: { "android:name": name },
                });
            }
        };
        ensurePermission("android.permission.RECORD_AUDIO");
        ensurePermission("android.permission.FOREGROUND_SERVICE");
        ensurePermission("android.permission.FOREGROUND_SERVICE_MICROPHONE");
        manifest["uses-permission"] = permissions;
        /**
         * Foreground service
         */
        const application = (_b = manifest.application) === null || _b === void 0 ? void 0 : _b[0];
        if (!application)
            return config;
        application.service = (_c = application.service) !== null && _c !== void 0 ? _c : [];
        const hasService = application.service.find((s) => s.$["android:name"] === "expo.modules.av.AudioRecordingService");
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
exports.default = withBackgroundAudio;
