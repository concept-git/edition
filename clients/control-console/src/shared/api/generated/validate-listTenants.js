// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const listTenantsInput = validate772;
const schema886 = {
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
        fields: { type: 'string', maxLength: 4096, minLength: 1 },
      },
      required: [],
    },
  },
  required: [],
  $id: 'https://edition.invalid/validators/listTenantsInput',
};
const func1 = ucs2Length;
function validate772(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listTenantsInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate772.evaluated;
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
        if (data0.fields !== undefined) {
          let data3 = data0.fields;
          if (typeof data3 === 'string') {
            if (func1(data3) > 4096) {
              const err4 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err4];
              } else {
                vErrors.push(err4);
              }
              errors++;
            }
            if (func1(data3) < 1) {
              const err5 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
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
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
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
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
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
  } else {
    const err8 = {
      instancePath,
      schemaPath: '#/type',
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
  validate772.errors = vErrors;
  return errors === 0;
}
validate772.evaluated = {
  props: { query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const listTenantsOutput = validate773;
const schema887 = {
  anyOf: [
    { $ref: 'https://edition.invalid/control#/components/schemas/Tenants' },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialTenants',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/listTenantsOutput',
};
const schema888 = {
  type: 'object',
  properties: {
    tenants: {
      type: 'array',
      items: { $ref: '#/components/schemas/TenantView' },
    },
    nextCursor: { type: 'string' },
  },
};
const schema889 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    status: { type: 'string' },
    ownerCount: { type: 'integer', format: 'int64' },
    createdAt: { type: 'string', format: 'date-time' },
  },
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const formats10 = fullFormats['date-time'];
function validate774(
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
  const evaluated0 = validate774.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.tenants !== undefined) {
      let data0 = data.tenants;
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
                    instancePath: instancePath + '/tenants/' + i0 + '/id',
                    schemaPath:
                      '#/components/schemas/TenantView/properties/id/format',
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
                  instancePath: instancePath + '/tenants/' + i0 + '/id',
                  schemaPath:
                    '#/components/schemas/TenantView/properties/id/type',
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
            if (data1.name !== undefined) {
              if (typeof data1.name !== 'string') {
                const err2 = {
                  instancePath: instancePath + '/tenants/' + i0 + '/name',
                  schemaPath:
                    '#/components/schemas/TenantView/properties/name/type',
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
            if (data1.status !== undefined) {
              if (typeof data1.status !== 'string') {
                const err3 = {
                  instancePath: instancePath + '/tenants/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/TenantView/properties/status/type',
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
            if (data1.ownerCount !== undefined) {
              let data5 = data1.ownerCount;
              if (!(
                typeof data5 == 'number' &&
                !(data5 % 1) &&
                !isNaN(data5)
              )) {
                const err4 = {
                  instancePath: instancePath + '/tenants/' + i0 + '/ownerCount',
                  schemaPath:
                    '#/components/schemas/TenantView/properties/ownerCount/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
                };
                if (vErrors === null) {
                  vErrors = [err4];
                } else {
                  vErrors.push(err4);
                }
                errors++;
              }
            }
            if (data1.createdAt !== undefined) {
              let data6 = data1.createdAt;
              if (typeof data6 === 'string') {
                if (!formats10.validate(data6)) {
                  const err5 = {
                    instancePath:
                      instancePath + '/tenants/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/TenantView/properties/createdAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
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
                  instancePath: instancePath + '/tenants/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/TenantView/properties/createdAt/type',
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
              instancePath: instancePath + '/tenants/' + i0,
              schemaPath: '#/components/schemas/TenantView/type',
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
      } else {
        const err8 = {
          instancePath: instancePath + '/tenants',
          schemaPath: '#/properties/tenants/type',
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
    if (data.nextCursor !== undefined) {
      if (typeof data.nextCursor !== 'string') {
        const err9 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
  } else {
    const err10 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err10];
    } else {
      vErrors.push(err10);
    }
    errors++;
  }
  validate774.errors = vErrors;
  return errors === 0;
}
validate774.evaluated = {
  props: { tenants: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
const schema890 = {
  type: 'object',
  properties: {
    tenants: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialTenantView' },
    },
    nextCursor: { type: 'string' },
  },
};
const schema891 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    status: { type: 'string' },
    ownerCount: { type: 'integer', format: 'int64' },
    createdAt: { type: 'string', format: 'date-time' },
  },
};
function validate776(
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
  const evaluated0 = validate776.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.tenants !== undefined) {
      let data0 = data.tenants;
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
                    instancePath: instancePath + '/tenants/' + i0 + '/id',
                    schemaPath:
                      '#/components/schemas/PartialTenantView/properties/id/format',
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
                  instancePath: instancePath + '/tenants/' + i0 + '/id',
                  schemaPath:
                    '#/components/schemas/PartialTenantView/properties/id/type',
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
            if (data1.name !== undefined) {
              if (typeof data1.name !== 'string') {
                const err2 = {
                  instancePath: instancePath + '/tenants/' + i0 + '/name',
                  schemaPath:
                    '#/components/schemas/PartialTenantView/properties/name/type',
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
            if (data1.status !== undefined) {
              if (typeof data1.status !== 'string') {
                const err3 = {
                  instancePath: instancePath + '/tenants/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/PartialTenantView/properties/status/type',
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
            if (data1.ownerCount !== undefined) {
              let data5 = data1.ownerCount;
              if (!(
                typeof data5 == 'number' &&
                !(data5 % 1) &&
                !isNaN(data5)
              )) {
                const err4 = {
                  instancePath: instancePath + '/tenants/' + i0 + '/ownerCount',
                  schemaPath:
                    '#/components/schemas/PartialTenantView/properties/ownerCount/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
                };
                if (vErrors === null) {
                  vErrors = [err4];
                } else {
                  vErrors.push(err4);
                }
                errors++;
              }
            }
            if (data1.createdAt !== undefined) {
              let data6 = data1.createdAt;
              if (typeof data6 === 'string') {
                if (!formats10.validate(data6)) {
                  const err5 = {
                    instancePath:
                      instancePath + '/tenants/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/PartialTenantView/properties/createdAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
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
                  instancePath: instancePath + '/tenants/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/PartialTenantView/properties/createdAt/type',
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
              instancePath: instancePath + '/tenants/' + i0,
              schemaPath: '#/components/schemas/PartialTenantView/type',
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
      } else {
        const err8 = {
          instancePath: instancePath + '/tenants',
          schemaPath: '#/properties/tenants/type',
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
    if (data.nextCursor !== undefined) {
      if (typeof data.nextCursor !== 'string') {
        const err9 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
  } else {
    const err10 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err10];
    } else {
      vErrors.push(err10);
    }
    errors++;
  }
  validate776.errors = vErrors;
  return errors === 0;
}
validate776.evaluated = {
  props: { tenants: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate773(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listTenantsOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate773.evaluated;
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
    !validate774(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate774.errors
        : vErrors.concat(validate774.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.tenants = true;
    props0.nextCursor = true;
  }
  const _errs2 = errors;
  if (
    !validate776(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate776.errors
        : vErrors.concat(validate776.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.tenants = true;
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
  validate773.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate773.evaluated = { dynamicProps: true, dynamicItems: false };
export const listTenantsOutputFull = validate778;
const schema892 = {
  $ref: 'https://edition.invalid/control#/components/schemas/Tenants',
  $id: 'https://edition.invalid/validators/listTenantsOutputFull',
};
function validate779(
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
  const evaluated0 = validate779.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.tenants !== undefined) {
      let data0 = data.tenants;
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
                    instancePath: instancePath + '/tenants/' + i0 + '/id',
                    schemaPath:
                      '#/components/schemas/TenantView/properties/id/format',
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
                  instancePath: instancePath + '/tenants/' + i0 + '/id',
                  schemaPath:
                    '#/components/schemas/TenantView/properties/id/type',
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
            if (data1.name !== undefined) {
              if (typeof data1.name !== 'string') {
                const err2 = {
                  instancePath: instancePath + '/tenants/' + i0 + '/name',
                  schemaPath:
                    '#/components/schemas/TenantView/properties/name/type',
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
            if (data1.status !== undefined) {
              if (typeof data1.status !== 'string') {
                const err3 = {
                  instancePath: instancePath + '/tenants/' + i0 + '/status',
                  schemaPath:
                    '#/components/schemas/TenantView/properties/status/type',
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
            if (data1.ownerCount !== undefined) {
              let data5 = data1.ownerCount;
              if (!(
                typeof data5 == 'number' &&
                !(data5 % 1) &&
                !isNaN(data5)
              )) {
                const err4 = {
                  instancePath: instancePath + '/tenants/' + i0 + '/ownerCount',
                  schemaPath:
                    '#/components/schemas/TenantView/properties/ownerCount/type',
                  keyword: 'type',
                  params: { type: 'integer' },
                  message: 'must be integer',
                };
                if (vErrors === null) {
                  vErrors = [err4];
                } else {
                  vErrors.push(err4);
                }
                errors++;
              }
            }
            if (data1.createdAt !== undefined) {
              let data6 = data1.createdAt;
              if (typeof data6 === 'string') {
                if (!formats10.validate(data6)) {
                  const err5 = {
                    instancePath:
                      instancePath + '/tenants/' + i0 + '/createdAt',
                    schemaPath:
                      '#/components/schemas/TenantView/properties/createdAt/format',
                    keyword: 'format',
                    params: { format: 'date-time' },
                    message: 'must match format "' + 'date-time' + '"',
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
                  instancePath: instancePath + '/tenants/' + i0 + '/createdAt',
                  schemaPath:
                    '#/components/schemas/TenantView/properties/createdAt/type',
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
              instancePath: instancePath + '/tenants/' + i0,
              schemaPath: '#/components/schemas/TenantView/type',
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
      } else {
        const err8 = {
          instancePath: instancePath + '/tenants',
          schemaPath: '#/properties/tenants/type',
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
    if (data.nextCursor !== undefined) {
      if (typeof data.nextCursor !== 'string') {
        const err9 = {
          instancePath: instancePath + '/nextCursor',
          schemaPath: '#/properties/nextCursor/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
  } else {
    const err10 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err10];
    } else {
      vErrors.push(err10);
    }
    errors++;
  }
  validate779.errors = vErrors;
  return errors === 0;
}
validate779.evaluated = {
  props: { tenants: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate778(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listTenantsOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate778.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate779(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate779.errors
        : vErrors.concat(validate779.errors);
    errors = vErrors.length;
  }
  validate778.errors = vErrors;
  return errors === 0;
}
validate778.evaluated = {
  props: { tenants: true, nextCursor: true },
  dynamicProps: false,
  dynamicItems: false,
};
