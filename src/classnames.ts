export default function classnames(args: {[className: string]: boolean}): string {
  return Object.keys(args).filter(key => args[key]).join(' ');
}