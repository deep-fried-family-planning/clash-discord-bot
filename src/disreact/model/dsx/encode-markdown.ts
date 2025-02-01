import {DFMD} from '#src/disreact/model/dsx/html.ts';

const parseMarkdown = (type: string, props: any): DSX.Node => {
  const text = props.children[0];

  switch (type) {
    case DFMD.dfmd:
      return '';

    case DFMD.at:
      const {user, role, channel} = props;
      switch (true) {
        case user:
          return `@${props.id}`;
        case role:
          return `@&${props.id}`;
        case channel:
          return `#${props.id}`;
        default:
          throw new Error('invalid mention type');
      }

    case DFMD.a:
      if (props.children[0].type !== DFMD.mask)
        return props.embed
          ? `<${props.href}>`
          : props.href;
      else
        return props.embed
          ? `${props.children[0]}(<${props.href}>)`
          : `${props.children[0]}(${props.href})`;

    case DFMD.mask:
      return `[${text}]`;

    case DFMD.p:
      return `\n${text}\n`;

    case DFMD.br:
      return `\n${text}`;

    case DFMD.b:
      return `**${text}**`;

    case DFMD.i:
      return `*${text}*`;

    case DFMD.u:
      return `__${text}__`;

    case DFMD.s:
      return `~~${text}~~`;

    case DFMD.details:
      return `||${text}||`;

    case DFMD.code:
      return `\`${text}\``;

    case DFMD.pre:
      return `\`\`\`${text}\`\`\``;

    case DFMD.blockquote:
      return `>> ${text}`;

    case DFMD.h1:
      return `# ${text}`;

    case DFMD.h2:
      return `## ${text}`;

    case DFMD.h3:
      return `### ${text}`;

    case DFMD.small:
      return `-# ${text}`;

    case DFMD.ol:
      return '';

    case DFMD.ul:
      return '';

    case DFMD.li:
      return '';
  }
};
