export const isNode = (): boolean =>
  !!(
    typeof process !== 'undefined' &&
    process.versions &&
    process.versions.node
  );

export const findDependencies = (
  modules: string[],
  manifest: Record<string, string[]>,
): string[] => {
  const files = new Set<string>();

  for (const id of modules || []) {
    for (const file of manifest[id] || []) {
      files.add(file);
    }
  }

  return [...files];
};

export const renderPreloadLinks = (files: string[]): string => {
  let link = '';

  for (const file of files || []) {
    if (file.endsWith('.js')) {
      link += `<link rel="modulepreload" crossorigin href="${file}">`;
    } else if (file.endsWith('.css')) {
      link += `<link rel="stylesheet" href="${file}">`;
    } else if (file.endsWith('.woff')) {
      link += ` <link rel="preload" href="${file}" as="font" type="font/woff" crossorigin>`;
    } else if (file.endsWith('.woff2')) {
      link += ` <link rel="preload" href="${file}" as="font" type="font/woff2" crossorigin>`;
    } else if (file.endsWith('.gif')) {
      link += ` <link rel="preload" href="${file}" as="image" type="image/gif">`;
    } else if (file.endsWith('.jpg') || file.endsWith('.jpeg')) {
      link += ` <link rel="preload" href="${file}" as="image" type="image/jpeg">`;
    } else if (file.endsWith('.png')) {
      link += ` <link rel="preload" href="${file}" as="image" type="image/png">`;
    }
  }

  return link;
};

export const simpleLog = (
  msg: string,
  level: 'info' | 'error' | 'warn' = 'info',
) => {
  const now = new Date();
  const icon: string = {
    info: '🚀',
    error: '🐞',
    warn: '⚠️',
  }[level];

  // eslint-disable-next-line no-console
  console.log(
    `\x1B[35m[${now.getHours()}:${now.getMinutes()}]\x1B[0m - ${icon} ${msg}`,
  );
};
