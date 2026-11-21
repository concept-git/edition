// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
('use strict');
export const authenticationContextInput = validate1461;
const schema1605 = {
  type: 'object',
  properties: {},
  required: [],
  $id: 'https://edition.invalid/validators/authenticationContextInput',
};
function validate1461(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/authenticationContextInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1461.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (!(data && typeof data == 'object' && !Array.isArray(data))) {
    const err0 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
  }
  validate1461.errors = vErrors;
  return errors === 0;
}
validate1461.evaluated = { dynamicProps: false, dynamicItems: false };
export const authenticationContextOutput = validate1462;
const schema1606 = {
  $ref: 'https://edition.invalid/control#/components/schemas/ManagementAuthenticationContext',
  $id: 'https://edition.invalid/validators/authenticationContextOutput',
};
const schema1607 = {
  type: 'object',
  properties: {
    credentialType: {
      type: 'string',
      enum: ['session', 'space_token', 'management_token'],
    },
    actorId: { type: 'string', format: 'uuid' },
    credentialId: { type: ['string', 'null'], format: 'uuid' },
    scopes: { type: 'array', items: { type: 'string' }, uniqueItems: true },
    tenantId: { type: ['string', 'null'], format: 'uuid' },
    expiry: { type: ['string', 'null'], format: 'date-time' },
  },
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const formats10 = fullFormats['date-time'];
function validate1462(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/authenticationContextOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1462.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.credentialType !== undefined) {
      let data0 = data.credentialType;
      if (typeof data0 !== 'string') {
        const err0 = {
          instancePath: instancePath + '/credentialType',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ManagementAuthenticationContext/properties/credentialType/type',
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
      if (!(
        data0 === 'session' ||
        data0 === 'space_token' ||
        data0 === 'management_token'
      )) {
        const err1 = {
          instancePath: instancePath + '/credentialType',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ManagementAuthenticationContext/properties/credentialType/enum',
          keyword: 'enum',
          params: { allowedValues: schema1607.properties.credentialType.enum },
          message: 'must be equal to one of the allowed values',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.actorId !== undefined) {
      let data1 = data.actorId;
      if (typeof data1 === 'string') {
        if (!formats0.test(data1)) {
          const err2 = {
            instancePath: instancePath + '/actorId',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/ManagementAuthenticationContext/properties/actorId/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
      } else {
        const err3 = {
          instancePath: instancePath + '/actorId',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ManagementAuthenticationContext/properties/actorId/type',
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
    if (data.credentialId !== undefined) {
      let data2 = data.credentialId;
      if (typeof data2 !== 'string' && data2 !== null) {
        const err4 = {
          instancePath: instancePath + '/credentialId',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ManagementAuthenticationContext/properties/credentialId/type',
          keyword: 'type',
          params: { type: schema1607.properties.credentialId.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
      if (typeof data2 === 'string') {
        if (!formats0.test(data2)) {
          const err5 = {
            instancePath: instancePath + '/credentialId',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/ManagementAuthenticationContext/properties/credentialId/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        }
      }
    }
    if (data.scopes !== undefined) {
      let data3 = data.scopes;
      if (Array.isArray(data3)) {
        const len0 = data3.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (typeof data3[i0] !== 'string') {
            const err6 = {
              instancePath: instancePath + '/scopes/' + i0,
              schemaPath:
                'https://edition.invalid/control#/components/schemas/ManagementAuthenticationContext/properties/scopes/items/type',
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
        let i1 = data3.length;
        let j0;
        if (i1 > 1) {
          const indices0 = {};
          for (; i1--;) {
            let item0 = data3[i1];
            if (typeof item0 !== 'string') {
              continue;
            }
            if (typeof indices0[item0] == 'number') {
              j0 = indices0[item0];
              const err7 = {
                instancePath: instancePath + '/scopes',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/ManagementAuthenticationContext/properties/scopes/uniqueItems',
                keyword: 'uniqueItems',
                params: { i: i1, j: j0 },
                message:
                  'must NOT have duplicate items (items ## ' +
                  j0 +
                  ' and ' +
                  i1 +
                  ' are identical)',
              };
              if (vErrors === null) {
                vErrors = [err7];
              } else {
                vErrors.push(err7);
              }
              errors++;
              break;
            }
            indices0[item0] = i1;
          }
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/scopes',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ManagementAuthenticationContext/properties/scopes/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.tenantId !== undefined) {
      let data5 = data.tenantId;
      if (typeof data5 !== 'string' && data5 !== null) {
        const err9 = {
          instancePath: instancePath + '/tenantId',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ManagementAuthenticationContext/properties/tenantId/type',
          keyword: 'type',
          params: { type: schema1607.properties.tenantId.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
      if (typeof data5 === 'string') {
        if (!formats0.test(data5)) {
          const err10 = {
            instancePath: instancePath + '/tenantId',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/ManagementAuthenticationContext/properties/tenantId/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err10];
          } else {
            vErrors.push(err10);
          }
          errors++;
        }
      }
    }
    if (data.expiry !== undefined) {
      let data6 = data.expiry;
      if (typeof data6 !== 'string' && data6 !== null) {
        const err11 = {
          instancePath: instancePath + '/expiry',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ManagementAuthenticationContext/properties/expiry/type',
          keyword: 'type',
          params: { type: schema1607.properties.expiry.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
      if (typeof data6 === 'string') {
        if (!formats10.validate(data6)) {
          const err12 = {
            instancePath: instancePath + '/expiry',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/ManagementAuthenticationContext/properties/expiry/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
      }
    }
  } else {
    const err13 = {
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/ManagementAuthenticationContext/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err13];
    } else {
      vErrors.push(err13);
    }
    errors++;
  }
  validate1462.errors = vErrors;
  return errors === 0;
}
validate1462.evaluated = {
  props: {
    credentialType: true,
    actorId: true,
    credentialId: true,
    scopes: true,
    tenantId: true,
    expiry: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
export const authenticationContextOutputFull = validate1463;
const schema1608 = {
  $ref: 'https://edition.invalid/control#/components/schemas/ManagementAuthenticationContext',
  $id: 'https://edition.invalid/validators/authenticationContextOutputFull',
};
function validate1463(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/authenticationContextOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1463.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.credentialType !== undefined) {
      let data0 = data.credentialType;
      if (typeof data0 !== 'string') {
        const err0 = {
          instancePath: instancePath + '/credentialType',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ManagementAuthenticationContext/properties/credentialType/type',
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
      if (!(
        data0 === 'session' ||
        data0 === 'space_token' ||
        data0 === 'management_token'
      )) {
        const err1 = {
          instancePath: instancePath + '/credentialType',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ManagementAuthenticationContext/properties/credentialType/enum',
          keyword: 'enum',
          params: { allowedValues: schema1607.properties.credentialType.enum },
          message: 'must be equal to one of the allowed values',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.actorId !== undefined) {
      let data1 = data.actorId;
      if (typeof data1 === 'string') {
        if (!formats0.test(data1)) {
          const err2 = {
            instancePath: instancePath + '/actorId',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/ManagementAuthenticationContext/properties/actorId/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
      } else {
        const err3 = {
          instancePath: instancePath + '/actorId',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ManagementAuthenticationContext/properties/actorId/type',
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
    if (data.credentialId !== undefined) {
      let data2 = data.credentialId;
      if (typeof data2 !== 'string' && data2 !== null) {
        const err4 = {
          instancePath: instancePath + '/credentialId',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ManagementAuthenticationContext/properties/credentialId/type',
          keyword: 'type',
          params: { type: schema1607.properties.credentialId.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
      if (typeof data2 === 'string') {
        if (!formats0.test(data2)) {
          const err5 = {
            instancePath: instancePath + '/credentialId',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/ManagementAuthenticationContext/properties/credentialId/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        }
      }
    }
    if (data.scopes !== undefined) {
      let data3 = data.scopes;
      if (Array.isArray(data3)) {
        const len0 = data3.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (typeof data3[i0] !== 'string') {
            const err6 = {
              instancePath: instancePath + '/scopes/' + i0,
              schemaPath:
                'https://edition.invalid/control#/components/schemas/ManagementAuthenticationContext/properties/scopes/items/type',
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
        let i1 = data3.length;
        let j0;
        if (i1 > 1) {
          const indices0 = {};
          for (; i1--;) {
            let item0 = data3[i1];
            if (typeof item0 !== 'string') {
              continue;
            }
            if (typeof indices0[item0] == 'number') {
              j0 = indices0[item0];
              const err7 = {
                instancePath: instancePath + '/scopes',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/ManagementAuthenticationContext/properties/scopes/uniqueItems',
                keyword: 'uniqueItems',
                params: { i: i1, j: j0 },
                message:
                  'must NOT have duplicate items (items ## ' +
                  j0 +
                  ' and ' +
                  i1 +
                  ' are identical)',
              };
              if (vErrors === null) {
                vErrors = [err7];
              } else {
                vErrors.push(err7);
              }
              errors++;
              break;
            }
            indices0[item0] = i1;
          }
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/scopes',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ManagementAuthenticationContext/properties/scopes/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.tenantId !== undefined) {
      let data5 = data.tenantId;
      if (typeof data5 !== 'string' && data5 !== null) {
        const err9 = {
          instancePath: instancePath + '/tenantId',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ManagementAuthenticationContext/properties/tenantId/type',
          keyword: 'type',
          params: { type: schema1607.properties.tenantId.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
      if (typeof data5 === 'string') {
        if (!formats0.test(data5)) {
          const err10 = {
            instancePath: instancePath + '/tenantId',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/ManagementAuthenticationContext/properties/tenantId/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err10];
          } else {
            vErrors.push(err10);
          }
          errors++;
        }
      }
    }
    if (data.expiry !== undefined) {
      let data6 = data.expiry;
      if (typeof data6 !== 'string' && data6 !== null) {
        const err11 = {
          instancePath: instancePath + '/expiry',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ManagementAuthenticationContext/properties/expiry/type',
          keyword: 'type',
          params: { type: schema1607.properties.expiry.type },
          message: 'must be string,null',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
      if (typeof data6 === 'string') {
        if (!formats10.validate(data6)) {
          const err12 = {
            instancePath: instancePath + '/expiry',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/ManagementAuthenticationContext/properties/expiry/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
      }
    }
  } else {
    const err13 = {
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/ManagementAuthenticationContext/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err13];
    } else {
      vErrors.push(err13);
    }
    errors++;
  }
  validate1463.errors = vErrors;
  return errors === 0;
}
validate1463.evaluated = {
  props: {
    credentialType: true,
    actorId: true,
    credentialId: true,
    scopes: true,
    tenantId: true,
    expiry: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
