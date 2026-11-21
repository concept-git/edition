// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const domainCertificateInput = validate984;
const schema1149 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: { host: { type: 'string' } },
      required: ['host'],
    },
    query: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', format: 'uuid' },
        siteId: { type: 'string', format: 'uuid' },
        platform: { type: 'boolean', default: false },
        fields: { type: 'string', maxLength: 4096, minLength: 1 },
      },
      required: ['tenantId', 'siteId'],
    },
  },
  required: ['path', 'query'],
  $id: 'https://edition.invalid/validators/domainCertificateInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
function validate984(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/domainCertificateInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate984.evaluated;
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
        if (data0.host === undefined) {
          const err2 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'host' },
            message: "must have required property '" + 'host' + "'",
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
        if (data0.host !== undefined) {
          if (typeof data0.host !== 'string') {
            const err3 = {
              instancePath: instancePath + '/path/host',
              schemaPath: '#/properties/path/properties/host/type',
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
        if (data2.tenantId === undefined) {
          const err5 = {
            instancePath: instancePath + '/query',
            schemaPath: '#/properties/query/required',
            keyword: 'required',
            params: { missingProperty: 'tenantId' },
            message: "must have required property '" + 'tenantId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        }
        if (data2.siteId === undefined) {
          const err6 = {
            instancePath: instancePath + '/query',
            schemaPath: '#/properties/query/required',
            keyword: 'required',
            params: { missingProperty: 'siteId' },
            message: "must have required property '" + 'siteId' + "'",
          };
          if (vErrors === null) {
            vErrors = [err6];
          } else {
            vErrors.push(err6);
          }
          errors++;
        }
        if (data2.tenantId !== undefined) {
          let data3 = data2.tenantId;
          if (typeof data3 === 'string') {
            if (!formats0.test(data3)) {
              const err7 = {
                instancePath: instancePath + '/query/tenantId',
                schemaPath: '#/properties/query/properties/tenantId/format',
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
              instancePath: instancePath + '/query/tenantId',
              schemaPath: '#/properties/query/properties/tenantId/type',
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
        if (data2.siteId !== undefined) {
          let data4 = data2.siteId;
          if (typeof data4 === 'string') {
            if (!formats0.test(data4)) {
              const err9 = {
                instancePath: instancePath + '/query/siteId',
                schemaPath: '#/properties/query/properties/siteId/format',
                keyword: 'format',
                params: { format: 'uuid' },
                message: 'must match format "' + 'uuid' + '"',
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
              instancePath: instancePath + '/query/siteId',
              schemaPath: '#/properties/query/properties/siteId/type',
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
        if (data2.platform !== undefined) {
          if (typeof data2.platform !== 'boolean') {
            const err11 = {
              instancePath: instancePath + '/query/platform',
              schemaPath: '#/properties/query/properties/platform/type',
              keyword: 'type',
              params: { type: 'boolean' },
              message: 'must be boolean',
            };
            if (vErrors === null) {
              vErrors = [err11];
            } else {
              vErrors.push(err11);
            }
            errors++;
          }
        }
        if (data2.fields !== undefined) {
          let data6 = data2.fields;
          if (typeof data6 === 'string') {
            if (func1(data6) > 4096) {
              const err12 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err12];
              } else {
                vErrors.push(err12);
              }
              errors++;
            }
            if (func1(data6) < 1) {
              const err13 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
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
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
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
      } else {
        const err15 = {
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
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
    }
  } else {
    const err16 = {
      instancePath,
      schemaPath: '#/type',
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
  validate984.errors = vErrors;
  return errors === 0;
}
validate984.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const domainCertificateOutput = validate985;
const schema1150 = {
  anyOf: [
    { $ref: 'https://edition.invalid/control#/components/schemas/Certificate' },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialCertificate',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/domainCertificateOutput',
};
const schema1151 = {
  type: 'object',
  properties: {
    host: { type: 'string' },
    status: { type: 'string' },
    issuer: { type: 'string' },
    notBefore: { type: 'string', format: 'date-time' },
    notAfter: { type: 'string', format: 'date-time' },
    checkedAt: { type: 'string', format: 'date-time' },
    error: { type: 'string' },
  },
};
const schema1152 = {
  type: 'object',
  properties: {
    host: { type: 'string' },
    status: { type: 'string' },
    issuer: { type: 'string' },
    notBefore: { type: 'string', format: 'date-time' },
    notAfter: { type: 'string', format: 'date-time' },
    checkedAt: { type: 'string', format: 'date-time' },
    error: { type: 'string' },
  },
};
const formats10 = fullFormats['date-time'];
function validate985(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/domainCertificateOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate985.evaluated;
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
    if (data.host !== undefined) {
      if (typeof data.host !== 'string') {
        const err0 = {
          instancePath: instancePath + '/host',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Certificate/properties/host/type',
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
    if (data.status !== undefined) {
      if (typeof data.status !== 'string') {
        const err1 = {
          instancePath: instancePath + '/status',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Certificate/properties/status/type',
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
    if (data.issuer !== undefined) {
      if (typeof data.issuer !== 'string') {
        const err2 = {
          instancePath: instancePath + '/issuer',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Certificate/properties/issuer/type',
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
    if (data.notBefore !== undefined) {
      let data3 = data.notBefore;
      if (typeof data3 === 'string') {
        if (!formats10.validate(data3)) {
          const err3 = {
            instancePath: instancePath + '/notBefore',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/Certificate/properties/notBefore/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/notBefore',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Certificate/properties/notBefore/type',
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
    if (data.notAfter !== undefined) {
      let data4 = data.notAfter;
      if (typeof data4 === 'string') {
        if (!formats10.validate(data4)) {
          const err5 = {
            instancePath: instancePath + '/notAfter',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/Certificate/properties/notAfter/format',
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
          instancePath: instancePath + '/notAfter',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Certificate/properties/notAfter/type',
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
    if (data.checkedAt !== undefined) {
      let data5 = data.checkedAt;
      if (typeof data5 === 'string') {
        if (!formats10.validate(data5)) {
          const err7 = {
            instancePath: instancePath + '/checkedAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/Certificate/properties/checkedAt/format',
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
          instancePath: instancePath + '/checkedAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Certificate/properties/checkedAt/type',
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
    if (data.error !== undefined) {
      if (typeof data.error !== 'string') {
        const err9 = {
          instancePath: instancePath + '/error',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Certificate/properties/error/type',
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
      schemaPath:
        'https://edition.invalid/control#/components/schemas/Certificate/type',
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
  var _valid0 = _errs1 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    var props0 = {};
    props0.host = true;
    props0.status = true;
    props0.issuer = true;
    props0.notBefore = true;
    props0.notAfter = true;
    props0.checkedAt = true;
    props0.error = true;
  }
  const _errs18 = errors;
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.host !== undefined) {
      if (typeof data.host !== 'string') {
        const err11 = {
          instancePath: instancePath + '/host',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialCertificate/properties/host/type',
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
    if (data.status !== undefined) {
      if (typeof data.status !== 'string') {
        const err12 = {
          instancePath: instancePath + '/status',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialCertificate/properties/status/type',
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
    if (data.issuer !== undefined) {
      if (typeof data.issuer !== 'string') {
        const err13 = {
          instancePath: instancePath + '/issuer',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialCertificate/properties/issuer/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
    }
    if (data.notBefore !== undefined) {
      let data10 = data.notBefore;
      if (typeof data10 === 'string') {
        if (!formats10.validate(data10)) {
          const err14 = {
            instancePath: instancePath + '/notBefore',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/PartialCertificate/properties/notBefore/format',
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
          instancePath: instancePath + '/notBefore',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialCertificate/properties/notBefore/type',
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
    if (data.notAfter !== undefined) {
      let data11 = data.notAfter;
      if (typeof data11 === 'string') {
        if (!formats10.validate(data11)) {
          const err16 = {
            instancePath: instancePath + '/notAfter',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/PartialCertificate/properties/notAfter/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/notAfter',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialCertificate/properties/notAfter/type',
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
    if (data.checkedAt !== undefined) {
      let data12 = data.checkedAt;
      if (typeof data12 === 'string') {
        if (!formats10.validate(data12)) {
          const err18 = {
            instancePath: instancePath + '/checkedAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/PartialCertificate/properties/checkedAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
          };
          if (vErrors === null) {
            vErrors = [err18];
          } else {
            vErrors.push(err18);
          }
          errors++;
        }
      } else {
        const err19 = {
          instancePath: instancePath + '/checkedAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialCertificate/properties/checkedAt/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err19];
        } else {
          vErrors.push(err19);
        }
        errors++;
      }
    }
    if (data.error !== undefined) {
      if (typeof data.error !== 'string') {
        const err20 = {
          instancePath: instancePath + '/error',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialCertificate/properties/error/type',
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
  } else {
    const err21 = {
      instancePath,
      schemaPath:
        'https://edition.invalid/control#/components/schemas/PartialCertificate/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err21];
    } else {
      vErrors.push(err21);
    }
    errors++;
  }
  var _valid0 = _errs18 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.host = true;
      props0.status = true;
      props0.issuer = true;
      props0.notBefore = true;
      props0.notAfter = true;
      props0.checkedAt = true;
      props0.error = true;
    }
  }
  if (!valid0) {
    const err22 = {
      instancePath,
      schemaPath: '#/anyOf',
      keyword: 'anyOf',
      params: {},
      message: 'must match a schema in anyOf',
    };
    if (vErrors === null) {
      vErrors = [err22];
    } else {
      vErrors.push(err22);
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
  validate985.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate985.evaluated = { dynamicProps: true, dynamicItems: false };
export const domainCertificateOutputFull = validate986;
const schema1153 = {
  $ref: 'https://edition.invalid/control#/components/schemas/Certificate',
  $id: 'https://edition.invalid/validators/domainCertificateOutputFull',
};
function validate986(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/domainCertificateOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate986.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.host !== undefined) {
      if (typeof data.host !== 'string') {
        const err0 = {
          instancePath: instancePath + '/host',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Certificate/properties/host/type',
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
    if (data.status !== undefined) {
      if (typeof data.status !== 'string') {
        const err1 = {
          instancePath: instancePath + '/status',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Certificate/properties/status/type',
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
    if (data.issuer !== undefined) {
      if (typeof data.issuer !== 'string') {
        const err2 = {
          instancePath: instancePath + '/issuer',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Certificate/properties/issuer/type',
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
    if (data.notBefore !== undefined) {
      let data3 = data.notBefore;
      if (typeof data3 === 'string') {
        if (!formats10.validate(data3)) {
          const err3 = {
            instancePath: instancePath + '/notBefore',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/Certificate/properties/notBefore/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/notBefore',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Certificate/properties/notBefore/type',
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
    if (data.notAfter !== undefined) {
      let data4 = data.notAfter;
      if (typeof data4 === 'string') {
        if (!formats10.validate(data4)) {
          const err5 = {
            instancePath: instancePath + '/notAfter',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/Certificate/properties/notAfter/format',
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
          instancePath: instancePath + '/notAfter',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Certificate/properties/notAfter/type',
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
    if (data.checkedAt !== undefined) {
      let data5 = data.checkedAt;
      if (typeof data5 === 'string') {
        if (!formats10.validate(data5)) {
          const err7 = {
            instancePath: instancePath + '/checkedAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/Certificate/properties/checkedAt/format',
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
          instancePath: instancePath + '/checkedAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Certificate/properties/checkedAt/type',
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
    if (data.error !== undefined) {
      if (typeof data.error !== 'string') {
        const err9 = {
          instancePath: instancePath + '/error',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/Certificate/properties/error/type',
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
      schemaPath:
        'https://edition.invalid/control#/components/schemas/Certificate/type',
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
  validate986.errors = vErrors;
  return errors === 0;
}
validate986.evaluated = {
  props: {
    host: true,
    status: true,
    issuer: true,
    notBefore: true,
    notAfter: true,
    checkedAt: true,
    error: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
