import {describe, expect, it} from 'vitest';
import {type PackageInfo, type ReleaseCommands, peerFloor, runRelease} from './release-pipeline';

const corePackage: PackageInfo = {
  key: 'core',
  name: '@ndw-ui-kit/core',
  version: '0.3.2',
  sourcePath: '/src/core/package.json',
  distPath: '/dist/core/package.json',
  tag: 'v0.3.2',
};

const chartsPackage: PackageInfo = {
  key: 'charts',
  name: '@ndw-ui-kit/charts',
  version: '0.4.0',
  sourcePath: '/src/charts/package.json',
  distPath: '/dist/charts/package.json',
  tag: 'charts-v0.4.0',
};

const packages = {core: corePackage, charts: chartsPackage};

interface FakeOptions {
  published?: string[];
  failIsPublished?: string;
  failYarn?: string;
  failPublish?: string;
}

const createCommands = ({published = [], failIsPublished, failYarn, failPublish}: FakeOptions = {}) => {
  const calls: string[] = [];
  const logs: string[] = [];
  const publishedVersions = new Set(published);

  const commands: ReleaseCommands = {
    yarn(args) {
      const script = args.join(' ');

      calls.push(`yarn ${script}`);

      if (script === failYarn) {
        throw new Error(`failed yarn ${script}`);
      }
    },
    isPublished(name, version) {
      const packageVersion = `${name}@${version}`;

      calls.push(`isPublished ${name}@${version}`);

      if (packageVersion === failIsPublished) {
        throw new Error(`failed registry check ${packageVersion}`);
      }

      return publishedVersions.has(packageVersion);
    },
    packRegistry(name, version, destination) {
      calls.push(`packRegistry ${name}@${version} ${destination}`);

      return `${destination}/core.tgz`;
    },
    extractCore(tarball) {
      calls.push(`extractCore ${tarball}`);
    },
    assertDistMatchesSource(pkg) {
      calls.push(`assertDistMatchesSource ${pkg.key}`);
    },
    npmPublish(pkg, dryRun) {
      calls.push(`npmPublish ${pkg.key} ${dryRun}`);

      if (pkg.key === failPublish) {
        throw new Error(`failed publish ${pkg.key}`);
      }
    },
    makeTempDir() {
      calls.push('makeTempDir');

      return '/dist/.tmp/publish-core-test';
    },
    removeDir(path) {
      calls.push(`removeDir ${path}`);
    },
    log(line) {
      logs.push(line);
      calls.push(`log ${line}`);
    },
  };

  return {calls, commands, logs};
};

describe('release pipeline selection', () => {
  it('builds and publishes core only', () => {
    const {calls, commands} = createCommands();

    runRelease(['core'], packages, '^0.3.1', false, commands);

    expect(calls.filter((call) => {
      return call.startsWith('yarn ');
    })).toEqual([
      'yarn build:core',
      'yarn emit-custom-sprite-cli',
      'yarn copy-custom-sprite-sources',
      'yarn verify:publish-artifacts --packages core',
    ]);
    expect(calls).not.toContain('yarn build:charts');
    expect(calls).not.toContain('yarn smoke:consumer');
    expect(calls.some((call) => {
      return call.startsWith('packRegistry ');
    })).toBe(false);
    expect(calls).toContain('npmPublish core false');
  });

  it('builds and publishes core before charts', () => {
    const {calls, commands} = createCommands();

    runRelease(['core', 'charts'], packages, '^0.3.1', false, commands);

    expect(calls.filter((call) => {
      return call.startsWith('yarn ');
    })).toEqual([
      'yarn build:core',
      'yarn emit-custom-sprite-cli',
      'yarn copy-custom-sprite-sources',
      'yarn build:charts',
      'yarn verify:publish-artifacts --packages core charts',
      'yarn smoke:consumer',
    ]);
    expect(calls.filter((call) => {
      return call.startsWith('npmPublish ');
    })).toEqual([
      'npmPublish core false',
      'npmPublish charts false',
    ]);
  });

  it('builds charts against the published core at the peer floor', () => {
    const {calls, commands, logs} = createCommands({published: ['@ndw-ui-kit/core@0.3.1']});

    runRelease(['charts'], packages, '^0.3.1', false, commands);

    const pipelineCalls = calls.filter((call) => {
      return call.startsWith('yarn ')
        || call.startsWith('packRegistry ')
        || call.startsWith('extractCore ')
        || call.startsWith('npmPublish ');
    });

    expect(pipelineCalls).toEqual([
      'packRegistry @ndw-ui-kit/core@0.3.1 /dist/.tmp/publish-core-test',
      'extractCore /dist/.tmp/publish-core-test/core.tgz',
      'yarn build:charts',
      'yarn verify:publish-artifacts --packages charts',
      'yarn smoke:consumer --core-tarball /dist/.tmp/publish-core-test/core.tgz',
      'npmPublish charts false',
    ]);
    expect(calls).toContain('isPublished @ndw-ui-kit/core@0.3.1');
    expect(calls).not.toContain('yarn build:core');
    expect(logs).toContain('Using published @ndw-ui-kit/core@0.3.1 for charts build and smoke.');
  });
});

describe('release pipeline validation', () => {
  it('rejects a charts peer floor that is not published before building', () => {
    const {calls, commands} = createCommands();

    expect(() => runRelease(['charts'], packages, '^0.3.0', false, commands)).toThrow(
      '@ndw-ui-kit/core@0.3.0 (charts peer floor) is not published.',
    );
    expect(calls.some((call) => {
      return call.startsWith('yarn ');
    })).toBe(false);
    expect(calls.some((call) => {
      return call.startsWith('packRegistry ');
    })).toBe(false);
    expect(calls.some((call) => {
      return call.startsWith('npmPublish ');
    })).toBe(false);
  });

  it('rejects an already published selected version before building', () => {
    const {calls, commands} = createCommands({published: ['@ndw-ui-kit/core@0.3.2']});

    expect(() => runRelease(['core'], packages, '^0.3.1', false, commands)).toThrow(
      '@ndw-ui-kit/core@0.3.2 is already published.',
    );
    expect(calls.some((call) => {
      return call.startsWith('yarn ');
    })).toBe(false);
    expect(calls).not.toContain('makeTempDir');
  });

  it('propagates a registry check failure before building', () => {
    const {calls, commands} = createCommands({failIsPublished: '@ndw-ui-kit/core@0.3.2'});

    expect(() => runRelease(['core'], packages, '^0.3.1', false, commands)).toThrow(
      'failed registry check @ndw-ui-kit/core@0.3.2',
    );
    expect(calls.some((call) => {
      return call.startsWith('yarn ');
    })).toBe(false);
    expect(calls).not.toContain('makeTempDir');
  });
});

describe('release pipeline failure handling', () => {
  it.each([
    'build:charts',
    'verify:publish-artifacts --packages charts',
    'smoke:consumer --core-tarball /dist/.tmp/publish-core-test/core.tgz',
  ])(
    'cleans temporary files and does not publish when %s fails',
    (failedYarn) => {
      const {calls, commands} = createCommands({published: ['@ndw-ui-kit/core@0.3.1'], failYarn: failedYarn});

      expect(() => runRelease(['charts'], packages, '^0.3.1', false, commands)).toThrow(`failed yarn ${failedYarn}`);
      expect(calls).toContain('removeDir /dist/.tmp/publish-core-test');
      expect(calls.some((call) => {
        return call.startsWith('npmPublish ');
      })).toBe(false);
    },
  );

  it('logs the core tag before a later charts publish failure', () => {
    const {calls, commands, logs} = createCommands({failPublish: 'charts'});

    expect(() => runRelease(['core', 'charts'], packages, '^0.3.1', false, commands)).toThrow('failed publish charts');
    expect(logs).toContain('Tag: git tag v0.3.2 && git push origin v0.3.2');
    expect(calls.indexOf('log Tag: git tag v0.3.2 && git push origin v0.3.2')).toBeLessThan(
      calls.indexOf('npmPublish charts false'),
    );
  });
});

describe('release pipeline output', () => {
  it('does not print tag commands for a dry run', () => {
    const {commands, logs} = createCommands();

    runRelease(['core'], packages, '^0.3.1', true, commands);

    expect(logs.some((line) => {
      return line.includes('Tag');
    })).toBe(false);
  });
});

describe('peerFloor', () => {
  it('returns the minimum version accepted by a peer range', () => {
    expect(peerFloor('^0.3.1')).toBe('0.3.1');
    expect(() => peerFloor('not a range')).toThrow();
  });
});
