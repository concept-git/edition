// Generated from contracts/openapi.json. Do not edit.
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const createCollectionInput = validate728;
const schema841 = {
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
      $ref: 'https://edition.invalid/control#/components/schemas/CreateRequest',
    },
  },
  required: ['path', 'header', 'body'],
  $id: 'https://edition.invalid/validators/createCollectionInput',
};
const schema842 = {
  type: 'object',
  properties: {
    parentId: { type: 'string', format: 'uuid' },
    name: { type: 'string', maxLength: 200, minLength: 0 },
    icon: { type: 'string', pattern: 'book|code|api|guide|reference' },
    position: { type: 'integer', format: 'int32', minimum: 0 },
  },
  required: ['name'],
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
const pattern4 = new RegExp('^[a-zA-Z0-9._:-]+$', 'u');
const pattern96 = new RegExp('book|code|api|guide|reference', 'u');
function validate728(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/createCollectionInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate728.evaluated;
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
        if (data4.name === undefined) {
          const err13 = {
            instancePath: instancePath + '/body',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/CreateRequest/required',
            keyword: 'required',
            params: { missingProperty: 'name' },
            message: "must have required property '" + 'name' + "'",
          };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
        if (data4.parentId !== undefined) {
          let data5 = data4.parentId;
          if (typeof data5 === 'string') {
            if (!formats0.test(data5)) {
              const err14 = {
                instancePath: instancePath + '/body/parentId',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/CreateRequest/properties/parentId/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
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
              instancePath: instancePath + '/body/parentId',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/CreateRequest/properties/parentId/type',
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
        if (data4.name !== undefined) {
          let data6 = data4.name;
          if (typeof data6 === 'string') {
            if (func1(data6) > 200) {
              const err16 = {
                instancePath: instancePath + '/body/name',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/CreateRequest/properties/name/maxLength',
                keyword: 'maxLength',
                params: { limit: 200 },
                message: 'must NOT have more than 200 characters',
              };
              if (vErrors === null) {
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
            }
            if (func1(data6) < 0) {
              const err17 = {
                instancePath: instancePath + '/body/name',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/CreateRequest/properties/name/minLength',
                keyword: 'minLength',
                params: { limit: 0 },
                message: 'must NOT have fewer than 0 characters',
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
              instancePath: instancePath + '/body/name',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/CreateRequest/properties/name/type',
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
        if (data4.icon !== undefined) {
          let data7 = data4.icon;
          if (typeof data7 === 'string') {
            if (!pattern96.test(data7)) {
              const err19 = {
                instancePath: instancePath + '/body/icon',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/CreateRequest/properties/icon/pattern',
                keyword: 'pattern',
                params: { pattern: 'book|code|api|guide|reference' },
                message:
                  'must match pattern "' +
                  'book|code|api|guide|reference' +
                  '"',
              };
              if (vErrors === null) {
                vErrors = [err19];
              } else {
                vErrors.push(err19);
              }
              errors++;
            }
          } else {
            const err20 = {
              instancePath: instancePath + '/body/icon',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/CreateRequest/properties/icon/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err20];
            } else {
              vErrors.push(err20);
            }
            errors++;
          }
        }
        if (data4.position !== undefined) {
          let data8 = data4.position;
          if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8))) {
            const err21 = {
              instancePath: instancePath + '/body/position',
              schemaPath:
                'https://edition.invalid/control#/components/schemas/CreateRequest/properties/position/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err21];
            } else {
              vErrors.push(err21);
            }
            errors++;
          }
          if (typeof data8 == 'number') {
            if (data8 < 0 || isNaN(data8)) {
              const err22 = {
                instancePath: instancePath + '/body/position',
                schemaPath:
                  'https://edition.invalid/control#/components/schemas/CreateRequest/properties/position/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 0 },
                message: 'must be >= 0',
              };
              if (vErrors === null) {
                vErrors = [err22];
              } else {
                vErrors.push(err22);
              }
              errors++;
            }
          }
        }
      } else {
        const err23 = {
          instancePath: instancePath + '/body',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/CreateRequest/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
    }
  } else {
    const err24 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err24];
    } else {
      vErrors.push(err24);
    }
    errors++;
  }
  validate728.errors = vErrors;
  return errors === 0;
}
validate728.evaluated = {
  props: { path: true, header: true, body: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const createCollectionOutput = validate729;
const schema843 = {
  $ref: 'https://edition.invalid/control#/components/schemas/CollectionView',
  $id: 'https://edition.invalid/validators/createCollectionOutput',
};
const schema835 = {
  type: 'object',
  properties: {
    collections: {
      type: 'array',
      items: { $ref: '#/components/schemas/CollectionNode' },
    },
    allowedActions: {
      type: 'array',
      items: { type: 'string' },
      uniqueItems: true,
    },
  },
};
const schema836 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    parentId: { type: 'string', format: 'uuid' },
    position: { type: 'integer', format: 'int32' },
    name: { type: 'string' },
    icon: { type: 'string' },
    depth: { type: 'integer', format: 'int32' },
    spaceCount: { type: 'integer', format: 'int64' },
    children: {
      type: 'array',
      items: { $ref: '#/components/schemas/CollectionNode' },
    },
  },
};
const wrapper2 = { validate: validate717 };
function validate717(
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
  const evaluated0 = validate717.evaluated;
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
    if (data.parentId !== undefined) {
      let data1 = data.parentId;
      if (typeof data1 === 'string') {
        if (!formats0.test(data1)) {
          const err2 = {
            instancePath: instancePath + '/parentId',
            schemaPath: '#/properties/parentId/format',
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
          instancePath: instancePath + '/parentId',
          schemaPath: '#/properties/parentId/type',
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
    if (data.position !== undefined) {
      let data2 = data.position;
      if (!(typeof data2 == 'number' && !(data2 % 1) && !isNaN(data2))) {
        const err4 = {
          instancePath: instancePath + '/position',
          schemaPath: '#/properties/position/type',
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
    if (data.name !== undefined) {
      if (typeof data.name !== 'string') {
        const err5 = {
          instancePath: instancePath + '/name',
          schemaPath: '#/properties/name/type',
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
    if (data.icon !== undefined) {
      if (typeof data.icon !== 'string') {
        const err6 = {
          instancePath: instancePath + '/icon',
          schemaPath: '#/properties/icon/type',
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
    if (data.depth !== undefined) {
      let data5 = data.depth;
      if (!(typeof data5 == 'number' && !(data5 % 1) && !isNaN(data5))) {
        const err7 = {
          instancePath: instancePath + '/depth',
          schemaPath: '#/properties/depth/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.spaceCount !== undefined) {
      let data6 = data.spaceCount;
      if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6))) {
        const err8 = {
          instancePath: instancePath + '/spaceCount',
          schemaPath: '#/properties/spaceCount/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.children !== undefined) {
      let data7 = data.children;
      if (Array.isArray(data7)) {
        const len0 = data7.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (
            !wrapper2.validate(data7[i0], {
              instancePath: instancePath + '/children/' + i0,
              parentData: data7,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors =
              vErrors === null
                ? wrapper2.validate.errors
                : vErrors.concat(wrapper2.validate.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err9 = {
          instancePath: instancePath + '/children',
          schemaPath: '#/properties/children/type',
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
  validate717.errors = vErrors;
  return errors === 0;
}
validate717.evaluated = {
  props: {
    id: true,
    parentId: true,
    position: true,
    name: true,
    icon: true,
    depth: true,
    spaceCount: true,
    children: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate730(
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
  const evaluated0 = validate730.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.collections !== undefined) {
      let data0 = data.collections;
      if (Array.isArray(data0)) {
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (
            !validate717(data0[i0], {
              instancePath: instancePath + '/collections/' + i0,
              parentData: data0,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate717.errors
                : vErrors.concat(validate717.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err0 = {
          instancePath: instancePath + '/collections',
          schemaPath: '#/properties/collections/type',
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
    if (data.allowedActions !== undefined) {
      let data2 = data.allowedActions;
      if (Array.isArray(data2)) {
        const len1 = data2.length;
        for (let i1 = 0; i1 < len1; i1++) {
          if (typeof data2[i1] !== 'string') {
            const err1 = {
              instancePath: instancePath + '/allowedActions/' + i1,
              schemaPath: '#/properties/allowedActions/items/type',
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
        let i2 = data2.length;
        let j0;
        if (i2 > 1) {
          const indices0 = {};
          for (; i2--;) {
            let item0 = data2[i2];
            if (typeof item0 !== 'string') {
              continue;
            }
            if (typeof indices0[item0] == 'number') {
              j0 = indices0[item0];
              const err2 = {
                instancePath: instancePath + '/allowedActions',
                schemaPath: '#/properties/allowedActions/uniqueItems',
                keyword: 'uniqueItems',
                params: { i: i2, j: j0 },
                message:
                  'must NOT have duplicate items (items ## ' +
                  j0 +
                  ' and ' +
                  i2 +
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
            indices0[item0] = i2;
          }
        }
      } else {
        const err3 = {
          instancePath: instancePath + '/allowedActions',
          schemaPath: '#/properties/allowedActions/type',
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
  } else {
    const err4 = {
      instancePath,
      schemaPath: '#/type',
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
  validate730.errors = vErrors;
  return errors === 0;
}
validate730.evaluated = {
  props: { collections: true, allowedActions: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate729(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/createCollectionOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate729.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate730(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate730.errors
        : vErrors.concat(validate730.errors);
    errors = vErrors.length;
  }
  validate729.errors = vErrors;
  return errors === 0;
}
validate729.evaluated = {
  props: { collections: true, allowedActions: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const createCollectionOutputFull = validate733;
const schema845 = {
  $ref: 'https://edition.invalid/control#/components/schemas/CollectionView',
  $id: 'https://edition.invalid/validators/createCollectionOutputFull',
};
function validate734(
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
  const evaluated0 = validate734.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.collections !== undefined) {
      let data0 = data.collections;
      if (Array.isArray(data0)) {
        const len0 = data0.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (
            !validate717(data0[i0], {
              instancePath: instancePath + '/collections/' + i0,
              parentData: data0,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate717.errors
                : vErrors.concat(validate717.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err0 = {
          instancePath: instancePath + '/collections',
          schemaPath: '#/properties/collections/type',
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
    if (data.allowedActions !== undefined) {
      let data2 = data.allowedActions;
      if (Array.isArray(data2)) {
        const len1 = data2.length;
        for (let i1 = 0; i1 < len1; i1++) {
          if (typeof data2[i1] !== 'string') {
            const err1 = {
              instancePath: instancePath + '/allowedActions/' + i1,
              schemaPath: '#/properties/allowedActions/items/type',
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
        let i2 = data2.length;
        let j0;
        if (i2 > 1) {
          const indices0 = {};
          for (; i2--;) {
            let item0 = data2[i2];
            if (typeof item0 !== 'string') {
              continue;
            }
            if (typeof indices0[item0] == 'number') {
              j0 = indices0[item0];
              const err2 = {
                instancePath: instancePath + '/allowedActions',
                schemaPath: '#/properties/allowedActions/uniqueItems',
                keyword: 'uniqueItems',
                params: { i: i2, j: j0 },
                message:
                  'must NOT have duplicate items (items ## ' +
                  j0 +
                  ' and ' +
                  i2 +
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
            indices0[item0] = i2;
          }
        }
      } else {
        const err3 = {
          instancePath: instancePath + '/allowedActions',
          schemaPath: '#/properties/allowedActions/type',
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
  } else {
    const err4 = {
      instancePath,
      schemaPath: '#/type',
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
  validate734.errors = vErrors;
  return errors === 0;
}
validate734.evaluated = {
  props: { collections: true, allowedActions: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate733(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/createCollectionOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate733.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate734(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors,
    })
  ) {
    vErrors =
      vErrors === null
        ? validate734.errors
        : vErrors.concat(validate734.errors);
    errors = vErrors.length;
  }
  validate733.errors = vErrors;
  return errors === 0;
}
validate733.evaluated = {
  props: { collections: true, allowedActions: true },
  dynamicProps: false,
  dynamicItems: false,
};
