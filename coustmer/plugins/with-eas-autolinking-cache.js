const { withSettingsGradle } = require('expo/config-plugins');

const SNIPPET = `// Drop a restored autolinking cache so EAS Linux does not reuse Windows paths.
def autolinkingCacheDir = new File(rootDir, "build/generated/autolinking")
if (!System.getProperty("os.name").toLowerCase().contains("windows")) {
  autolinkingCacheDir.deleteDir()
}
`;

/** Gradle needs pluginManagement {} / plugins {} first; autolinking reads the cache after them. */
const PLUGINS_BLOCK = /^plugins \{[\s\S]*?^\}\n/m;

/** EAS restores android/build after prebuild. Stale Windows paths yield "No variants exist". */
function withEasAutolinkingCacheReset(config) {
  return withSettingsGradle(config, (cfg) => {
    let contents = cfg.modResults.contents.replace(`${SNIPPET}\n`, '').replace(SNIPPET, '');
    const block = contents.match(PLUGINS_BLOCK);
    if (block) {
      const at = block.index + block[0].length;
      contents = `${contents.slice(0, at)}\n${SNIPPET}${contents.slice(at)}`;
    }
    cfg.modResults.contents = contents;
    return cfg;
  });
}

module.exports = withEasAutolinkingCacheReset;
