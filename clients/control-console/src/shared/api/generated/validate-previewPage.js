// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const previewPageInput = validate472;
const schema563 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', format: 'uuid' },
        spaceId: { type: 'string', format: 'uuid' },
      },
      required: ['tenantId', 'spaceId'],
    },
    body: {
      $ref: 'https://edition.invalid/control#/components/schemas/PreviewPageRequest',
    },
  },
  required: ['path', 'body'],
  $id: 'https://edition.invalid/validators/previewPageInput',
};
const schema564 = {
  type: 'object',
  properties: {
    format: {
      type: 'string',
      minLength: 1,
      pattern: 'markdown|html|txt|json|xml',
    },
    content: { type: 'string' },
  },
  required: ['content', 'format'],
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
const pattern61 = new RegExp('markdown|html|txt|json|xml', 'u');
function validate472(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/previewPageInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate472.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.path === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'path' },
        message: "must have required property '" + 'path' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.body === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'body' },
        message: "must have required property '" + 'body' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.path !== undefined) {
      let data0 = data.path;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.tenantId === undefined) {
          const err2 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'tenantId' },
            message: "must have required property '" + 'tenantId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
        if (data0.spaceId === undefined) {
          const err3 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'spaceId' },
            message: "must have required property '" + 'spaceId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
        if (data0.tenantId !== undefined) {
          let data1 = data0.tenantId;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err4 = {
                instancePath: instancePath + '/path/tenantId',
                schemaPath: '#/properties/path/properties/tenantId/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
              };
              if (vErrors === null) {
                vErrors = [err4];
              } else {
                vErrors.push(err4);
              }
              errors++;
            }
          } else {
            const err5 = {
              instancePath: instancePath + '/path/tenantId',
              schemaPath: '#/properties/path/properties/tenantId/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err5];
            } else {
              vErrors.push(err5);
            }
            errors++;
          }
        }
        if (data0.spaceId !== undefined) {
          let data2 = data0.spaceId;
          if (typeof data2 === 'string') {
            if (!formats0.test(data2)) {
              const err6 = {
                instancePath: instancePath + '/path/spaceId',
                schemaPath: '#/properties/path/properties/spaceId/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
              };
              if (vErrors === null) {
                vErrors = [err6];
              } else {
                vErrors.push(err6);
              }
              errors++;
            }
          } else {
            const err7 = {
              instancePath: instancePath + '/path/spaceId',
              schemaPath: '#/properties/path/properties/spaceId/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err7];
            } else {
              vErrors.push(err7);
            }
            errors++;
          }
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/path',
          schemaPath: '#/properties/path/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.body !== undefined) {
      let data3 = data.body;
      if (data3 && typeof data3 == 'object' && !Array.isArray(data3)) {
        if (data3.content === undefined) {
          const err9 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/PreviewPageRequest/required',
            keyword: 'required',
            params: { missingProperty: 'content' },
            message: "must have required property '" + 'content' + "'",
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
        if (data3.format === undefined) {
          const err10 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/PreviewPageRequest/required',
            keyword: 'required',
            params: { missingProperty: 'format' },
            message: "must have required property '" + 'format' + "'",
          };
          if (vErrors === null) {
            vErrors = [err10];
          } else {
            vErrors.push(err10);
          }
          errors++;
        }
        if (data3.format !== undefined) {
          let data4 = data3.format;
          if (typeof data4 === 'string') {
            if (func1(data4) < 1) {
              const err11 = {
                instancePath: instancePath + '/body/format',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/PreviewPageRequest/properties/format/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              };
              if (vErrors === null) {
                vErrors = [err11];
              } else {
                vErrors.push(err11);
              }
              errors++;
            }
            if (!pattern61.test(data4)) {
              const err12 = {
                instancePath: instancePath + '/body/format',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/PreviewPageRequest/properties/format/pattern',
                keyword: 'pattern',
                params: { pattern: 'markdown|html|txt|json|xml' },
                message:
                  'must match pattern "' + 'markdown|html|txt|json|xml' + '"',
              };
              if (vErrors === null) {
                vErrors = [err12];
              } else {
                vErrors.push(err12);
              }
              errors++;
            }
          } else {
            const err13 = {
              instancePath: instancePath + '/body/format',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/PreviewPageRequest/properties/format/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err13];
            } else {
              vErrors.push(err13);
            }
            errors++;
          }
        }
        if (data3.content !== undefined) {
          if (typeof data3.content !== 'string') {
            const err14 = {
              instancePath: instancePath + '/body/content',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/PreviewPageRequest/properties/content/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
        }
      } else {
        const err15 = {
          instancePath: instancePath + '/body',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PreviewPageRequest/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      }
    }
  } else {
    const err16 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err16];
    } else {
      vErrors.push(err16);
    }
    errors++;
  }
  validate472.errors = vErrors;
  return errors === 0;
}
validate472.evaluated = {
  props: { path: true, body: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const previewPageOutput = validate473;
const schema565 = {
  $ref: 'https://edition.invalid/control#/components/schemas/PagePreview',
  $id: 'https://edition.invalid/validators/previewPageOutput',
};
const schema566 = { type: 'object', properties: { html: { type: 'string' } } };
function validate473(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/previewPageOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate473.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.html !== undefined) {
      if (typeof data.html !== 'string') {
        const err0 = {
          instancePath: instancePath + '/html',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PagePreview/properties/html/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
  } else {
    const err1 = {
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/PagePreview/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err1];
    } else {
      vErrors.push(err1);
    }
    errors++;
  }
  validate473.errors = vErrors;
  return errors === 0;
}
validate473.evaluated = {
  props: { html: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const previewPageOutputFull = validate474;
const schema567 = {
  $ref: 'https://edition.invalid/control#/components/schemas/PagePreview',
  $id: 'https://edition.invalid/validators/previewPageOutputFull',
};
function validate474(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/previewPageOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate474.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.html !== undefined) {
      if (typeof data.html !== 'string') {
        const err0 = {
          instancePath: instancePath + '/html',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PagePreview/properties/html/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
  } else {
    const err1 = {
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/PagePreview/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err1];
    } else {
      vErrors.push(err1);
    }
    errors++;
  }
  validate474.errors = vErrors;
  return errors === 0;
}
validate474.evaluated = {
  props: { html: true },
  dynamicProps: false,
  dynamicItems: false,
};
