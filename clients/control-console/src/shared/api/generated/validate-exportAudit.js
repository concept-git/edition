// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const exportAuditInput = validate255;
const schema345 = {
  type: 'object',
  properties: {
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
      $ref: 'https://edition.invalid/control#/components/schemas/ExportRequest',
    },
  },
  required: ['header', 'body'],
  $id: 'https://edition.invalid/validators/exportAuditInput',
};
const func1 = ucs2Length;
const pattern4 = new RegExp('^[a-zA-Z0-9._:-]+$', 'u');
const schema346 = {
  type: 'object',
  properties: {
    tenantId: { type: 'string', format: 'uuid' },
    filter: { $ref: '#/components/schemas/AuditFilter' },
  },
  required: ['filter'],
};
const schema347 = {
  type: 'object',
  properties: {
    actor: { type: 'string', format: 'uuid' },
    action: { type: 'string' },
    target: { type: 'string', format: 'uuid' },
    outcome: { type: 'string' },
    from: { type: 'string', format: 'date-time' },
    to: { type: 'string', format: 'date-time' },
    cursor: { type: 'integer', format: 'int64' },
  },
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const formats10 = fullFormats['date-time'];
function validate256(
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
  const evaluated0 = validate256.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.filter === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'filter' },
        message: "must have required property '" + 'filter' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.tenantId !== undefined) {
      let data0 = data.tenantId;
      if (typeof data0 === 'string') {
        if (!formats0.test(data0)) {
          const err1 = {
            instancePath: instancePath + '/tenantId',
            schemaPath: '#/properties/tenantId/format',
            keyword: 'format',
            params: { format: 'uuid' },
            message: 'must match format "' + 'uuid' + '"',
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
          instancePath: instancePath + '/tenantId',
          schemaPath: '#/properties/tenantId/type',
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
    if (data.filter !== undefined) {
      let data1 = data.filter;
      if (data1 && typeof data1 == 'object' && !Array.isArray(data1)) {
        if (data1.actor !== undefined) {
          let data2 = data1.actor;
          if (typeof data2 === 'string') {
            if (!formats0.test(data2)) {
              const err3 = {
                instancePath: instancePath + '/filter/actor',
                schemaPath:
                  '#/components/schemas/AuditFilter/properties/actor/format',
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
              instancePath: instancePath + '/filter/actor',
              schemaPath:
                '#/components/schemas/AuditFilter/properties/actor/type',
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
        if (data1.action !== undefined) {
          if (typeof data1.action !== 'string') {
            const err5 = {
              instancePath: instancePath + '/filter/action',
              schemaPath:
                '#/components/schemas/AuditFilter/properties/action/type',
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
        if (data1.target !== undefined) {
          let data4 = data1.target;
          if (typeof data4 === 'string') {
            if (!formats0.test(data4)) {
              const err6 = {
                instancePath: instancePath + '/filter/target',
                schemaPath:
                  '#/components/schemas/AuditFilter/properties/target/format',
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
              instancePath: instancePath + '/filter/target',
              schemaPath:
                '#/components/schemas/AuditFilter/properties/target/type',
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
        if (data1.outcome !== undefined) {
          if (typeof data1.outcome !== 'string') {
            const err8 = {
              instancePath: instancePath + '/filter/outcome',
              schemaPath:
                '#/components/schemas/AuditFilter/properties/outcome/type',
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
        if (data1.from !== undefined) {
          let data6 = data1.from;
          if (typeof data6 === 'string') {
            if (!formats10.validate(data6)) {
              const err9 = {
                instancePath: instancePath + '/filter/from',
                schemaPath:
                  '#/components/schemas/AuditFilter/properties/from/format',
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
              instancePath: instancePath + '/filter/from',
              schemaPath:
                '#/components/schemas/AuditFilter/properties/from/type',
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
        if (data1.to !== undefined) {
          let data7 = data1.to;
          if (typeof data7 === 'string') {
            if (!formats10.validate(data7)) {
              const err11 = {
                instancePath: instancePath + '/filter/to',
                schemaPath:
                  '#/components/schemas/AuditFilter/properties/to/format',
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
              instancePath: instancePath + '/filter/to',
              schemaPath: '#/components/schemas/AuditFilter/properties/to/type',
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
        if (data1.cursor !== undefined) {
          let data8 = data1.cursor;
          if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8))) {
            const err13 = {
              instancePath: instancePath + '/filter/cursor',
              schemaPath:
                '#/components/schemas/AuditFilter/properties/cursor/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err13];
            } else {
              vErrors.push(err13);
            }
            errors++;
          }
        }
      } else {
        const err14 = {
          instancePath: instancePath + '/filter',
          schemaPath: '#/components/schemas/AuditFilter/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err14];
        } else {
          vErrors.push(err14);
        }
        errors++;
      }
    }
  } else {
    const err15 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err15];
    } else {
      vErrors.push(err15);
    }
    errors++;
  }
  validate256.errors = vErrors;
  return errors === 0;
}
validate256.evaluated = {
  props: { tenantId: true, filter: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate255(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/exportAuditInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate255.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.header === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'header' },
        message: "must have required property '" + 'header' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.body === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'body' },
        message: "must have required property '" + 'body' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.header !== undefined) {
      let data0 = data.header;
      if (data0 && typeof data0 == 'object' && !Array.isArray(data0)) {
        if (data0['Idempotency-Key'] === undefined) {
          const err2 = {
            instancePath: instancePath + '/header',
            schemaPath: '#/properties/header/required',
            keyword: 'required',
            params: { missingProperty: 'Idempotency-Key' },
            message: "must have required property '" + 'Idempotency-Key' + "'",
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
        if (data0['Idempotency-Key'] !== undefined) {
          let data1 = data0['Idempotency-Key'];
          if (typeof data1 === 'string') {
            if (func1(data1) > 128) {
              const err3 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/maxLength',
                keyword: 'maxLength',
                params: { limit: 128 },
                message: 'must NOT have more than 128 characters',
              };
              if (vErrors === null) {
                vErrors = [err3];
              } else {
                vErrors.push(err3);
              }
              errors++;
            }
            if (func1(data1) < 1) {
              const err4 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              };
              if (vErrors === null) {
                vErrors = [err4];
              } else {
                vErrors.push(err4);
              }
              errors++;
            }
            if (!pattern4.test(data1)) {
              const err5 = {
                instancePath: instancePath + '/header/Idempotency-Key',
                schemaPath:
                  '#/properties/header/properties/Idempotency-Key/pattern',
                keyword: 'pattern',
                params: { pattern: '^[a-zA-Z0-9._:-]+$' },
                message: 'must match pattern "' + '^[a-zA-Z0-9._:-]+$' + '"',
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
              instancePath: instancePath + '/header/Idempotency-Key',
              schemaPath: '#/properties/header/properties/Idempotency-Key/type',
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
          instancePath: instancePath + '/header',
          schemaPath: '#/properties/header/type',
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
    if (data.body !== undefined) {
      if (
        !validate256(data.body, {
          instancePath: instancePath + '/body',
          parentData: data,
          parentDataProperty: 'body',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors =
          vErrors === null
            ? validate256.errors
            : vErrors.concat(validate256.errors);
        errors = vErrors.length;
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
  validate255.errors = vErrors;
  return errors === 0;
}
validate255.evaluated = {
  props: { header: true, body: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const exportAuditOutput = validate258;
const schema348 = {
  $ref: 'https://edition.invalid/control#/components/schemas/ExportStatus',
  $id: 'https://edition.invalid/validators/exportAuditOutput',
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
function validate258(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/exportAuditOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate258.evaluated;
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
  validate258.errors = vErrors;
  return errors === 0;
}
validate258.evaluated = {
  props: { id: true, status: true, error: true, expiresAt: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const exportAuditOutputFull = validate259;
const schema350 = {
  $ref: 'https://edition.invalid/control#/components/schemas/ExportStatus',
  $id: 'https://edition.invalid/validators/exportAuditOutputFull',
};
function validate259(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/exportAuditOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate259.evaluated;
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
  validate259.errors = vErrors;
  return errors === 0;
}
validate259.evaluated = {
  props: { id: true, status: true, error: true, expiresAt: true },
  dynamicProps: false,
  dynamicItems: false,
};
