// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const deactivateContentTypeInput = validate708;
const schema821 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: { tenantId: { type: 'string', format: 'uuid' } },
      required: ['tenantId'],
    },
    header: {
      type: 'object',
      properties: {
        'Idempotency-Key': {
          type: 'string',
          maxLength: 128,
          minLength: 1,
          pattern: '^[a-zA-Z0-9._:-]+$',
        },
      },
      required: ['Idempotency-Key'],
    },
    body: {
      $ref: 'https://edition.invalid/control#/components/schemas/Deactivate',
    },
  },
  required: ['path', 'header', 'body'],
  $id: 'https://edition.invalid/validators/deactivateContentTypeInput',
};
const schema822 = {
  type: 'object',
  properties: {
    contentType: { type: 'string', minLength: 1 },
    baseRevision: { type: 'integer', format: 'int32', minimum: 0 },
  },
  required: ['contentType'],
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
const pattern4 = new RegExp('^[a-zA-Z0-9._:-]+$', 'u');
function validate708(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/deactivateContentTypeInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate708.evaluated;
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
    if (data.header === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'header' },
        message: "must have required property '" + 'header' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.body === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'body' },
        message: "must have required property '" + 'body' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.path !== undefined) {
      let data0 = data.path;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.tenantId === undefined) {
          const err3 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'tenantId' },
            message: "must have required property '" + 'tenantId' + "'",
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
      } else {
        const err6 = {
          instancePath: instancePath + '/path',
          schemaPath: '#/properties/path/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.header !== undefined) {
      let data2 = data.header;
      if (data2 && typeof data2 == 'object' && !Array.isArray(data2)) {
        if (data2['Idempotency-Key'] === undefined) {
          const err7 = {
            instancePath: instancePath + '/header',
            schemaPath: '#/properties/header/required',
            keyword: 'required',
            params: { missingProperty: 'Idempotency-Key' },
            message: "must have required property '" + 'Idempotency-Key' + "'",
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
        if (data2['Idempotency-Key'] !== undefined) {
          let data3 = data2['Idempotency-Key'];
          if (typeof data3 === 'string') {
            if (func1(data3) > 128) {
              const err8 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/maxLength',
                keyword: 'maxLength',
                params: { limit: 128 },
                message: 'must NOT have more than 128 characters',
              };
              if (vErrors === null) {
                vErrors = [err8];
              } else {
                vErrors.push(err8);
              }
              errors++;
            }
            if (func1(data3) < 1) {
              const err9 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              };
              if (vErrors === null) {
                vErrors = [err9];
              } else {
                vErrors.push(err9);
              }
              errors++;
            }
            if (!pattern4.test(data3)) {
              const err10 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/pattern',
                keyword: 'pattern',
                params: { pattern: '^[a-zA-Z0-9._:-]+$' },
                message: 'must match pattern "' + '^[a-zA-Z0-9._:-]+$' + '"',
              };
              if (vErrors === null) {
                vErrors = [err10];
              } else {
                vErrors.push(err10);
              }
              errors++;
            }
          } else {
            const err11 = {
              instancePath: instancePath + '/header/Idempotency-Key',
              schemaPath: '#/properties/header/properties/Idempotency-Key/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err11];
            } else {
              vErrors.push(err11);
            }
            errors++;
          }
        }
      } else {
        const err12 = {
          instancePath: instancePath + '/header',
          schemaPath: '#/properties/header/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
    }
    if (data.body !== undefined) {
      let data4 = data.body;
      if (data4 && typeof data4 == 'object' && !Array.isArray(data4)) {
        if (data4.contentType === undefined) {
          const err13 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/Deactivate/required',
            keyword: 'required',
            params: { missingProperty: 'contentType' },
            message: "must have required property '" + 'contentType' + "'",
          };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
        if (data4.contentType !== undefined) {
          let data5 = data4.contentType;
          if (typeof data5 === 'string') {
            if (func1(data5) < 1) {
              const err14 = {
                instancePath: instancePath + '/body/contentType',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/Deactivate/properties/contentType/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              };
              if (vErrors === null) {
                vErrors = [err14];
              } else {
                vErrors.push(err14);
              }
              errors++;
            }
          } else {
            const err15 = {
              instancePath: instancePath + '/body/contentType',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/Deactivate/properties/contentType/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err15];
            } else {
              vErrors.push(err15);
            }
            errors++;
          }
        }
        if (data4.baseRevision !== undefined) {
          let data6 = data4.baseRevision;
          if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6))) {
            const err16 = {
              instancePath: instancePath + '/body/baseRevision',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/Deactivate/properties/baseRevision/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err16];
            } else {
              vErrors.push(err16);
            }
            errors++;
          }
          if (typeof data6 == 'number') {
            if (data6 < 0 || isNaN(data6)) {
              const err17 = {
                instancePath: instancePath + '/body/baseRevision',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/Deactivate/properties/baseRevision/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 0 },
                message: 'must be >= 0',
              };
              if (vErrors === null) {
                vErrors = [err17];
              } else {
                vErrors.push(err17);
              }
              errors++;
            }
          }
        }
      } else {
        const err18 = {
          instancePath: instancePath + '/body',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Deactivate/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err18];
        } else {
          vErrors.push(err18);
        }
        errors++;
      }
    }
  } else {
    const err19 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err19];
    } else {
      vErrors.push(err19);
    }
    errors++;
  }
  validate708.errors = vErrors;
  return errors === 0;
}
validate708.evaluated = {
  props: { path: true, header: true, body: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const deactivateContentTypeOutput = validate709;
const schema823 = {
  $ref: 'https://edition.invalid/control#/components/schemas/State',
  $id: 'https://edition.invalid/validators/deactivateContentTypeOutput',
};
const schema824 = {
  type: 'object',
  properties: {
    contentType: { type: 'string' },
    enabled: { type: 'boolean' },
    revision: { type: 'integer', format: 'int32' },
    activeVersionRef: { type: 'string' },
    label: { type: 'string' },
    format: { type: 'string' },
    mediaType: { type: 'string' },
    builtin: { type: 'boolean' },
  },
};
function validate709(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/deactivateContentTypeOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate709.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.contentType !== undefined) {
      if (typeof data.contentType !== 'string') {
        const err0 = {
          instancePath: instancePath + '/contentType',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/State/properties/contentType/type',
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
    if (data.enabled !== undefined) {
      if (typeof data.enabled !== 'boolean') {
        const err1 = {
          instancePath: instancePath + '/enabled',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/State/properties/enabled/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.revision !== undefined) {
      let data2 = data.revision;
      if (!(typeof data2 == 'number' && !(data2 % 1) && !isNaN(data2))) {
        const err2 = {
          instancePath: instancePath + '/revision',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/State/properties/revision/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.activeVersionRef !== undefined) {
      if (typeof data.activeVersionRef !== 'string') {
        const err3 = {
          instancePath: instancePath + '/activeVersionRef',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/State/properties/activeVersionRef/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.label !== undefined) {
      if (typeof data.label !== 'string') {
        const err4 = {
          instancePath: instancePath + '/label',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/State/properties/label/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.format !== undefined) {
      if (typeof data.format !== 'string') {
        const err5 = {
          instancePath: instancePath + '/format',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/State/properties/format/type',
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
    if (data.mediaType !== undefined) {
      if (typeof data.mediaType !== 'string') {
        const err6 = {
          instancePath: instancePath + '/mediaType',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/State/properties/mediaType/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.builtin !== undefined) {
      if (typeof data.builtin !== 'boolean') {
        const err7 = {
          instancePath: instancePath + '/builtin',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/State/properties/builtin/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
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
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/State/type',
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
  validate709.errors = vErrors;
  return errors === 0;
}
validate709.evaluated = {
  props: {
    contentType: true,
    enabled: true,
    revision: true,
    activeVersionRef: true,
    label: true,
    format: true,
    mediaType: true,
    builtin: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
export const deactivateContentTypeOutputFull = validate710;
const schema825 = {
  $ref: 'https://edition.invalid/control#/components/schemas/State',
  $id: 'https://edition.invalid/validators/deactivateContentTypeOutputFull',
};
function validate710(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/deactivateContentTypeOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate710.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.contentType !== undefined) {
      if (typeof data.contentType !== 'string') {
        const err0 = {
          instancePath: instancePath + '/contentType',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/State/properties/contentType/type',
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
    if (data.enabled !== undefined) {
      if (typeof data.enabled !== 'boolean') {
        const err1 = {
          instancePath: instancePath + '/enabled',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/State/properties/enabled/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.revision !== undefined) {
      let data2 = data.revision;
      if (!(typeof data2 == 'number' && !(data2 % 1) && !isNaN(data2))) {
        const err2 = {
          instancePath: instancePath + '/revision',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/State/properties/revision/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.activeVersionRef !== undefined) {
      if (typeof data.activeVersionRef !== 'string') {
        const err3 = {
          instancePath: instancePath + '/activeVersionRef',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/State/properties/activeVersionRef/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.label !== undefined) {
      if (typeof data.label !== 'string') {
        const err4 = {
          instancePath: instancePath + '/label',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/State/properties/label/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.format !== undefined) {
      if (typeof data.format !== 'string') {
        const err5 = {
          instancePath: instancePath + '/format',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/State/properties/format/type',
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
    if (data.mediaType !== undefined) {
      if (typeof data.mediaType !== 'string') {
        const err6 = {
          instancePath: instancePath + '/mediaType',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/State/properties/mediaType/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.builtin !== undefined) {
      if (typeof data.builtin !== 'boolean') {
        const err7 = {
          instancePath: instancePath + '/builtin',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/State/properties/builtin/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
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
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/State/type',
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
  validate710.errors = vErrors;
  return errors === 0;
}
validate710.evaluated = {
  props: {
    contentType: true,
    enabled: true,
    revision: true,
    activeVersionRef: true,
    label: true,
    format: true,
    mediaType: true,
    builtin: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
