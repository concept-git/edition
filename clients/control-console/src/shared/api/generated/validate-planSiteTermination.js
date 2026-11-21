// Generated from contracts/openapi.json. Do not edit.
import { fullFormats } from 'ajv-formats/dist/formats.js';
import ucs2Module from 'ajv/dist/runtime/ucs2length.js';
const ucs2Length =
  typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;
('use strict');
export const planSiteTerminationInput = validate1268;
const schema1428 = {
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', format: 'uuid' },
        siteId: { type: 'string', format: 'uuid' },
      },
      required: ['tenantId', 'siteId'],
    },
    query: {
      type: 'object',
      properties: {
        confirmationName: { type: 'string' },
        fields: { type: 'string', maxLength: 4096, minLength: 1 },
      },
      required: ['confirmationName'],
    },
  },
  required: ['path', 'query'],
  $id: 'https://edition.invalid/validators/planSiteTerminationInput',
};
const formats0 = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const func1 = ucs2Length;
function validate1268(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/planSiteTerminationInput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1268.evaluated;
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
        if (data0.siteId === undefined) {
          const err3 = {
            instancePath: instancePath + '/path',
            schemaPath: '#/properties/path/required',
            keyword: 'required',
            params: { missingProperty: 'siteId' },
            message: "must have required property '" + 'siteId' + "'",
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
        if (data0.siteId !== undefined) {
          let data2 = data0.siteId;
          if (typeof data2 === 'string') {
            if (!formats0.test(data2)) {
              const err6 = {
                instancePath: instancePath + '/path/siteId',
                schemaPath: '#/properties/path/properties/siteId/format',
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
              instancePath: instancePath + '/path/siteId',
              schemaPath: '#/properties/path/properties/siteId/type',
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
        if (data3.confirmationName === undefined) {
          const err9 = {
            instancePath: instancePath + '/query',
            schemaPath: '#/properties/query/required',
            keyword: 'required',
            params: { missingProperty: 'confirmationName' },
            message: "must have required property '" + 'confirmationName' + "'",
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
        if (data3.confirmationName !== undefined) {
          if (typeof data3.confirmationName !== 'string') {
            const err10 = {
              instancePath: instancePath + '/query/confirmationName',
              schemaPath: '#/properties/query/properties/confirmationName/type',
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
        if (data3.fields !== undefined) {
          let data5 = data3.fields;
          if (typeof data5 === 'string') {
            if (func1(data5) > 4096) {
              const err11 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/maxLength',
                keyword: 'maxLength',
                params: { limit: 4096 },
                message: 'must NOT have more than 4096 characters',
              };
              if (vErrors === null) {
                vErrors = [err11];
              } else {
                vErrors.push(err11);
              }
              errors++;
            }
            if (func1(data5) < 1) {
              const err12 = {
                instancePath: instancePath + '/query/fields',
                schemaPath: '#/properties/query/properties/fields/minLength',
                keyword: 'minLength',
                params: { limit: 1 },
                message: 'must NOT have fewer than 1 characters',
              };
              if (vErrors === null) {
                vErrors = [err12];
              } else {
                vErrors.push(err12);
              }
              errors++;
            }
          } else {
            const err13 = {
              instancePath: instancePath + '/query/fields',
              schemaPath: '#/properties/query/properties/fields/type',
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
      } else {
        const err14 = {
          instancePath: instancePath + '/query',
          schemaPath: '#/properties/query/type',
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
  validate1268.errors = vErrors;
  return errors === 0;
}
validate1268.evaluated = {
  props: { path: true, query: true },
  dynamicProps: false,
  dynamicItems: false,
};
export const planSiteTerminationOutput = validate1269;
const schema1429 = {
  anyOf: [
    {
      $ref: 'https://edition.invalid/control#/components/schemas/TerminationPlan',
    },
    {
      $ref: 'https://edition.invalid/control#/components/schemas/PartialTerminationPlan',
    },
  ],
  description:
    'Full response when fields is absent; selected fields may be omitted when fields is supplied.',
  $id: 'https://edition.invalid/validators/planSiteTerminationOutput',
};
const schema1207 = {
  type: 'object',
  properties: {
    resourceType: { type: 'string' },
    resourceId: { type: 'string', format: 'uuid' },
    validationLevel: { type: 'string' },
    observedAt: { type: 'string', format: 'date-time' },
    counts: {
      type: 'object',
      additionalProperties: { type: 'integer', format: 'int64' },
    },
    effects: { type: 'array', items: { type: 'string' } },
    unknowns: { type: 'array', items: { type: 'string' } },
  },
};
const schema1208 = {
  type: 'object',
  properties: {
    resourceType: { type: 'string' },
    resourceId: { type: 'string', format: 'uuid' },
    validationLevel: { type: 'string' },
    observedAt: { type: 'string', format: 'date-time' },
    counts: {
      type: 'object',
      additionalProperties: { type: 'integer', format: 'int64' },
    },
    effects: { type: 'array', items: { type: 'string' } },
    unknowns: { type: 'array', items: { type: 'string' } },
  },
};
const formats10 = fullFormats['date-time'];
function validate1269(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/planSiteTerminationOutput" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1269.evaluated;
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
    if (data.resourceType !== undefined) {
      if (typeof data.resourceType !== 'string') {
        const err0 = {
          instancePath: instancePath + '/resourceType',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TerminationPlan/properties/resourceType/type',
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
    if (data.resourceId !== undefined) {
      let data1 = data.resourceId;
      if (typeof data1 === 'string') {
        if (!formats0.test(data1)) {
          const err1 = {
            instancePath: instancePath + '/resourceId',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/TerminationPlan/properties/resourceId/format',
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
          instancePath: instancePath + '/resourceId',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TerminationPlan/properties/resourceId/type',
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
    if (data.validationLevel !== undefined) {
      if (typeof data.validationLevel !== 'string') {
        const err3 = {
          instancePath: instancePath + '/validationLevel',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TerminationPlan/properties/validationLevel/type',
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
    if (data.observedAt !== undefined) {
      let data3 = data.observedAt;
      if (typeof data3 === 'string') {
        if (!formats10.validate(data3)) {
          const err4 = {
            instancePath: instancePath + '/observedAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/TerminationPlan/properties/observedAt/format',
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
          instancePath: instancePath + '/observedAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TerminationPlan/properties/observedAt/type',
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
    if (data.counts !== undefined) {
      let data4 = data.counts;
      if (data4 && typeof data4 == 'object' && !Array.isArray(data4)) {
        for (const key0 in data4) {
          let data5 = data4[key0];
          if (!(typeof data5 == 'number' && !(data5 % 1) && !isNaN(data5))) {
            const err6 = {
              instancePath:
                instancePath +
                '/counts/' +
                key0.replace(/~/g, '~0').replace(/\//g, '~1'),
              schemaPath:
                'https://edition.invalid/control#/components/schemas/TerminationPlan/properties/counts/additionalProperties/type',
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
      } else {
        const err7 = {
          instancePath: instancePath + '/counts',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TerminationPlan/properties/counts/type',
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
    if (data.effects !== undefined) {
      let data6 = data.effects;
      if (Array.isArray(data6)) {
        const len0 = data6.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (typeof data6[i0] !== 'string') {
            const err8 = {
              instancePath: instancePath + '/effects/' + i0,
              schemaPath:
                'https://edition.invalid/control#/components/schemas/TerminationPlan/properties/effects/items/type',
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
      } else {
        const err9 = {
          instancePath: instancePath + '/effects',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TerminationPlan/properties/effects/type',
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
    if (data.unknowns !== undefined) {
      let data8 = data.unknowns;
      if (Array.isArray(data8)) {
        const len1 = data8.length;
        for (let i1 = 0; i1 < len1; i1++) {
          if (typeof data8[i1] !== 'string') {
            const err10 = {
              instancePath: instancePath + '/unknowns/' + i1,
              schemaPath:
                'https://edition.invalid/control#/components/schemas/TerminationPlan/properties/unknowns/items/type',
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
          instancePath: instancePath + '/unknowns',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TerminationPlan/properties/unknowns/type',
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
        'https://edition.invalid/control#/components/schemas/TerminationPlan/type',
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
    props0.resourceType = true;
    props0.resourceId = true;
    props0.validationLevel = true;
    props0.observedAt = true;
    props0.counts = true;
    props0.effects = true;
    props0.unknowns = true;
  }
  const _errs25 = errors;
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.resourceType !== undefined) {
      if (typeof data.resourceType !== 'string') {
        const err13 = {
          instancePath: instancePath + '/resourceType',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialTerminationPlan/properties/resourceType/type',
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
    if (data.resourceId !== undefined) {
      let data11 = data.resourceId;
      if (typeof data11 === 'string') {
        if (!formats0.test(data11)) {
          const err14 = {
            instancePath: instancePath + '/resourceId',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/PartialTerminationPlan/properties/resourceId/format',
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
          instancePath: instancePath + '/resourceId',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialTerminationPlan/properties/resourceId/type',
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
    if (data.validationLevel !== undefined) {
      if (typeof data.validationLevel !== 'string') {
        const err16 = {
          instancePath: instancePath + '/validationLevel',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialTerminationPlan/properties/validationLevel/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err16];
        } else {
          vErrors.push(err16);
        }
        errors++;
      }
    }
    if (data.observedAt !== undefined) {
      let data13 = data.observedAt;
      if (typeof data13 === 'string') {
        if (!formats10.validate(data13)) {
          const err17 = {
            instancePath: instancePath + '/observedAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/PartialTerminationPlan/properties/observedAt/format',
            keyword: 'format',
            params: { format: 'date-time' },
            message: 'must match format "' + 'date-time' + '"',
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
          instancePath: instancePath + '/observedAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialTerminationPlan/properties/observedAt/type',
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
    if (data.counts !== undefined) {
      let data14 = data.counts;
      if (data14 && typeof data14 == 'object' && !Array.isArray(data14)) {
        for (const key1 in data14) {
          let data15 = data14[key1];
          if (!(typeof data15 == 'number' && !(data15 % 1) && !isNaN(data15))) {
            const err19 = {
              instancePath:
                instancePath +
                '/counts/' +
                key1.replace(/~/g, '~0').replace(/\//g, '~1'),
              schemaPath:
                'https://edition.invalid/control#/components/schemas/PartialTerminationPlan/properties/counts/additionalProperties/type',
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
      } else {
        const err20 = {
          instancePath: instancePath + '/counts',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialTerminationPlan/properties/counts/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.effects !== undefined) {
      let data16 = data.effects;
      if (Array.isArray(data16)) {
        const len2 = data16.length;
        for (let i2 = 0; i2 < len2; i2++) {
          if (typeof data16[i2] !== 'string') {
            const err21 = {
              instancePath: instancePath + '/effects/' + i2,
              schemaPath:
                'https://edition.invalid/control#/components/schemas/PartialTerminationPlan/properties/effects/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err21];
            } else {
              vErrors.push(err21);
            }
            errors++;
          }
        }
      } else {
        const err22 = {
          instancePath: instancePath + '/effects',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialTerminationPlan/properties/effects/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.unknowns !== undefined) {
      let data18 = data.unknowns;
      if (Array.isArray(data18)) {
        const len3 = data18.length;
        for (let i3 = 0; i3 < len3; i3++) {
          if (typeof data18[i3] !== 'string') {
            const err23 = {
              instancePath: instancePath + '/unknowns/' + i3,
              schemaPath:
                'https://edition.invalid/control#/components/schemas/PartialTerminationPlan/properties/unknowns/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
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
          instancePath: instancePath + '/unknowns',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/PartialTerminationPlan/properties/unknowns/type',
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
        'https://edition.invalid/control#/components/schemas/PartialTerminationPlan/type',
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
  var _valid0 = _errs25 === errors;
  valid0 = valid0 || _valid0;
  if (_valid0) {
    if (props0 !== true) {
      props0 = props0 || {};
      props0.resourceType = true;
      props0.resourceId = true;
      props0.validationLevel = true;
      props0.observedAt = true;
      props0.counts = true;
      props0.effects = true;
      props0.unknowns = true;
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
  validate1269.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate1269.evaluated = { dynamicProps: true, dynamicItems: false };
export const planSiteTerminationOutputFull = validate1270;
const schema1432 = {
  $ref: 'https://edition.invalid/control#/components/schemas/TerminationPlan',
  $id: 'https://edition.invalid/validators/planSiteTerminationOutputFull',
};
function validate1270(
  data,
  {
    instancePath = '',
    parentData,
    parentDataProperty,
    rootData = data,
    dynamicAnchors = {},
  } = {},
) {
  /*# sourceURL="https://edition.invalid/validators/planSiteTerminationOutputFull" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate1270.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.resourceType !== undefined) {
      if (typeof data.resourceType !== 'string') {
        const err0 = {
          instancePath: instancePath + '/resourceType',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TerminationPlan/properties/resourceType/type',
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
    if (data.resourceId !== undefined) {
      let data1 = data.resourceId;
      if (typeof data1 === 'string') {
        if (!formats0.test(data1)) {
          const err1 = {
            instancePath: instancePath + '/resourceId',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/TerminationPlan/properties/resourceId/format',
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
          instancePath: instancePath + '/resourceId',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TerminationPlan/properties/resourceId/type',
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
    if (data.validationLevel !== undefined) {
      if (typeof data.validationLevel !== 'string') {
        const err3 = {
          instancePath: instancePath + '/validationLevel',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TerminationPlan/properties/validationLevel/type',
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
    if (data.observedAt !== undefined) {
      let data3 = data.observedAt;
      if (typeof data3 === 'string') {
        if (!formats10.validate(data3)) {
          const err4 = {
            instancePath: instancePath + '/observedAt',
            schemaPath:
              'https://edition.invalid/control#/components/schemas/TerminationPlan/properties/observedAt/format',
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
          instancePath: instancePath + '/observedAt',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TerminationPlan/properties/observedAt/type',
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
    if (data.counts !== undefined) {
      let data4 = data.counts;
      if (data4 && typeof data4 == 'object' && !Array.isArray(data4)) {
        for (const key0 in data4) {
          let data5 = data4[key0];
          if (!(typeof data5 == 'number' && !(data5 % 1) && !isNaN(data5))) {
            const err6 = {
              instancePath:
                instancePath +
                '/counts/' +
                key0.replace(/~/g, '~0').replace(/\//g, '~1'),
              schemaPath:
                'https://edition.invalid/control#/components/schemas/TerminationPlan/properties/counts/additionalProperties/type',
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
      } else {
        const err7 = {
          instancePath: instancePath + '/counts',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TerminationPlan/properties/counts/type',
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
    if (data.effects !== undefined) {
      let data6 = data.effects;
      if (Array.isArray(data6)) {
        const len0 = data6.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (typeof data6[i0] !== 'string') {
            const err8 = {
              instancePath: instancePath + '/effects/' + i0,
              schemaPath:
                'https://edition.invalid/control#/components/schemas/TerminationPlan/properties/effects/items/type',
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
      } else {
        const err9 = {
          instancePath: instancePath + '/effects',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TerminationPlan/properties/effects/type',
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
    if (data.unknowns !== undefined) {
      let data8 = data.unknowns;
      if (Array.isArray(data8)) {
        const len1 = data8.length;
        for (let i1 = 0; i1 < len1; i1++) {
          if (typeof data8[i1] !== 'string') {
            const err10 = {
              instancePath: instancePath + '/unknowns/' + i1,
              schemaPath:
                'https://edition.invalid/control#/components/schemas/TerminationPlan/properties/unknowns/items/type',
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
          instancePath: instancePath + '/unknowns',
          schemaPath:
            'https://edition.invalid/control#/components/schemas/TerminationPlan/properties/unknowns/type',
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
        'https://edition.invalid/control#/components/schemas/TerminationPlan/type',
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
  validate1270.errors = vErrors;
  return errors === 0;
}
validate1270.evaluated = {
  props: {
    resourceType: true,
    resourceId: true,
    validationLevel: true,
    observedAt: true,
    counts: true,
    effects: true,
    unknowns: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
