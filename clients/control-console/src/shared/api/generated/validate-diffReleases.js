// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const diffReleasesInput = validate1057;
const schema1230 = {
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
      properties: {
        from: { type: 'string', format: 'uuid' },
        to: { type: 'string', format: 'uuid' },
        fields: { type: 'string', maxLength: 4096, minLength: 1 },
      },
      required: ['from', 'to'],
    },
  },
  required: ['path', 'query'],
  $id: 'https://edition.invalid/validators/diffReleasesInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
function validate1057(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/diffReleasesInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1057.evaluated;
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
    if (data.query === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'query' },
        message: "must have required property '" + 'query' + "'",
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
    if (data.query !== undefined) {
      let data3 = data.query;
      if (data3 && typeof data3 == 'object' && !Array.isArray(data3)) {
        if (data3.from === undefined) {
          const err9 = {
            instancePath: instancePath + '/query',
            schemaPath: '#/properties/query/required',
            keyword: 'required',
            params: { missingProperty: 'from' },
            message: "must have required property '" + 'from' + "'",
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
        if (data3.to === undefined) {
          const err10 = {
            instancePath: instancePath + '/query',
            schemaPath: '#/properties/query/required',
            keyword: 'required',
            params: { missingProperty: 'to' },
            message: "must have required property '" + 'to' + "'",
          };
          if (vErrors === null) {
            vErrors = [err10];
          } else {
            vErrors.push(err10);
          }
          errors++;
        }
        if (data3.from !== undefined) {
          let data4 = data3.from;
          if (typeof data4 === 'string') {
            if (!formats0.test(data4)) {
              const err11 = {
                instancePath: instancePath + '/query/from',
                schemaPath: '#/properties/query/properties/from/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
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
              instancePath: instancePath + '/query/from',
              schemaPath: '#/properties/query/properties/from/type',
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
        if (data3.to !== undefined) {
          let data5 = data3.to;
          if (typeof data5 === 'string') {
            if (!formats0.test(data5)) {
              const err13 = {
                instancePath: instancePath + '/query/to',
                schemaPath: '#/properties/query/properties/to/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
              };
              if (vErrors === null) {
                vErrors = [err13];
              } else {
                vErrors.push(err13);
              }
              errors++;
            }
          } else {
            const err14 = {
              instancePath: instancePath + '/query/to',
              schemaPath: '#/properties/query/properties/to/type',
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
        if (data3.fields !== undefined) {
          let data6 = data3.fields;
          if (typeof data6 === 'string') {
            if (func1(data6) > 4096) {
              const err15 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
            if (func1(data6) < 1) {
              const err16 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              };
              if (vErrors === null) {
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
            }
          } else {
            const err17 = {
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err17];
            } else {
              vErrors.push(err17);
            }
            errors++;
          }
        }
      } else {
        const err18 = {
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
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
  validate1057.errors = vErrors;
  return errors === 0;
}
validate1057.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const diffReleasesOutput = validate1058;
const schema1231 = {
  anyOf: [
    {
      $ref: 'https://edition.invalid/control#/components/schemas/ReleaseDelta',
    },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialReleaseDelta',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/diffReleasesOutput',
};
const schema1232 = {
  type: 'object',
  properties: {
    added: {
      type: 'array',
      items: { type: 'string', format: 'uuid' },
      uniqueItems: true,
    },
    changed: {
      type: 'array',
      items: { type: 'string', format: 'uuid' },
      uniqueItems: true,
    },
    removed: {
      type: 'array',
      items: { type: 'string', format: 'uuid' },
      uniqueItems: true,
    },
  },
};
const schema1233 = {
  type: 'object',
  properties: {
    added: {
      type: 'array',
      items: { type: 'string', format: 'uuid' },
      uniqueItems: true,
    },
    changed: {
      type: 'array',
      items: { type: 'string', format: 'uuid' },
      uniqueItems: true,
    },
    removed: {
      type: 'array',
      items: { type: 'string', format: 'uuid' },
      uniqueItems: true,
    },
  },
};
function validate1058(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/diffReleasesOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1058.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  const _errs0 = errors;
  let valid0 = false;
  const _errs1 = errors;
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.added !== undefined) {
      let data0 = data.added;
      if (Array.isArray(data0)) {
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data1 = data0[i0];
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err0 = {
                instancePath: instancePath + '/added/' + i0,
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/ReleaseDelta/properties/added/items/format',
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
              instancePath: instancePath + '/added/' + i0,
              schemaPath:
                'https://edition.invalid/control#/components/schemas/ReleaseDelta/properties/added/items/type',
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
        let i1 = data0.length;
        let j0;
        if (i1 > 1) {
          const indices0 = {};
          for (; i1--;) {
            let item0 = data0[i1];
            if (typeof item0 !== 'string') {
              continue;
            }
            if (typeof indices0[item0] == 'number') {
              j0 = indices0[item0];
              const err2 = {
                instancePath: instancePath + '/added',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/ReleaseDelta/properties/added/uniqueItems',
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
                vErrors = [err2];
              } else {
                vErrors.push(err2);
              }
              errors++;
              break;
            }
            indices0[item0] = i1;
          }
        }
      } else {
        const err3 = {
          instancePath: instancePath + '/added',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ReleaseDelta/properties/added/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.changed !== undefined) {
      let data2 = data.changed;
      if (Array.isArray(data2)) {
        const len1 = data2.length;
        for (let i2 = 0; i2 < len1; i2++) {
          let data3 = data2[i2];
          if (typeof data3 === 'string') {
            if (!formats0.test(data3)) {
              const err4 = {
                instancePath: instancePath + '/changed/' + i2,
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/ReleaseDelta/properties/changed/items/format',
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
              instancePath: instancePath + '/changed/' + i2,
              schemaPath:
                'https://edition.invalid/control#/components/schemas/ReleaseDelta/properties/changed/items/type',
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
        let i3 = data2.length;
        let j1;
        if (i3 > 1) {
          const indices1 = {};
          for (; i3--;) {
            let item1 = data2[i3];
            if (typeof item1 !== 'string') {
              continue;
            }
            if (typeof indices1[item1] == 'number') {
              j1 = indices1[item1];
              const err6 = {
                instancePath: instancePath + '/changed',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/ReleaseDelta/properties/changed/uniqueItems',
                keyword: 'uniqueItems',
                params: { i: i3, j: j1 },
                message:
                  'must NOT have duplicate items (items ## ' +
                  j1 +
                  ' and ' +
                  i3 +
                  ' are identical)',
              };
              if (vErrors === null) {
                vErrors = [err6];
              } else {
                vErrors.push(err6);
              }
              errors++;
              break;
            }
            indices1[item1] = i3;
          }
        }
      } else {
        const err7 = {
          instancePath: instancePath + '/changed',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ReleaseDelta/properties/changed/type',
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
    if (data.removed !== undefined) {
      let data4 = data.removed;
      if (Array.isArray(data4)) {
        const len2 = data4.length;
        for (let i4 = 0; i4 < len2; i4++) {
          let data5 = data4[i4];
          if (typeof data5 === 'string') {
            if (!formats0.test(data5)) {
              const err8 = {
                instancePath: instancePath + '/removed/' + i4,
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/ReleaseDelta/properties/removed/items/format',
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
              instancePath: instancePath + '/removed/' + i4,
              schemaPath:
                'https://edition.invalid/control#/components/schemas/ReleaseDelta/properties/removed/items/type',
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
        let i5 = data4.length;
        let j2;
        if (i5 > 1) {
          const indices2 = {};
          for (; i5--;) {
            let item2 = data4[i5];
            if (typeof item2 !== 'string') {
              continue;
            }
            if (typeof indices2[item2] == 'number') {
              j2 = indices2[item2];
              const err10 = {
                instancePath: instancePath + '/removed',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/ReleaseDelta/properties/removed/uniqueItems',
                keyword: 'uniqueItems',
                params: { i: i5, j: j2 },
                message:
                  'must NOT have duplicate items (items ## ' +
                  j2 +
                  ' and ' +
                  i5 +
                  ' are identical)',
              };
              if (vErrors === null) {
                vErrors = [err10];
              } else {
                vErrors.push(err10);
              }
              errors++;
              break;
            }
            indices2[item2] = i5;
          }
        }
      } else {
        const err11 = {
          instancePath: instancePath + '/removed',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ReleaseDelta/properties/removed/type',
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
    }
  } else {
    const err12 = {
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/ReleaseDelta/type',
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
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.added = true;
    props0.changed = true;
    props0.removed = true;
  }
  const _errs16 = errors;
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.added !== undefined) {
      let data6 = data.added;
      if (Array.isArray(data6)) {
        const len3 = data6.length;
        for (let i6 = 0; i6 < len3; i6++) {
          let data7 = data6[i6];
          if (typeof data7 === 'string') {
            if (!formats0.test(data7)) {
              const err13 = {
                instancePath: instancePath + '/added/' + i6,
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/PartialReleaseDelta/properties/added/items/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
              };
              if (vErrors === null) {
                vErrors = [err13];
              } else {
                vErrors.push(err13);
              }
              errors++;
            }
          } else {
            const err14 = {
              instancePath: instancePath + '/added/' + i6,
              schemaPath:
                'https://edition.invalid/control#/components/schemas/PartialReleaseDelta/properties/added/items/type',
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
        let i7 = data6.length;
        let j3;
        if (i7 > 1) {
          const indices3 = {};
          for (; i7--;) {
            let item3 = data6[i7];
            if (typeof item3 !== 'string') {
              continue;
            }
            if (typeof indices3[item3] == 'number') {
              j3 = indices3[item3];
              const err15 = {
                instancePath: instancePath + '/added',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/PartialReleaseDelta/properties/added/uniqueItems',
                keyword: 'uniqueItems',
                params: { i: i7, j: j3 },
                message:
                  'must NOT have duplicate items (items ## ' +
                  j3 +
                  ' and ' +
                  i7 +
                  ' are identical)',
              };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
              break;
            }
            indices3[item3] = i7;
          }
        }
      } else {
        const err16 = {
          instancePath: instancePath + '/added',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialReleaseDelta/properties/added/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err16];
        } else {
          vErrors.push(err16);
        }
        errors++;
      }
    }
    if (data.changed !== undefined) {
      let data8 = data.changed;
      if (Array.isArray(data8)) {
        const len4 = data8.length;
        for (let i8 = 0; i8 < len4; i8++) {
          let data9 = data8[i8];
          if (typeof data9 === 'string') {
            if (!formats0.test(data9)) {
              const err17 = {
                instancePath: instancePath + '/changed/' + i8,
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/PartialReleaseDelta/properties/changed/items/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
              };
              if (vErrors === null) {
                vErrors = [err17];
              } else {
                vErrors.push(err17);
              }
              errors++;
            }
          } else {
            const err18 = {
              instancePath: instancePath + '/changed/' + i8,
              schemaPath:
                'https://edition.invalid/control#/components/schemas/PartialReleaseDelta/properties/changed/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err18];
            } else {
              vErrors.push(err18);
            }
            errors++;
          }
        }
        let i9 = data8.length;
        let j4;
        if (i9 > 1) {
          const indices4 = {};
          for (; i9--;) {
            let item4 = data8[i9];
            if (typeof item4 !== 'string') {
              continue;
            }
            if (typeof indices4[item4] == 'number') {
              j4 = indices4[item4];
              const err19 = {
                instancePath: instancePath + '/changed',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/PartialReleaseDelta/properties/changed/uniqueItems',
                keyword: 'uniqueItems',
                params: { i: i9, j: j4 },
                message:
                  'must NOT have duplicate items (items ## ' +
                  j4 +
                  ' and ' +
                  i9 +
                  ' are identical)',
              };
              if (vErrors === null) {
                vErrors = [err19];
              } else {
                vErrors.push(err19);
              }
              errors++;
              break;
            }
            indices4[item4] = i9;
          }
        }
      } else {
        const err20 = {
          instancePath: instancePath + '/changed',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialReleaseDelta/properties/changed/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.removed !== undefined) {
      let data10 = data.removed;
      if (Array.isArray(data10)) {
        const len5 = data10.length;
        for (let i10 = 0; i10 < len5; i10++) {
          let data11 = data10[i10];
          if (typeof data11 === 'string') {
            if (!formats0.test(data11)) {
              const err21 = {
                instancePath: instancePath + '/removed/' + i10,
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/PartialReleaseDelta/properties/removed/items/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
              };
              if (vErrors === null) {
                vErrors = [err21];
              } else {
                vErrors.push(err21);
              }
              errors++;
            }
          } else {
            const err22 = {
              instancePath: instancePath + '/removed/' + i10,
              schemaPath:
                'https://edition.invalid/control#/components/schemas/PartialReleaseDelta/properties/removed/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err22];
            } else {
              vErrors.push(err22);
            }
            errors++;
          }
        }
        let i11 = data10.length;
        let j5;
        if (i11 > 1) {
          const indices5 = {};
          for (; i11--;) {
            let item5 = data10[i11];
            if (typeof item5 !== 'string') {
              continue;
            }
            if (typeof indices5[item5] == 'number') {
              j5 = indices5[item5];
              const err23 = {
                instancePath: instancePath + '/removed',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/PartialReleaseDelta/properties/removed/uniqueItems',
                keyword: 'uniqueItems',
                params: { i: i11, j: j5 },
                message:
                  'must NOT have duplicate items (items ## ' +
                  j5 +
                  ' and ' +
                  i11 +
                  ' are identical)',
              };
              if (vErrors === null) {
                vErrors = [err23];
              } else {
                vErrors.push(err23);
              }
              errors++;
              break;
            }
            indices5[item5] = i11;
          }
        }
      } else {
        const err24 = {
          instancePath: instancePath + '/removed',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialReleaseDelta/properties/removed/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err24];
        } else {
          vErrors.push(err24);
        }
        errors++;
      }
    }
  } else {
    const err25 = {
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/PartialReleaseDelta/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err25];
    } else {
      vErrors.push(err25);
    }
    errors++;
  }
  var _valid0 = _errs16 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.added = true;
      props0.changed = true;
      props0.removed = true;
    }
  }
  if (!valid0) {
    const err26 = {
      instancePath,
      schemaPath: '#/anyOf',
      keyword: 'anyOf',
      params: {},
      message: 'must match a schema in anyOf',
    };
    if (vErrors === null) {
      vErrors = [err26];
    } else {
      vErrors.push(err26);
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
  validate1058.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate1058.evaluated = { dynamicProps: true, dynamicItems: false };
export const diffReleasesOutputFull = validate1059;
const schema1234 = {
  $ref: 'https://edition.invalid/control#/components/schemas/ReleaseDelta',
  $id: 'https://edition.invalid/validators/diffReleasesOutputFull',
};
function validate1059(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/diffReleasesOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1059.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.added !== undefined) {
      let data0 = data.added;
      if (Array.isArray(data0)) {
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data1 = data0[i0];
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err0 = {
                instancePath: instancePath + '/added/' + i0,
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/ReleaseDelta/properties/added/items/format',
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
              instancePath: instancePath + '/added/' + i0,
              schemaPath:
                'https://edition.invalid/control#/components/schemas/ReleaseDelta/properties/added/items/type',
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
        let i1 = data0.length;
        let j0;
        if (i1 > 1) {
          const indices0 = {};
          for (; i1--;) {
            let item0 = data0[i1];
            if (typeof item0 !== 'string') {
              continue;
            }
            if (typeof indices0[item0] == 'number') {
              j0 = indices0[item0];
              const err2 = {
                instancePath: instancePath + '/added',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/ReleaseDelta/properties/added/uniqueItems',
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
                vErrors = [err2];
              } else {
                vErrors.push(err2);
              }
              errors++;
              break;
            }
            indices0[item0] = i1;
          }
        }
      } else {
        const err3 = {
          instancePath: instancePath + '/added',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ReleaseDelta/properties/added/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.changed !== undefined) {
      let data2 = data.changed;
      if (Array.isArray(data2)) {
        const len1 = data2.length;
        for (let i2 = 0; i2 < len1; i2++) {
          let data3 = data2[i2];
          if (typeof data3 === 'string') {
            if (!formats0.test(data3)) {
              const err4 = {
                instancePath: instancePath + '/changed/' + i2,
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/ReleaseDelta/properties/changed/items/format',
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
              instancePath: instancePath + '/changed/' + i2,
              schemaPath:
                'https://edition.invalid/control#/components/schemas/ReleaseDelta/properties/changed/items/type',
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
        let i3 = data2.length;
        let j1;
        if (i3 > 1) {
          const indices1 = {};
          for (; i3--;) {
            let item1 = data2[i3];
            if (typeof item1 !== 'string') {
              continue;
            }
            if (typeof indices1[item1] == 'number') {
              j1 = indices1[item1];
              const err6 = {
                instancePath: instancePath + '/changed',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/ReleaseDelta/properties/changed/uniqueItems',
                keyword: 'uniqueItems',
                params: { i: i3, j: j1 },
                message:
                  'must NOT have duplicate items (items ## ' +
                  j1 +
                  ' and ' +
                  i3 +
                  ' are identical)',
              };
              if (vErrors === null) {
                vErrors = [err6];
              } else {
                vErrors.push(err6);
              }
              errors++;
              break;
            }
            indices1[item1] = i3;
          }
        }
      } else {
        const err7 = {
          instancePath: instancePath + '/changed',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ReleaseDelta/properties/changed/type',
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
    if (data.removed !== undefined) {
      let data4 = data.removed;
      if (Array.isArray(data4)) {
        const len2 = data4.length;
        for (let i4 = 0; i4 < len2; i4++) {
          let data5 = data4[i4];
          if (typeof data5 === 'string') {
            if (!formats0.test(data5)) {
              const err8 = {
                instancePath: instancePath + '/removed/' + i4,
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/ReleaseDelta/properties/removed/items/format',
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
              instancePath: instancePath + '/removed/' + i4,
              schemaPath:
                'https://edition.invalid/control#/components/schemas/ReleaseDelta/properties/removed/items/type',
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
        let i5 = data4.length;
        let j2;
        if (i5 > 1) {
          const indices2 = {};
          for (; i5--;) {
            let item2 = data4[i5];
            if (typeof item2 !== 'string') {
              continue;
            }
            if (typeof indices2[item2] == 'number') {
              j2 = indices2[item2];
              const err10 = {
                instancePath: instancePath + '/removed',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/ReleaseDelta/properties/removed/uniqueItems',
                keyword: 'uniqueItems',
                params: { i: i5, j: j2 },
                message:
                  'must NOT have duplicate items (items ## ' +
                  j2 +
                  ' and ' +
                  i5 +
                  ' are identical)',
              };
              if (vErrors === null) {
                vErrors = [err10];
              } else {
                vErrors.push(err10);
              }
              errors++;
              break;
            }
            indices2[item2] = i5;
          }
        }
      } else {
        const err11 = {
          instancePath: instancePath + '/removed',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ReleaseDelta/properties/removed/type',
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
    }
  } else {
    const err12 = {
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/ReleaseDelta/type',
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
  validate1059.errors = vErrors;
  return errors === 0;
}
validate1059.evaluated = {
  props: { added: true, changed: true, removed: true },
  dynamicProps: false,
  dynamicItems: false,
};
