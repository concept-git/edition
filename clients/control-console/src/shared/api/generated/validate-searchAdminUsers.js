// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const searchAdminUsersInput = validate1464;
const schema1610 = {
  type: 'object',
  properties: {
    query: {
      type: 'object',
      properties: {
        q: { type: 'string', maxLength: 2147483647, minLength: 3 },
        cursor: { type: 'string' },
        limit: {
          type: 'integer',
          format: 'int32',
          default: 20,
          maximum: 100,
          minimum: 1,
        },
        fields: { type: 'string', maxLength: 4096, minLength: 1 },
      },
      required: ['q'],
    },
  },
  required: ['query'],
  $id: 'https://edition.invalid/validators/searchAdminUsersInput',
};
const func1 = ucs2Length;
function validate1464(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/searchAdminUsersInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1464.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.query === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'query' },
        message: "must have required property '" + 'query' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.query !== undefined) {
      let data0 = data.query;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.q === undefined) {
          const err1 = {
            instancePath: instancePath + '/query',
            schemaPath: '#/properties/query/required',
            keyword: 'required',
            params: { missingProperty: 'q' },
            message: "must have required property '" + 'q' + "'",
          };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
        if (data0.q !== undefined) {
          let data1 = data0.q;
          if (typeof data1 === 'string') {
            if (func1(data1) > 2147483647) {
              const err2 = {
                instancePath: instancePath + '/query/q',
                schemaPath: '#/properties/query/properties/q/maxLength',
                keyword: 'maxLength',
                params: { limit: 2147483647 },
                message: 'must NOT have more than 2147483647 characters',
              };
              if (vErrors === null) {
                vErrors = [err2];
              } else {
                vErrors.push(err2);
              }
              errors++;
            }
            if (func1(data1) < 3) {
              const err3 = {
                instancePath: instancePath + '/query/q',
                schemaPath: '#/properties/query/properties/q/minLength',
                keyword: 'minLength',
                params: { limit: 3 },
                message: 'must NOT have fewer than 3 characters',
              };
              if (vErrors === null) {
                vErrors = [err3];
              } else {
                vErrors.push(err3);
              }
              errors++;
            }
          } else {
            const err4 = {
              instancePath: instancePath + '/query/q',
              schemaPath: '#/properties/query/properties/q/type',
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
        if (data0.cursor !== undefined) {
          if (typeof data0.cursor !== 'string') {
            const err5 = {
              instancePath: instancePath + '/query/cursor',
              schemaPath: '#/properties/query/properties/cursor/type',
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
        if (data0.limit !== undefined) {
          let data3 = data0.limit;
          if (!(typeof data3 == 'number' && !(data3 % 1) && !isNaN(data3))) {
            const err6 = {
              instancePath: instancePath + '/query/limit',
              schemaPath: '#/properties/query/properties/limit/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err6];
            } else {
              vErrors.push(err6);
            }
            errors++;
          }
          if (typeof data3 == 'number') {
            if (data3 > 100 || isNaN(data3)) {
              const err7 = {
                instancePath: instancePath + '/query/limit',
                schemaPath: '#/properties/query/properties/limit/maximum',
                keyword: 'maximum',
                params: { comparison: '<=', limit: 100 },
                message: 'must be <= 100',
              };
              if (vErrors === null) {
                vErrors = [err7];
              } else {
                vErrors.push(err7);
              }
              errors++;
            }
            if (data3 < 1 || isNaN(data3)) {
              const err8 = {
                instancePath: instancePath + '/query/limit',
                schemaPath: '#/properties/query/properties/limit/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err8];
              } else {
                vErrors.push(err8);
              }
              errors++;
            }
          }
        }
        if (data0.fields !== undefined) {
          let data4 = data0.fields;
          if (typeof data4 === 'string') {
            if (func1(data4) > 4096) {
              const err9 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err9];
              } else {
                vErrors.push(err9);
              }
              errors++;
            }
            if (func1(data4) < 1) {
              const err10 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
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
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
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
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
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
  } else {
    const err13 = {
      instancePath,
      schemaPath: '#/type',
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
  validate1464.errors = vErrors;
  return errors === 0;
}
validate1464.evaluated = {
  props: { query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const searchAdminUsersOutput = validate1465;
const schema1611 = {
  anyOf: [
    { $ref: 'https://edition.invalid/control#/components/schemas/UserPage' },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialUserPage',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/searchAdminUsersOutput',
};
const schema1612 = {
  type: 'object',
  properties: {
    users: {
      type: 'array',
      items: { $ref: '#/components/schemas/UserSummary' },
    },
    nextCursor: { type: 'string' },
  },
};
const schema1613 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    email: { type: 'string' },
    name: { type: 'string' },
    status: { type: 'string' },
    platformOperator: { type: 'boolean' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const formats10 = fullFormats['date-time'];
function validate1466(
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
  const evaluated0 = validate1466.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.users !== undefined) {
      let data0 = data.users;
      if (Array.isArray(data0)) {
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data1 = data0[i0];
          if (data1 && typeof data1 == 'object' && !Array.isArray(data1)) {
            if (data1.id !== undefined) {
              let data2 = data1.id;
              if (typeof data2 === 'string') {
                if (!formats0.test(data2)) {
                  const err0 = {
                    instancePath: instancePath + '/users/' + i0 + '/id',
                    schemaPath:
                      '#/components/schemas/UserSummary/properties/id/format',
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
                  instancePath: instancePath + '/users/' + i0 + '/id',
                  schemaPath:
                    '#/components/schemas/UserSummary/properties/id/type',
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
            if (data1.email !== undefined) {
              if (typeof data1.email !== 'string') {
                const err2 = {
                  instancePath: instancePath + '/users/' + i0 + '/email',
                  schemaPath:
                    '#/components/schemas/UserSummary/properties/email/type',
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
            if (data1.name !== undefined) {
              if (typeof data1.name !== 'string') {
                const err3 = {
                  instancePath: instancePath + '/users/' + i0 + '/name',
                  schemaPath:
                    '#/components/schemas/UserSummary/properties/name/type',
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
            if (data1.status !== undefined) {
              if (typeof data1.status !== 'string') {
                const err4 = {
                  instancePath: instancePath + '/users/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/UserSummary/properties/status/type',
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
            if (data1.platformOperator !== undefined) {
              if (typeof data1.platformOperator !== 'boolean') {
                const err5 = {
                  instancePath:
                    instancePath + '/users/' + i0 + '/platformOperator',
                  schemaPath:
                    '#/components/schemas/UserSummary/properties/platformOperator/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
                };
                if (vErrors === null) {
                  vErrors = [err5];
                } else {
                  vErrors.push(err5);
                }
                errors++;
              }
            }
            if (data1.updatedAt !== undefined) {
              let data7 = data1.updatedAt;
              if (typeof data7 === 'string') {
                if (!formats10.validate(data7)) {
                  const err6 = {
                    instancePath: instancePath + '/users/' + i0 + '/updatedAt',
                    schemaPath:
                      '#/components/schemas/UserSummary/properties/updatedAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
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
                  instancePath: instancePath + '/users/' + i0 + '/updatedAt',
                  schemaPath:
                    '#/components/schemas/UserSummary/properties/updatedAt/type',
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
              instancePath: instancePath + '/users/' + i0,
              schemaPath: '#/components/schemas/UserSummary/type',
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
      } else {
        const err9 = {
          instancePath: instancePath + '/users',
          schemaPath: '#/properties/users/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.nextCursor !== undefined) {
      if (typeof data.nextCursor !== 'string') {
        const err10 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
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
      instancePath,
      schemaPath: '#/type',
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
  validate1466.errors = vErrors;
  return errors === 0;
}
validate1466.evaluated = {
  props: { users: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
const schema1614 = {
  type: 'object',
  properties: {
    users: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialUserSummary' },
    },
    nextCursor: { type: 'string' },
  },
};
const schema1615 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    email: { type: 'string' },
    name: { type: 'string' },
    status: { type: 'string' },
    platformOperator: { type: 'boolean' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};
function validate1468(
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
  const evaluated0 = validate1468.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.users !== undefined) {
      let data0 = data.users;
      if (Array.isArray(data0)) {
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data1 = data0[i0];
          if (data1 && typeof data1 == 'object' && !Array.isArray(data1)) {
            if (data1.id !== undefined) {
              let data2 = data1.id;
              if (typeof data2 === 'string') {
                if (!formats0.test(data2)) {
                  const err0 = {
                    instancePath: instancePath + '/users/' + i0 + '/id',
                    schemaPath:
                      '#/components/schemas/PartialUserSummary/properties/id/format',
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
                  instancePath: instancePath + '/users/' + i0 + '/id',
                  schemaPath:
                    '#/components/schemas/PartialUserSummary/properties/id/type',
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
            if (data1.email !== undefined) {
              if (typeof data1.email !== 'string') {
                const err2 = {
                  instancePath: instancePath + '/users/' + i0 + '/email',
                  schemaPath:
                    '#/components/schemas/PartialUserSummary/properties/email/type',
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
            if (data1.name !== undefined) {
              if (typeof data1.name !== 'string') {
                const err3 = {
                  instancePath: instancePath + '/users/' + i0 + '/name',
                  schemaPath:
                    '#/components/schemas/PartialUserSummary/properties/name/type',
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
            if (data1.status !== undefined) {
              if (typeof data1.status !== 'string') {
                const err4 = {
                  instancePath: instancePath + '/users/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/PartialUserSummary/properties/status/type',
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
            if (data1.platformOperator !== undefined) {
              if (typeof data1.platformOperator !== 'boolean') {
                const err5 = {
                  instancePath:
                    instancePath + '/users/' + i0 + '/platformOperator',
                  schemaPath:
                    '#/components/schemas/PartialUserSummary/properties/platformOperator/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
                };
                if (vErrors === null) {
                  vErrors = [err5];
                } else {
                  vErrors.push(err5);
                }
                errors++;
              }
            }
            if (data1.updatedAt !== undefined) {
              let data7 = data1.updatedAt;
              if (typeof data7 === 'string') {
                if (!formats10.validate(data7)) {
                  const err6 = {
                    instancePath: instancePath + '/users/' + i0 + '/updatedAt',
                    schemaPath:
                      '#/components/schemas/PartialUserSummary/properties/updatedAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
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
                  instancePath: instancePath + '/users/' + i0 + '/updatedAt',
                  schemaPath:
                    '#/components/schemas/PartialUserSummary/properties/updatedAt/type',
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
              instancePath: instancePath + '/users/' + i0,
              schemaPath: '#/components/schemas/PartialUserSummary/type',
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
      } else {
        const err9 = {
          instancePath: instancePath + '/users',
          schemaPath: '#/properties/users/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.nextCursor !== undefined) {
      if (typeof data.nextCursor !== 'string') {
        const err10 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
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
      instancePath,
      schemaPath: '#/type',
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
  validate1468.errors = vErrors;
  return errors === 0;
}
validate1468.evaluated = {
  props: { users: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1465(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/searchAdminUsersOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1465.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  const _errs0 = errors;
  let valid0 = false;
  const _errs1 = errors;
  if (
    !validate1466(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1466.errors
        : vErrors.concat(validate1466.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.users = true;
    props0.nextCursor = true;
  }
  const _errs2 = errors;
  if (
    !validate1468(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1468.errors
        : vErrors.concat(validate1468.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.users = true;
      props0.nextCursor = true;
    }
  }
  if (!valid0) {
    const err0 = {
      instancePath,
      schemaPath: '#/anyOf',
      keyword: 'anyOf',
      params: {},
      message: 'must match a schema in anyOf',
    };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate1465.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate1465.evaluated = { dynamicProps: true, dynamicItems: false };
export const searchAdminUsersOutputFull = validate1470;
const schema1616 = {
  $ref: 'https://edition.invalid/control#/components/schemas/UserPage',
  $id: 'https://edition.invalid/validators/searchAdminUsersOutputFull',
};
function validate1471(
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
  const evaluated0 = validate1471.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.users !== undefined) {
      let data0 = data.users;
      if (Array.isArray(data0)) {
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data1 = data0[i0];
          if (data1 && typeof data1 == 'object' && !Array.isArray(data1)) {
            if (data1.id !== undefined) {
              let data2 = data1.id;
              if (typeof data2 === 'string') {
                if (!formats0.test(data2)) {
                  const err0 = {
                    instancePath: instancePath + '/users/' + i0 + '/id',
                    schemaPath:
                      '#/components/schemas/UserSummary/properties/id/format',
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
                  instancePath: instancePath + '/users/' + i0 + '/id',
                  schemaPath:
                    '#/components/schemas/UserSummary/properties/id/type',
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
            if (data1.email !== undefined) {
              if (typeof data1.email !== 'string') {
                const err2 = {
                  instancePath: instancePath + '/users/' + i0 + '/email',
                  schemaPath:
                    '#/components/schemas/UserSummary/properties/email/type',
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
            if (data1.name !== undefined) {
              if (typeof data1.name !== 'string') {
                const err3 = {
                  instancePath: instancePath + '/users/' + i0 + '/name',
                  schemaPath:
                    '#/components/schemas/UserSummary/properties/name/type',
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
            if (data1.status !== undefined) {
              if (typeof data1.status !== 'string') {
                const err4 = {
                  instancePath: instancePath + '/users/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/UserSummary/properties/status/type',
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
            if (data1.platformOperator !== undefined) {
              if (typeof data1.platformOperator !== 'boolean') {
                const err5 = {
                  instancePath:
                    instancePath + '/users/' + i0 + '/platformOperator',
                  schemaPath:
                    '#/components/schemas/UserSummary/properties/platformOperator/type',
                  keyword: 'type',
                  params: { type: 'boolean' },
                  message: 'must be boolean',
                };
                if (vErrors === null) {
                  vErrors = [err5];
                } else {
                  vErrors.push(err5);
                }
                errors++;
              }
            }
            if (data1.updatedAt !== undefined) {
              let data7 = data1.updatedAt;
              if (typeof data7 === 'string') {
                if (!formats10.validate(data7)) {
                  const err6 = {
                    instancePath: instancePath + '/users/' + i0 + '/updatedAt',
                    schemaPath:
                      '#/components/schemas/UserSummary/properties/updatedAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
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
                  instancePath: instancePath + '/users/' + i0 + '/updatedAt',
                  schemaPath:
                    '#/components/schemas/UserSummary/properties/updatedAt/type',
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
              instancePath: instancePath + '/users/' + i0,
              schemaPath: '#/components/schemas/UserSummary/type',
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
      } else {
        const err9 = {
          instancePath: instancePath + '/users',
          schemaPath: '#/properties/users/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.nextCursor !== undefined) {
      if (typeof data.nextCursor !== 'string') {
        const err10 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
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
      instancePath,
      schemaPath: '#/type',
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
  validate1471.errors = vErrors;
  return errors === 0;
}
validate1471.evaluated = {
  props: { users: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1470(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/searchAdminUsersOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1470.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate1471(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1471.errors
        : vErrors.concat(validate1471.errors);
    errors = vErrors.length;
  }
  validate1470.errors = vErrors;
  return errors === 0;
}
validate1470.evaluated = {
  props: { users: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
