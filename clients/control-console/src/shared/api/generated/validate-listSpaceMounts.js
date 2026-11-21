// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const listSpaceMountsInput = validate1221;
const schema1375 = {
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
    query: {
      type: 'object',
      properties: { fields: { type: 'string', maxLength: 4096, minLength: 1 } },
      required: [],
    },
  },
  required: ['path'],
  $id: 'https://edition.invalid/validators/listSpaceMountsInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
function validate1221(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listSpaceMountsInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1221.evaluated;
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
        if (data0.spaceId === undefined) {
          const err2 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'spaceId' },
            message: "must have required property '" + 'spaceId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
        if (data0.tenantId !== undefined) {
          let data1 = data0.tenantId;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err3 = {
                instancePath: instancePath + '/path/tenantId',
                schemaPath: '#/properties/path/properties/tenantId/format',
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
              instancePath: instancePath + '/path/tenantId',
              schemaPath: '#/properties/path/properties/tenantId/type',
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
        if (data0.spaceId !== undefined) {
          let data2 = data0.spaceId;
          if (typeof data2 === 'string') {
            if (!formats0.test(data2)) {
              const err5 = {
                instancePath: instancePath + '/path/spaceId',
                schemaPath: '#/properties/path/properties/spaceId/format',
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
          } else {
            const err6 = {
              instancePath: instancePath + '/path/spaceId',
              schemaPath: '#/properties/path/properties/spaceId/type',
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
          instancePath: instancePath + '/path',
          schemaPath: '#/properties/path/type',
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
    if (data.query !== undefined) {
      let data3 = data.query;
      if (data3 && typeof data3 == 'object' && !Array.isArray(data3)) {
        if (data3.fields !== undefined) {
          let data4 = data3.fields;
          if (typeof data4 === 'string') {
            if (func1(data4) > 4096) {
              const err8 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err8];
              } else {
                vErrors.push(err8);
              }
              errors++;
            }
            if (func1(data4) < 1) {
              const err9 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
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
          } else {
            const err10 = {
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
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
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
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
  validate1221.errors = vErrors;
  return errors === 0;
}
validate1221.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const listSpaceMountsOutput = validate1222;
const schema1376 = {
  anyOf: [
    {
      type: 'array',
      items: {
        $ref: 'https://edition.invalid/control#/components/schemas/SpaceMount',
      },
    },
    {
      type: 'array',
      items: {
        $ref: 'https://edition.invalid/control#/components/schemas/PartialSpaceMount',
      },
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/listSpaceMountsOutput',
};
const schema42 = {
  type: 'object',
  properties: {
    siteId: { type: 'string', format: 'uuid' },
    slug: { type: 'string' },
  },
  required: ['siteId', 'slug'],
};
const schema926 = {
  type: 'object',
  properties: {
    siteId: { type: 'string', format: 'uuid' },
    slug: { type: 'string' },
  },
};
function validate1222(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listSpaceMountsOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1222.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  const _errs0 = errors;
  let valid0 = false;
  const _errs1 = errors;
  if (Array.isArray(data)) {
    const len0 = data.length;
    for (let i0 = 0; i0 < len0; i0++) {
      let data0 = data[i0];
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.siteId === undefined) {
          const err0 = {
            instancePath: instancePath + '/' + i0,
            schemaPath:
              'https://edition.invalid/control#/components/schemas/SpaceMount/required',
            keyword: 'required',
            params: { missingProperty: 'siteId' },
            message: "must have required property '" + 'siteId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err0];
          } else {
            vErrors.push(err0);
          }
          errors++;
        }
        if (data0.slug === undefined) {
          const err1 = {
            instancePath: instancePath + '/' + i0,
            schemaPath:
              'https://edition.invalid/control#/components/schemas/SpaceMount/required',
            keyword: 'required',
            params: { missingProperty: 'slug' },
            message: "must have required property '" + 'slug' + "'",
          };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
        if (data0.siteId !== undefined) {
          let data1 = data0.siteId;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err2 = {
                instancePath: instancePath + '/' + i0 + '/siteId',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/SpaceMount/properties/siteId/format',
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
              instancePath: instancePath + '/' + i0 + '/siteId',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/SpaceMount/properties/siteId/type',
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
        if (data0.slug !== undefined) {
          if (typeof data0.slug !== 'string') {
            const err4 = {
              instancePath: instancePath + '/' + i0 + '/slug',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/SpaceMount/properties/slug/type',
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
          instancePath: instancePath + '/' + i0,
          schemaPath:
            'https://edition.invalid/control#/components/schemas/SpaceMount/type',
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
  } else {
    const err6 = {
      instancePath,
      schemaPath: '#/anyOf/0/type',
      keyword: 'type',
      params: { type: 'array' },
      message: 'must be array',
    };
    if (vErrors === null) {
      vErrors = [err6];
    } else {
      vErrors.push(err6);
    }
    errors++;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var items0 = true;
  }
  const _errs10 = errors;
  if (Array.isArray(data)) {
    const len1 = data.length;
    for (let i1 = 0; i1 < len1; i1++) {
      let data3 = data[i1];
      if (data3 && typeof data3 == 'object' && !Array.isArray(data3)) {
        if (data3.siteId !== undefined) {
          let data4 = data3.siteId;
          if (typeof data4 === 'string') {
            if (!formats0.test(data4)) {
              const err7 = {
                instancePath: instancePath + '/' + i1 + '/siteId',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/PartialSpaceMount/properties/siteId/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
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
              instancePath: instancePath + '/' + i1 + '/siteId',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/PartialSpaceMount/properties/siteId/type',
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
        if (data3.slug !== undefined) {
          if (typeof data3.slug !== 'string') {
            const err9 = {
              instancePath: instancePath + '/' + i1 + '/slug',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/PartialSpaceMount/properties/slug/type',
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
          instancePath: instancePath + '/' + i1,
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialSpaceMount/type',
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
    }
  } else {
    const err11 = {
      instancePath,
      schemaPath: '#/anyOf/1/type',
      keyword: 'type',
      params: { type: 'array' },
      message: 'must be array',
    };
    if (vErrors === null) {
      vErrors = [err11];
    } else {
      vErrors.push(err11);
    }
    errors++;
  }
  var _valid0 = _errs10 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (items0 !== true) {
      items0 = true;
    }
  }
  if (!valid0) {
    const err12 = {
      instancePath,
      schemaPath: '#/anyOf',
      keyword: 'anyOf',
      params: {},
      message: 'must match a schema in anyOf',
    };
    if (vErrors === null) {
      vErrors = [err12];
    } else {
      vErrors.push(err12);
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
  validate1222.errors = vErrors;
  evaluated0.items = items0;
  return errors === 0;
}
validate1222.evaluated = { dynamicProps: false, dynamicItems: true };
export const listSpaceMountsOutputFull = validate1223;
const schema1379 = {
  anyOf: [
    {
      type: 'array',
      items: {
        $ref: 'https://edition.invalid/control#/components/schemas/SpaceMount',
      },
    },
    {
      type: 'array',
      items: {
        $ref: 'https://edition.invalid/control#/components/schemas/PartialSpaceMount',
      },
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/listSpaceMountsOutputFull',
};
function validate1223(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/listSpaceMountsOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1223.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  const _errs0 = errors;
  let valid0 = false;
  const _errs1 = errors;
  if (Array.isArray(data)) {
    const len0 = data.length;
    for (let i0 = 0; i0 < len0; i0++) {
      let data0 = data[i0];
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0.siteId === undefined) {
          const err0 = {
            instancePath: instancePath + '/' + i0,
            schemaPath:
              'https://edition.invalid/control#/components/schemas/SpaceMount/required',
            keyword: 'required',
            params: { missingProperty: 'siteId' },
            message: "must have required property '" + 'siteId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err0];
          } else {
            vErrors.push(err0);
          }
          errors++;
        }
        if (data0.slug === undefined) {
          const err1 = {
            instancePath: instancePath + '/' + i0,
            schemaPath:
              'https://edition.invalid/control#/components/schemas/SpaceMount/required',
            keyword: 'required',
            params: { missingProperty: 'slug' },
            message: "must have required property '" + 'slug' + "'",
          };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
        if (data0.siteId !== undefined) {
          let data1 = data0.siteId;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err2 = {
                instancePath: instancePath + '/' + i0 + '/siteId',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/SpaceMount/properties/siteId/format',
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
              instancePath: instancePath + '/' + i0 + '/siteId',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/SpaceMount/properties/siteId/type',
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
        if (data0.slug !== undefined) {
          if (typeof data0.slug !== 'string') {
            const err4 = {
              instancePath: instancePath + '/' + i0 + '/slug',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/SpaceMount/properties/slug/type',
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
          instancePath: instancePath + '/' + i0,
          schemaPath:
            'https://edition.invalid/control#/components/schemas/SpaceMount/type',
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
  } else {
    const err6 = {
      instancePath,
      schemaPath: '#/anyOf/0/type',
      keyword: 'type',
      params: { type: 'array' },
      message: 'must be array',
    };
    if (vErrors === null) {
      vErrors = [err6];
    } else {
      vErrors.push(err6);
    }
    errors++;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var items0 = true;
  }
  const _errs10 = errors;
  if (Array.isArray(data)) {
    const len1 = data.length;
    for (let i1 = 0; i1 < len1; i1++) {
      let data3 = data[i1];
      if (data3 && typeof data3 == 'object' && !Array.isArray(data3)) {
        if (data3.siteId !== undefined) {
          let data4 = data3.siteId;
          if (typeof data4 === 'string') {
            if (!formats0.test(data4)) {
              const err7 = {
                instancePath: instancePath + '/' + i1 + '/siteId',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/PartialSpaceMount/properties/siteId/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
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
              instancePath: instancePath + '/' + i1 + '/siteId',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/PartialSpaceMount/properties/siteId/type',
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
        if (data3.slug !== undefined) {
          if (typeof data3.slug !== 'string') {
            const err9 = {
              instancePath: instancePath + '/' + i1 + '/slug',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/PartialSpaceMount/properties/slug/type',
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
          instancePath: instancePath + '/' + i1,
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialSpaceMount/type',
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
    }
  } else {
    const err11 = {
      instancePath,
      schemaPath: '#/anyOf/1/type',
      keyword: 'type',
      params: { type: 'array' },
      message: 'must be array',
    };
    if (vErrors === null) {
      vErrors = [err11];
    } else {
      vErrors.push(err11);
    }
    errors++;
  }
  var _valid0 = _errs10 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (items0 !== true) {
      items0 = true;
    }
  }
  if (!valid0) {
    const err12 = {
      instancePath,
      schemaPath: '#/anyOf',
      keyword: 'anyOf',
      params: {},
      message: 'must match a schema in anyOf',
    };
    if (vErrors === null) {
      vErrors = [err12];
    } else {
      vErrors.push(err12);
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
  validate1223.errors = vErrors;
  evaluated0.items = items0;
  return errors === 0;
}
validate1223.evaluated = { dynamicProps: false, dynamicItems: true };
