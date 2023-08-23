import * as os from 'os';

export function getPackageName(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(process.cwd() + '/package.json').name;
  } catch {
    return '';
  }
}

function getNodeID() {
  return os.hostname().toLowerCase() + '-' + process.pid;
}

export function getNodeIdWithPrefix(prefix: string) {
  const postfix = getNodeID();
  return prefix ? prefix + '-' + postfix : postfix;
}
