// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const listContentTypesInput = validate1412;
const schema1562 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: { tenantId: { type: 'string', format: 'uuid' } },
      required: ['tenantId'],
    },
    query: {
      type: 'object',
      properties: { fields: { type: 'string', maxLength: 4096, minLength: 1 } },
      required: [],
    },
  },
  required: ['path'],
  $id: 'https://edition.invalid/validators/listContentTypesInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
function validate1412(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listContentTypesInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1412.evaluated;
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
    if (data.path !== undefined) {
      let data0 = data.path;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.tenantId === undefined) {
          const err1 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'tenantId' },
            message: "must have required property '" + 'tenantId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
        if (data0.tenantId !== undefined) {
          let data1 = data0.tenantId;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err2 = {
                instancePath: instancePath + '/path/tenantId',
                schemaPath: '#/properties/path/properties/tenantId/format',
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
              instancePath: instancePath + '/path/tenantId',
              schemaPath: '#/properties/path/properties/tenantId/type',
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
      } else {
        const err4 = {
          instancePath: instancePath + '/path',
          schemaPath: '#/properties/path/type',
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
    if (data.query !== undefined) {
      let data2 = data.query;
      if (data2 && typeof data2 == 'object' && !Array.isArray(data2)) {
        if (data2.fields !== undefined) {
          let data3 = data2.fields;
          if (typeof data3 === 'string') {
            if (func1(data3) > 4096) {
              const err5 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err5];
              } else {
                vErrors.push(err5);
              }
              errors++;
            }
            if (func1(data3) < 1) {
              const err6 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
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
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
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
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
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
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err9];
    } else {
      vErrors.push(err9);
    }
    errors++;
  }
  validate1412.errors = vErrors;
  return errors === 0;
}
validate1412.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const listContentTypesOutput = validate1413;
const schema1563 = {
  anyOf: [
    { $ref: 'https://edition.invalid/control#/components/schemas/TypeList' },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialTypeList',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/listContentTypesOutput',
};
const schema1564 = {
  type: 'object',
  properties: {
    items: { type: 'array', items: { $ref: '#/components/schemas/State' } },
    canManage: { type: 'boolean' },
  },
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
function validate1414(
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
  const evaluated0 = validate1414.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.items !== undefined) {
      let data0 = data.items;
      if (Array.isArray(data0)) {
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data1 = data0[i0];
          if (data1 && typeof data1 == 'object' && !Array.isArray(data1)) {
            if (data1.contentType !== undefined) {
              if (typeof data1.contentType !== 'string') {
                const err0 = {
                  instancePath: instancePath + '/items/' + i0 + '/contentType',
                  schemaPath:
                    '#/components/schemas/State/properties/contentType/type',
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
            if (data1.enabled !== undefined) {
              if (typeof data1.enabled !== 'boolean') {
                const err1 = {
                  instancePath: instancePath + '/items/' + i0 + '/enabled',
                  schemaPath:
                    '#/components/schemas/State/properties/enabled/type',
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
            if (data1.revision !== undefined) {
              let data4 = data1.revision;
              if (!(
                typeof data4 == 'number' &&
                !(data4 % 1) &&
                !isNaN(data4)
              )) {
                const err2 = {
                  instancePath: instancePath + '/items/' + i0 + '/revision',
                  schemaPath:
                    '#/components/schemas/State/properties/revision/type',
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
            if (data1.activeVersionRef !== undefined) {
              if (typeof data1.activeVersionRef !== 'string') {
                const err3 = {
                  instancePath:
                    instancePath + '/items/' + i0 + '/activeVersionRef',
                  schemaPath:
                    '#/components/schemas/State/properties/activeVersionRef/type',
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
            if (data1.label !== undefined) {
              if (typeof data1.label !== 'string') {
                const err4 = {
                  instancePath: instancePath + '/items/' + i0 + '/label',
                  schemaPath:
                    '#/components/schemas/State/properties/label/type',
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
            if (data1.format !== undefined) {
              if (typeof data1.format !== 'string') {
                const err5 = {
                  instancePath: instancePath + '/items/' + i0 + '/format',
                  schemaPath:
                    '#/components/schemas/State/properties/format/type',
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
            if (data1.mediaType !== undefined) {
              if (typeof data1.mediaType !== 'string') {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/mediaType',
                  schemaPath:
                    '#/components/schemas/State/properties/mediaType/type',
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
            if (data1.builtin !== undefined) {
              if (typeof data1.builtin !== 'boolean') {
                const err7 = {
                  instancePath: instancePath + '/items/' + i0 + '/builtin',
                  schemaPath:
                    '#/components/schemas/State/properties/builtin/type',
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
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/State/type',
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
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
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
    if (data.canManage !== undefined) {
      if (typeof data.canManage !== 'boolean') {
        const err10 = {
          instancePath: instancePath + '/canManage',
          schemaPath: '#/properties/canManage/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
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
  validate1414.errors = vErrors;
  return errors === 0;
}
validate1414.evaluated = {
  props: { items: true, canManage: true },
  dynamicProps: false,
  dynamicItems: false,
};
const schema1566 = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialState' },
    },
    canManage: { type: 'boolean' },
  },
};
const schema1567 = {
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
function validate1416(
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
  const evaluated0 = validate1416.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.items !== undefined) {
      let data0 = data.items;
      if (Array.isArray(data0)) {
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data1 = data0[i0];
          if (data1 && typeof data1 == 'object' && !Array.isArray(data1)) {
            if (data1.contentType !== undefined) {
              if (typeof data1.contentType !== 'string') {
                const err0 = {
                  instancePath: instancePath + '/items/' + i0 + '/contentType',
                  schemaPath:
                    '#/components/schemas/PartialState/properties/contentType/type',
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
            if (data1.enabled !== undefined) {
              if (typeof data1.enabled !== 'boolean') {
                const err1 = {
                  instancePath: instancePath + '/items/' + i0 + '/enabled',
                  schemaPath:
                    '#/components/schemas/PartialState/properties/enabled/type',
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
            if (data1.revision !== undefined) {
              let data4 = data1.revision;
              if (!(
                typeof data4 == 'number' &&
                !(data4 % 1) &&
                !isNaN(data4)
              )) {
                const err2 = {
                  instancePath: instancePath + '/items/' + i0 + '/revision',
                  schemaPath:
                    '#/components/schemas/PartialState/properties/revision/type',
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
            if (data1.activeVersionRef !== undefined) {
              if (typeof data1.activeVersionRef !== 'string') {
                const err3 = {
                  instancePath:
                    instancePath + '/items/' + i0 + '/activeVersionRef',
                  schemaPath:
                    '#/components/schemas/PartialState/properties/activeVersionRef/type',
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
            if (data1.label !== undefined) {
              if (typeof data1.label !== 'string') {
                const err4 = {
                  instancePath: instancePath + '/items/' + i0 + '/label',
                  schemaPath:
                    '#/components/schemas/PartialState/properties/label/type',
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
            if (data1.format !== undefined) {
              if (typeof data1.format !== 'string') {
                const err5 = {
                  instancePath: instancePath + '/items/' + i0 + '/format',
                  schemaPath:
                    '#/components/schemas/PartialState/properties/format/type',
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
            if (data1.mediaType !== undefined) {
              if (typeof data1.mediaType !== 'string') {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/mediaType',
                  schemaPath:
                    '#/components/schemas/PartialState/properties/mediaType/type',
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
            if (data1.builtin !== undefined) {
              if (typeof data1.builtin !== 'boolean') {
                const err7 = {
                  instancePath: instancePath + '/items/' + i0 + '/builtin',
                  schemaPath:
                    '#/components/schemas/PartialState/properties/builtin/type',
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
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/PartialState/type',
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
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
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
    if (data.canManage !== undefined) {
      if (typeof data.canManage !== 'boolean') {
        const err10 = {
          instancePath: instancePath + '/canManage',
          schemaPath: '#/properties/canManage/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
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
  validate1416.errors = vErrors;
  return errors === 0;
}
validate1416.evaluated = {
  props: { items: true, canManage: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1413(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listContentTypesOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1413.evaluated;
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
    !validate1414(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1414.errors
        : vErrors.concat(validate1414.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.items = true;
    props0.canManage = true;
  }
  const _errs2 = errors;
  if (
    !validate1416(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1416.errors
        : vErrors.concat(validate1416.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.items = true;
      props0.canManage = true;
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
  validate1413.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate1413.evaluated = { dynamicProps: true, dynamicItems: false };
export const listContentTypesOutputFull = validate1418;
const schema1568 = {
  $ref: 'https://edition.invalid/control#/components/schemas/TypeList',
  $id: 'https://edition.invalid/validators/listContentTypesOutputFull',
};
function validate1419(
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
  const evaluated0 = validate1419.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.items !== undefined) {
      let data0 = data.items;
      if (Array.isArray(data0)) {
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data1 = data0[i0];
          if (data1 && typeof data1 == 'object' && !Array.isArray(data1)) {
            if (data1.contentType !== undefined) {
              if (typeof data1.contentType !== 'string') {
                const err0 = {
                  instancePath: instancePath + '/items/' + i0 + '/contentType',
                  schemaPath:
                    '#/components/schemas/State/properties/contentType/type',
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
            if (data1.enabled !== undefined) {
              if (typeof data1.enabled !== 'boolean') {
                const err1 = {
                  instancePath: instancePath + '/items/' + i0 + '/enabled',
                  schemaPath:
                    '#/components/schemas/State/properties/enabled/type',
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
            if (data1.revision !== undefined) {
              let data4 = data1.revision;
              if (!(
                typeof data4 == 'number' &&
                !(data4 % 1) &&
                !isNaN(data4)
              )) {
                const err2 = {
                  instancePath: instancePath + '/items/' + i0 + '/revision',
                  schemaPath:
                    '#/components/schemas/State/properties/revision/type',
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
            if (data1.activeVersionRef !== undefined) {
              if (typeof data1.activeVersionRef !== 'string') {
                const err3 = {
                  instancePath:
                    instancePath + '/items/' + i0 + '/activeVersionRef',
                  schemaPath:
                    '#/components/schemas/State/properties/activeVersionRef/type',
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
            if (data1.label !== undefined) {
              if (typeof data1.label !== 'string') {
                const err4 = {
                  instancePath: instancePath + '/items/' + i0 + '/label',
                  schemaPath:
                    '#/components/schemas/State/properties/label/type',
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
            if (data1.format !== undefined) {
              if (typeof data1.format !== 'string') {
                const err5 = {
                  instancePath: instancePath + '/items/' + i0 + '/format',
                  schemaPath:
                    '#/components/schemas/State/properties/format/type',
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
            if (data1.mediaType !== undefined) {
              if (typeof data1.mediaType !== 'string') {
                const err6 = {
                  instancePath: instancePath + '/items/' + i0 + '/mediaType',
                  schemaPath:
                    '#/components/schemas/State/properties/mediaType/type',
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
            if (data1.builtin !== undefined) {
              if (typeof data1.builtin !== 'boolean') {
                const err7 = {
                  instancePath: instancePath + '/items/' + i0 + '/builtin',
                  schemaPath:
                    '#/components/schemas/State/properties/builtin/type',
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
              instancePath: instancePath + '/items/' + i0,
              schemaPath: '#/components/schemas/State/type',
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
          instancePath: instancePath + '/items',
          schemaPath: '#/properties/items/type',
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
    if (data.canManage !== undefined) {
      if (typeof data.canManage !== 'boolean') {
        const err10 = {
          instancePath: instancePath + '/canManage',
          schemaPath: '#/properties/canManage/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
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
  validate1419.errors = vErrors;
  return errors === 0;
}
validate1419.evaluated = {
  props: { items: true, canManage: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1418(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listContentTypesOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1418.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate1419(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1419.errors
        : vErrors.concat(validate1419.errors);
    errors = vErrors.length;
  }
  validate1418.errors = vErrors;
  return errors === 0;
}
validate1418.evaluated = {
  props: { items: true, canManage: true },
  dynamicProps: false,
  dynamicItems: false,
};
