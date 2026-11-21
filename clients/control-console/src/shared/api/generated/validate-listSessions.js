// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
('use strict');
export const listSessionsInput = validate1442;
const schema1586 = {
  type: 'object',
  properties: {
    query: {
      type: 'object',
      properties: {
        cursor: { type: 'string' },
        limit: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
      },
      required: [],
    },
  },
  required: [],
  $id: 'https://edition.invalid/validators/listSessionsInput',
};
function validate1442(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listSessionsInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1442.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.query !== undefined) {
      let data0 = data.query;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.cursor !== undefined) {
          if (typeof data0.cursor !== 'string') {
            const err0 = {
              instancePath: instancePath + '/query/cursor',
              schemaPath: '#/properties/query/properties/cursor/type',
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
        if (data0.limit !== undefined) {
          let data2 = data0.limit;
          if (!(typeof data2 == 'number' && !(data2 % 1) && !isNaN(data2))) {
            const err1 = {
              instancePath: instancePath + '/query/limit',
              schemaPath: '#/properties/query/properties/limit/type',
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
          if (typeof data2 == 'number') {
            if (data2 > 100 || isNaN(data2)) {
              const err2 = {
                instancePath: instancePath + '/query/limit',
                schemaPath: '#/properties/query/properties/limit/maximum',
                keyword: 'maximum',
                params: { comparison: '<=', limit: 100 },
                message: 'must be <= 100',
              };
              if (vErrors === null) {
                vErrors = [err2];
              } else {
                vErrors.push(err2);
              }
              errors++;
            }
            if (data2 < 1 || isNaN(data2)) {
              const err3 = {
                instancePath: instancePath + '/query/limit',
                schemaPath: '#/properties/query/properties/limit/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err3];
              } else {
                vErrors.push(err3);
              }
              errors++;
            }
          }
        }
      } else {
        const err4 = {
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
  } else {
    const err5 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err5];
    } else {
      vErrors.push(err5);
    }
    errors++;
  }
  validate1442.errors = vErrors;
  return errors === 0;
}
validate1442.evaluated = {
  props: { query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const listSessionsOutput = validate1443;
const schema1587 = {
  $ref: 'https://edition.invalid/control#/components/schemas/Sessions',
  $id: 'https://edition.invalid/validators/listSessionsOutput',
};
const schema1588 = {
  type: 'object',
  properties: {
    sessions: {
      type: 'array',
      items: { $ref: '#/components/schemas/SessionView' },
    },
    nextCursor: { type: 'string' },
  },
};
const schema1589 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    device: { $ref: '#/components/schemas/Device' },
    ipApproximate: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    lastSeenAt: { type: 'string', format: 'date-time' },
    expiresAt: { type: 'string', format: 'date-time' },
    current: { type: 'boolean' },
  },
};
const schema1590 = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    browser: { type: 'string' },
    os: { type: 'string' },
  },
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const formats10 = fullFormats['date-time'];
function validate1445(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate1445.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.id !== undefined) {
      let data0 = data.id;
      if (typeof data0 === 'string') {
        if (!formats0.test(data0)) {
          const err0 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/properties/id/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
          };
          if (vErrors === null) {
            vErrors = [err0];
          } else {
            vErrors.push(err0);
          }
          errors++;
        }
      } else {
        const err1 = {
          instancePath: instancePath + '/id',
          schemaPath: '#/properties/id/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.device !== undefined) {
      let data1 = data.device;
      if (data1 && typeof data1 == 'object' && !Array.isArray(data1)) {
        if (data1.name !== undefined) {
          if (typeof data1.name !== 'string') {
            const err2 = {
              instancePath: instancePath + '/device/name',
              schemaPath: '#/components/schemas/Device/properties/name/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err2];
            } else {
              vErrors.push(err2);
            }
            errors++;
          }
        }
        if (data1.browser !== undefined) {
          if (typeof data1.browser !== 'string') {
            const err3 = {
              instancePath: instancePath + '/device/browser',
              schemaPath: '#/components/schemas/Device/properties/browser/type',
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
        if (data1.os !== undefined) {
          if (typeof data1.os !== 'string') {
            const err4 = {
              instancePath: instancePath + '/device/os',
              schemaPath: '#/components/schemas/Device/properties/os/type',
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
      } else {
        const err5 = {
          instancePath: instancePath + '/device',
          schemaPath: '#/components/schemas/Device/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.ipApproximate !== undefined) {
      if (typeof data.ipApproximate !== 'string') {
        const err6 = {
          instancePath: instancePath + '/ipApproximate',
          schemaPath: '#/properties/ipApproximate/type',
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
    if (data.createdAt !== undefined) {
      let data6 = data.createdAt;
      if (typeof data6 === 'string') {
        if (!formats10.validate(data6)) {
          const err7 = {
            instancePath: instancePath + '/createdAt',
            schemaPath: '#/properties/createdAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/createdAt',
          schemaPath: '#/properties/createdAt/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.lastSeenAt !== undefined) {
      let data7 = data.lastSeenAt;
      if (typeof data7 === 'string') {
        if (!formats10.validate(data7)) {
          const err9 = {
            instancePath: instancePath + '/lastSeenAt',
            schemaPath: '#/properties/lastSeenAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/lastSeenAt',
          schemaPath: '#/properties/lastSeenAt/type',
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
    if (data.expiresAt !== undefined) {
      let data8 = data.expiresAt;
      if (typeof data8 === 'string') {
        if (!formats10.validate(data8)) {
          const err11 = {
            instancePath: instancePath + '/expiresAt',
            schemaPath: '#/properties/expiresAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err11];
          } else {
            vErrors.push(err11);
          }
          errors++;
        }
      } else {
        const err12 = {
          instancePath: instancePath + '/expiresAt',
          schemaPath: '#/properties/expiresAt/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
    }
    if (data.current !== undefined) {
      if (typeof data.current !== 'boolean') {
        const err13 = {
          instancePath: instancePath + '/current',
          schemaPath: '#/properties/current/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
    }
  } else {
    const err14 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err14];
    } else {
      vErrors.push(err14);
    }
    errors++;
  }
  validate1445.errors = vErrors;
  return errors === 0;
}
validate1445.evaluated = {
  props: {
    id: true,
    device: true,
    ipApproximate: true,
    createdAt: true,
    lastSeenAt: true,
    expiresAt: true,
    current: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1444(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate1444.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.sessions !== undefined) {
      let data0 = data.sessions;
      if (Array.isArray(data0)) {
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (
            !validate1445(data0[i0], {
              instancePath: instancePath + '/sessions/' + i0,
              parentData: data0,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate1445.errors
                : vErrors.concat(validate1445.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err0 = {
          instancePath: instancePath + '/sessions',
          schemaPath: '#/properties/sessions/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.nextCursor !== undefined) {
      if (typeof data.nextCursor !== 'string') {
        const err1 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
  } else {
    const err2 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err2];
    } else {
      vErrors.push(err2);
    }
    errors++;
  }
  validate1444.errors = vErrors;
  return errors === 0;
}
validate1444.evaluated = {
  props: { sessions: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1443(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listSessionsOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1443.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate1444(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1444.errors
        : vErrors.concat(validate1444.errors);
    errors = vErrors.length;
  }
  validate1443.errors = vErrors;
  return errors === 0;
}
validate1443.evaluated = {
  props: { sessions: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const listSessionsOutputFull = validate1448;
const schema1591 = {
  $ref: 'https://edition.invalid/control#/components/schemas/Sessions',
  $id: 'https://edition.invalid/validators/listSessionsOutputFull',
};
function validate1449(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate1449.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.sessions !== undefined) {
      let data0 = data.sessions;
      if (Array.isArray(data0)) {
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (
            !validate1445(data0[i0], {
              instancePath: instancePath + '/sessions/' + i0,
              parentData: data0,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate1445.errors
                : vErrors.concat(validate1445.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err0 = {
          instancePath: instancePath + '/sessions',
          schemaPath: '#/properties/sessions/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.nextCursor !== undefined) {
      if (typeof data.nextCursor !== 'string') {
        const err1 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
  } else {
    const err2 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err2];
    } else {
      vErrors.push(err2);
    }
    errors++;
  }
  validate1449.errors = vErrors;
  return errors === 0;
}
validate1449.evaluated = {
  props: { sessions: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1448(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listSessionsOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1448.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate1449(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1449.errors
        : vErrors.concat(validate1449.errors);
    errors = vErrors.length;
  }
  validate1448.errors = vErrors;
  return errors === 0;
}
validate1448.evaluated = {
  props: { sessions: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
