const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
    packagerConfig: {
        asar: true,
        name: 'Realtime Agent Lab',
    },
    rebuildConfig: {},
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {
                name: 'realtime-agent-lab',
                productName: 'Realtime Agent Lab',
                shortcutName: 'Realtime Agent Lab',
                createDesktopShortcut: true,
                createStartMenuShortcut: true,
            },
        },
        { name: '@electron-forge/maker-dmg', platforms: ['darwin'] },
        {
            name: '@reforged/maker-appimage',
            platforms: ['linux'],
            config: {
                options: {
                    name: 'Realtime Agent Lab',
                    productName: 'Realtime Agent Lab',
                    genericName: 'AI Agent Evaluation Tool',
                    description: 'Desktop harness for real-time multimodal AI agent testing and session replay',
                    categories: ['Development', 'Utility'],
                },
            },
        },
    ],
    plugins: [
        { name: '@electron-forge/plugin-auto-unpack-natives', config: {} },
        new FusesPlugin({
            version: FuseVersion.V1,
            [FuseV1Options.RunAsNode]: false,
            [FuseV1Options.EnableCookieEncryption]: true,
            [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
            [FuseV1Options.EnableNodeCliInspectArguments]: false,
            [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
            [FuseV1Options.OnlyLoadAppFromAsar]: true,
        }),
    ],
};
