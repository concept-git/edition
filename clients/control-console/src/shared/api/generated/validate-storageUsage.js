// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const storageUsageInput = validate963;
const schema1125 = {
  type: 'object',
  properties: {
    query: {
      type: 'object',
      properties: { fields: { type: 'string', maxLength: 4096, minLength: 1 } },
      required: [],
    },
  },
  required: [],
  $id: 'https://edition.invalid/validators/storageUsageInput',
};
const func1 = ucs2Length;
function validate963(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/storageUsageInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate963.evaluated;
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
        if (data0.fields !== undefined) {
          let data1 = data0.fields;
          if (typeof data1 === 'string') {
            if (func1(data1) > 4096) {
              const err0 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err0];
              } else {
                vErrors.push(err0);
              }
              errors++;
            }
            if (func1(data1) < 1) {
              const err1 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              };
              if (vErrors === null) {
                vErrors = [err1];
              } else {
                vErrors.push(err1);
              }
              errors++;
            }
          } else {
            const err2 = {
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
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
      } else {
        const err3 = {
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
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
  validate963.errors = vErrors;
  return errors === 0;
}
validate963.evaluated = {
  props: { query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const storageUsageOutput = validate964;
const schema1126 = {
  anyOf: [
    {
      $ref: 'https://edition.invalid/control#/components/schemas/StorageUsage',
    },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialStorageUsage',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/storageUsageOutput',
};
const schema1127 = {
  type: 'object',
  properties: {
    sourceObjects: { type: 'integer', format: 'int64' },
    sourceBytes: { type: 'integer', format: 'int64' },
    measuredAt: { type: 'string', format: 'date-time' },
    databaseBytes: { type: 'integer', format: 'int64' },
    failedSourceObjects: { type: 'integer', format: 'int64' },
  },
};
const schema1128 = {
  type: 'object',
  properties: {
    sourceObjects: { type: 'integer', format: 'int64' },
    sourceBytes: { type: 'integer', format: 'int64' },
    measuredAt: { type: 'string', format: 'date-time' },
    databaseBytes: { type: 'integer', format: 'int64' },
    failedSourceObjects: { type: 'integer', format: 'int64' },
  },
};
const formats10 = fullFormats['date-time'];
function validate964(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/storageUsageOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate964.evaluated;
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
    if (data.sourceObjects !== undefined) {
      let data0 = data.sourceObjects;
      if (!(typeof data0 == 'number' && !(data0 % 1) && !isNaN(data0))) {
        const err0 = {
          instancePath: instancePath + '/sourceObjects',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/StorageUsage/properties/sourceObjects/type',
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
    if (data.sourceBytes !== undefined) {
      let data1 = data.sourceBytes;
      if (!(typeof data1 == 'number' && !(data1 % 1) && !isNaN(data1))) {
        const err1 = {
          instancePath: instancePath + '/sourceBytes',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/StorageUsage/properties/sourceBytes/type',
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
    if (data.measuredAt !== undefined) {
      let data2 = data.measuredAt;
      if (typeof data2 === 'string') {
        if (!formats10.validate(data2)) {
          const err2 = {
            instancePath: instancePath + '/measuredAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/StorageUsage/properties/measuredAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/measuredAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/StorageUsage/properties/measuredAt/type',
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
    if (data.databaseBytes !== undefined) {
      let data3 = data.databaseBytes;
      if (!(typeof data3 == 'number' && !(data3 % 1) && !isNaN(data3))) {
        const err4 = {
          instancePath: instancePath + '/databaseBytes',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/StorageUsage/properties/databaseBytes/type',
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
    if (data.failedSourceObjects !== undefined) {
      let data4 = data.failedSourceObjects;
      if (!(typeof data4 == 'number' && !(data4 % 1) && !isNaN(data4))) {
        const err5 = {
          instancePath: instancePath + '/failedSourceObjects',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/StorageUsage/properties/failedSourceObjects/type',
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
  } else {
    const err6 = {
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/StorageUsage/type',
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
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.sourceObjects = true;
    props0.sourceBytes = true;
    props0.measuredAt = true;
    props0.databaseBytes = true;
    props0.failedSourceObjects = true;
  }
  const _errs14 = errors;
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.sourceObjects !== undefined) {
      let data5 = data.sourceObjects;
      if (!(typeof data5 == 'number' && !(data5 % 1) && !isNaN(data5))) {
        const err7 = {
          instancePath: instancePath + '/sourceObjects',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialStorageUsage/properties/sourceObjects/type',
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
    if (data.sourceBytes !== undefined) {
      let data6 = data.sourceBytes;
      if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6))) {
        const err8 = {
          instancePath: instancePath + '/sourceBytes',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialStorageUsage/properties/sourceBytes/type',
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
    if (data.measuredAt !== undefined) {
      let data7 = data.measuredAt;
      if (typeof data7 === 'string') {
        if (!formats10.validate(data7)) {
          const err9 = {
            instancePath: instancePath + '/measuredAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/PartialStorageUsage/properties/measuredAt/format',
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
          instancePath: instancePath + '/measuredAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialStorageUsage/properties/measuredAt/type',
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
    if (data.databaseBytes !== undefined) {
      let data8 = data.databaseBytes;
      if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8))) {
        const err11 = {
          instancePath: instancePath + '/databaseBytes',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialStorageUsage/properties/databaseBytes/type',
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
    if (data.failedSourceObjects !== undefined) {
      let data9 = data.failedSourceObjects;
      if (!(typeof data9 == 'number' && !(data9 % 1) && !isNaN(data9))) {
        const err12 = {
          instancePath: instancePath + '/failedSourceObjects',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialStorageUsage/properties/failedSourceObjects/type',
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
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/PartialStorageUsage/type',
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
  var _valid0 = _errs14 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.sourceObjects = true;
      props0.sourceBytes = true;
      props0.measuredAt = true;
      props0.databaseBytes = true;
      props0.failedSourceObjects = true;
    }
  }
  if (!valid0) {
    const err14 = {
      instancePath,
      schemaPath: '#/anyOf',
      keyword: 'anyOf',
      params: {},
      message: 'must match a schema in anyOf',
    };
    if (vErrors === null) {
      vErrors = [err14];
    } else {
      vErrors.push(err14);
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
  validate964.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate964.evaluated = { dynamicProps: true, dynamicItems: false };
export const storageUsageOutputFull = validate965;
const schema1129 = {
  $ref: 'https://edition.invalid/control#/components/schemas/StorageUsage',
  $id: 'https://edition.invalid/validators/storageUsageOutputFull',
};
function validate965(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/storageUsageOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate965.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.sourceObjects !== undefined) {
      let data0 = data.sourceObjects;
      if (!(typeof data0 == 'number' && !(data0 % 1) && !isNaN(data0))) {
        const err0 = {
          instancePath: instancePath + '/sourceObjects',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/StorageUsage/properties/sourceObjects/type',
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
    if (data.sourceBytes !== undefined) {
      let data1 = data.sourceBytes;
      if (!(typeof data1 == 'number' && !(data1 % 1) && !isNaN(data1))) {
        const err1 = {
          instancePath: instancePath + '/sourceBytes',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/StorageUsage/properties/sourceBytes/type',
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
    if (data.measuredAt !== undefined) {
      let data2 = data.measuredAt;
      if (typeof data2 === 'string') {
        if (!formats10.validate(data2)) {
          const err2 = {
            instancePath: instancePath + '/measuredAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/StorageUsage/properties/measuredAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/measuredAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/StorageUsage/properties/measuredAt/type',
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
    if (data.databaseBytes !== undefined) {
      let data3 = data.databaseBytes;
      if (!(typeof data3 == 'number' && !(data3 % 1) && !isNaN(data3))) {
        const err4 = {
          instancePath: instancePath + '/databaseBytes',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/StorageUsage/properties/databaseBytes/type',
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
    if (data.failedSourceObjects !== undefined) {
      let data4 = data.failedSourceObjects;
      if (!(typeof data4 == 'number' && !(data4 % 1) && !isNaN(data4))) {
        const err5 = {
          instancePath: instancePath + '/failedSourceObjects',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/StorageUsage/properties/failedSourceObjects/type',
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
  } else {
    const err6 = {
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/StorageUsage/type',
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
  validate965.errors = vErrors;
  return errors === 0;
}
validate965.evaluated = {
  props: {
    sourceObjects: true,
    sourceBytes: true,
    measuredAt: true,
    databaseBytes: true,
    failedSourceObjects: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
