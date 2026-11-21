// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const tenantUsageInput = validate936;
const schema1071 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: { id: { type: 'string', format: 'uuid' } },
      required: ['id'],
    },
    query: {
      type: 'object',
      properties: {
        from: { type: 'string', format: 'date-time' },
        to: { type: 'string', format: 'date-time' },
        fields: { type: 'string', maxLength: 4096, minLength: 1 },
      },
      required: [],
    },
  },
  required: ['path'],
  $id: 'https://edition.invalid/validators/tenantUsageInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const formats10 = fullFormats['date-time'];
const func1 = ucs2Length;
function validate936(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/tenantUsageInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate936.evaluated;
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
        if (data0.id === undefined) {
          const err1 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'id' },
            message: "must have required property '" + 'id' + "'",
          };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
        if (data0.id !== undefined) {
          let data1 = data0.id;
          if (typeof data1 === 'string') {
            if (!formats0.test(data1)) {
              const err2 = {
                instancePath: instancePath + '/path/id',
                schemaPath: '#/properties/path/properties/id/format',
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
              instancePath: instancePath + '/path/id',
              schemaPath: '#/properties/path/properties/id/type',
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
        if (data2.from !== undefined) {
          let data3 = data2.from;
          if (typeof data3 === 'string') {
            if (!formats10.validate(data3)) {
              const err5 = {
                instancePath: instancePath + '/query/from',
                schemaPath: '#/properties/query/properties/from/format',
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
              instancePath: instancePath + '/query/from',
              schemaPath: '#/properties/query/properties/from/type',
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
        if (data2.to !== undefined) {
          let data4 = data2.to;
          if (typeof data4 === 'string') {
            if (!formats10.validate(data4)) {
              const err7 = {
                instancePath: instancePath + '/query/to',
                schemaPath: '#/properties/query/properties/to/format',
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
              instancePath: instancePath + '/query/to',
              schemaPath: '#/properties/query/properties/to/type',
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
        if (data2.fields !== undefined) {
          let data5 = data2.fields;
          if (typeof data5 === 'string') {
            if (func1(data5) > 4096) {
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
            if (func1(data5) < 1) {
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
  validate936.errors = vErrors;
  return errors === 0;
}
validate936.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const tenantUsageOutput = validate937;
const schema1072 = {
  anyOf: [
    { $ref: 'https://edition.invalid/control#/components/schemas/Usage' },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialUsage',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/tenantUsageOutput',
};
const schema1073 = {
  type: 'object',
  properties: {
    workingPages: { type: 'integer', format: 'int64' },
    trashedPages: { type: 'integer', format: 'int64' },
    publishedPages: { type: 'integer', format: 'int64' },
    workingTextBytes: { type: 'integer', format: 'int64' },
    trashedTextBytes: { type: 'integer', format: 'int64' },
    attachmentCount: { type: 'integer', format: 'int64' },
    attachmentBytes: { type: 'integer', format: 'int64' },
    releases: { type: 'integer', format: 'int64' },
    snapshotPages: { type: 'integer', format: 'int64' },
    snapshotTextBytes: { type: 'integer', format: 'int64' },
    promotions: { type: 'integer', format: 'int64' },
    activeAuthors: { type: 'integer', format: 'int64' },
    imports: {
      type: 'object',
      additionalProperties: { type: 'integer', format: 'int64' },
    },
    computedAt: { type: 'string', format: 'date-time' },
  },
};
const schema1074 = {
  type: 'object',
  properties: {
    workingPages: { type: 'integer', format: 'int64' },
    trashedPages: { type: 'integer', format: 'int64' },
    publishedPages: { type: 'integer', format: 'int64' },
    workingTextBytes: { type: 'integer', format: 'int64' },
    trashedTextBytes: { type: 'integer', format: 'int64' },
    attachmentCount: { type: 'integer', format: 'int64' },
    attachmentBytes: { type: 'integer', format: 'int64' },
    releases: { type: 'integer', format: 'int64' },
    snapshotPages: { type: 'integer', format: 'int64' },
    snapshotTextBytes: { type: 'integer', format: 'int64' },
    promotions: { type: 'integer', format: 'int64' },
    activeAuthors: { type: 'integer', format: 'int64' },
    imports: {
      type: 'object',
      additionalProperties: { type: 'integer', format: 'int64' },
    },
    computedAt: { type: 'string', format: 'date-time' },
  },
};
function validate937(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/tenantUsageOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate937.evaluated;
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
    if (data.workingPages !== undefined) {
      let data0 = data.workingPages;
      if (!(typeof data0 == 'number' && !(data0 % 1) && !isNaN(data0))) {
        const err0 = {
          instancePath: instancePath + '/workingPages',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Usage/properties/workingPages/type',
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
    if (data.trashedPages !== undefined) {
      let data1 = data.trashedPages;
      if (!(typeof data1 == 'number' && !(data1 % 1) && !isNaN(data1))) {
        const err1 = {
          instancePath: instancePath + '/trashedPages',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Usage/properties/trashedPages/type',
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
    if (data.publishedPages !== undefined) {
      let data2 = data.publishedPages;
      if (!(typeof data2 == 'number' && !(data2 % 1) && !isNaN(data2))) {
        const err2 = {
          instancePath: instancePath + '/publishedPages',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Usage/properties/publishedPages/type',
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
    if (data.workingTextBytes !== undefined) {
      let data3 = data.workingTextBytes;
      if (!(typeof data3 == 'number' && !(data3 % 1) && !isNaN(data3))) {
        const err3 = {
          instancePath: instancePath + '/workingTextBytes',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Usage/properties/workingTextBytes/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.trashedTextBytes !== undefined) {
      let data4 = data.trashedTextBytes;
      if (!(typeof data4 == 'number' && !(data4 % 1) && !isNaN(data4))) {
        const err4 = {
          instancePath: instancePath + '/trashedTextBytes',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Usage/properties/trashedTextBytes/type',
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
    if (data.attachmentCount !== undefined) {
      let data5 = data.attachmentCount;
      if (!(typeof data5 == 'number' && !(data5 % 1) && !isNaN(data5))) {
        const err5 = {
          instancePath: instancePath + '/attachmentCount',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Usage/properties/attachmentCount/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.attachmentBytes !== undefined) {
      let data6 = data.attachmentBytes;
      if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6))) {
        const err6 = {
          instancePath: instancePath + '/attachmentBytes',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Usage/properties/attachmentBytes/type',
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
    }
    if (data.releases !== undefined) {
      let data7 = data.releases;
      if (!(typeof data7 == 'number' && !(data7 % 1) && !isNaN(data7))) {
        const err7 = {
          instancePath: instancePath + '/releases',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Usage/properties/releases/type',
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
    if (data.snapshotPages !== undefined) {
      let data8 = data.snapshotPages;
      if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8))) {
        const err8 = {
          instancePath: instancePath + '/snapshotPages',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Usage/properties/snapshotPages/type',
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
    if (data.snapshotTextBytes !== undefined) {
      let data9 = data.snapshotTextBytes;
      if (!(typeof data9 == 'number' && !(data9 % 1) && !isNaN(data9))) {
        const err9 = {
          instancePath: instancePath + '/snapshotTextBytes',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Usage/properties/snapshotTextBytes/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.promotions !== undefined) {
      let data10 = data.promotions;
      if (!(typeof data10 == 'number' && !(data10 % 1) && !isNaN(data10))) {
        const err10 = {
          instancePath: instancePath + '/promotions',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Usage/properties/promotions/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.activeAuthors !== undefined) {
      let data11 = data.activeAuthors;
      if (!(typeof data11 == 'number' && !(data11 % 1) && !isNaN(data11))) {
        const err11 = {
          instancePath: instancePath + '/activeAuthors',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Usage/properties/activeAuthors/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.imports !== undefined) {
      let data12 = data.imports;
      if (data12 && typeof data12 == 'object' && !Array.isArray(data12)) {
        for (const key0 in data12) {
          let data13 = data12[key0];
          if (!(typeof data13 == 'number' && !(data13 % 1) && !isNaN(data13))) {
            const err12 = {
              instancePath:
                instancePath +
                '/imports/' +
                key0.replace(/~/g, '~0').replace(/\//g, '~1'),
              schemaPath:
                'https://edition.invalid/control#/components/schemas/Usage/properties/imports/additionalProperties/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
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
          instancePath: instancePath + '/imports',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Usage/properties/imports/type',
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
    }
    if (data.computedAt !== undefined) {
      let data14 = data.computedAt;
      if (typeof data14 === 'string') {
        if (!formats10.validate(data14)) {
          const err14 = {
            instancePath: instancePath + '/computedAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/Usage/properties/computedAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/computedAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Usage/properties/computedAt/type',
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
  } else {
    const err16 = {
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/Usage/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err16];
    } else {
      vErrors.push(err16);
    }
    errors++;
  }
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.workingPages = true;
    props0.trashedPages = true;
    props0.publishedPages = true;
    props0.workingTextBytes = true;
    props0.trashedTextBytes = true;
    props0.attachmentCount = true;
    props0.attachmentBytes = true;
    props0.releases = true;
    props0.snapshotPages = true;
    props0.snapshotTextBytes = true;
    props0.promotions = true;
    props0.activeAuthors = true;
    props0.imports = true;
    props0.computedAt = true;
  }
  const _errs35 = errors;
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.workingPages !== undefined) {
      let data15 = data.workingPages;
      if (!(typeof data15 == 'number' && !(data15 % 1) && !isNaN(data15))) {
        const err17 = {
          instancePath: instancePath + '/workingPages',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialUsage/properties/workingPages/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err17];
        } else {
          vErrors.push(err17);
        }
        errors++;
      }
    }
    if (data.trashedPages !== undefined) {
      let data16 = data.trashedPages;
      if (!(typeof data16 == 'number' && !(data16 % 1) && !isNaN(data16))) {
        const err18 = {
          instancePath: instancePath + '/trashedPages',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialUsage/properties/trashedPages/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err18];
        } else {
          vErrors.push(err18);
        }
        errors++;
      }
    }
    if (data.publishedPages !== undefined) {
      let data17 = data.publishedPages;
      if (!(typeof data17 == 'number' && !(data17 % 1) && !isNaN(data17))) {
        const err19 = {
          instancePath: instancePath + '/publishedPages',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialUsage/properties/publishedPages/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err19];
        } else {
          vErrors.push(err19);
        }
        errors++;
      }
    }
    if (data.workingTextBytes !== undefined) {
      let data18 = data.workingTextBytes;
      if (!(typeof data18 == 'number' && !(data18 % 1) && !isNaN(data18))) {
        const err20 = {
          instancePath: instancePath + '/workingTextBytes',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialUsage/properties/workingTextBytes/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.trashedTextBytes !== undefined) {
      let data19 = data.trashedTextBytes;
      if (!(typeof data19 == 'number' && !(data19 % 1) && !isNaN(data19))) {
        const err21 = {
          instancePath: instancePath + '/trashedTextBytes',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialUsage/properties/trashedTextBytes/type',
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
    }
    if (data.attachmentCount !== undefined) {
      let data20 = data.attachmentCount;
      if (!(typeof data20 == 'number' && !(data20 % 1) && !isNaN(data20))) {
        const err22 = {
          instancePath: instancePath + '/attachmentCount',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialUsage/properties/attachmentCount/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.attachmentBytes !== undefined) {
      let data21 = data.attachmentBytes;
      if (!(typeof data21 == 'number' && !(data21 % 1) && !isNaN(data21))) {
        const err23 = {
          instancePath: instancePath + '/attachmentBytes',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialUsage/properties/attachmentBytes/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
    }
    if (data.releases !== undefined) {
      let data22 = data.releases;
      if (!(typeof data22 == 'number' && !(data22 % 1) && !isNaN(data22))) {
        const err24 = {
          instancePath: instancePath + '/releases',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialUsage/properties/releases/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err24];
        } else {
          vErrors.push(err24);
        }
        errors++;
      }
    }
    if (data.snapshotPages !== undefined) {
      let data23 = data.snapshotPages;
      if (!(typeof data23 == 'number' && !(data23 % 1) && !isNaN(data23))) {
        const err25 = {
          instancePath: instancePath + '/snapshotPages',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialUsage/properties/snapshotPages/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err25];
        } else {
          vErrors.push(err25);
        }
        errors++;
      }
    }
    if (data.snapshotTextBytes !== undefined) {
      let data24 = data.snapshotTextBytes;
      if (!(typeof data24 == 'number' && !(data24 % 1) && !isNaN(data24))) {
        const err26 = {
          instancePath: instancePath + '/snapshotTextBytes',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialUsage/properties/snapshotTextBytes/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err26];
        } else {
          vErrors.push(err26);
        }
        errors++;
      }
    }
    if (data.promotions !== undefined) {
      let data25 = data.promotions;
      if (!(typeof data25 == 'number' && !(data25 % 1) && !isNaN(data25))) {
        const err27 = {
          instancePath: instancePath + '/promotions',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialUsage/properties/promotions/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
    if (data.activeAuthors !== undefined) {
      let data26 = data.activeAuthors;
      if (!(typeof data26 == 'number' && !(data26 % 1) && !isNaN(data26))) {
        const err28 = {
          instancePath: instancePath + '/activeAuthors',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialUsage/properties/activeAuthors/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err28];
        } else {
          vErrors.push(err28);
        }
        errors++;
      }
    }
    if (data.imports !== undefined) {
      let data27 = data.imports;
      if (data27 && typeof data27 == 'object' && !Array.isArray(data27)) {
        for (const key1 in data27) {
          let data28 = data27[key1];
          if (!(typeof data28 == 'number' && !(data28 % 1) && !isNaN(data28))) {
            const err29 = {
              instancePath:
                instancePath +
                '/imports/' +
                key1.replace(/~/g, '~0').replace(/\//g, '~1'),
              schemaPath:
                'https://edition.invalid/control#/components/schemas/PartialUsage/properties/imports/additionalProperties/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err29];
            } else {
              vErrors.push(err29);
            }
            errors++;
          }
        }
      } else {
        const err30 = {
          instancePath: instancePath + '/imports',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialUsage/properties/imports/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err30];
        } else {
          vErrors.push(err30);
        }
        errors++;
      }
    }
    if (data.computedAt !== undefined) {
      let data29 = data.computedAt;
      if (typeof data29 === 'string') {
        if (!formats10.validate(data29)) {
          const err31 = {
            instancePath: instancePath + '/computedAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/PartialUsage/properties/computedAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err31];
          } else {
            vErrors.push(err31);
          }
          errors++;
        }
      } else {
        const err32 = {
          instancePath: instancePath + '/computedAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialUsage/properties/computedAt/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err32];
        } else {
          vErrors.push(err32);
        }
        errors++;
      }
    }
  } else {
    const err33 = {
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/PartialUsage/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err33];
    } else {
      vErrors.push(err33);
    }
    errors++;
  }
  var _valid0 = _errs35 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.workingPages = true;
      props0.trashedPages = true;
      props0.publishedPages = true;
      props0.workingTextBytes = true;
      props0.trashedTextBytes = true;
      props0.attachmentCount = true;
      props0.attachmentBytes = true;
      props0.releases = true;
      props0.snapshotPages = true;
      props0.snapshotTextBytes = true;
      props0.promotions = true;
      props0.activeAuthors = true;
      props0.imports = true;
      props0.computedAt = true;
    }
  }
  if (!valid0) {
    const err34 = {
      instancePath,
      schemaPath: '#/anyOf',
      keyword: 'anyOf',
      params: {},
      message: 'must match a schema in anyOf',
    };
    if (vErrors === null) {
      vErrors = [err34];
    } else {
      vErrors.push(err34);
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
  validate937.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate937.evaluated = { dynamicProps: true, dynamicItems: false };
export const tenantUsageOutputFull = validate938;
const schema1075 = {
  $ref: 'https://edition.invalid/control#/components/schemas/Usage',
  $id: 'https://edition.invalid/validators/tenantUsageOutputFull',
};
function validate938(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/tenantUsageOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate938.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.workingPages !== undefined) {
      let data0 = data.workingPages;
      if (!(typeof data0 == 'number' && !(data0 % 1) && !isNaN(data0))) {
        const err0 = {
          instancePath: instancePath + '/workingPages',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Usage/properties/workingPages/type',
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
    if (data.trashedPages !== undefined) {
      let data1 = data.trashedPages;
      if (!(typeof data1 == 'number' && !(data1 % 1) && !isNaN(data1))) {
        const err1 = {
          instancePath: instancePath + '/trashedPages',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Usage/properties/trashedPages/type',
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
    if (data.publishedPages !== undefined) {
      let data2 = data.publishedPages;
      if (!(typeof data2 == 'number' && !(data2 % 1) && !isNaN(data2))) {
        const err2 = {
          instancePath: instancePath + '/publishedPages',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Usage/properties/publishedPages/type',
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
    if (data.workingTextBytes !== undefined) {
      let data3 = data.workingTextBytes;
      if (!(typeof data3 == 'number' && !(data3 % 1) && !isNaN(data3))) {
        const err3 = {
          instancePath: instancePath + '/workingTextBytes',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Usage/properties/workingTextBytes/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.trashedTextBytes !== undefined) {
      let data4 = data.trashedTextBytes;
      if (!(typeof data4 == 'number' && !(data4 % 1) && !isNaN(data4))) {
        const err4 = {
          instancePath: instancePath + '/trashedTextBytes',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Usage/properties/trashedTextBytes/type',
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
    if (data.attachmentCount !== undefined) {
      let data5 = data.attachmentCount;
      if (!(typeof data5 == 'number' && !(data5 % 1) && !isNaN(data5))) {
        const err5 = {
          instancePath: instancePath + '/attachmentCount',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Usage/properties/attachmentCount/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.attachmentBytes !== undefined) {
      let data6 = data.attachmentBytes;
      if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6))) {
        const err6 = {
          instancePath: instancePath + '/attachmentBytes',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Usage/properties/attachmentBytes/type',
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
    }
    if (data.releases !== undefined) {
      let data7 = data.releases;
      if (!(typeof data7 == 'number' && !(data7 % 1) && !isNaN(data7))) {
        const err7 = {
          instancePath: instancePath + '/releases',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Usage/properties/releases/type',
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
    if (data.snapshotPages !== undefined) {
      let data8 = data.snapshotPages;
      if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8))) {
        const err8 = {
          instancePath: instancePath + '/snapshotPages',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Usage/properties/snapshotPages/type',
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
    if (data.snapshotTextBytes !== undefined) {
      let data9 = data.snapshotTextBytes;
      if (!(typeof data9 == 'number' && !(data9 % 1) && !isNaN(data9))) {
        const err9 = {
          instancePath: instancePath + '/snapshotTextBytes',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Usage/properties/snapshotTextBytes/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.promotions !== undefined) {
      let data10 = data.promotions;
      if (!(typeof data10 == 'number' && !(data10 % 1) && !isNaN(data10))) {
        const err10 = {
          instancePath: instancePath + '/promotions',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Usage/properties/promotions/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.activeAuthors !== undefined) {
      let data11 = data.activeAuthors;
      if (!(typeof data11 == 'number' && !(data11 % 1) && !isNaN(data11))) {
        const err11 = {
          instancePath: instancePath + '/activeAuthors',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Usage/properties/activeAuthors/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.imports !== undefined) {
      let data12 = data.imports;
      if (data12 && typeof data12 == 'object' && !Array.isArray(data12)) {
        for (const key0 in data12) {
          let data13 = data12[key0];
          if (!(typeof data13 == 'number' && !(data13 % 1) && !isNaN(data13))) {
            const err12 = {
              instancePath:
                instancePath +
                '/imports/' +
                key0.replace(/~/g, '~0').replace(/\//g, '~1'),
              schemaPath:
                'https://edition.invalid/control#/components/schemas/Usage/properties/imports/additionalProperties/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
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
          instancePath: instancePath + '/imports',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Usage/properties/imports/type',
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
    }
    if (data.computedAt !== undefined) {
      let data14 = data.computedAt;
      if (typeof data14 === 'string') {
        if (!formats10.validate(data14)) {
          const err14 = {
            instancePath: instancePath + '/computedAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/Usage/properties/computedAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/computedAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Usage/properties/computedAt/type',
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
  } else {
    const err16 = {
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/Usage/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err16];
    } else {
      vErrors.push(err16);
    }
    errors++;
  }
  validate938.errors = vErrors;
  return errors === 0;
}
validate938.evaluated = {
  props: {
    workingPages: true,
    trashedPages: true,
    publishedPages: true,
    workingTextBytes: true,
    trashedTextBytes: true,
    attachmentCount: true,
    attachmentBytes: true,
    releases: true,
    snapshotPages: true,
    snapshotTextBytes: true,
    promotions: true,
    activeAuthors: true,
    imports: true,
    computedAt: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
