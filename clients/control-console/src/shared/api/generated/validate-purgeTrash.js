// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const purgeTrashInput = validate225;
const schema289 = {
  type: 'object',
  properties: {
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
      $ref: 'https://edition.invalid/control#/components/schemas/TenantRequest',
    },
  },
  required: ['header', 'body'],
  $id: 'https://edition.invalid/validators/purgeTrashInput',
};
const schema290 = {
  type: 'object',
  properties: { tenantId: { type: 'string', format: 'uuid' } },
  required: ['tenantId'],
};
const func1 = ucs2Length;
const pattern4 = new RegExp('^[a-zA-Z0-9._:-]+$', 'u');
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
function validate225(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/purgeTrashInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate225.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.header === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'header' },
        message: "must have required property '" + 'header' + "'",
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
    if (data.header !== undefined) {
      let data0 = data.header;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0['Idempotency-Key'] === undefined) {
          const err2 = {
            instancePath: instancePath + '/header',
            schemaPath: '#/properties/header/required',
            keyword: 'required',
            params: { missingProperty: 'Idempotency-Key' },
            message: "must have required property '" + 'Idempotency-Key' + "'",
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
        if (data0['Idempotency-Key'] !== undefined) {
          let data1 = data0['Idempotency-Key'];
          if (typeof data1 === 'string') {
            if (func1(data1) > 128) {
              const err3 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/maxLength',
                keyword: 'maxLength',
                params: { limit: 128 },
                message: 'must NOT have more than 128 characters',
              };
              if (vErrors === null) {
                vErrors = [err3];
              } else {
                vErrors.push(err3);
              }
              errors++;
            }
            if (func1(data1) < 1) {
              const err4 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              };
              if (vErrors === null) {
                vErrors = [err4];
              } else {
                vErrors.push(err4);
              }
              errors++;
            }
            if (!pattern4.test(data1)) {
              const err5 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/pattern',
                keyword: 'pattern',
                params: { pattern: '^[a-zA-Z0-9._:-]+$' },
                message: 'must match pattern "' + '^[a-zA-Z0-9._:-]+$' + '"',
              };
              if (vErrors === null) {
                vErrors = [err5];
              } else {
                vErrors.push(err5);
              }
              errors++;
            }
          } else {
            const err6 = {
              instancePath: instancePath + '/header/Idempotency-Key',
              schemaPath: '#/properties/header/properties/Idempotency-Key/type',
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
      } else {
        const err7 = {
          instancePath: instancePath + '/header',
          schemaPath: '#/properties/header/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.body !== undefined) {
      let data2 = data.body;
      if (data2 && typeof data2 == 'object' && !Array.isArray(data2)) {
        if (data2.tenantId === undefined) {
          const err8 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/TenantRequest/required',
            keyword: 'required',
            params: { missingProperty: 'tenantId' },
            message: "must have required property '" + 'tenantId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err8];
          } else {
            vErrors.push(err8);
          }
          errors++;
        }
        if (data2.tenantId !== undefined) {
          let data3 = data2.tenantId;
          if (typeof data3 === 'string') {
            if (!formats0.test(data3)) {
              const err9 = {
                instancePath: instancePath + '/body/tenantId',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/TenantRequest/properties/tenantId/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
              };
              if (vErrors === null) {
                vErrors = [err9];
              } else {
                vErrors.push(err9);
              }
              errors++;
            }
          } else {
            const err10 = {
              instancePath: instancePath + '/body/tenantId',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/TenantRequest/properties/tenantId/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err10];
            } else {
              vErrors.push(err10);
            }
            errors++;
          }
        }
      } else {
        const err11 = {
          instancePath: instancePath + '/body',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TenantRequest/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
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
      instancePath,
      schemaPath: '#/type',
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
  validate225.errors = vErrors;
  return errors === 0;
}
validate225.evaluated = {
  props: { header: true, body: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const purgeTrashOutput = validate226;
const schema291 = {
  $ref: 'https://edition.invalid/control#/components/schemas/PurgeReport',
  $id: 'https://edition.invalid/validators/purgeTrashOutput',
};
const schema292 = {
  type: 'object',
  properties: {
    scanned: { type: 'integer', format: 'int32' },
    purged: { type: 'integer', format: 'int32' },
    protectedCount: { type: 'integer', format: 'int32' },
  },
};
function validate226(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/purgeTrashOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate226.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.scanned !== undefined) {
      let data0 = data.scanned;
      if (!(typeof data0 == 'number' && !(data0 % 1) && !isNaN(data0))) {
        const err0 = {
          instancePath: instancePath + '/scanned',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PurgeReport/properties/scanned/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.purged !== undefined) {
      let data1 = data.purged;
      if (!(typeof data1 == 'number' && !(data1 % 1) && !isNaN(data1))) {
        const err1 = {
          instancePath: instancePath + '/purged',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PurgeReport/properties/purged/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.protectedCount !== undefined) {
      let data2 = data.protectedCount;
      if (!(typeof data2 == 'number' && !(data2 % 1) && !isNaN(data2))) {
        const err2 = {
          instancePath: instancePath + '/protectedCount',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PurgeReport/properties/protectedCount/type',
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
  } else {
    const err3 = {
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/PurgeReport/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err3];
    } else {
      vErrors.push(err3);
    }
    errors++;
  }
  validate226.errors = vErrors;
  return errors === 0;
}
validate226.evaluated = {
  props: { scanned: true, purged: true, protectedCount: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const purgeTrashOutputFull = validate227;
const schema293 = {
  $ref: 'https://edition.invalid/control#/components/schemas/PurgeReport',
  $id: 'https://edition.invalid/validators/purgeTrashOutputFull',
};
function validate227(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/purgeTrashOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate227.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.scanned !== undefined) {
      let data0 = data.scanned;
      if (!(typeof data0 == 'number' && !(data0 % 1) && !isNaN(data0))) {
        const err0 = {
          instancePath: instancePath + '/scanned',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PurgeReport/properties/scanned/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.purged !== undefined) {
      let data1 = data.purged;
      if (!(typeof data1 == 'number' && !(data1 % 1) && !isNaN(data1))) {
        const err1 = {
          instancePath: instancePath + '/purged',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PurgeReport/properties/purged/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.protectedCount !== undefined) {
      let data2 = data.protectedCount;
      if (!(typeof data2 == 'number' && !(data2 % 1) && !isNaN(data2))) {
        const err2 = {
          instancePath: instancePath + '/protectedCount',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PurgeReport/properties/protectedCount/type',
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
  } else {
    const err3 = {
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/PurgeReport/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err3];
    } else {
      vErrors.push(err3);
    }
    errors++;
  }
  validate227.errors = vErrors;
  return errors === 0;
}
validate227.evaluated = {
  props: { scanned: true, purged: true, protectedCount: true },
  dynamicProps: false,
  dynamicItems: false,
};
