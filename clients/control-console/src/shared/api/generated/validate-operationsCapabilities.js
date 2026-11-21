// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const operationsCapabilitiesInput = validate1376;
const schema1520 = {
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
  $id: 'https://edition.invalid/validators/operationsCapabilitiesInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
function validate1376(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/operationsCapabilitiesInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1376.evaluated;
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
  validate1376.errors = vErrors;
  return errors === 0;
}
validate1376.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const operationsCapabilitiesOutput = validate1377;
const schema1521 = {
  anyOf: [
    {
      $ref: 'https://edition.invalid/control#/components/schemas/Capabilities',
    },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialCapabilities',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/operationsCapabilitiesOutput',
};
const schema1522 = {
  type: 'object',
  properties: {
    audit: { type: 'boolean' },
    webhooks: { type: 'boolean' },
    tenantStats: { type: 'boolean' },
    spaces: { type: 'array', items: { $ref: '#/components/schemas/Choice' } },
    sites: { type: 'array', items: { $ref: '#/components/schemas/Choice' } },
  },
};
const schema1523 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
  },
};
function validate1378(
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
  const evaluated0 = validate1378.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.audit !== undefined) {
      if (typeof data.audit !== 'boolean') {
        const err0 = {
          instancePath: instancePath + '/audit',
          schemaPath: '#/properties/audit/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.webhooks !== undefined) {
      if (typeof data.webhooks !== 'boolean') {
        const err1 = {
          instancePath: instancePath + '/webhooks',
          schemaPath: '#/properties/webhooks/type',
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
    if (data.tenantStats !== undefined) {
      if (typeof data.tenantStats !== 'boolean') {
        const err2 = {
          instancePath: instancePath + '/tenantStats',
          schemaPath: '#/properties/tenantStats/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.spaces !== undefined) {
      let data3 = data.spaces;
      if (Array.isArray(data3)) {
        const len0 = data3.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data4 = data3[i0];
          if (data4 && typeof data4 == 'object' && !Array.isArray(data4)) {
            if (data4.id !== undefined) {
              let data5 = data4.id;
              if (typeof data5 === 'string') {
                if (!formats0.test(data5)) {
                  const err3 = {
                    instancePath: instancePath + '/spaces/' + i0 + '/id',
                    schemaPath:
                      '#/components/schemas/Choice/properties/id/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
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
                  instancePath: instancePath + '/spaces/' + i0 + '/id',
                  schemaPath: '#/components/schemas/Choice/properties/id/type',
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
            if (data4.name !== undefined) {
              if (typeof data4.name !== 'string') {
                const err5 = {
                  instancePath: instancePath + '/spaces/' + i0 + '/name',
                  schemaPath:
                    '#/components/schemas/Choice/properties/name/type',
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
              instancePath: instancePath + '/spaces/' + i0,
              schemaPath: '#/components/schemas/Choice/type',
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
      } else {
        const err7 = {
          instancePath: instancePath + '/spaces',
          schemaPath: '#/properties/spaces/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.sites !== undefined) {
      let data7 = data.sites;
      if (Array.isArray(data7)) {
        const len1 = data7.length;
        for (let i1 = 0; i1 < len1; i1++) {
          let data8 = data7[i1];
          if (data8 && typeof data8 == 'object' && !Array.isArray(data8)) {
            if (data8.id !== undefined) {
              let data9 = data8.id;
              if (typeof data9 === 'string') {
                if (!formats0.test(data9)) {
                  const err8 = {
                    instancePath: instancePath + '/sites/' + i1 + '/id',
                    schemaPath:
                      '#/components/schemas/Choice/properties/id/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err8];
                  } else {
                    vErrors.push(err8);
                  }
                  errors++;
                }
              } else {
                const err9 = {
                  instancePath: instancePath + '/sites/' + i1 + '/id',
                  schemaPath: '#/components/schemas/Choice/properties/id/type',
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
            if (data8.name !== undefined) {
              if (typeof data8.name !== 'string') {
                const err10 = {
                  instancePath: instancePath + '/sites/' + i1 + '/name',
                  schemaPath:
                    '#/components/schemas/Choice/properties/name/type',
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
              instancePath: instancePath + '/sites/' + i1,
              schemaPath: '#/components/schemas/Choice/type',
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
          instancePath: instancePath + '/sites',
          schemaPath: '#/properties/sites/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
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
  validate1378.errors = vErrors;
  return errors === 0;
}
validate1378.evaluated = {
  props: {
    audit: true,
    webhooks: true,
    tenantStats: true,
    spaces: true,
    sites: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
const schema1525 = {
  type: 'object',
  properties: {
    audit: { type: 'boolean' },
    webhooks: { type: 'boolean' },
    tenantStats: { type: 'boolean' },
    spaces: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialChoice' },
    },
    sites: {
      type: 'array',
      items: { $ref: '#/components/schemas/PartialChoice' },
    },
  },
};
const schema1526 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
  },
};
function validate1380(
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
  const evaluated0 = validate1380.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.audit !== undefined) {
      if (typeof data.audit !== 'boolean') {
        const err0 = {
          instancePath: instancePath + '/audit',
          schemaPath: '#/properties/audit/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.webhooks !== undefined) {
      if (typeof data.webhooks !== 'boolean') {
        const err1 = {
          instancePath: instancePath + '/webhooks',
          schemaPath: '#/properties/webhooks/type',
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
    if (data.tenantStats !== undefined) {
      if (typeof data.tenantStats !== 'boolean') {
        const err2 = {
          instancePath: instancePath + '/tenantStats',
          schemaPath: '#/properties/tenantStats/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.spaces !== undefined) {
      let data3 = data.spaces;
      if (Array.isArray(data3)) {
        const len0 = data3.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data4 = data3[i0];
          if (data4 && typeof data4 == 'object' && !Array.isArray(data4)) {
            if (data4.id !== undefined) {
              let data5 = data4.id;
              if (typeof data5 === 'string') {
                if (!formats0.test(data5)) {
                  const err3 = {
                    instancePath: instancePath + '/spaces/' + i0 + '/id',
                    schemaPath:
                      '#/components/schemas/PartialChoice/properties/id/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
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
                  instancePath: instancePath + '/spaces/' + i0 + '/id',
                  schemaPath:
                    '#/components/schemas/PartialChoice/properties/id/type',
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
            if (data4.name !== undefined) {
              if (typeof data4.name !== 'string') {
                const err5 = {
                  instancePath: instancePath + '/spaces/' + i0 + '/name',
                  schemaPath:
                    '#/components/schemas/PartialChoice/properties/name/type',
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
              instancePath: instancePath + '/spaces/' + i0,
              schemaPath: '#/components/schemas/PartialChoice/type',
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
      } else {
        const err7 = {
          instancePath: instancePath + '/spaces',
          schemaPath: '#/properties/spaces/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.sites !== undefined) {
      let data7 = data.sites;
      if (Array.isArray(data7)) {
        const len1 = data7.length;
        for (let i1 = 0; i1 < len1; i1++) {
          let data8 = data7[i1];
          if (data8 && typeof data8 == 'object' && !Array.isArray(data8)) {
            if (data8.id !== undefined) {
              let data9 = data8.id;
              if (typeof data9 === 'string') {
                if (!formats0.test(data9)) {
                  const err8 = {
                    instancePath: instancePath + '/sites/' + i1 + '/id',
                    schemaPath:
                      '#/components/schemas/PartialChoice/properties/id/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err8];
                  } else {
                    vErrors.push(err8);
                  }
                  errors++;
                }
              } else {
                const err9 = {
                  instancePath: instancePath + '/sites/' + i1 + '/id',
                  schemaPath:
                    '#/components/schemas/PartialChoice/properties/id/type',
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
            if (data8.name !== undefined) {
              if (typeof data8.name !== 'string') {
                const err10 = {
                  instancePath: instancePath + '/sites/' + i1 + '/name',
                  schemaPath:
                    '#/components/schemas/PartialChoice/properties/name/type',
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
              instancePath: instancePath + '/sites/' + i1,
              schemaPath: '#/components/schemas/PartialChoice/type',
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
          instancePath: instancePath + '/sites',
          schemaPath: '#/properties/sites/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
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
  validate1380.errors = vErrors;
  return errors === 0;
}
validate1380.evaluated = {
  props: {
    audit: true,
    webhooks: true,
    tenantStats: true,
    spaces: true,
    sites: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1377(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/operationsCapabilitiesOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1377.evaluated;
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
    !validate1378(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1378.errors
        : vErrors.concat(validate1378.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.audit = true;
    props0.webhooks = true;
    props0.tenantStats = true;
    props0.spaces = true;
    props0.sites = true;
  }
  const _errs2 = errors;
  if (
    !validate1380(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1380.errors
        : vErrors.concat(validate1380.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.audit = true;
      props0.webhooks = true;
      props0.tenantStats = true;
      props0.spaces = true;
      props0.sites = true;
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
  validate1377.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate1377.evaluated = { dynamicProps: true, dynamicItems: false };
export const operationsCapabilitiesOutputFull = validate1382;
const schema1528 = {
  $ref: 'https://edition.invalid/control#/components/schemas/Capabilities',
  $id: 'https://edition.invalid/validators/operationsCapabilitiesOutputFull',
};
function validate1383(
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
  const evaluated0 = validate1383.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.audit !== undefined) {
      if (typeof data.audit !== 'boolean') {
        const err0 = {
          instancePath: instancePath + '/audit',
          schemaPath: '#/properties/audit/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.webhooks !== undefined) {
      if (typeof data.webhooks !== 'boolean') {
        const err1 = {
          instancePath: instancePath + '/webhooks',
          schemaPath: '#/properties/webhooks/type',
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
    if (data.tenantStats !== undefined) {
      if (typeof data.tenantStats !== 'boolean') {
        const err2 = {
          instancePath: instancePath + '/tenantStats',
          schemaPath: '#/properties/tenantStats/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.spaces !== undefined) {
      let data3 = data.spaces;
      if (Array.isArray(data3)) {
        const len0 = data3.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data4 = data3[i0];
          if (data4 && typeof data4 == 'object' && !Array.isArray(data4)) {
            if (data4.id !== undefined) {
              let data5 = data4.id;
              if (typeof data5 === 'string') {
                if (!formats0.test(data5)) {
                  const err3 = {
                    instancePath: instancePath + '/spaces/' + i0 + '/id',
                    schemaPath:
                      '#/components/schemas/Choice/properties/id/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
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
                  instancePath: instancePath + '/spaces/' + i0 + '/id',
                  schemaPath: '#/components/schemas/Choice/properties/id/type',
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
            if (data4.name !== undefined) {
              if (typeof data4.name !== 'string') {
                const err5 = {
                  instancePath: instancePath + '/spaces/' + i0 + '/name',
                  schemaPath:
                    '#/components/schemas/Choice/properties/name/type',
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
              instancePath: instancePath + '/spaces/' + i0,
              schemaPath: '#/components/schemas/Choice/type',
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
      } else {
        const err7 = {
          instancePath: instancePath + '/spaces',
          schemaPath: '#/properties/spaces/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.sites !== undefined) {
      let data7 = data.sites;
      if (Array.isArray(data7)) {
        const len1 = data7.length;
        for (let i1 = 0; i1 < len1; i1++) {
          let data8 = data7[i1];
          if (data8 && typeof data8 == 'object' && !Array.isArray(data8)) {
            if (data8.id !== undefined) {
              let data9 = data8.id;
              if (typeof data9 === 'string') {
                if (!formats0.test(data9)) {
                  const err8 = {
                    instancePath: instancePath + '/sites/' + i1 + '/id',
                    schemaPath:
                      '#/components/schemas/Choice/properties/id/format',
                    keyword: 'format',
                    params: { format: 'uuid' },
                    message: 'must match format "' + 'uuid' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err8];
                  } else {
                    vErrors.push(err8);
                  }
                  errors++;
                }
              } else {
                const err9 = {
                  instancePath: instancePath + '/sites/' + i1 + '/id',
                  schemaPath: '#/components/schemas/Choice/properties/id/type',
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
            if (data8.name !== undefined) {
              if (typeof data8.name !== 'string') {
                const err10 = {
                  instancePath: instancePath + '/sites/' + i1 + '/name',
                  schemaPath:
                    '#/components/schemas/Choice/properties/name/type',
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
              instancePath: instancePath + '/sites/' + i1,
              schemaPath: '#/components/schemas/Choice/type',
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
          instancePath: instancePath + '/sites',
          schemaPath: '#/properties/sites/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
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
  validate1383.errors = vErrors;
  return errors === 0;
}
validate1383.evaluated = {
  props: {
    audit: true,
    webhooks: true,
    tenantStats: true,
    spaces: true,
    sites: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate1382(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/operationsCapabilitiesOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1382.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate1383(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate1383.errors
        : vErrors.concat(validate1383.errors);
    errors = vErrors.length;
  }
  validate1382.errors = vErrors;
  return errors === 0;
}
validate1382.evaluated = {
  props: {
    audit: true,
    webhooks: true,
    tenantStats: true,
    spaces: true,
    sites: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
