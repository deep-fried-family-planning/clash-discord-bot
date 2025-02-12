import { compressStack, decompressStack } from '#src/disreact/internal/codec/compression.ts';

describe('compression', () => {
  it('Url compression', () => {
    const url = {
      'TestMessage:0': [
        {
          s: 0,
        },
      ],
    };

    const compress = compressStack(url);
    const decompress = decompressStack(compress);


    expect(decompress).toEqual(url);
  });
});

describe('dyna object', () => {
  it('convert', () => {
      type objectT = {[key: string]: string};

      interface dynamicAcessor {
        regex      : string;
        component  : string[];
        rootPointer: string;
      }

      function createDynamicAccessor(obj: objectT, path: string = ''): dynamicAcessor {
        let regex = '';
        let component: string[] = [];

        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            const newPath = path ? `${path}.${key}` : key;

            if (typeof value === 'object') {
              // Recursively handle nested objects
              const nestedAccessor = createDynamicAccessor(value, newPath);
              regex += `(${nestedAccessor.regex})`; // Wrap nested regex in parentheses
              component = [...component, ...nestedAccessor.component];
            }
            else {
              // For primitive values, use them in the regex
              regex += `(${value})`;
              component.push(newPath);
            }
          }
        }
        return {
          regex      : `^${regex}$`, // Wrap the entire regex
          component,
          rootPointer: path || 'root',
        };
      }
    const test = {
      title     : 'test title',
      custom_id : 'TestDialog:0:modal:0',
      components: [
        {
          type      : 1,
          components: [
            {
              label: 'test text',
              type : 1,
            },
          ],
        },
      ],
    };
      const test2 = {
        embeds: [
          {
            title      : 'Omni Board',
            description: 'V2 - JSX Pragma',
          },
        ],
        components: [
          {
            type      : 1,
            components: [
              {
                label: 'Start',
                style: 1,
                type : 2,
              },
              {
                label: 'Help',
                style: 6,
                emoji: {
                  name: 'ope',
                },
                type: 2,
              },
            ],
          },
        ],
      };

      const acc = createDynamicAccessor(test2);
    console.log(acc.regex);
    console.log(acc.component);
    console.log(acc.rootPointer);
  });
});
