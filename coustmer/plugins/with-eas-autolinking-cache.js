const { withSettingsGradle } = require('expo/config-plugins');

const SNIPPET = `// Drop a restored autolinking cache so EAS Linux does not reuse Windows paths.
def autolinkingCacheDir = new File(rootDir, "build/generated/autolinking")
if (!System.getProperty("os.name").toLowerCase().contains("windows")) {
  autolinkingCacheDir.deleteDir()
}

`;

/** EAS restores android/build after prebuild. Stale Windows paths yield "No variants exist". */
function withEasAutolinkingCacheReset(config) {
  return withSettingsGradle(config, (cfg) => {
    if (!cfg.modResults.contents.includes('autolinkingCacheDir')) {
      cfg.modResults.contents = SNIPPET + cfg.modResults.contents;
    }
    return cfg;
  });
}

module.exports = withEasAutolinkingCacheReset;
