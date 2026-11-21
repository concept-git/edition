// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const viewAuditExportInput = validate1000;
const schema1171 = {
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
        tenantId: { type: 'string', format: 'uuid' },
        fields: { type: 'string', maxLength: 4096, minLength: 1 },
      },
      required: [],
    },
  },
  required: ['path'],
  $id: 'https://edition.invalid/validators/viewAuditExportInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
function validate1000(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/viewAuditExportInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1000.evaluated;
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
        if (data2.tenantId !== undefined) {
          let data3 = data2.tenantId;
          if (typeof data3 === 'string') {
            if (!formats0.test(data3)) {
              const err5 = {
                instancePath: instancePath + '/query/tenantId',
                schemaPath: '#/properties/query/properties/tenantId/format',
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
              instancePath: instancePath + '/query/tenantId',
              schemaPath: '#/properties/query/properties/tenantId/type',
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
        if (data2.fields !== undefined) {
          let data4 = data2.fields;
          if (typeof data4 === 'string') {
            if (func1(data4) > 4096) {
              const err7 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err7];
              } else {
                vErrors.push(err7);
              }
              errors++;
            }
            if (func1(data4) < 1) {
              const err8 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
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
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
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
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
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
  validate1000.errors = vErrors;
  return errors === 0;
}
validate1000.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const viewAuditExportOutput = validate1001;
const schema1172 = {
  anyOf: [
    {
      $ref: 'https://edition.invalid/control#/components/schemas/ExportStatus',
    },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialExportStatus',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/viewAuditExportOutput',
};
const schema349 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    status: { type: 'string' },
    error: { type: 'string' },
    expiresAt: { type: 'string', format: 'date-time' },
  },
};
const schema1174 = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    status: { type: 'string' },
    error: { type: 'string' },
    expiresAt: { type: 'string', format: 'date-time' },
  },
};
const formats10 = fullFormats['date-time'];
function validate1001(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/viewAuditExportOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1001.evaluated;
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
    if (data.id !== undefined) {
      let data0 = data.id;
      if (typeof data0 === 'string') {
        if (!formats0.test(data0)) {
          const err0 = {
            instancePath: instancePath + '/id',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/ExportStatus/properties/id/format',
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
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ExportStatus/properties/id/type',
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
    if (data.status !== undefined) {
      if (typeof data.status !== 'string') {
        const err2 = {
          instancePath: instancePath + '/status',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ExportStatus/properties/status/type',
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
    if (data.error !== undefined) {
      if (typeof data.error !== 'string') {
        const err3 = {
          instancePath: instancePath + '/error',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ExportStatus/properties/error/type',
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
    if (data.expiresAt !== undefined) {
      let data3 = data.expiresAt;
      if (typeof data3 === 'string') {
        if (!formats10.validate(data3)) {
          const err4 = {
            instancePath: instancePath + '/expiresAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/ExportStatus/properties/expiresAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/expiresAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ExportStatus/properties/expiresAt/type',
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
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/ExportStatus/type',
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
    props0.id = true;
    props0.status = true;
    props0.error = true;
    props0.expiresAt = true;
  }
  const _errs12 = errors;
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.id !== undefined) {
      let data4 = data.id;
      if (typeof data4 === 'string') {
        if (!formats0.test(data4)) {
          const err7 = {
            instancePath: instancePath + '/id',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/PartialExportStatus/properties/id/format',
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
          instancePath: instancePath + '/id',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialExportStatus/properties/id/type',
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
    if (data.status !== undefined) {
      if (typeof data.status !== 'string') {
        const err9 = {
          instancePath: instancePath + '/status',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialExportStatus/properties/status/type',
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
    if (data.error !== undefined) {
      if (typeof data.error !== 'string') {
        const err10 = {
          instancePath: instancePath + '/error',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialExportStatus/properties/error/type',
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
      let data7 = data.expiresAt;
      if (typeof data7 === 'string') {
        if (!formats10.validate(data7)) {
          const err11 = {
            instancePath: instancePath + '/expiresAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/PartialExportStatus/properties/expiresAt/format',
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
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialExportStatus/properties/expiresAt/type',
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
  } else {
    const err13 = {
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/PartialExportStatus/type',
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
  var _valid0 = _errs12 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.id = true;
      props0.status = true;
      props0.error = true;
      props0.expiresAt = true;
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
  validate1001.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate1001.evaluated = { dynamicProps: true, dynamicItems: false };
export const viewAuditExportOutputFull = validate1002;
const schema1175 = {
  $ref: 'https://edition.invalid/control#/components/schemas/ExportStatus',
  $id: 'https://edition.invalid/validators/viewAuditExportOutputFull',
};
function validate1002(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/viewAuditExportOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1002.evaluated;
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
            schemaPath:
              'https://edition.invalid/control#/components/schemas/ExportStatus/properties/id/format',
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
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ExportStatus/properties/id/type',
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
    if (data.status !== undefined) {
      if (typeof data.status !== 'string') {
        const err2 = {
          instancePath: instancePath + '/status',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ExportStatus/properties/status/type',
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
    if (data.error !== undefined) {
      if (typeof data.error !== 'string') {
        const err3 = {
          instancePath: instancePath + '/error',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ExportStatus/properties/error/type',
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
    if (data.expiresAt !== undefined) {
      let data3 = data.expiresAt;
      if (typeof data3 === 'string') {
        if (!formats10.validate(data3)) {
          const err4 = {
            instancePath: instancePath + '/expiresAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/ExportStatus/properties/expiresAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/expiresAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/ExportStatus/properties/expiresAt/type',
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
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/ExportStatus/type',
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
  validate1002.errors = vErrors;
  return errors === 0;
}
validate1002.evaluated = {
  props: { id: true, status: true, error: true, expiresAt: true },
  dynamicProps: false,
  dynamicItems: false,
};
